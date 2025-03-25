const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");

const io = new Server(server);

const players = [];
let fruits  = [];

const fruitDados = {
  width: 20,
  height: 20
}


function generateSimpleUUID() {
  const letters = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  
  const randomLetter = () => letters[Math.floor(Math.random() * letters.length)];
  const randomNumber = () => numbers[Math.floor(Math.random() * numbers.length)];

  return `${randomLetter()}${randomLetter()}${randomNumber()}${randomNumber()}${randomNumber()}${randomLetter()}${randomLetter()}`;
}


const fruitRandomSpawn = () => {
  const fruit = { x: 10, y: 10 };
  const randomPosition = { x: Math.floor(Math.random() * 65) * fruit.x, y: Math.floor(Math.random() * 87) * fruit.y };

  if (fruits.length > 100) return;
  
  fruits.push({
    id: generateSimpleUUID(),
    ...randomPosition
  });

  io.emit('api spawn fruit', fruits);
}


app.use(express.static(__dirname + '/public'))

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});



io.on('connection', (socket) => {

  console.log('a user connected');
  players.push(socket.id);
  
  socket.once('player connected', (data)=> {
    socket.broadcast.emit('api player connected', {
      id: socket.id,
     ...data
    });
  })

  socket.on('player movement', (data) => {
    socket.broadcast.emit('api player movement', {
      id: socket.id,
      ...data
    });
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
    socket.broadcast.emit('player disconnect', socket.id);
  });

  io.emit('api connection', {
    fruits,
    id: socket.id
  });

  // FRUTAS
  setInterval(fruitRandomSpawn, 1000 * 5); // 5 seconds


  socket.on('player fruit colection', (dados)=> {


    

    const fruitColection = dados['area'];
    const player = dados['player'];

    const dx = Math.abs(player.x - fruitColection.x);
    const dy = Math.abs(player.y - fruitColection.y);

    if (
      dx < player.width / 2 + fruitDados.width / 2 &&
      dy < player.height / 2 + fruitDados.height / 2
    ) {

      player.score++;

      fruits = fruits.filter((fruit) => fruit.id !== fruitColection['id']);

     // io.emit('api player score update', player);

      socket.emit("api player fruit colection", {player, fruits});
    }

  })

  
});


server.listen(3000, () => {
  console.log('listening on *:3000');
});