// Dependencies
var express = require("express");
var exphbs = require("express-handlebars");
var bodyParser = require("body-parser");
var mongojs = require("mongojs");
var request = require("request");
var cheerio = require("cheerio");

// Create an instance of the express app.
var app = express();

// Database configuration
var databaseUrl = "scrapper";
var collections = ["scrapperData"];

// Hook mongojs configuration to the db variable
var db = mongojs(databaseUrl, collections);
db.on("error", function(error) {
  console.log("Database Error:", error);
});

app.use(express.static("public"));

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// parse application/json
app.use(bodyParser.json());

// Set the port of our application
// process.env.PORT lets the port be set by Heroku
var PORT = process.env.PORT || 8080;

// Set Handlebars.
var exphbs = require("express-handlebars");

app.engine("handlebars", exphbs({ defaultLayout: "main" }));

app.set("view engine", "handlebars");

// Routes
app.get("/", function(req, res) {
  res.render("index");
});

app.get("/scrape", function(req, res) {
  request("https://www.nytimes.com/section/technology", function(
    error,
    response,
    html
  ) {
    var $ = cheerio.load(html);
    var results = [];

    $("h2.headline").each(function(i, element) {
      var title = $(element).text();
      var link = $(element)
        .children()
        .attr("href");

      results.push({
        title: title,
        link: link
      });
    });
    console.log(results);
  });
});

app.get("/mongo", function(req, res) {
    request("https://www.nytimes.com/section/technology", function(
      error,
      response,
      html
    ) {
      var $ = cheerio.load(html);
      var results = [];
  
      $("h2.headline").each(function(i, element) {
        var title = $(element).text();
        var link = $(element)
          .children()
          .attr("href");
  
        results.push({
          title: title,
          link: link
        });
      });
      
      for(i=0; i < results.length; i++){
        db.scrapper.insert(results[i]);
      }
  
      res.json(results);
    });
  });

app.get("/savedarticles", function(req, res) {
  res.render("savedArticles");
});

// Start our server so that it can begin listening to client requests.
app.listen(PORT, function() {
  // Log (server-side) when our server has started
  console.log("Server listening on: http://localhost:" + PORT);
});
