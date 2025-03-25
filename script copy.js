const canvas = document.getElementById('gameCanvas');
const score  = document.getElementById('score');
const ctx = canvas.getContext('2d');
const canvasWidth = ctx.canvas.width;
const canvasHeight = ctx.canvas.height;

const apple = document.getElementById("apple");
const tnt = document.getElementById("tnt");
const playerSkin = document.getElementById("player");

const keysPressed = {};

const playerStatus = {
  x: canvasWidth / 2,
  y: canvasHeight / 2,
  width: 20,
  height: 20,
  speed: 10,
  score: 0,
}

const fruitStatus = {
  x: 10,
  y: 10,
  width: 20,
  height: 20,
  spwan: [],
  skin: (x,y,width,height)=> ctx.drawImage(apple,x,y,width,height)
}




const fruitRandomSpawn = () => {
  const fruit = { x: 10, y: 10 };
  const randomPosition = { x:   Math.floor(Math.random() * 65) * fruit.x, y: Math.floor(Math.random() * 87) * fruit.y };

  if (randomPosition.x === playerStatus.x && randomPosition.y === playerStatus.y) {
    return fruitRandomSpawn();
  }

  if (fruitStatus.spwan.length > 0) {
    for (const area in fruitStatus.spwan) {
      if (randomPosition.x === fruitStatus.spwan[area].x && randomPosition.y === fruitStatus.spwan[area].y) {
        return fruitRandomSpawn();
      }
    }
  }

  fruitStatus.skin(randomPosition.x, randomPosition.y, fruitStatus.width, fruitStatus.height);

  fruitStatus.spwan.push(randomPosition);
}



const collisionMargin = 15; // Tolerância para pegar a fruta

const fruitReSpawn = () => {
  for (const area in fruitStatus.spwan) {
    const fruit = fruitStatus.spwan[area];

    if (
      playerStatus.x < fruit.x + fruitStatus.width &&
      playerStatus.x + playerStatus.width > fruit.x &&
      playerStatus.y < fruit.y + fruitStatus.height &&
      playerStatus.y + playerStatus.height > fruit.y
    ) {
      playerStatus.score++;
      fruitStatus.spwan.splice(area, 1);
      fruitRandomSpawn();
      fruitReSpawn();
      // Atualizando o scores no HTML
      new Audio("/src/orb.mp3").play();
      score.innerText = playerStatus.score;
    } else {
      ctx.fillStyle = 'red';
      ctx.drawImage(apple,fruit.x, fruit.y, fruitStatus.width, fruitStatus.height);
    }
  }
}



const playerSpawn = () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  

  if (playerStatus.y >= 686) {
    playerStatus.y = 0;
    new Audio("/src/teleport.mp3").play();
  } else if (playerStatus.y < 0) {
    playerStatus.y = 680;
    new Audio("/src/teleport.mp3").play();
  } 
  
  if (playerStatus.x < 0) {
    playerStatus.x = 680;
    new Audio("/src/teleport.mp3").play();
  } else if (playerStatus.x >= 690) {
    playerStatus.x = 0;
    new Audio("/src/teleport.mp3").play();
  }

  const player = { x: playerStatus.x, y: playerStatus.y };
  ctx.fillStyle = 'blue';

  ctx.drawImage(playerSkin,player.x, player.y, playerStatus.width, playerStatus.height);
  fruitReSpawn();
}


document.addEventListener('keydown', (e) => {
  keysPressed[e.key] = true;
});

document.addEventListener('keyup', (e) => {
  keysPressed[e.key] = false;
});

const playerMove = () => {
  const moveAmount = 4;

  if (keysPressed['ArrowUp']) playerStatus.y -= moveAmount;
  if (keysPressed['ArrowDown']) playerStatus.y += moveAmount;
  if (keysPressed['ArrowLeft']) playerStatus.x -= moveAmount;
  if (keysPressed['ArrowRight']) playerStatus.x += moveAmount;

  playerSpawn();
}

setInterval(playerMove, 1000 / 60);

const startGame = () => { 
  setInterval(fruitRandomSpawn, 1000*5);

  playerSpawn();
  fruitRandomSpawn();  
}	

startGame();