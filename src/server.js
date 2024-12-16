const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

// Create an Express app
const app = express();

// Create an http server using the Express app
const httpServer = http.createServer(app);

// Set up Socket.IO on HTTP server
const io = new Server(httpServer, { /* options */ });


let clientSet = new Set();
io.on("connection", (socket) => {
	// console.log("user connected");
	console.log("client id is " + socket.id);
	clientSet.add(socket.id);
	// console.log("Clients:" + clientSet.keys().next().value);
	socket.on("disconnect", (reason) => {
		clientSet.delete(socket.id);
		console.log('disconnected');
		console.log(reason);
		console.log(`${clientSet.size} total clients connected.`);

	})

	console.log(`${clientSet.size} total clients connected.`);
});



// app.get('/', (req, res) => {
// 	// res.send('Test');
// 	res.send('Hello World');
// });

// Serve static files from the "public" directory
app.use(express.static('public'));

const PORT = process.env.PORT || 8080;
httpServer.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});


