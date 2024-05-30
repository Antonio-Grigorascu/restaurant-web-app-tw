const fs = require('fs');
const session = require('express-session');
const formidable = require('formidable');
const path = require('path');
var nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const port = 7000
var express = require('express');


var app = express();

/////////////////////////////////////////////////////////////////////////////////////////////////////////////
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

app.use(express.json());

// Middleware pentru parsarea datelor din formular
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


// LOGIN/LOGOUT
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

// FISIERE HTML
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

// REZERVARI
// Endpoint pentru rezervare

app.post('/reserve', async (req, res) => {
    try {

        const reservationData = await req.body;

        const filePath = path.join(__dirname, 'reservations.json');
        let reservations = [];
        try {
            const fileData = await fs.promises.readFile(filePath, 'utf8');
            if (fileData) {
                reservations = JSON.parse(fileData);
            }
        } catch (err) {
            console.error('Error reading reservations file:', err);
        }

        reservations.push(reservationData);


        await fs.promises.writeFile(filePath, JSON.stringify(reservations, null, 2));

        res.json({ success: true, message: 'Reservation saved successfully!' });
    } catch (error) {

        console.error('Error processing reservation:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

////////////////////////////////////////////////////////////////////////////////
// EMAIL SENDER
// var transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//         user: 'grigorascu95antonio@gmail.com',
//         pass: 'emha zdcu vxkg lqnv'
//     }
// });
//
// var mailOptions = {
//     from: 'websitefresco@yahoo.com',
//     to: 'grigorascu.antonio@gmail.com',
//     subject: 'Mesaj din Node.js',
//     text: 'Hello!'
// };
//
// transporter.sendMail(mailOptions, function(error, info){
//     if (error) {
//         console.log(error);
//     } else {
//         console.log('Mail trimis: ' + info.response);
//     }
// });

///////////////////////////////////////////////////////////////////////////////
// SERVER
app.listen(port, ()=>{
    console.log(`Server is running on http://localhost:${port}`);
});

////////////////////////////////////////////////////////////////////////////
// Functii
function verifica(s1,s2){

    var data = fs.readFileSync("users.json")
    var obj = JSON.parse(data);

    for(let i=0; i<obj.length; i++){
        if(obj[i].username === s1 && obj[i].parola === s2){
            return obj[i].username;
        }
    }
    return false;
}

function readReservationsFromFile(callback) {
    fs.readFile('reservations.json', (err, data) => {
        if (err) {
            console.error('Error reading reservations file:', err);
            callback([]);
        } else {
            callback(JSON.parse(data));
        }
    });
}

function writeReservationToFile(reservation, callback) {
    readReservationsFromFile((reservations) => {
        reservations.push(reservation);
        fs.writeFile('reservations.json', JSON.stringify(reservations), (err) => {
            if (err) {
                console.error('Error writing reservations file:', err);
            }
            callback();
        });
    });
}