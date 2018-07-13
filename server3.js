var express = require("express");
var expressHandlebars = require("express-handlebars");
var mongoose = require("express");
var bodyParser = require("body-parser");
var cheerio = require("cheerio");
var request = require("request");
var mongojs = require("mongojs");

var app = express();
var PORT = 3000;

var databaseUrl = "zoo";
var collections = ["animals"];

var db = mongojs(databaseUrl, collections);
db.on("error", function(error) {
  console.log("Database Error:", error);
});

app.get("/", function(req, res) {
  res.send("Hello world");
});

app.get("/all", function(req, res) {

  db.scrapedData.find({}, function(error, found) {

    if (error) {
      console.log(error);
    }

    else {
      res.json(found);
    }
  });
});


  request("https://www.3ders.org/", function(error, response, html) {
    var $ = cheerio.load(html);
    var results = [];

    $("div.art-content-layout").each(function(i, element) {
      var title = $(element).children().find("span").find("span").find("a")
                            .text().replace(/\n\n/g,"");
      var link = $(element).children().find("a").attr("href");
        results.push({
            title: title,
            link: link
        });
        // console.log(results);
    //   if (title && link) {
    //     db.mongoose.insert({
    //       title: title,
    //       link: link
    //     },
    //     function(err, inserted) {
    //       if (err) {
    //         console.log(err);
    //       }
    //       else {
    //         console.log(inserted);
    //         // console.log(results);
    //       }
    //     });
    //   }
    });
    // for (j = 0; j<results.length;j++)
    console.log(results);

    
  });
//   res.send("Scrape Complete");
//   db.scrapedData.insert(results)
// });
app.listen(3000, function() {
  console.log("App running on port 3000!");
});
  