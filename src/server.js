import express from 'express';
import { createServer } from 'http';
// import { listeners } from 'process';
import { Server } from 'socket.io';
import { join } from 'path';
import session from 'express-session';
import bodyParser from 'body-parser';
import { createAndConnectDB, addUser, selectAllRows, userLookUp } from './db.js'

// const bodyParser = require('body-parser');

// Create an Express app
const app = express();

app.use(bodyParser.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(bodyParser.json()); // Parse JSON bodies
app.use(express.json()); // Parse JSON bodies

// Create an http server using the Express app
const httpServer = createServer(app);

// Set up Socket.IO on HTTP server
const io = new Server(httpServer, { /* options */ });

// public directory path
const public_dir = '/home/ubuntu/Working/ChatRoom/public/'

// Create connection to database
createAndConnectDB();

let clientSet = new Set();

function ClientCount() {
	const count = clientSet.size;
	return count;
}

io.on("connection", (socket) => {
	// console.log("user connected");
	console.log("client id is " + socket.id);
	clientSet.add(socket.id);
	// console.log("Clients:" + clientSet.keys().next().value);
	socket.on("disconnect", (reason) => {
		clientSet.delete(socket.id);
		console.log('disconnected');
		console.log(reason);
		console.log(`${ClientCount()} total clients connected.`);

	})

	socket.on("recvClientMessage", (msg) => {
		console.log(`Client said "${msg}".`);
		socket.broadcast.emit("receiveOtherClientMessages", msg);
	});

	console.log(`${ClientCount()} total clients connected.`);
});

// Serve static files from the "public" directory
// app.use(express.static('public'));

// Use session middleware
app.use(session({
    secret: 'random_string_for_session_secret_12345',  // Your secret key here
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
}));


// Index endpoint
app.get('/', (req, res) => {
	console.log(req.session);
	console.log('username: ' + req.session.username);
	if (req.session.username) {
		console.log('user exissts');
		res.sendFile(join(public_dir, 'index.html'));
	} else {
		console.log('user does not exist');
		// res.sendFile(path.join(public_dir, 'login.html'));
		res.redirect('/signup');
	}
	// res.sendFile(join(public_dir, 'index.html'));
});


// chat.js
app.get('/chat.js', (req, res) => {
	res.sendFile(join(public_dir, 'chat.js'));
});


// Endpoint that servers login page
app.get('/login', async (req, res) => {
	res.sendFile(join(public_dir, 'login.html'));
});


// Look up username and password. Returns true if login is correct, false otherwise.
app.post('/user_lookup', async (req, res) => {
	const { username, password } = req.body;
	console.log(username + password);
	const isLoggedIn = await userLookUp(username, password);

	try {
		if (isLoggedIn === true) {
			req.session.username = username; // Store the username in the session
			res.redirect('/');
		} else {
			return res.status(401).send('Username or password is incorrect');
		}
	} catch {
		console.error(error);
        res.status(500).send('Internal Server Error');
	}

});


// Serves signup page.
app.get('/signup', (req, res) => {
	res.sendFile(join(public_dir, 'signup.html'));
});


// Endpoint that adds user to database
app.post('/adduser', async (req, res) => {
	// TODO: Add encryption for passwords rather than storing in plain text
	console.log(`Body contains ${JSON.stringify(req.body, null, 2)}`);
	const { email, username, password } = req.body;
	try {
		await addUser(email, username, password);

		// Set the user information in the session after successful signup
		req.session.username = username; // Store the username in the session
		console.log(req.session);
		res.redirect('/');


	} catch (error) {
        if (error.statusCode) {
            // If the error has a statusCode property, send that status code and message
            return res.status(error.statusCode).send(error.message);
        }
        return res.status(500).send('Database error');
	}

	return;
});


// app.get('/login', (req, res) => {
// 	res.sendFile('public', 'login.html');
// })

const PORT = process.env.PORT || 8080;
httpServer.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});


