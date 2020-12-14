const express = require('express')
const app = express()
const db = require("./database.js")
const bcrypt=require('bcrypt')
const session=require('express-session')
const fileUpload=require('express-fileupload');

app.set('view engine', 'ejs')
app.use(session({secret:'vladtan'}))
app.use(fileUpload());

function setCurrentUser (req,res,next){
	if (req.session.loggedIn){
		var sql = "SELECT * FROM users WHERE id=?"
		var params = [req.session.userId]
		db.get(sql,params,(err,row)=>{
			if(row !== undefined){
				res.locals.currentUser=row
			}
			return next()
		});
	} else {
		return next()
	}
}
app.use(setCurrentUser)
app.use('/images', express.static( __dirname + '/views/images/'));
app.use('/photos', express.static(__dirname + '/photos/'))
app.use('/bootstrap', express.static(__dirname + '/node_modules/bootstrap/dist'))
app.use('/jquery', express.static(__dirname + '/node_modules/jquery/dist/'))

app.use(express.urlencoded())

app.get('/', function (reg, res) {
    res.render('index', {
        activePage: "home"
    })
})
app.get('/register',function(req,res){
    res.render('register',{activePage:"register"})
})
app.post('/register',function(req,res){
    var photoFile = req.files.photo;

	photoFile.mv(__dirname + '/photos/'+req.files.photo.name, function(err) {

    bcrypt.hash(req.body.password,10,function(err,hash){
        var data =[
            req.body.name,
            req.body.email,
            hash,
            req.files.photo.name,
            0
            
        ]
        var sql="INSERT INTO users(name,email,password,photo,failed_logins) VALUES(?,?,?,?,?)"
        db.run(sql,data,function(err,result){
            if(err){
                res.status(400)
                res.send("database error"+err.message)
                return;
            }
            res.render('register_answer',{activePage:"register",formData:req.body})
        });
    });
});
})
app.get( '/login' , function ( req , res ) {
    res.render( 'login' , { activePage : "login",error:"" })
    })

