import express from 'express';
import { createServer } from 'http';
// import { listeners } from 'process';
import { Server } from 'socket.io';
import { join } from 'path';
import session from 'express-session';

// Create an Express app
const app = express();

// Create an http server using the Express app
const httpServer = createServer(app);

// Set up Socket.IO on HTTP server
const io = new Server(httpServer, { /* options */ });

// public directory path
const public_dir = '/home/ubuntu/Working/ChatRoom/public/'

// Import connection from db.js
// const createAndConnectDB = require('./db.js');
import createAndConnectDB  from './db.js'
async function ConnectDB() {
	const connection = await createAndConnectDB();
	console.log('Connected to database as id ' + connection.threadId);
	return connection;
}
const dbConnection =  await ConnectDB();


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
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
}));

app.get('/', (req, res) => {
	// res.send('Test');
	if (req.session.username) {
		console.log('user exissts');
	} else {
		console.log('user does not exist');
		// res.sendFile(path.join(public_dir, 'login.html'));
		// res.redirect('/login');
	}
	res.sendFile(join(public_dir, 'index.html'));
});

app.get('/chat.js', (req, res) => {
	res.sendFile(join(public_dir, 'chat.js'));
});


app.get('/login', (req, res) => {
	// console.log('debug');

	// TODO REMOVE
	// FOR TESTING PURPOSE
	const query = 'SELECT id, username, email FROM users WHERE id IS NOT NULL AND username IS NOT NULL AND email IS NOT NULL';
	dbConnection.query(query, (err, results) => {
		if (err) {
			console.error('Error executing query:', err);
			return;
		}

		console.log(`Query Results: ${JSON.stringify(results, null, 2)}`);
	});
	res.sendFile(join(public_dir, 'login.html'));

})



// app.get('/login', (req, res) => {
// 	res.sendFile('public', 'login.html');
// })

const PORT = process.env.PORT || 8080;
httpServer.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});


