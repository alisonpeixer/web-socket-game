const canvas = document.getElementById('gameCanvas');
const score = document.getElementById('score');
const diamonds = document.getElementById('diamonds');
const ctx = canvas.getContext('2d');
const canvasWidth = ctx.canvas.width;
const canvasHeight = ctx.canvas.height;

const apple = document.getElementById("apple");
const tntSkin = document.getElementById("tnt");
const playerSkin = document.getElementById("player");
const mira = document.getElementById("mira");
const diamondSkin = document.getElementById("diamond");

const keysPressed = {};

let players = [];

let playerStatus = {
  x: canvasWidth / 2,
  y: canvasHeight / 2,
  width: 50,
  height: 50,
  speed: 10,
  score: 0,
  diamonds: 1,
  diamondAtived: false
}

const fruitStatus = {
  x: 40,
  y: 40,
  width: 20,
  height: 20,
  spwan: [],
  skin: (x, y, width, height) => ctx.drawImage(apple, x, y, width, height)
}


const tntStatus = {
  x: 40,
  y: 40,
  width: 20,
  height: 20,
  speed: 2,
  direction: 0,
  spwan: [],
  skin: (x, y, width, height) => ctx.drawImage(tntSkin, x, y, width, height)
}


const diamondStatus = {
  x: 40,
  y: 40,
  width: 20,
  height: 20,
  speed: 3,
  direction: 0,
  spwan: [],
  skin: (x, y, width, height) => ctx.drawImage(diamondSkin, x, y, width, height)
}


const playerSpawnOnline = (playerObj) => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const player = { x: playerObj.x, y: playerObj.y };
  ctx.fillStyle = 'blue';

  diamonds.innerHTML = playerObj.diamonds;

  ctx.drawImage(mira, player.x, player.y, playerObj.width, playerObj.height);

}

const timerElement = document.getElementById('timer');

let countdown;

function startTimer(duration) {
  clearInterval(countdown);
  const endTime = Date.now() + duration * 1000;

  countdown = setInterval(() => {
    const remainingTime = Math.max(0, Math.floor((endTime - Date.now()) / 1000));
    const minutes = String(Math.floor(remainingTime / 60)).padStart(2, '0');
    const seconds = String(remainingTime % 60).padStart(2, '0');
    timerElement.textContent = `${minutes}:${seconds}`;

    if (remainingTime === 0) {
      clearInterval(countdown);
      alert('⏰ Tempo esgotado!');
    }
  }, 1000);
}

const removePlayerDiamond = () => {
  if (playerStatus.diamonds > 0) {
    playerStatus.diamondAtived = false;
  }
}



