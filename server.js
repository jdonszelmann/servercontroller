


const express = require("express");
const ejs = require("ejs");
const bodyParser = require('body-parser');
const fs = require('fs');
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
	res.redirect("back")

})

app.post("/loaded",function(req,res){
	fs.writeFileSync("status.txt","ON",'utf8');
})

app.listen(port, function() {
	console.log("Listening on " + (process.env.PORT || port));
});