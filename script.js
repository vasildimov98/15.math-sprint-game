// Pages
const gamePage = document.getElementById("game-page");
const scorePage = document.getElementById("score-page");
const splashPage = document.getElementById("splash-page");
const countdownPage = document.getElementById("countdown-page");
// Splash Page
const startForm = document.getElementById("game__start-form");
const radioContainers = document.querySelectorAll(".game__radio");
const radioInputs = document.querySelectorAll("input");
const bestScores = document.querySelectorAll(".game__best-score-value");
// Countdown Page
const countdown = document.querySelector(".game__countdown");
// Game Page
const itemContainer = document.querySelector(".game__items");
// Score Page
const finalTimeEl = document.querySelector(".final-time");
const baseTimeEl = document.querySelector(".base-time");
const penaltyTimeEl = document.querySelector(".penalty-time");
const playAgainBtn = document.querySelector(".play-again");

// Equations
let questionAmount;
let equationsArray = [];
let playerGuessArray = [];
let bestScoresArr = [];

// Game Page
let firstNumber = 0;
let secondNumber = 0;
let equationObject = {};
const wrongFormat = [];

// Time
let timer;
let timePlayed = 0;
let baseTime = 0;
let penaltyTime = 0;
let finalTime = 0;
let finalTimeDisplayed = "0.0";

// Scroll
let scrollY = 0;

// update dom to show best scores
function bestScoresToDOM() {
  bestScores.forEach((el, i) => {
    el.textContent = `${bestScoresArr[i].bestScore}s`;
  });
}

// get best scores from local storage or create them
function getBestScores() {
  if (localStorage.getItem("bestScores")) {
    bestScoresArr = JSON.parse(localStorage.bestScores);
  } else {
    bestScoresArr = [
      { questions: 10, bestScore: finalTimeDisplayed },
      { questions: 25, bestScore: finalTimeDisplayed },
      { questions: 50, bestScore: finalTimeDisplayed },
      { questions: 99, bestScore: finalTimeDisplayed },
    ];

    localStorage.setItem("bestScores", JSON.stringify(bestScoresArr));
  }
}

function updateBestScores() {
  bestScoresArr.forEach((score, index) => {
    // Select correct best score
    if (questionAmount == score.questions) {
      // Return best score as a number with one decimal
      const savedBestScore = Number(bestScoresArr[index].bestScore);

      // Replace new best score if it bigger than last or 0;
      if (savedBestScore === 0 || savedBestScore > finalTime) {
        bestScoresArr[index].bestScore = finalTimeDisplayed;
      }
    }
  });
  // Update splash page
  bestScoresToDOM();
  // Saved to local storage
  localStorage.setItem("bestScores", JSON.stringify(bestScoresArr));
}

// Disable play again button for 2 seconds to have time to check the score
function disableButton(button) {
  button.hidden = true;
  setTimeout(function () {
    button.hidden = false;
  }, 1000);
}

// Play Again
function playAgain() {
  gamePage.addEventListener("click", startTimer);
  scorePage.hidden = true;
  splashPage.hidden = false;
  equationsArray = [];
  playerGuessArray = [];
  scrollY = 0;
}

// Show Score Page
function showScorePage() {
  disableButton(playAgainBtn);
  scorePage.hidden = false;
  gamePage.hidden = true;
}

// Format and Display time to DOM
function scoresToDOM() {
  finalTimeDisplayed = finalTime.toFixed(1);
  baseTime = timePlayed.toFixed(1);
  penaltyTime = penaltyTime.toFixed(1);
  baseTimeEl.textContent = `Base Time: ${baseTime}s`;
  penaltyTimeEl.textContent = `Penalty Time: +${penaltyTime}s`;
  finalTimeEl.textContent = `${finalTimeDisplayed}s`;
  itemContainer.scrollTo({ top: 0, behavior: "instant" });
  showScorePage();
  updateBestScores();
}

// Stop the timer if game is finished
function checkTime() {
  console.log(timePlayed);
  if (playerGuessArray.length == questionAmount) {
    console.log(playerGuessArray);
    clearInterval(timer);

    // Guess for wrong quested

    equationsArray.forEach((eq, i) => {
      if (playerGuessArray[i] !== eq.evaluated) {
        penaltyTime += 0.5;
      }
    });
    console.log(timePlayed, penaltyTime);
    finalTime = timePlayed + penaltyTime;
    scoresToDOM();
  }
}

// Add a tenth of a second to time played
function addTime() {
  timePlayed += 0.1;
  checkTime();
}

// Start timer when game page is clicked
function startTimer() {
  // Reset time
  timePlayed = 0;
  penaltyTime = 0;
  finalTime = 0;
  timer = setInterval(addTime, 100);
  gamePage.removeEventListener("click", startTimer);
}

