const express = require('express');
const http = require('http');
const { listeners } = require('process');
const { Server } = require('socket.io');
const path  = require('path');
const session = require('express-session');

// Create an Express app
const app = express();

// Create an http server using the Express app
const httpServer = http.createServer(app);

// Set up Socket.IO on HTTP server
const io = new Server(httpServer, { /* options */ });

// public directory path
const public_dir = '/home/ubuntu/Working/ChatRoom/public/'

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
		res.redirect('/login');
	}
	res.sendFile(path.join(public_dir, 'index.html'));
});

app.get('/chat.js', (req, res) => {
	res.sendFile(path.join(public_dir, 'chat.js'));
});


app.get('/login', (req, res) => {
	// console.log('debug');
	res.sendFile(path.join(public_dir, 'login.html'));
})



// app.get('/login', (req, res) => {
// 	res.sendFile('public', 'login.html');
// })

const PORT = process.env.PORT || 8080;
httpServer.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});


