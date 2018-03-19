const readline = require('readline');
const socketio = require('socket.io-client');
const color = require('ansi-color').set;

// Init Variables
let nickname;

// Setup Client Socket to Make Connection
const socket = socketio('http://localhost:2000');

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
      const emote = `${nickname} ${arg}.`;
      socket.emit('send', {
        type: 'emote',
        message: emote
      });
      break;
    default:
      console_out('Invalid command.');
  }
}

// Handle and Output Incoming Messages
socket.on('message', data => {
  let lead;
  // if regular chat message from user
  if (data.type == 'chat' && data.nickname == nickname) {
    lead = color("<"+data.nickname+"> ", "white+black_bg");
    console_out(lead + data.message);
    // if chat message from other users
  } else if (data.type == 'chat' && data.nickname != nickname) {
    lead = color("<"+data.nickname+"> ", "green");
    console_out(lead + data.message);
    // if notice from app
  } else if (data.type == 'notice') {
    console_out(color(data.message), "red");
    // if targeted msg to user
  } else if (data.type == 'tell' && data.to == nickname) {
    lead = color("["+data.from+"->"+data.to+"] ", "cyan");
    console_out(lead + data.message);
  } else if (data.type == 'emote') {
    console_out(color(data.message), "blink");
  }
});
