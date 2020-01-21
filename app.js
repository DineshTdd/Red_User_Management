const express = require('express');
const exphbs = require('express-handlebars');
const path = require('path');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const redis = require('redis');

// Create Redis Client
let client = redis.createClient();

client.on('connect', () => {
    console.log('Connected to Redis...');
});

//Set Port
const port = 5000;

//Init app
const app = express();

// Set View Engine
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

//body parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

// methodOverride
app.use(methodOverride('_method')); // delete request with form

//Search Page
app.get('/', (req, res, next) => {
    res.render('searchusers');
});

//Search Processing
app.post('/user/search', (req, res, next) => {
    let id = req.body.id;

    client.HGETALL(id, (err, obj) => {
        if(!obj) {
            res.render('searchusers', {
                error: 'User does not exist'
            });
        } else {
            obj.id = id;
            res.render('details', {
                user: obj
            });
        }
    });
});

// Add User page
app.get('/user/add', (req, res, next) => {
    res.render('adduser');
});

// Process Add User Page
app.post('/user/add', (req, res, next) => {
    let id = req.body.id;
    let first_name = req.body.first_name;
    let last_name = req.body.last_name;
    let email = req.body.email;
    let phone = req.body.phone;

    client.HMSET(id, [
        `first_name`, first_name,
        `last_name`, last_name,
        `email`, email,
        `phone`, phone
    ], (err, reply) => {
        if(err) {
            console.log(err);
        }
        console.log(reply);
        res.redirect('/');
    })
});

// Delete User
app.delete('/user/delete/:id', (req, res, next) => {
    client.del(req.params.id);
    res.redirect('/');
});

app.listen(port, () => {
    console.log(`Server started on port: ${port}`);
});