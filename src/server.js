const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const cors = require('cors');

const corsOptions = {
    origin: 'http://localhost:3000', // Replace with the URL of your React app
    allowedHeaders: ["Access-Control-Allow-Origin"],
};

app.use(cors(corsOptions));

io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('message', (message) => {
    console.log('Received message:', message);
    io.emit('message', message);
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});


http.listen(4000, () => {
  console.log('Server is running on http://localhost:4000');
});