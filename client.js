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

// Console.log() workaround for rl.prompt()
function console_out(msg) {
  process.stdout.clearLine();
  process.stdout.cursorTo(0);
  console.log(msg);
  rl.prompt(true);
}

// Handle Input ('line' event)
rl.on('line', (line) => {
  // check if input is meant to be a command (starts with /) or text
  if (line[0] == "/" && line.length > 0) {
    // separate the comand from the argument
    const cmd = line.match(/[a-z]+\b/)[0];
    const arg = line.substring(cmd.length + 2, line.length);
    // invoke function to process command
    chat_command(cmd, arg);
  } else {
    // send chat message
    socket.emit('send', { type: 'chat', message: line, nickname});
    rl.prompt(true);
  }
});

// Process Chat Command
function chat_command(cmd, arg) {
  switch (cmd) {
    // change nickname
    case 'nick':
      const notice = `${nickname} changed their name to ${arg}.`
      nickname = arg;
      socket.emit('send', {
        type: 'notice',
        message: notice
      });
      break;
    // targeted msg
    case 'msg':
      const to = arg.match(/[a-z]+\b/)[0];
      const message = arg.substring(to.length, arg.length);
      socket.emit('send', {
        type: 'tell',
        message,
        to,
        from: nickname
      });
      break;
    // emote
    case 'me':
      const emote = `${nickame} ${arg}.`;
      socket.emit('send', {
        type: 'emote',
        message: emote
      });
      break;
    default:
      console_out('Invalid command.');
  }
}
