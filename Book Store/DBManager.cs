using Microsoft.Data.Sqlite;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BookStore
{
    public class DBManager
    {

        private SqliteConnection connection;

        public DBManager()
        {
            SqliteConnection.CreateFile("BookStore.sqlite");
            connect();
            createTables();
        }

        private void connect()
        {
            connection = new SqliteConnection("Data Source=MyDatabase.sqlite;Version=3;");
            connection.Open();
        }

    }
}
