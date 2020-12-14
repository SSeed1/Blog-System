var sqlite3=require('sqlite3').verbose()
var DBSOURCE="db.sqlite"

var db=new sqlite3.Database(DBSOURCE,(err)=>{
    if(err){
        console.error(err.message)
        throw err
    }
    else{
        console.log('Connected to the SQLite databese Users.')
        db.run(`CREATE TABLE users(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name text,
            email text UNIQUE,
            password text,
            photo text,
            failed_logins INTEGER,
            CONSTRAINT email_unique UNIQUE (email)
        )`,
        (err)=>{
            if (err){
                console.log("Table users id already create:"+err.message)
            }
            else{
                console.log("Table users is created")
            }
        });
        console.log('Connected to the SQLite databese Posts.')
        db.run(`CREATE TABLE posts(
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title text,
                author text,
                body text
        )`,
        (err)=>{
            if (err){
                console.log("Table posts id already create:"+err.message)
            }
            else{
                console.log("Table posts is created")
            }
        });
        db.run(`CREATE TABLE comments(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            author text,
            comm text,
            post_id INTEGER
        )`,
        (err)=>{
            if (err){
                console.log("Table comments id already create:"+err.message)
            }
            else{
                console.log("Table comments is created")
            }
        });
    }
});
module.exports=db