const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io')(http, { cors: { origin: '*' } });

const rooms = new Map(); // Map to store participants in each room

io.on('connection', (socket) => {
  console.log('A user connected ', socket.id);

  socket.on('message', (message) => {
    console.log('Received message:', message);
    let room = rooms.get(message.room)
    room.forEach(participant => {
      console.log("participant: ", participant)
      if (participant.id === message.id) {
        participant.value = message.pointingValue;
        console.log("found : ",room)
      }
    })

    console.log("room: ", room)
    const participants = Array.from(room).map(participant => participant);
    socket.emit('participants', participants);
    socket.to(message.room).emit('participants', participants)
  });

  socket.on('joinRoom', ({ room, name, value, role }) => {
    socket.join(room);

    // Add participant to the room
    if (!rooms.has(room)) {
      rooms.set(room, new Set());
    }
    rooms.get(room).add({ id: socket.id, name, value, role });
    // console.log(rooms)

    // Get the participant in the room
    const participants = Array.from(rooms.get(room)).map(participant => participant);

    socket.emit('participants', participants);
    socket.to(room).emit('participants', participants);
  });

  socket.on('disconnect', () => {
    // Remove participant from the room
    console.log("user disconnected ", socket.id)
    let selectedRoom
    rooms.forEach((participants, room) => {
      // console.log("line 1: ", participants, room)
      participants.forEach(participant => {
        // console.log("line 2: ", participant)
        if (participant.id === socket.id) {
          console.log("found : ", participant)
          participants.delete(participant);
          console.log("sisa : ", participants)
          selectedRoom = room
        }
      });
    });

    if (selectedRoom) {
      // Get the participant names in the room
      console.log("selected room: ", selectedRoom)
      const participants = Array.from(rooms.get(selectedRoom) || []).map(participantsLeft => participantsLeft);
      console.log(participants)
      socket.to(selectedRoom).emit('participants', participants);
    }
  });
});

http.listen(4000, () => {
  console.log('Server is running on http://localhost:4000');
});