const readline = require('readline');
const socketio = require('socket.io-client');

// Init Variables
let nickname;

// Setup Client Socket to Make Connection
const socket = socketio.connect('localhost', {port: 2000});

// Create Readline Interface
const rl = readline.createInterface(process.stdin, process.stdout);

// Get Username
rl.question('Please enter a username: ', (username) => {
  nickname = username;
  const msg = `${nickname} has joined the chat.`;
  // Emit Feedback to Server
  socket.emit('send', {
    type: 'notice',
    message: msg
  });
  rl.prompt(true);
});
