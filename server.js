


const express = require("express");
const ejs = require("ejs");
const bodyParser = require('body-parser');
const fs = require('fs');
const util = require('util');
const child_process = require('child_process');
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser());

let port = 8000

app.set('view engine', 'ejs');


let failure = ""

/* serves main page */
app.get("/", function(req, res) {
	res.render('index.ejs',{
		status:fs.readFileSync('status.txt', 'utf8'),
		failure:failure
	})
	failure = ""
});

app.post("/on", function(req,res){
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

app.post("/off", function(req,res){

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

app.post("/reload", function(req,res){

	reload()
	res.redirect("back")

})

app.post("/loaded",function(req,res){
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
	const { stdout, stderr } = await exec('git pull');
	console.log('stdout:', stdout);
	console.log('stderr:', stderr);
}

