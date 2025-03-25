const socket = io();
const canvas = document.getElementById('gameCanvas');
const scoreDiv = document.getElementById('score');
const playerDiv = document.getElementById('players');
const ctx = canvas.getContext('2d');

const canvasWidth = ctx.canvas.width;
const canvasHeight = ctx.canvas.height;

const miraSkin = document.getElementById("mira");

const player = {
  id: '',
  x: canvasWidth / 2,
  y: canvasHeight / 2,
  width: 40,
  height: 40,
  speed: 10,
  score: 0,
}


const fruitDados = {
  x: 40,
  y: 40,
  width: 20,
  height: 20,
  spwan: [],
  skin: (x, y, width, height) => ctx.drawImage(apple, x, y, width, height)
}

let players = [];

const frutasSpawn = () => {
  for (const area of fruitDados.spwan) {
  
    const dx = Math.abs(player.x - area.x);
    const dy = Math.abs(player.y - area.y);
  
    if (
      dx < (player.width + fruitDados.width) / 3 &&
      dy < (player.height + fruitDados.height) / 3
    ) {
      socket.emit("player fruit colection", { player, area });
    }
  
    ctx.drawImage(apple, area.x, area.y, fruitDados.width, fruitDados.height);
  }
  
}


const playersSpawn = () => {  
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (const aPlayer of players) {

    playerDiv.innerHTML = `<li>${aPlayer.id}</li>`

    ctx.drawImage(miraSkin, aPlayer.x, aPlayer.y, aPlayer.width, aPlayer.height);
  }

  ctx.drawImage(miraSkin, player.x, player.y, player.width, player.height);
  
  frutasSpawn();
}


const playersScore = () => { 
  players.forEach(player => {
    playerDiv.innerHTML = `<li> ${player.id} SCORE => ${player.score}</li>`
  });

  scoreDiv.innerText = `${player.score}`

}

canvas.addEventListener('mousemove', (e) => {

  const rect = canvas.getBoundingClientRect();

  player.x = e.clientX - rect.left - player.width / 2;
  player.y = e.clientY - rect.top - player.height / 2;

  socket.emit('player movement', player);

  playersSpawn();
});

socket.on('api connection', (data) => {
  player.id = data['id'];
  fruitDados.spwan = data['fruits'];
  
  playersSpawn();
  console.log('Connected to the server');
});


socket.onClose(() => {
  console.warn('Conexão perdida com o servidor.');
  
  setTimeout(() => socket.connect(), 3000);
});


socket.emit('player connected', player);

socket.on('api player connected', (data) => {
  
  data = data.filter(d=> d.id != '');
  players.push(data);
});

socket.on('api player movement', (data) => {

  players = players.filter(a => a.id !== data.id);
  players.push(data)

  playersSpawn();
});



socket.on('player disconnect', (id) => {
  console.log(`Player ${id} disconnected`);
  players = players.filter(a => a.id!== id);
  playersSpawn();
});


/// FRUTAS

socket.on('api spawn fruit', (dados)=> {
  fruitDados.spwan = dados;

  playersSpawn();
})
socket.on('api player fruit colection', (data) => {

  const playerUpdate  = data['player'];
  const fruitUpdate   = data['fruits'];

  if (playerUpdate.id === player.id) {
    player.score = playerUpdate.score;
  } else {
    players = players.map(player => player.id === playerUpdate.id? playerUpdate : player);
  }

  
  fruitDados.spwan = fruitUpdate;

  playersSpawn();
  playersScore();

});


/// SCORE UPDATE

socket.on('api player score update', (data) => {

});
