//board
let board;
let boardWidth = 360;
let boardHeight = 640;
let context;

//bird
let birdWidth = 34;
let birdHeight = 24;
let birdX = boardWidth / 5;
let birdY = boardHeight / 2;

let bird = {
  x: birdX,
  y: birdY,
  width: birdWidth,
  height: birdHeight
};

//pipes
let pipeArray = [];
let pipeWidth = 64;
let pipeHeight = 512;
let pipeX = boardWidth;
let pipeY = 0;

let topPipeImg;
let bottomPipeImg;

//physics
let velocityX = -2;
let velocityY = 0;
let gravity = 0.4;

let gameOver = false;
let score = 0;

// sounds
let dieSound = new Audio("./soundeffects/sfx_die.wav");
let hitSound = new Audio("./soundeffects/sfx_hit.wav");
let pointSound = new Audio("./soundeffects/sfx_point.wav");
let wingSound = new Audio("./soundeffects/sfx_wing.wav");
let swooshSound = new Audio("./soundeffects/sfx_swooshing.wav");

let birdImg;

window.onload = () => {
  board = document.getElementById("board");
  board.height = boardHeight;
  board.width = boardWidth;
  context = board.getContext("2d");

  birdImg = new Image();
  birdImg.src = "./image/flappybird0.png";
  birdImg.onload = () => {
    context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);
  };

  topPipeImg = new Image();
  topPipeImg.src = "./image/toppipe.png";

  bottomPipeImg = new Image();
  bottomPipeImg.src = "./image/bottompipe.png";

  requestAnimationFrame(update);
  setInterval(placePipe, 2000);
  document.addEventListener("keydown", moveBird);
    document.addEventListener("mousedown", moveBird);
};

function update() {
  requestAnimationFrame(update);
  if (gameOver) {
    return;
  }

  context.clearRect(0, 0, board.width, board.height);

  // bird
  velocityY += gravity;
  bird.y = Math.max(bird.y + velocityY, 0);
  context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);

  if (bird.y > boardHeight) {
    dieSound.play();
    gameOver = true;
  }

  // pipes
  for (let i = 0; i < pipeArray.length; i++) {
    let pipe = pipeArray[i];
    pipe.x += velocityX;
    context.drawImage(pipe.img, pipe.x, pipe.y, pipe.width, pipe.height);

    if (!pipe.passed && bird.x > pipe.x + pipe.width) {
      score += 0.5;
      pipe.passed = true;
      if (score % 1 === 0) pointSound.play();
    }

    if (detectCollision(bird, pipe)) {
      hitSound.play();
      setTimeout(() => dieSound.play(), 200);
      gameOver = true;
    }
  }

  // remove off-screen pipes
  while (pipeArray.length > 0 && pipeArray[0].x < -pipeWidth) {
    pipeArray.shift();
  }

  // score display
  context.fillStyle = "white";
  context.font = "45px sans-serif";
  context.fillText(score, 5, 45);

  if (gameOver) {
    context.fillText("GAME OVER", 5, 90);
  }
}

function placePipe() {
  if (gameOver) {
    return;
  }

  let randompipeY = pipeY - pipeHeight / 4 - Math.random() * (pipeHeight / 2);
  let openingSpace = board.height / 4;

  let topPipe = {
    img: topPipeImg,
    x: pipeX,
    y: randompipeY,
    width: pipeWidth,
    height: pipeHeight,
    passed: false
  };
  pipeArray.push(topPipe);

  let bottompipe = {
    img: bottomPipeImg,
    x: pipeX,
    y: randompipeY + pipeHeight + openingSpace,
    width: pipeWidth,
    height: pipeHeight,
    passed: false
  };
  pipeArray.push(bottompipe);
}

function moveBird(e) {
  if (e.code == "Space" || e.code == "ArrowUp" || e.code == "KeyX" || e.type === "mousedown" ) {
    velocityY = -6;
    wingSound.play();
    swooshSound.play();

    if (gameOver) {
      bird.y = birdY;
      pipeArray = [];
      score = 0;
      velocityY = 0;
      gameOver = false;
    }
  }
}

function detectCollision(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}
