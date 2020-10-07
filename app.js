const express = require('express'); // Express framework
const request = require('request'); // Express framework
const app = express();













let session = require('express-session');
// Set up session with express
app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));
let path = require('path');

const sqlite3 = require('sqlite3'); // Interfaces with sqlite3 database
const db = new sqlite3.Database('database/CCdatabase.db');

const bodyParser = require('body-parser'); // Parses data from http request bodies
//S et up bodyParser with express
app.use(bodyParser.urlencoded({
	extended: true
}));
app.use(bodyParser.json());

//Set up web folders
app.use(express.static(__dirname + '/public'));

app.listen(3001, function() {
	console.log('Listening on port ' + 3001 + '.');
});

require('dns').lookup(require('os').hostname(), function (err, add, fam) {
  console.log('addr: '+add);
})



//Set up PUG view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(express.static("public"));







/*
██       ██████   ██████  ██ ███    ██
██      ██    ██ ██       ██ ████   ██
██      ██    ██ ██   ███ ██ ██ ██  ██
██      ██    ██ ██    ██ ██ ██  ██ ██
███████  ██████   ██████  ██ ██   ████
*/

app.get('/', function(request, response) {
	if (request.session.loggedin) {
		response.redirect('/home');
	} else {
		response.redirect('/login');
	}
	response.end();
});

app.get('/login', function(request, response) {
	response.status(200).render('login', {
		// darkmode: request.session.darkmode
	});
});

app.get('/accountCreation', function(request, response) {
	response.status(200).render('account');
});


app.post('/auth', function(request, response) {
	let studentID = request.body.student_ID;
	let password = request.body.password;
	if (studentID && password) {
		db.get('SELECT * FROM cc_accounts WHERE student_ID = \'' + studentID + '\' AND password = \'' + password + '\';', function(err, results) {
			if (err)
				console.log(err);
			if (results) {
				request.session.loggedin = true;
				request.session.student_ID = studentID;
				request.session.accUID = results.account_UID;
				request.session.firstName = results.first_name;
				request.session.lastName = results.last_name;
				request.session.accTYPE = results.account_type;
				response.redirect('/home');
				console.log(studentID + "#" + results.account_UID + " logged in.");
			} else {
				response.send('Incorrect Username and/or Password!');
			}
			response.end();
		});
	} else {
		response.send('Please enter Username and Password!');

		response.end();
	}
});

app.get('/home', function(request, response) {
	if (request.session.loggedin) {
		response.status(200).render(request.session.accTYPE + 'index', {
				firstName: request.session.firstName,
        lastName: request.session.lastName,
				accountUID: request.session.accUID
				// darkmode: request.session.darkmode
		});
	} else {
		response.redirect('/login');
	}
	// response.end();
});




app.post('/createAccount', function(request, response) {
		db.run("INSERT INTO cc_accounts (first_name, last_name, student_ID, password, account_type) VALUES ('" + request.body.first_name + "','" + request.body.last_name + "','" + request.body.student_ID + "','" + request.body.password + "','" + request.body.accountType + "')", function(err) {
			response.redirect('/login');
			if (err) {
				console.log("ERROR:");
				console.log(err);
			} else {
				console.log("An account with the student ID: " + request.body.student_ID + " was created.");
			}
		});

});









app.get('/studentlist', function(request, response) {
		 db.all('SELECT * FROM cc_accounts WHERE account_type = "Student";', function(err, results) {
			 results.sort(function(a, b) {
			 return parseFloat(b.student_ID) - parseFloat(a.student_ID);
			 });
			 response.status(200).render('studentlist', {
				 	firstName: request.session.firstName,
				 	lastName: request.session.lastName,
					accountUID: request.session.accUID,
					accounts: results
			 });
		 });

});
