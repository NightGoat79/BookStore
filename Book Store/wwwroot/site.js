
const uri = 'api/todo';
let books = null;
var bookshelf = [];
var orders = [];

// retrieved from https://stackoverflow.com/questions/6122571/simple-non-secure-hash-function-for-javascript
// a simple hash for storing passwords
String.prototype.hashCode = function () {
    var hash = 0;
    if (this.length == 0) {
        return hash;
    }
    for (var i = 0; i < this.length; i++) {
        var char = this.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
}

/**
    once the page loads, the login dialog box is hidden, the books are loaded from
    the json file, and the orders are retrieved from the API
**/
$(document).ready(function () {
    $("#dialog").hide();
    loadBooks("Programming");
    getData();
});

/**
    when the value in the categories dropdown list is changed, the books are reloaded
**/
$("#categories").change(function () {
    loadBooks(this.value);
});

/**
 * retrieves the orders from the API and appends each of them as a row to the table
 */
function getData() {
    orders = [];
    $.ajax({
        type: 'GET',
        url: uri,
        success: function (data) {
            // empty any previously loaded orders
            $('#orders').empty();
            $.each(data, function (key, item) {
                // only load orders if they are pending finalization
                if (item.pending == true) {
                    orders.push(item.id);
                    $('<tr><td id="title-' + item.id + '">' + item.item + '</td>' +
                        '<td id="quan-' + item.id + '">' + item.quantity + '</td>' +
                        '<td id="price-' + item.id + '">$' + item.cost + '</td>' +
                        '<td><button onclick="deleteItem(' + item.id + ')" class="btn btn-danger">Delete</button>&nbsp;&nbsp;' +
                        '<button id="edit-' + item.id + '" onclick="editOrder(' + item.id + ')" class="btn btn-warning">Edit</button></td>' +
                        '</tr>').appendTo($('#orders'));
                }
            });
            books = data;
        }
    });
}

/**
 * when the users wants to finalize an order, they must first login
 * this function shows the login dialog with example data in the input boxes
 * an event is attached to the login button that makes a request to the API
 * to get the id of an account giving its username and hashed password
 * once the login credentials have been checked, all of the orders are switched
 * from pending to finalized
 */
function login() {
    // if there are no pending orders, cancel
    if (orders.length < 1) {
        return;
    }
    // show login dialog box
    $("#dialog").dialog();
    // populate input with example data (the example data works)
    $('#login-uname').val('example@mail.com');
    $('#login-pwd').val('example');
    // add a click event to the login button
    $('#login').off('click').on('click', function () {
        // get the user input
        var uname = $('#login-uname').val();
        var pwd = $('#login-pwd').val();
        var hash = pwd.hashCode();
        $.ajax({
            type: 'GET',
            url: uri + '/' + uname + ';' + hash,
            error: function (jqXHR, textStatus, errorThrown) {
                alert('Username or Password are invalid.');
                $("#dialog").dialog('close');
            },
            success: function (data) {
                alert('id: ' + data + ', Successfully placed order');
                $("#dialog").dialog('close');
                // finalize the pending orders
                placeOrders(data);
            }
        });
    });
}

/**
 * finalzes all the currently pending orders
 * @param id - the id of the account finalizing the orders
 */
function placeOrders(id) {
    // if there are no pending orders, cancel
    if (orders.length < 1) {
        return;
    }
    // for each pending order, send a request to finalize it
    orders.forEach(function (data) {
        $.ajax({
            url: uri + '/' + data + ';' + id,
            type: 'PUT',
            accepts: 'application/json',
            contentType: 'application/json',
            error: function (jqXHR, textStatus, errorThrown) {
                alert(errorThrown);
            },
            success: function (result) {
                // if the request was successfull, reload the data
                getData();
            }
        });
    });
}

/**
 * changes an order row in the orders table to edit mode
 * @param id - the id of the order that is being changed
 */
function editOrder(id) {
    // get the order data
    var button = $('#edit-' + id);
    var quan = $('#quan-' + id);
    var num = quan.text();
    var price = $('#price-' + id).text();
    price = price.substr(1);
    price = price / num;
    // replace the edit button with a finish edit button
    button.replaceWith('<button id="edit-' + id + '" onclick="finishEdit(' + id + ', ' + price + ')" class="btn btn-success">Done</button >');
    // replace the quantity label with a number picker input box
    quan.replaceWith('<input id="quan-' + id + '" type="number" min="0" max="100" value="' + num + '"/>');
}

/**
 * updates an order in the API and switches the order row back to view mode
 * @param id - the id of the order that is being changed
 * @param price - the price of the item on the order
 */
function finishEdit(id, price) {
    var button = $('#edit-' + id);
    // replace the finish edit button with an edit button
    button.replaceWith('<button id="edit-' + id + '" onclick="editOrder(' + id + ')" class="btn btn-warning">Edit</button>');
    var quan = $('#quan-' + id);
    var num = quan.val();
    if (num < 1) {
        // if the quantity input is 0, then delete this order ...
        deleteItem(id);
        getData();
    } else {
        // otherwise, get the new price and update the order in the API
        var title = $('#title-' + id).text();
        $('#price-' + id).text('$' + Math.round((num * price) * 100) / 100);
        quan.replaceWith('<td id="quan-' + id + '">' + num + '</td>');
        updateOrder(id, title, num, Math.round((num * price) * 100) / 100);
    }
}

/**
 * creates a new order
 * @param id - the id of the book included in the order
 */
function placeOrder(id) {
    // get the book info
    var book = bookshelf[id];
    var quantity = $('#num-' + id).val();
    const item = {
        'item': book.title,
        'quantity': quantity,
        'cost': Math.round((book.price * quantity) * 100) / 100,
        'pending': true
    };
    // send request
    $.ajax({
        type: 'POST',
        accepts: 'application/json',
        url: uri,
        contentType: 'application/json',
        data: JSON.stringify(item),
        error: function (jqXHR, textStatus, errorThrown) {
            alert(errorThrown);
        },
        success: function (result) {
            // if request was successfull, reload data
            getData();
        }
    });
}

/**
 * delete an order from the API
 * @param id - the id of the order being delete
 */
function deleteItem(id) {
    $.ajax({
        url: uri + '/' + id,
        type: 'DELETE',
        success: function (result) {
            // if the request was successfull, reload the data
            getData();
        }
    });
}

/**
 * deletes all the orders from the API
 * @param message - the message to be displayed as an alert when the request is done
 */
function deleteAll(message) {
    $.ajax({
        url: uri,
        type: 'DELETE',
        error: function (jqXHR, textStatus, errorThrown) {
            alert(errorThrown);
        },
        success: function () {
            if (message != null && message != undefined) {
                alert(message);
            }
            getData();
        }
    });
}

/**
 * updates an order in the API
 * @param id - the id of the order being updated
 * @param title - the title of the book
 * @param quantity - the number of books being ordered
 * @param cost - the total cost of all the books
 */
function updateOrder(id, title, quantity, cost) {
    const item = {
        'id': id,
        'item': title,
        'quantity': quantity,
        'cost': cost,
    };
    $.ajax({
        url: uri + '/' + id,
        type: 'PUT',
        accepts: 'application/json',
        contentType: 'application/json',
        data: JSON.stringify(item),
        error: function (jqXHR, textStatus, errorThrown) {
            console.log(errorThrown);
            console.log(textStatus);
        },
        success: function (result) {
            getData();
        }
    });
}

/**
 * loads the data from the books.json file and displays them as products in a grid
 * @param category - narrows down the books being loaded - 3 options: Programming, Fiction, Any
 */
function loadBooks(category) {
    // empty any previously loaded books
    $('#books').empty();
    bookshelf = [];
    // load data from json file
    $.getJSON("books.json", function (data) {
        var rows = [];
        var row = {};
        var size = this.length;
        var count = 0;
        $.each(data, function () {
            $.each(this, function (key, value) {
                // category filter
                if (value.category == category ||
                    /**
                     * the following code divides the books into rows of 3
                     * rows is an array of row objects which each contain 3 books
                     **/
                    category == "Any") {
                    bookshelf.push(value);
                    count++;
                    row[count] = value;
                    row[count].id = count + (rows.length * 3) - 1;
                    // once 3 books have been added to a row, start a new row
                    if (count == 3) {
                        rows.push(row);
                        row = {};
                        count = 0;
                    }
                }
            });
        });
        // if there are any remaining books, create one extra row with empty spots
        if (row[1] != null) {
            while (count < 3) {
                count++;
                row[count] = "empty";
            }
            rows.push(row);
        }
        // for each row, create the html and append it to the grid
        rows.forEach(function (item) {
            var html = '<div class="row">';
            if (item[1] != "empty") {
                html += '<div class="col-sm book">' +
                            '<img src="' + item[1].image + '"/>' +
                            '<center><p class="title">' + item[1].title + '</p></center>' +
                            '<center><p>' + item[1].author + '</p></center>' +
                            '<center><p class="price">$' + item[1].price + '</p></center>' + 
                            '<center><input type="number" min="1" max="100" value="1" id="num-' + item[1].id + '"/>&nbsp;&nbsp;' +
                            '<button onclick="placeOrder(' + item[1].id + ')" class="btn btn-success">' +
                                    'Add Item</button></center>' +
                        '</div>';
            } else {
                html += '<div class="col-sm"></div>';
            }
            if (item[2] != "empty") {
                html += '<div class="col-sm book">' +
                            '<img src="' + item[2].image + '"/>' +
                            '<center><p class="title">' + item[2].title + '</p></center>' +
                            '<center><p>' + item[2].author + '</p></center>' +
                            '<center><p class="price">$' + item[2].price + '</p></center>' +
                            '<center><input type="number" min="1" max="100" value="1" id="num-' + item[2].id + '"/>&nbsp;&nbsp;' +
                            '<button onclick="placeOrder(' + item[2].id + ')" class="btn btn-success">' +
                                    'Add Item</button></center>' +
                       '</div>';
            } else {
                html += '<div class="col-sm"></div>';
            }
            if (item[3] != "empty") {
                html += '<div class="col-sm book">' +
                            '<img src="' + item[3].image + '"/>' +
                            '<center><p class="title">' + item[3].title + '</p></center>' +
                            '<center><p>' + item[3].author + '</p></center>' +
                            '<center><p class="price">$' + item[3].price + '</p></center>' +
                            '<center><input type="number" min="1" max="100" value="1" id="num-' + item[3].id + '"/>&nbsp;&nbsp;' +
                            '<button onclick="placeOrder(' + item[3].id + ')" class="btn btn-success">' +
                                'Add Item</button></center>' +
                         '</div>';
            } else {
                html += '<div class="col-sm"></div>';
            }
            html += '</div>'
            $('#books').append(html);
        });
    });
}