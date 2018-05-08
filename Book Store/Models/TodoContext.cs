using Microsoft.EntityFrameworkCore;

namespace WebAPI.Models
{
    public class OrderContext : DbContext
    {
        public OrderContext(DbContextOptions<OrderContext> options)
            : base(options)
        {

        }

        public DbSet<BookOrder> orders { get; set; }
        public DbSet<Account> accounts { get; set; }
    }
}
