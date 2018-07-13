var express = require("express");
var expressHandlebars = require("express-handlebars");
var mongoose = require("mongoose");
var bodyParser = require("body-parser");
var cheerio = require("cheerio");
var request = require("request");
var mongojs = require("mongojs");
var app = express();
var PORT = process.env.PORT || 3000;
//var db = mongojs(databaseUrl, collections);
var logger = require("morgan");
var axios = require("axios");
var db = require("./models");



app.use(logger("dev"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
var databaseUri ='mongodb://localhost/mongoose';
  if (process.env.MONGODB_URI) {
    mongoose.connect(process.env.MONGODB_URI);
  } else {
    mongoose.connect(databaseUri);
  }

var ab = mongoose.connection;
ab.on('error', function(err){
  console.log('mongoose error: ', err);
});

ab.once('open', function(){
  console.log('mongoose success');
});
//mongoose.connect("mongodb://localhost/week18Populater");
app.get("/scrape", function(req, res) {
  axios.get("https://www.washingtonpost.com").then(function(response) {
    var $ = cheerio.load(response.data);
    $("div.flex-stack").each(function(i, element) {
      var result = {};
      result.title = $(this)

        .find("a")
        .text();
      result.link = $(this)
        .find("a")
        .attr("href");
      db.Article.create(result)
        .then(function(dbArticle) {
          console.log(dbArticle);
        })
        .catch(function(err) {
          return res.json(err);
        });
    });
    res.send("Scrape Complete");
  });
});

app.get("/articles", function(req, res) {
  db.Article.find({})
    .then(function(dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(err) {
      res.json(err);
    });
});

app.get("/articles/:id", function(req, res) {
  db.Article.findOne({ _id: req.params.id })
    .populate("note")
    .then(function(dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(err) {
      res.json(err);
    });
});
app.post("/articles/:id", function(req, res) {
  db.Note.create(req.body)
    .then(function(dbNote) {
      return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
    })
    .then(function(dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Start the server
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});
