const fs = require('fs');
const session = require('express-session');
const formidable = require('formidable');
const path = require('path');
var nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const port = 7000
var express = require('express');
var app = express();

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname, 'public')));


app.use(session({
    secret: 'abcdefg', // pentru criptarea session ID-ului
    resave: true, // să nu șteargă sesiunile idle
    saveUninitialized: false
    // nu salvează obiectul sesiune dacă nu am setat niciun câmp
}));


app.use(express.json());


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


// LOGIN/LOGOUT
app.post('/login', function(req, res) {
    var form = new formidable.IncomingForm();
    form.parse(req, function(err, fields, files) {
        user =  verifica(fields.username, fields.parola);
        // verificarea datelor de login
        console.log(user);

        if(user){
            req.session.username = user;
            // setez userul ca proprietate a sesiunii
            console.log('Login successful for user:', user);
            res.redirect('/reservation');}
        else{
            req.session.username = false;
            console.log('Login failed for username:', fields.username);
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
    res.redirect('/');
});

// FISIERE HTML
app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
    // res.render('pages/log');
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

app.get('/isLoggedIn', function(req, res) {
    res.json({ isLoggedIn: !!req.session.username });
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

app.get('/occupiedTablesData', (req, res) => {
    fs.readFile('reservations.json', (err, data) => {
        if (err) {
            res.status(500).json({ error: 'Error reading reservations file' });
            return;
        }
        const reservations = JSON.parse(data);
        const occupiedTables = reservations.map(reservation => reservation.table_id);
        res.json({ occupiedTables });
    });
});

// 404
app.use((req, res, next) => {
    res.status(404).render('pages/404');
});


////////////////////////////////////////////////////////////////////////////////
// EMAIL SENDER
var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'grigorascu95antonio@gmail.com',
        pass: 'emha zdcu vxkg lqnv'
    }
});

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

function emailReservations() {
    const filePath = path.join(__dirname, 'reservations.json');

    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading reservations file:', err);
            return;
        }

        let reservations = [];
        try {
            reservations = JSON.parse(data);
        } catch (parseError) {
            console.error('Error parsing reservations file:', parseError);
            return;
        }

        if (reservations.length === 0) {
            console.log('There are no reservations.');
            return;
        }

        const occupiedTables = reservations.map(reservation => reservation.table_id);
        const emailText = `Mese ocupate: ${occupiedTables.join(', ')}`;

        var mailOptions = {
            from: 'grigorascu95antonio@gmail.com',
            to: 'grigorascu.antonio@gmail.com',
            subject: 'Mese ocupate - Rezervări',
            text: emailText
        };

        transporter.sendMail(mailOptions, function(error, info) {
            if (error) {
                console.log('Eroare la trimiterea email-ului:', error);
            } else {
                console.log('Email trimis: ' + info.response);
            }
        });
    });
}


setInterval(emailReservations, 60 * 60 * 1000);

///////////////////////////////////////////////////////////////////////////////
// SERVER
app.listen(port, ()=>{
    console.log(`Server is running on http://localhost:${port}`);
});

////////////////////////////////////////////////////////////////////////////
// Functii
function verifica(s1, s2) {
    if (!s1 || !s2) {
        console.error('Username sau parola nu sunt definite');
        return false;
    }

    try {
        const data = fs.readFileSync("users.json", 'utf8');
        const obj = JSON.parse(data);

        for (let i = 0; i < obj.length; i++) {
            if (obj[i].username == s1 && obj[i].parola == s2) {
                return obj[i].username;
            }
        }
    } catch (error) {
        console.error('Eroare la citirea sau parsarea fișierului users.json:', error);
        return false;
    }

    return false;
}

async function readReservationsFromFile() {
    const filePath = path.join(__dirname, 'reservations.json');
    const data = await fs.promises.readFile(filePath, 'utf8');
    if (data) {
        return JSON.parse(data);
    } else {
        return []; // Return an empty array if the file is empty
    }
}

function printReservedTables(filePath) {
    fs.promises.readFile(filePath, 'utf8')
        .then(data => {
            if (data) {
                const reservations = JSON.parse(data);
                const reservedTables = reservations.map(reservation => reservation.table_id); // Assuming "table_id" holds the table number
                console.log('Reserved tables:', reservedTables.join(', '));
            } else {
                console.log('No reservations found.');
            }
        })
        .catch(error => {
            console.error('Error reading reservations file:', error);
        });
}


printReservedTables('reservations.json');