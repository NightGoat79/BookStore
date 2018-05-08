
const uri = 'api/todo';
var orders = [];

// retrieved from https://stackoverflow.com/questions/6122571/simple-non-secure-hash-function-for-javascript
// simple password hash
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

$(document).ready(function () {
    // show the login dialog as soon as the page loads
    $('#dialog').dialog();
    $('#login-uname').val('example@mail.com');
    $('#login-pwd').val('example');
    // get the account id based on the the login credentials and
    // filter the orders to display only those that the current user
    // has finalized
    $('#login').off('click').on('click', function () {
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
                $('#dialog').dialog('close');
                getData(data);
            }
        });
    });
});

// the same function as in the site.js file, except it filters by account id
function getData(id) {
    orders = [];
    $.ajax({
        type: 'GET',
        url: uri,
        success: function (data) {
            $('#orders').empty();
            $.each(data, function (key, item) {
                if (item.pending == false) {
                    if (item.accountid == id) {
                        orders.push(item.id);
                        $('<tr><td id="title-' + item.id + '">' + item.item + '</td>' +
                            '<td id="quan-' + item.id + '">' + item.quantity + '</td>' +
                            '<td id="price-' + item.id + '">$' + item.cost + '</td>' +
                            '</tr>').appendTo($('#orders'));
                    }
                }
            });
        }
    });
}