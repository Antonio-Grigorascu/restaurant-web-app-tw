const fs = require('fs');
const session = require('express-session');
const formidable = require('formidable');
const path = require('path');

var express = require('express');

var app = express();


app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(req,res){
    res.render('pages/log');
});

app.use(session({
    secret: 'abcdefg', // pentru criptarea session ID-ului
    resave: true, // să nu șteargă sesiunile idle
    saveUninitialized: false
    // nu salvează obiectul sesiune dacă nu am setat niciun câmp
}));

function requireLogin(req, res, next) {
    if (req.session.username) {
        next();
    } else {
        res.redirect('/login');
    }
}


app.post('/login', function(req, res) {
    var form = new formidable.IncomingForm();
    form.parse(req, function(err, fields, files) {
        user =  verifica(fields.username, fields.parola);
        // verificarea datelor de login

        if(user){
            req.session.username = user;
            // setez userul ca proprietate a sesiunii
            res.redirect('/reservation');}
        else{
            req.session.username = false;
            res.redirect('/');
        }

    });
});

app.get('/logat',function(req,res){
    if(req.session.username) {
        res.render('pages/logout', {'nume': req.session.username});
    } else {
        res.redirect('/');
    }
});

app.get('/logout', function(req, res) {
    req.session.destroy();
    // distrugem sesiunea la intrarea pe pagina de logout
    res.render('pages/log');
});


app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/menu', function(req, res) {
    res.sendFile(path.join(__dirname, 'public', 'menu.html'));
});

app.get('/contact', function(req, res) {
    res.sendFile(path.join(__dirname, 'public', 'contact.html'));
});

app.get('/reservation', function(req, res) {
    res.sendFile(path.join(__dirname, 'public', 'reservation.html'));
});




app.listen(7000);
function verifica(s1,s2){

    var data = fs.readFileSync("users.json")
    var obj = JSON.parse(data);

    for(let i=0; i<obj.length; i++){
        if(obj[i].username == s1 && obj[i].parola == s2){
            return obj[i].username;
        }
    }
    return false;
}