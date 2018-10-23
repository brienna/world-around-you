
// Tutorial: https://medium.freecodecamp.org/going-out-to-eat-and-understanding-the-basics-of-express-js-f034a029fb66

// Load modules 
const express = require('express');
const exphbs = require('express-handlebars');
const path = require('path')

// Initialize the app and engine
const app = express();
const hbs = exphbs.create();

// Tell app where static files are 
app.use(express.static(path.join(__dirname, '/public')));

// Set handlebars as the templating engine
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');


// HOME PAGE
app.get("/", function(req, res) {
    // To do
});

// STORY PAGE
app.get("/story", function(req, res) {
    // Display story template
    res.render('story', {
        title: 'Hi',
        body: 'Bye'
    });
});


// Tell app to listen on port 3000
app.listen(3000, function() {
    console.log('App listening on localhost:3000')
});

