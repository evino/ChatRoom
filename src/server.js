const express = require('express');
const http = require('http');

const app = express();
const server = http.createServer(app);

// app.get('/', (req, res) => {
// 	// res.send('Test');
// 	res.send('<h1>Hello World</h1>');
// });

// Serve static files from the "public" directory
app.use(express.static('public'));

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});


