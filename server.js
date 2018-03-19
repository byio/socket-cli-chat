const socketio = require('socket.io');

// Setup Sockets to Listen on Specific Port
const port = process.env.PORT || 2000;
const io = socketio.listen(port);

// Setup Sockets Connections
io.sockets.on('connection', (socket) =>{
  // Handle 'send' event from client
  socket.on('send', data => {
    io.sockets.emit('message', data);
  });
});
