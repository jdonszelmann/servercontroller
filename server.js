


const express = require("express");
const ejs = require("ejs");
const bodyParser = require('body-parser');
const fs = require('fs');
const util = require('util');
const child_process = require('child_process');
const app = express();
const morgan = require('morgan');
const session = require('express-session');
const cookieParser = require('cookie-parser');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser());
app.use(morgan('dev'));
app.use(cookieParser());

app.use(session({
    key: 'user_sid',
    secret: 'somerandonstuffs',
    resave: false,
    saveUninitialized: false,
    cookie: {
        expires: 600000
    }
}));

let sessionChecker = (req, res, next) => {
    if (req.session.user && req.cookies.user_sid) {
        next();
    } else {
        res.redirect("/login")
    }    
};

app.use((req, res, next) => {
    if (req.cookies.user_sid && !req.session.user) {
        res.clearCookie('user_sid');        
    }
    next();
});


let port = 8000

app.set('view engine', 'ejs');


let failure = ""

/* serves main page */
app.get("/", sessionChecker, function(req, res) {
	res.render('index.ejs',{
		status:fs.readFileSync('status.txt', 'utf8'),
		failure:failure
	})
	failure = ""
});

app.post("/on",sessionChecker, function(req,res){
	if(fs.readFileSync('status.txt', 'utf8') == "WORKING"){
		failure = "was still working.... please retry later"
		return res.redirect("back")
	}
	if(fs.readFileSync('status.txt', 'utf8') == "ON"){
		failure = "was already on...."
		return res.redirect("back")
	}
 	fs.writeFileSync("status.txt","WORKING",'utf8');
	start()
	res.redirect("back")
})

app.get("/login",function(req,res){
	res.render("login.ejs",{status:""})
})

app.post("/login",function(req,res){
	let username = req.body.username,
		password = req.body.password;
	if(username == "jonay2000" && password == "Abcdefgh1"){
		req.session.user = true
		res.redirect("/")
	}else{
		res.render("login.ejs",{status:"incorrect password or username"})
	}
})

app.post("/logout",function(req,res){
	req.session.user = undefined;
	res.redirect("/")
})

app.post("/off",sessionChecker, function(req,res){

	if(fs.readFileSync('status.txt', 'utf8') == "WORKING"){
		failure = "was still working.... please retry later"
		return res.redirect("back")
	}
	if(fs.readFileSync('status.txt', 'utf8') == "OFF"){
		failure = "was already off...."
		return res.redirect("back")
	}
	fs.writeFileSync("status.txt","WORKING",'utf8');
	stop()
	res.redirect("back")

})

app.post("/reload",sessionChecker, function(req,res){

	reload()
	res.redirect("back")

})

app.post("/loaded",sessionChecker,function(req,res){
	fs.writeFileSync("status.txt","ON",'utf8');
})

app.listen(port, function() {
	console.log("Listening on port " + (process.env.PORT || port));
});


const exec = util.promisify(require('child_process').exec);

async function start() {
	const { stdout, stderr } = await exec('python3 start_server.py');
	console.log('stdout:', stdout);
	console.log('stderr:', stderr);
}

async function stop() {
	const { stdout, stderr } = await exec('python3 stop_server.py');
	console.log('stdout:', stdout);
	console.log('stderr:', stderr);
}


async function reload() {
	const { stdout, stderr } = await exec('git pull && npm install');
	console.log('stdout:', stdout);
	console.log('stderr:', stderr);
}