// Scroll when user makes choice
function select(guessedTrue) {
  // Scroll 80px
  scrollY += 80;
  itemContainer.scroll(0, scrollY);
  // Add player guess to array
  return guessedTrue
    ? playerGuessArray.push("true")
    : playerGuessArray.push("false");
}

// Display Game page
function showGamePage() {
  gamePage.hidden = false;
  countdownPage.hidden = true;
}

// Random number from 0 to max
function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

// Create Correct/Incorrect Random Equations
function createEquations() {
  // Randomly choose how many correct equations there should be
  const correctEquations = getRandomInt(questionAmount);
  // Set amount of wrong equations
  const wrongEquations = questionAmount - correctEquations;

  console.log(`correctEquations: ${correctEquations}`);
  console.log(`wrongEquations: ${wrongEquations}`);
  // Loop through, multiply random numbers up to 9, push to array
  for (let i = 0; i < correctEquations; i++) {
    firstNumber = getRandomInt(9);
    secondNumber = getRandomInt(9);
    const equationValue = firstNumber * secondNumber;
    const equation = `${firstNumber} x ${secondNumber} = ${equationValue}`;
    equationObject = { value: equation, evaluated: "true" };
    equationsArray.push(equationObject);
  }
  // Loop through, mess with the equation results, push to array
  for (let i = 0; i < wrongEquations; i++) {
    firstNumber = getRandomInt(9);
    secondNumber = getRandomInt(9);
    const equationValue = firstNumber * secondNumber;
    wrongFormat[0] = `${firstNumber} x ${secondNumber + 1} = ${equationValue}`;
    wrongFormat[1] = `${firstNumber} x ${secondNumber} = ${equationValue - 1}`;
    wrongFormat[2] = `${firstNumber + 1} x ${secondNumber} = ${equationValue}`;
    const formatChoice = getRandomInt(3);
    const equation = wrongFormat[formatChoice];
    equationObject = { value: equation, evaluated: "false" };
    equationsArray.push(equationObject);
  }
  equationsArray = shuffle(equationsArray);
}

// Add Equations to DOM
function equationsToDOM() {
  equationsArray.forEach((eq) => {
    // item
    const item = document.createElement("div");
    item.classList.add("game__item");
    // Equations text
    const equationsText = document.createElement("h1");
    equationsText.textContent = eq.value;
    // Append
    item.appendChild(equationsText);
    itemContainer.appendChild(item);
  });
}

// Dynamically adding correct/incorrect equations
function populateGamePage() {
  // Reset DOM, Set Blank Space Above
  itemContainer.textContent = "";
  // Spacer
  const topSpacer = document.createElement("div");
  topSpacer.classList.add("height-240");
  // Selected Item
  const selectedItem = document.createElement("div");
  selectedItem.classList.add("selected-item");
  // Append
  itemContainer.append(topSpacer, selectedItem);

  // Create Equations, Build Elements in DOM
  createEquations();
  equationsToDOM();

  // Set Blank Space Below
  const bottomSpacer = document.createElement("div");
  bottomSpacer.classList.add("height-500");
  itemContainer.appendChild(bottomSpacer);
}

// Find the value of the radio that was checked
function findCheckingValue() {
  let value;
  radioInputs.forEach((i) => {
    if (i.checked) value = i.value;
  });
  return value;
}

// Display 3, 2, 1 GO!
function countdownStart() {
  countdown.textContent = "3";

  setTimeout(() => {
    countdown.textContent = "2";
  }, 1000);

  setTimeout(() => {
    countdown.textContent = "1";
  }, 2000);

  setTimeout(() => {
    countdown.textContent = "GO!";
  }, 3000);
}

// Move to countdown page
function showCountdown() {
  countdownPage.hidden = false;
  splashPage.hidden = true;
  countdownStart();
}

// Take submitted form and decide what game will be played
function selectQuestionAmount(e) {
  e.preventDefault();
  questionAmount = findCheckingValue();
  console.log(questionAmount);

  if (!questionAmount) return;
  showCountdown();
  populateGamePage();
  setTimeout(showGamePage, 4000);
}

// Add Event Listener
startForm.addEventListener("click", () => {
  radioContainers.forEach((radEl) => {
    // Remove Selected Label Styling
    radEl.classList.remove("selected-label");
    // Add class back if radio input is clicked
    if (radEl.children[1].checked) {
      radEl.classList.add("selected-label");
    }
  });
});
startForm.addEventListener("submit", selectQuestionAmount);
gamePage.addEventListener("click", startTimer);

// On Load
getBestScores();
bestScoresToDOM();
