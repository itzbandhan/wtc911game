document.addEventListener("DOMContentLoaded", () => {
  const playButton = document.getElementById("playButton");
  const replayButton = document.getElementById("replayButton");
  const homeButton = document.getElementById("homeButton");
  const crashText = document.getElementById("crashText");
  const winText = document.getElementById("winText"); // Added for winning
  const homeScreen = document.getElementById("home");
  const endScreen = document.getElementById("endScreen");
  const gameCanvas = document.getElementById("gameCanvas");
  const highScoreDisplay = document.getElementById("highScore");
  const currentScoreDisplay = document.getElementById("currentScore");
  const finalHighScoreDisplay = document.getElementById("finalHighScore");
  const ctx = gameCanvas.getContext("2d");

  let highScore = localStorage.getItem("highScore") || 0;
  let score = 0;
  let gravity = 0.3;
  let isGameOver = false;
  let plane = { x: 50, y: 150, size: 30, velocity: 0 }; // Plane as the player
  let buildings = [];
  let buildingInterval;
  let gameLoopInterval;

  const bgm = new Audio("bgm.mp3");
  bgm.volume = 0.5;
  bgm.loop = true;

  const crashSound = new Audio("crash.mp3");

  highScoreDisplay.textContent = `High Score: ${highScore}`;

  playButton.addEventListener("click", startGame);
  replayButton.addEventListener("click", startGame);
  homeButton.addEventListener("click", goHome);

  function startGame() {
    homeScreen.classList.add("hidden");
    endScreen.classList.add("hidden");
    gameCanvas.classList.remove("hidden");

    gameCanvas.width = window.innerWidth;
    gameCanvas.height = window.innerHeight;

    score = 0;
    isGameOver = false;
    plane.y = gameCanvas.height / 2;
    plane.velocity = 0;
    buildings = [];

    bgm.play(); // Play background music

    buildingInterval = setInterval(spawnBuilding, 1400); // Adjusted spawn time
    gameLoopInterval = setInterval(gameLoop, 20);

    gameCanvas.addEventListener("click", flap);
  }

  function gameLoop() {
    if (isGameOver) return;

    updatePlane();
    updateBuildings();
    checkCollisions();

    if (score >= 200) endGame("win"); // Win condition
  }

  function updatePlane() {
    plane.velocity += gravity;
    plane.y += plane.velocity;

    if (plane.y > gameCanvas.height - plane.size) {
      endGame("Mission unsuccessful, the plane fell!");
      return;
    }

    if (plane.y < 0) {
      endGame("Plane went out of maqsad!");
      return;
    }

    ctx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);

    ctx.fillStyle = "#000000"; // Black for plane
    ctx.font = "30px Arial";
    ctx.fillText("✈️", plane.x, plane.y + plane.size); // Plane emoji
  }

  function spawnBuilding() {
    let gap = 200; // Increased gap for better playability
    let height = Math.floor(Math.random() * (gameCanvas.height - gap));
    let color = "#808080"; // Gray for WTC-like buildings

    buildings.push({ x: gameCanvas.width, y: 0, width: 50, height, color });
    buildings.push({
      x: gameCanvas.width,
      y: height + gap,
      width: 50,
      height: gameCanvas.height - height - gap,
      color,
    });
  }

  // function updateBuildings() {
  //   buildings.forEach((building, index) => {
  //     building.x -= 4;

  //     if (building.x + building.width < 0) {
  //       buildings.splice(index, 1);
  //       score += 1;
  //     }

  //     ctx.fillStyle = building.color;
  //     ctx.fillRect(building.x, building.y, building.width, building.height);

  //     for (let i = 0; i < building.height; i += 20) {
  //       for (let j = 0; j < building.width; j += 20) {
  //         ctx.fillStyle = "#ffffff"; // Window color
  //         ctx.fillRect(building.x + j + 5, building.y + i + 5, 5, 10); // Windows on buildings
  //       }
  //     }
  //   });

  //   ctx.fillStyle = "#ffffff";
  //   ctx.font = "20px Arial";
  //   ctx.fillText(`Score: ${score}`, 10, 30);
  // }
  function updateBuildings() {
    buildings.forEach((building, index) => {
      building.x -= 4;

      if (building.x + building.width < 0) {
        buildings.splice(index, 1);
        score += 1;
      }

      // Draw the building
      ctx.fillStyle = building.color;
      ctx.fillRect(building.x, building.y, building.width, building.height);

      // Calculate window positions to center the windows in the building
      const windowWidth = 5;
      const windowHeight = 10;
      const padding = 10; // Padding between windows

      // Calculate how many rows and columns of windows fit within the building
      const rows = Math.floor(
        (building.height - padding) / (windowHeight + padding)
      );
      const columns = Math.floor(
        (building.width - padding) / (windowWidth + padding)
      );

      // Draw windows in a grid pattern, centering them horizontally
      for (let i = 0; i < rows; i++) {
        for (let j = 0; j < columns; j++) {
          const xPos = building.x + padding + j * (windowWidth + padding);
          const yPos = building.y + padding + i * (windowHeight + padding);

          // Ensure windows fit inside the building, without overflow
          if (
            xPos + windowWidth <= building.x + building.width &&
            yPos + windowHeight <= building.y + building.height
          ) {
            ctx.fillStyle = "#ffffff"; // Window color
            ctx.fillRect(xPos, yPos, windowWidth, windowHeight); // Draw the window
          }
        }
      }
    });

    // Display the score
    ctx.fillStyle = "#ffffff";
    ctx.font = "20px Arial";
    ctx.fillText(`Score: ${score}`, 10, 30);
  }


  function checkCollisions() {
    buildings.forEach((building) => {
      if (
        plane.x + plane.size > building.x &&
        plane.x < building.x + building.width &&
        plane.y + plane.size > building.y &&
        plane.y < building.y + building.height
      ) {
        endGame("Mission unsuccessful, the plane crashed!");
      }
    });
  }

  function flap() {
    plane.velocity = -6;
  }

  function endGame(result) {
    clearInterval(buildingInterval);
    clearInterval(gameLoopInterval);
    bgm.pause();
    bgm.currentTime = 0; // Reset bgm

    isGameOver = true;

    gameCanvas.classList.add("hidden");
    endScreen.classList.remove("hidden");

    if (result === "win") {
      winText.classList.remove("hidden");
      crashText.classList.add("hidden");
      winText.textContent =
        "Congratulations, you saved the WTC! Mission successful! 🎉";
    } else {
      crashSound.play(); // Play crash sound
      crashText.classList.remove("hidden");
      winText.classList.add("hidden");
      crashText.textContent = result;
    }

    currentScoreDisplay.textContent = `Score: ${score}`;
    if (score > highScore) {
      highScore = score;
      localStorage.setItem("highScore", highScore);
    }
    finalHighScoreDisplay.textContent = `High Score: ${highScore}`;
  }

  function goHome() {
    homeScreen.classList.remove("hidden");
    endScreen.classList.add("hidden");
  }
});
