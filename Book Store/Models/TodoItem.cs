namespace WebAPI.Models
{
    public class Order
    {
        public long id { get; set; }
        public string item { get; set; }
        public int quantity { get; set; }
        public double cost { get; set; }
    }
}
