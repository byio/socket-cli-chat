const readline = require('readline');
const socketio = require('socket.io-client');

// Init Variables
const nickname;

// Setup Client Socket to Make Connection
const socket = socketio.connect('localhost', {port: 2000});

// Create Readline Interface
const rl = readline.createInterface(process.stdin, process.stdout);
