window.addEventListener("load", function () {
  //-----------Setting Up Canvas-----------
  const canvas = document.getElementById("canvas1");
  const ctx = canvas.getContext("2d");

  canvas.width = 1400;
  canvas.height = 720;

  let enemies = [];
  let score = 0;
  let gameover = false;

  //---------Declaring Classes-------------
  class InputHandler {
    constructor() {
      this.keys = [];
      this.touchY = "";
      this.touchTreshold = 30;
      window.addEventListener("keydown", (event) => {
        if (
          (event.key === "ArrowDown" ||
            event.key === "ArrowUp" ||
            event.key === "ArrowLeft" ||
            event.key === "ArrowRight") &&
          this.keys.indexOf(event.key) === -1
        ) {
          this.keys.push(event.key);
        } else if (event.key === "Enter" && gameover) restartGame();
      });

      window.addEventListener("keyup", (event) => {
        if (
          event.key === "ArrowDown" ||
          event.key === "ArrowUp" ||
          event.key === "ArrowLeft" ||
          event.key === "ArrowRight"
        ) {
          this.keys.splice(this.keys.indexOf(event.key), 1);
        }
      });
      window.addEventListener("touchstart", (event) => {
        this.touchY = event.changedTouches[0].pageY;
      });
      window.addEventListener("touchmove", (event) => {
        const swipeDistance = event.changedTouches[0].pageY - this.touchY;
        // Check Statement Swipe Up
        if (
          swipeDistance < -this.touchTreshold &&
          this.keys.indexOf("swipe up" === -1)
        )
          this.keys.push("swipe up");
        // Check Statement Swipe Down
        else if (
          swipeDistance > this.touchTreshold &&
          this.keys.indexOf("swipe down") === -1
        )
          this.keys.push("swipe down");
        if (gameover) restartGame;
      });
      window.addEventListener("touchend", (event) => {
        this.keys.splice(this.keys.indexOf("swipe up"), 1);
        this.keys.splice(this.keys.indexOf("swipe down"), 1);
      });
    }
  }

  class Player {
    constructor(gameWidth, gameHeight) {
      this.gameWidth = gameWidth;
      this.gameHeight = gameHeight;
      this.width = 200;
      this.height = 200;
      this.x = 100;
      this.y = this.gameHeight - this.height;
      this.image = document.getElementById("player");
      this.frameX = 0;
      this.frameY = 0;
      this.maxFrame = 8;
      this.fps = 20;
      this.frameTimer = 0;
      this.frameInterval = 1000 / this.fps;
      this.speed = 0;
      this.velocity_y = 0;
      this.gravity = 1;
    }
    retart() {
      this.x = 100;
      this.y = this.gameHeight - this.height;
      this.maxFrame = 8;
      this.frameY = 0;
    }

    draw(context) {
      context.drawImage(
        this.image,
        this.frameX * this.width,
        this.frameY * this.height,
        this.width,
        this.height,
        this.x,
        this.y,
        this.width,
        this.height
      );
    }
    update(input, deltaTime, enemies) {
      // Collision Detection
      enemies.forEach((enemy) => {
        const distanceX = enemy.x + enemy.width / 2 - (this.x + this.width / 2);
        const distanceY =
          enemy.y + enemy.height / 2 - (this.y + this.height / 2);
        const distance = Math.sqrt(
          distanceX * distanceX + distanceY * distanceY
        );
        // Check Statement
        if (distance < enemy.width / 2 + this.width / 2) {
          gameover = true;
        }
      });
      //sprite Animations
      if (this.frameTimer > this.frameInterval) {
        // Check Statement
        if (this.frameX >= this.maxFrame) this.frameX = 0;
        else this.frameX++;
        this.frameTimer = 0;
      } else {
        this.frameTimer += deltaTime;
      }

      // Movement Controls
      this.x += this.speed;
      if (input.keys.indexOf("ArrowRight") > -1) {
        this.speed = 5;
      } else if (input.keys.indexOf("ArrowLeft") > -1) {
        this.speed = -5;
        // Horizontal Movement
      } else if (input.keys.indexOf("ArrowUp") > -1 && this.onGround()) {
        this.velocity_y -= 30;
      } else {
        this.speed = 0;
      }
      // Horizontal Boundaries
      if (this.x < 0) this.x = 0;
      else if (this.x > this.gameWidth - this.width)
        this.x = this.gameWidth - this.width;
      // Vertical Movement
      this.y += this.velocity_y;
      if (!this.onGround()) {
        this.velocity_y += this.gravity;
        this.maxFrame = 5;
        this.frameY = 1;
      } else {
        this.velocity_y = 0;
        this.maxFrame = 8;
        this.frameY = 0;
      }
      if (this.y > this.gameHeight - this.height)
        this.y = this.gameHeight - this.height;
    }
    // utility Method
    onGround() {
      return this.y >= this.gameHeight - player.height;
    }
  }

  class Background {
    constructor(gameWidth, gameHeight) {
      this.gameWidth = gameWidth;
      this.gameHeight = gameHeight;
      this.image = document.getElementById("background");
      this.x = 0;
      this.y = 0;
      this.width = 2400;
      this.height = 720;
      this.speed = 7;
    }
    draw(context) {
      context.drawImage(this.image, this.x, this.y, this.width, this.height);
      context.drawImage(
        this.image,
        this.x + this.width - this.speed,
        this.y,
        this.width,
        this.height
      );
    }
    update() {
      this.x -= this.speed;
      // Reset Check Statement
      if (this.x < 0 - this.width) this.x = 0;
    }
    restart() {
      this.x = 0;
    }
  }

  class Enemy {
    constructor(gameWidth, gameHeight) {
      this.gameWidth = gameWidth;
      this.gameHeight = gameHeight;
      this.width = 160;
      this.height = 119;
      this.image = document.getElementById("enemy");
      this.x = this.gameWidth;
      this.y = this.gameHeight - this.height;
      this.frameX = 0;
      this.maxFrame = 5;
      this.fps = 20; //will effect x-axis horizontal. fps: Frames Per Second.
      this.frameTimer = 0;
      this.frameInterval = 1000 / this.fps;
      this.speed = 8;
      this.markedForDeletion = false;
    }
    draw(context) {
      context.drawImage(
        this.image,
        this.frameX * this.width,
        0,
        this.width,
        this.height,
        this.x,
        this.y,
        this.width,
        this.height
      );
    }
    update(deltaTime) {
      // Check Statement
      if (this.frameTimer > this.frameInterval) {
        // Run code
        if (this.frameX >= this.maxFrame) this.frameX = 0;
        else this.frameX++;
        // Reset frameTimer to zero
        this.frameTimer = 0;
      } else {
        // Keep adding deltaTime to frameTimer
        this.frameTimer += deltaTime;
      }
      this.x -= this.speed;
      // Check Statement
      if (this.x < 0 - this.width) {
        this.markedForDeletion = true;
        //increase score by 1
        score++;
      }
    }
  }

  //--------Declaring functions----------
  function handleEnemies(deltaTime) {
    // Statement Check
    if (enemyTimer > enemyInterval + randomEnemyInterval) {
      enemies.push(new Enemy(canvas.width, canvas.height));
      randomEnemyInterval = Math.random() * 1000 + 500;
      // Reset Enemy Timer
      enemyTimer = 0;
    } else {
      // Keep Adding Enemies Timer
      enemyTimer += deltaTime;
    }
    enemies.forEach((enemy) => {
      // calling methods draw and update
      enemy.draw(ctx);
      enemy.update(deltaTime);
    });
    // Assign it to the same Array but filter it.
    enemies = enemies.filter((enemy) => !enemy.markedForDeletion);
  }

  function displayStatusText(context) {
    context.textAlign = "left";
    context.font = "30px Poppins";
    context.fillStyle = "black";
    context.fillText("Score: " + score, 20, 50); // x and y coordinates
    context.font = "30px Poppins";
    context.fillStyle = "white";
    context.fillText("Score: " + score, 22, 53); // x and y coordinates
    if (gameover) {
      context.textAlign = "center";
      context.font = "30px Poppins";
      context.fillStyle = "black";
      context.fillText(
        "Game Over, Press Enter to Restart ",
        canvas.width / 2,
        200
      );
      context.fillStyle = "white";
      context.fillText(
        "Game Over, Press Enter to Restart ",
        canvas.width / 2 + 3,
        203
      );
    }
  }

  function restartGame() {
    player.retart();
    background.restart();
    enemies = [];
    score = 0;
    gameover = false;
    animation(0);
  }

  // Declaring Instances
  const input = new InputHandler();
  const player = new Player(canvas.width, canvas.height);
  const background = new Background(canvas.width, canvas.height);

  // Helper Variables
  let lastTime = 0;
  let enemyTimer = 0;
  let enemyInterval = 1000;
  let randomEnemyInterval = Math.random() * 1000 + 500;

  // main game loop function
  function animation(timeStamp) {
    const deltaTime = timeStamp - lastTime;
    lastTime = timeStamp;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    background.draw(ctx);
    // background.update();
    player.draw(ctx);
    player.update(input, deltaTime, enemies);
    handleEnemies(deltaTime);
    displayStatusText(ctx);
    //one line if statement
    if (!gameover) requestAnimationFrame(animation);
  }
  animation(0);
});
