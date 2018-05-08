using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace WebAPI.Models
{
    public class Account
    {
        public long id { get; set; }
        public String username { get; set; }
        public String password { get; set; }
    }
}