app.post('/login',function (req,res){
        var sql = "SELECT * FROM users WHERE email = ?"
        var params = [req.body.email]
        var error=""
        db.get(sql,params,(err,row)=>{
            if(err){
                error = err.message
            }
            if(row===undefined){
                error = "Wrong email or password"
            }
            if( error !== ""){
                console.log(" email not found")
                res.render('login',{activePage:"login",error: error})
                return
            }
            
            bcrypt.compare(req.body.password, row["password"],function(err,hashRes){
                if(hashRes === false){
                    error="Wrong email or password"
                    console.log(" password not found")
                    
                }
                
                req.session.userId = row["id"]
                req.session.loggedIn = true
                
                res.redirect("/")
            });
        })
    })
    app.get('/logout' ,function(req,res){
        req.session.userId = null
        req.session.loggedIn = false
        res.redirect("/login")
    })
    function checkAuth(req, res, next) {
        if (req.session.loggedIn) {
            return next()
        } else {
            res.redirect('/login')
        }
    }
    app.get('/profile', checkAuth, function (req, res) {
        res.render('profile', { activePage: "profile" })
    })
    app.post('/profile', function (req, res) {
        bcrypt.hash(req.body.password, 10, function (err, hash) {
            var data = [
                req.body.name,
                req.body.email,
                hash,
                req.session.userId
            ]
            var sql = "UPDATE users SET name=?, email=?, password=? WHERE id=?"
    
            db.run(sql, data, function (err, result) {
                if (err) {
                    res.status(400)
                    res.send("database error: " + err.message)
                    return;
                }
                res.render('profile_answer', { activePage: "profile", formData: req.body })
            });
    
        });
    })
    app.get('/contact', function (req, res) {
        res.render('contact', {
            activePage: "contact"
        })
    })
    app.post('/contact', function (req, res) {
        res.render('contact_answer', {
            activePage: "contact",
            formData: req.body
        })
    })
    app.get('/new_post', function (req, res) {
        res.render('new_post', {
            activePage: "new_post"
        })
    })
    app.post('/new_post', function (req, res) {
        var data = [
            req.body.title,
            req.body.author,
            req.body.body
        ]
        var sql = "INSERT INTO posts (title,author,body) VALUES(?,?,?)"
        db.run(sql, data, function (err, result) {
            if (err) {
                res.status(400)
                res.send("database error" + err.message)
                return;
            }
            res.render('new_post_answer', {
                activePage: "new_post",
                formData: req.body
            })
        });
    })
    app.get('/posts', function (req, res) {
        var sql = "SELECT * FROM posts"
        db.all(sql, [], (err, rows) => {
            if (err) {
                res.status(400)
                res.send("database erroe:" + err.message)
                return;
            }
            res.render('posts', {
                activePage: "posts",
                posts: rows
            })
        });
    })
    app.get('/posts/:id/edit', function (req, res) {
        var sql = "SELECT * FROM posts Where id=? "
        var params = [req.params.id]
        db.get(sql, params, (err, row) => {
            if (err) {
                res.status(400)
                res.send("database error:" + err.message)
                return;
            }
            res.render('edit_post', {
                post: row,
                activePage: "posts"
            })
        });
    })
    app.post('/posts/:id/edit', function (req, res) {
        var data = [
            req.body.title,
            req.body.author,
            req.body.body,
            req.params.id
        ]
        db.run(
            ` UPDATE posts SET
            title = COALESCE ( ?, title ) ,
            author = COALESCE ( ?, author ) ,
            body = COALESCE ( ?, body )
            WHERE id = ? `,
            data,
            function (err, result) {
                if (err) {
                    res.status(400)
                    res.send("database error:" + err.message)
                    return;
                }
                res.redirect('/posts')
            });
    })
    app.get('/posts/:id/delete', function (req, res) {
                var sql = "DELETE FROM posts WHERE id = ?"
                var params = [req.params.id]
                db.get(sql, params, (err, row) => {
                    if (err) {
                        res.status(400)
                        res.send("database error:" + err.message)
                        return;
                    }
                    res.redirect('/posts')
                });
    })
    app.get('/posts/:id/show_post', function (req, res) {
        var post_id = [req.params.id]
        var sql1 = "SELECT * FROM posts WHERE posts.id = ?"
        var sql2 = "SELECT * FROM comments WHERE comments.post_id = ?"
    
        db.get(sql1, post_id, (err, row) => {
            if (err) {
                res.status(400)
                res.send("database error: " + err.message) 
                return;
            }
            db.all(sql2, post_id, [], (err, comments) => {
                if (err) {
                    res.status(400)
                    res.send("database error: " + err.message) 
                    return;
                }
                res.render('show_post', { post: row, comments: comments, activePage: "posts" })
            });
        });
    })
    app.post('/posts/:id/show_post', function (req, res) {
        var data = [
            req.body.author,
            req.body.comm,
            req.params.id
        ]
        var sql = "INSERT INTO comments (author, comm, post_id) VALUES (?, ?, ?)"
        db.run(sql, data, function (err, result) {
            if (err) {
                res.status(400)
                res.send("database error: " + err.message)
                return;
            }
            res.redirect('/posts')
        })
    });
    app.post('/search',function(req,res){
        var data=req.body.search
        console.log(data)
        var sql ="SELECT * FROM users WHERE id LIKE '"+ data+"%'"
        console.log(sql)
        db.get(sql,function(err,row){
                if(err){
                    res.status(400)
                    
                    return;
                }
    
                var sql2 ="SELECT * FROM users WHERE name LIKE '"+ data+"%'"
        console.log(sql2)
        db.get(sql2,function(err,row2){
                if(err){
                    res.status(400)
                    
                    return;
                }
    
                if(row==undefined&&row2==undefined)res.render('error',{activePage:"register"})
    
                else if(row!=undefined)res.render('profile2',{activePage:"register",emp:row})
                else if(row2!=undefined)res.render('profile2',{activePage:"register",emp:row2})
            });
    });
    })
app.listen(3000)