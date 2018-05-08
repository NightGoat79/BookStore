using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Linq;
using WebAPI.Models;

namespace TodoApi.Controllers
{
    [Route("api/[controller]")]
    public class TodoController : ControllerBase
    {

        private readonly OrderContext _context;

        /**
         * Initialize the controller with 2 accounts
         */
        public TodoController(OrderContext context)
        {
            _context = context;

            if (_context.accounts.Count() == 0)
            {
                _context.accounts.Add(new Account {
                    username = "example@mail.com",
                    password = "-1322970774"
                    // unhashed = example
                });
                _context.accounts.Add(new Account
                {
                    username = "user@mail.com",
                    password = "1216985755"
                    // unhashed = password
                });
                _context.SaveChanges();
            }
        }

        /**
         * returns all the orders
         */
        [HttpGet]
        public List<BookOrder> GetAll()
        {
            return _context.orders.ToList();
        }

        /**
         * returns all the accounts
         */
        [HttpGet("account")]
        public List<Account> GetAccounts()
        {
            return _context.accounts.ToList();
        }

        /**
         * returns an account id given a username and password
         */
        [HttpGet("{username};{password}")]
        public IActionResult GetAccount(string username, string password)
        {
            if(username == null || username.Length <= 0 ||
                password == null || password.Length <= 0)
            {
                return BadRequest();
            }
            foreach (var account in _context.accounts)
            {
                if(account.username.Equals(username) &&
                    account.password.Equals(password)){
                    return Ok(account.id);
                }
            }
            return NotFound();
        }

        /**
         * gets one order given an id
         */
        [HttpGet("{id}", Name = "GetTodo")]
        public IActionResult GetById(long id)
        {
            var item = _context.orders.Find(id);
            if (item == null)
            {
                return NotFound();
            }
            return Ok(item);
        }

        /**
         * Creates an order
         */
        [HttpPost]
        public IActionResult Create([FromBody] BookOrder order)
        {
            if(order == null)
            {
                return BadRequest();
            }

            _context.orders.Add(order);
            _context.SaveChanges();

            return CreatedAtRoute("GetTodo", new { id = order.id }, order);
        }

        /**
         * updates an order
         */
        [HttpPut("{id}")]
        public IActionResult Update(long id, [FromBody] BookOrder order)
        {
            if (order == null || order.id != id)
            {
                return BadRequest();
            }

            var item = _context.orders.Find(id);
            if (item == null)
            {
                return NotFound();
            }

            item.item = order.item;
            item.quantity = order.quantity;
            item.cost = order.cost;

            _context.orders.Update(item);
            _context.SaveChanges();
            return NoContent();
        }

        /**
         * changes the pending property of an order to false and
         * adds an accountid to it
         */
        [HttpPut("{orderid};{accountid}")]
        public IActionResult SwitchPending(long orderid, long accountid)
        {
            var order = _context.orders.Find(orderid);
            if (order == null)
            {
                return NotFound();
            }

            order.accountid = accountid;
            order.pending = false;

            _context.orders.Update(order);
            _context.SaveChanges();
            return NoContent();
        }

        /**
         * deletes an order given an id
         */
        [HttpDelete("{id}")]
        public IActionResult Delete(long id)
        {
            var todo = _context.orders.Find(id);
            if(todo == null)
            {
                return NotFound();
            }

            _context.orders.Remove(todo);
            _context.SaveChanges();
            return NoContent();
        }

        /**
         * deletes all the orders
         */
        [HttpDelete]
        public IActionResult DeleteAll()
        {
            foreach (var order in _context.orders)
                _context.orders.Remove(order);
            _context.SaveChanges();
            return NoContent();
        }

    }
}