const fruitRandomSpawn = () => {

  if (fruitStatus.spwan.length >= 100) return;

  const fruit = { x: 10, y: 10 };
  const randomPosition = { x: Math.floor(Math.random() * 65) * fruit.x, y: Math.floor(Math.random() * 87) * fruit.y };

  if (randomPosition?.x === playerStatus.x && randomPosition?.y === playerStatus.y) {
    return fruitRandomSpawn();
  }

  if (fruitStatus.spwan.length > 0) {
    for (const area in fruitStatus.spwan) {
      if (randomPosition?.x === fruitStatus.spwan[area].x && randomPosition?.y === fruitStatus.spwan[area].y) {
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

    const dx = Math.abs(playerStatus.x - fruit.x);
    const dy = Math.abs(playerStatus.y - fruit.y);

    if (
      dx < playerStatus.width / 2 + fruitStatus.width / 2 &&
      dy < playerStatus.height / 2 + fruitStatus.height / 2
    ) {
      playerStatus.score++;
      fruitStatus.spwan.splice(area, 1);

      fruitReSpawn();
      new Audio("/src/orb.mp3").play();
      score.innerText = playerStatus.score;


      console.log(Math.random().toFixed(3))
      Math.random().toFixed(2) == 0.77 && diamondRandomSpawn();
    } else {
      ctx.fillStyle = 'red';
      ctx.drawImage(apple, fruit.x, fruit.y, fruitStatus.width, fruitStatus.height);
    }
  }
}

const tntRandomSpawn = () => {
  if (tntStatus.spwan.length >= 3 && playerStatus.score <= 100 || tntStatus.spwan.length >= 20) {
    tntStatus.spwan.splice(0, 1);
  };

  const tnt = { x: 10, y: 10 };
  const randomPosition = { x: Math.floor(Math.random() * 65) * tnt.x, y: Math.floor(Math.random() * 87) * tnt.y };

  const dx = Math.abs(playerStatus.x - randomPosition.x);
  const dy = Math.abs(playerStatus.y - randomPosition.y);


  if (
    dx < playerStatus.width / 2 + fruitStatus.width / 2 &&
    dy < playerStatus.height / 2 + fruitStatus.height / 2
  ) {
    return tntRandomSpawn();
  }

  if (tntStatus.spwan.length > 0) {
    for (const area in tntStatus.spwan) {
      if (randomPosition.x === tntStatus.spwan[area].x && randomPosition.y === tntStatus.spwan[area].y) {
        return tntRandomSpawn();
      }
    }
  }
  tntStatus.skin(randomPosition.x, randomPosition.y, tntStatus.width, tntStatus.height);
  tntStatus.spwan.push(randomPosition);
}

const tntReSpawn = () => {
  for (const area in tntStatus.spwan) {
    const tnt = tntStatus.spwan[area];
    const dx = Math.abs(playerStatus.x - tnt.x);
    const dy = Math.abs(playerStatus.y - tnt.y);

    if (
      dx < playerStatus.width / 2 + tntStatus.width / 2 &&
      dy < playerStatus.height / 2 + tntStatus.height / 2
    ) {

      if (!playerStatus.diamondAtived) {
        playerStatus.score--;
        new Audio("/src/explode.mp3").play();
        score.innerText = playerStatus.score;
        tntStatus.spwan.splice(area, 1);
      }
      else {
        playerStatus.score++;
        new Audio("/src/orb.mp3").play();
        score.innerText = playerStatus.score;
        tntStatus.spwan.splice(area, 1);
      }


    } else {

      tntStatus.skin(tnt.x, tnt.y, tntStatus.width, tntStatus.height)
    }
  }
}



const diamondRandomSpawn = () => {
  console.log("Diamond")
  const diamond = { x: 10, y: 10 };
  const randomPosition = { x: Math.floor(Math.random() * 65) * diamond.x, y: Math.floor(Math.random() * 87) * diamond.y };

  const dx = Math.abs(playerStatus.x - randomPosition.x);
  const dy = Math.abs(playerStatus.y - randomPosition.y);
  if (
    dx < playerStatus.width / 2 + diamondStatus.width / 2 &&
    dy < playerStatus.height / 2 + diamondStatus.height / 2
  ) {
    return diamondRandomSpawn();
  }

  if (diamondStatus.spwan.length > 0) {
    for (const area in diamondStatus.spwan) {
      if (randomPosition.x === diamondStatus.spwan[area].x && randomPosition.y === diamondStatus.spwan[area].y) {
        return diamondRandomSpawn();
      }
    }
  }

  diamondStatus.skin(randomPosition.x, randomPosition.y, diamondStatus.width, diamondStatus.height);
  diamondStatus.spwan.push(randomPosition);
}


const diamondReSpawn = () => {
  for (const area in diamondStatus.spwan) {
    const diamond = diamondStatus.spwan[area];
    const dx = Math.abs(playerStatus.x - diamond.x);
    const dy = Math.abs(playerStatus.y - diamond.y);
    if (
      dx < playerStatus.width / 2 + diamondStatus.width / 2 &&
      dy < playerStatus.height / 2 + diamondStatus.height / 2
    ) {
      playerStatus.diamonds++;
      new Audio("/src/achievement.mp3").play();
      diamonds.innerText = playerStatus.diamonds;
      diamondStatus.spwan.splice(area, 1);
    } else {
      diamondStatus.skin(diamond.x, diamond.y, diamondStatus.width, diamondStatus.height)
    }
  }
}



const playerSpawn = () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const player = { x: playerStatus.x, y: playerStatus.y };
  ctx.fillStyle = 'blue';

  diamonds.innerHTML = playerStatus.diamonds;

  ctx.drawImage(mira, player.x, player.y, playerStatus.width, playerStatus.height);
  fruitReSpawn();
  tntReSpawn();
  diamondReSpawn();
}


document.addEventListener('keydown', (e) => {
  keysPressed[e.key] = true;
});

document.addEventListener('keyup', (e) => {
  keysPressed[e.key] = false;
});




let mouseX = playerStatus.x;
let mouseY = playerStatus.y;

canvas.addEventListener('mousemove', (e) => {

  const rect = canvas.getBoundingClientRect();
  playerStatus.x = e.clientX - rect.left - playerStatus.width / 2;
  playerStatus.y = e.clientY - rect.top - playerStatus.height / 2;



});


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


}

setInterval(playerMove, 1000 / 60);


const startGame = () => {
  setInterval(fruitRandomSpawn, 1000 * 3);
  setInterval(tntRandomSpawn, 1000 * 2);
  setInterval(playerSpawn, 1000 * 2);


  startTimer(10 * 60);
}

startGame();



document.addEventListener('keydown', (e) => {
  if (
    e.keyCode === 68 && playerStatus.diamonds > 0
  ) {
    new Audio("/src/totem.mp3").play();
    playerStatus.diamonds--;
    playerStatus.diamondAtived = true;
    setInterval(removePlayerDiamond, 60000);
  }
});




socket.on('api reload', function() {
  location.reload();
});

socket.on('player connected', function(data) {

  console.log(players)

  for (const player of data) {
    console.log(player)
    playerSpawnOnline(player)
  }
});

socket.emit('player join', playerStatus)