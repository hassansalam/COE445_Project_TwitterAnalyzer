// Making the port number dynamic for deploying on heroku
var port = (process.env.VCAP_APP_PORT || 3000);
// This Project will use these libraries
var express = require("express");
var sentiment = require('sentiment');
var twitter = require('ntwitter');
var stream;
var app = express();
var tweetCounter = 0;
var TotalSentiment = 0;
var Topic;
var status;
// Using the keys of User @coe561658
var MyTwitter = new twitter({
    consumer_key: 'oaAzsDu1JzOZj8sRYJDEvjFcl',
    consumer_secret: 'YDMfJ6bkrflkCT0PhOnwQjXVsKlJG6cKgIbWMDuexe27fIzUWy',
    access_token_key: '3236580886-eh6VF85lNAll1jCiVzkP6ddEjfd9d7uCjBysSNP',
    access_token_secret: '8HKa3mef56n9pnfy4BTB7VzkOjXTRVZ72Rit81Occmey6'
});
// This method will check if the keys of the account are working or not
app.get('/check', function (req, res) {
    MyTwitter.verifyCredentials(function (error, data) {
		if (error) {
			res.send("<h1>Cannot connect to Twitter Check Your Keys !</h1>");
        }
		else{
			res.sendFile(__dirname +'/check.html');
		}        
    });
});

// This function will reset the analysing
function resetMonitoring() {
	if (stream) {
		var tempStream = stream;
	    stream = null;  
		tempStream.destroySilent();
	}
    Topic = "";
	console.log("The Analyzer has been reset !");
}
// This method will start analysing the topic 
app.get('/monitor', function (req, res) {
    beginMonitoring(req.query.phrase);
	res.sendFile(__dirname +'/analyzer-working.html');
});
// This method will reset analysing the topic 
app.get('/reset', function (req, res) {
    resetMonitoring();
	res.sendFile(__dirname +'/analyzer.html');
});
// This method will handle requesting the home page
app.get('/', function (req, res) {
  
  res.sendFile(__dirname +'/index.html');
  
});
// This method will handle requesting the index page
app.get('/home', function (req, res) {
  
  res.sendFile(__dirname +'/index.html');
  
});
// This method will handle requesting the analyzer page
app.get('/analyzer', function (req, res) {
  
  res.sendFile(__dirname +'/analyzer.html');
});
// This method will handle requesting the analyzer-working page
app.get('/analyzer-working', function (req, res) {
  
  res.sendFile(__dirname +'/analyzer-working.html');
  
});
// This method will handle requesting the analyzer-starting page
app.get('/analyzer-starting', function (req, res) {
	var response="";
	response += "<!doctype html>";
	response += "<html>";
	response += "<head>";
	response += "	<meta http-equiv=\"refresh\" content=\"6\">";
	response += "	<title>Twitter Analyzer<\/title>";
	response += "	<script src=\"TwitterAnalyzer.js\"><\/script>";
	response += "<\/head>";
	response += "";
	response += "<body>";
	response += "	<h1> Welcome to Twitter Analyzer <\/h1>";
	response += "	<h3> The Twitter Community is feeling <\/h3>";
	response += "	<P>";
	response += "		Twitter is Feeling = "+status;
	response += "		<br>"
	response += "		Topic Analysed : "+Topic;
	response += "		<br>"
	response += "		Number of Tweets Analysed = "+tweetCounter;
	response += "	<\/P>";
	response += "	<br> ";
	response += "	<h3> <A href=\"\/reset\"> Restart The Analyzer<\/A> <\/h3>";
	response += "	<h2> <p> | <a href=\"\/home\">Home<\/a> | <a href=\"\/analyzer\">The Analyzer<\/a> | <a href=\"\/check\">Check Twitter Connectivity<\/ <\/p> <\/h2>";
	response += "<\/body>";
	response += "";
	response += "<\/html>";
	response += "";
	response += "";
	res.send(response);
});
// The actual function to analyse the topic
function beginMonitoring(phrase)
{
    // clean and dump everything
    if (Topic)
	{
        resetMonitoring();
    }
    Topic = phrase;
    tweetCounter = 0;
    TotalSentiment = 0;
	MyTwitter.stream('statuses/filter', {'track': Topic}, function (inStream)
	{
		stream = inStream;
		console.log("Monitoring Twitter for " + Topic);
        stream.on('data', function (data)
		{
			//The sentiment can only evaluate English tweets
			if (data.lang === 'en')
			{
				sentiment(data.text, function (err, result)
				{
					tweetCounter++;
					TotalSentiment += result.score;
				});
            }
        });
    });
	return stream;
}
setInterval(function()
{
	var avg = TotalSentiment / tweetCounter;
	if (avg > 0.5)
	{
		status = "excited,thrilled,passionate,delighted";		
	}
	if (avg < -0.5)
	{
		status = "angry,furious,offended,outraged";
	}
	else
	{
		status = "normal,natural,ordinary,routine";
	}
}, 6000);
app.listen(port);
console.log("The Server is ON and listing on port:" + port);