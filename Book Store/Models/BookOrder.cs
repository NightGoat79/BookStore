namespace WebAPI.Models
{
    public class BookOrder
    {
        public long id { get; set; }
        public string item { get; set; }
        public int quantity { get; set; }
        public double cost { get; set; }
        public bool pending { get; set; }
        public long accountid { get; set; }
    }
}
