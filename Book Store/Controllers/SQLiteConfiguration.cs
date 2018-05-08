using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Data.Entity.Core.Common;
using System.Data.SQLite;
using System.Data.SQLite.EF6;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookStore.Controllers
{
    /**
     * retrieve from https://www.codeproject.com/Articles/1158937/SQLite-with-Csharp-Net-and-Entity-Framework
     **/
    public class SQLiteConfiguration : DbConfiguration
    {
        SetProviderFactory("System.Data.SQLite", SQLiteFactory.Instance);
        SetProviderFactory("System.Data.SQLite.EF6", SQLiteProviderFactory.Instance);
        SetProviderServices("System.Data.SQLite", (DbProviderServices) SQLiteProviderFactory.Instance.GetService(typeof(DbProviderServices)));
    }

}
