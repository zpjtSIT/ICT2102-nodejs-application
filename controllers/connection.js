var mysql = require('mysql');

var pool      =    mysql.createPool({
    connectionLimit : 1000,
    connectTimeout  : 60 * 60 * 1000,
    aquireTimeout   : 60 * 60 * 1000,
    timeout         : 60 * 60 * 1000,
    host     : 'sit.cziuvgcsstcl.ap-southeast-1.rds.amazonaws.com',
    user     : 'leeqicheng',
    port     : "3306",
    password : 'Zc3AKADxl7',
    database : 'sql12260856'
});    

pool.getConnection(function(err, connection) {
  // connected! (unless `err` is set)
    if(err)
    console.log(err);
  
});

pool.on('error', function(err) {
  console.log(err.code); // 'ER_BAD_DB_ERROR' 
  // https://www.npmjs.com/package/mysql#error-handling
});

module.exports = pool;