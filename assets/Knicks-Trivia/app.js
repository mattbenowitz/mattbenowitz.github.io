// --- DOM Elements ---
const startScreen = document.getElementById('start-screen');
const quizScreen = document.getElementById('quiz-screen');
const resultsScreen = document.getElementById('results-screen');

const startBtn = document.getElementById('start-btn');
const nextBtn = document.getElementById('next-btn');
const restartBtn = document.getElementById('restart-btn');

const questionText = document.getElementById('question-text');
const optionsContainer = document.getElementById('options-container');
const funFactText = document.getElementById('fun-fact');
const scoreDisplay = document.getElementById('score-display');
const streakDisplay = document.getElementById('streak-display');
const shotClockDisplay = document.getElementById('shot-clock');
const progressBar = document.getElementById('progress-bar');
const finalScoreDisplay = document.getElementById('final-score');

// --- Game State Variables ---
let questionsData = [];
let currentQuestionIndex = 0;
let score = 0;
let streak = 0;
let timeLeft = 24;
let timerInterval;

// --- Initialize App ---
// Fetch the JSON data when the script loads
async function fetchQuestions() {
    try {
        const response = await fetch('questions.json');
        const data = await response.json();
        questionsData = data.questions;
        // Enable the start button only after data is loaded
        startBtn.disabled = false;
        startBtn.textContent = "Tip Off (Start Game)";
    } catch (error) {
        console.error("Error loading questions:", error);
        startBtn.textContent = "Error loading game data";
    }
}

// --- Event Listeners ---
startBtn.addEventListener('click', startGame);
nextBtn.addEventListener('click', loadNextQuestion);
restartBtn.addEventListener('click', startGame);

// --- Game Functions ---
function startGame() {
    // Reset state
    currentQuestionIndex = 0;
    score = 0;
    streak = 0;
    updateScoreBoard();
    
    // Switch screens
    startScreen.classList.add('hidden');
    resultsScreen.classList.add('hidden');
    quizScreen.classList.remove('hidden');

    loadQuestion();
}

function loadQuestion() {
    resetTurn();
    
    const currentQuestion = questionsData[currentQuestionIndex];
    
    // Update Progress Bar
    const progressPercentage = ((currentQuestionIndex) / questionsData.length) * 100;
    progressBar.style.width = `${progressPercentage}%`;

    // Render Question
    questionText.textContent = currentQuestion.question;

    // Render Options
    currentQuestion.options.forEach(option => {
        const button = document.createElement('button');
        button.textContent = option;
        button.classList.add('option-btn');
        button.addEventListener('click', () => handleAnswer(button, option, currentQuestion));
        optionsContainer.appendChild(button);
    });

    startShotClock();
}

function handleAnswer(selectedBtn, selectedAnswer, questionObj) {
    clearInterval(timerInterval); // Stop the clock
    
    const isCorrect = selectedAnswer === questionObj.answer;
    const buttons = document.querySelectorAll('.option-btn');

    // Disable all buttons so user can't click twice
    buttons.forEach(btn => {
        btn.disabled = true;
        // Highlight the correct answer regardless of what user picked
        if (btn.textContent === questionObj.answer) {
            btn.classList.add('correct');
        }
    });

    if (isCorrect) {
        selectedBtn.classList.add('correct');
        streak++;
        calculateScore(questionObj.difficulty);
    } else {
        selectedBtn.classList.add('wrong');
        // Add a CSS shake animation class
        quizScreen.classList.add('shake');
        setTimeout(() => quizScreen.classList.remove('shake'), 500);
        streak = 0; // Reset streak
    }

    updateScoreBoard();

    // Show Fun Fact and Next Button
    funFactText.textContent = `Did you know? ${questionObj.funFact}`;
    funFactText.classList.remove('hidden');
    nextBtn.classList.remove('hidden');
}

function calculateScore(difficulty) {
    let basePoints = 10;
    if (difficulty === "Medium") basePoints = 20;
    if (difficulty === "Hard") basePoints = 30;

    // Multiplier for streaks of 3 or more
    const multiplier = streak >= 3 ? 1.5 : 1;
    
    // Total points = (Base + Remaining Time) * Streak Multiplier
    const pointsEarned = Math.round((basePoints + timeLeft) * multiplier);
    score += pointsEarned;
}

function updateScoreBoard() {
    scoreDisplay.textContent = `Score: ${score}`;
    if (streak >= 3) {
        streakDisplay.textContent = ` 🔥 Streak: ${streak}`;
    } else {
        streakDisplay.textContent = "";
    }
}

function startShotClock() {
    timeLeft = 24;
    shotClockDisplay.textContent = timeLeft;
    shotClockDisplay.style.color = "var(--text-dark)";

    timerInterval = setInterval(() => {
        timeLeft--;
        shotClockDisplay.textContent = timeLeft;

        // Warning color when 5 seconds or less
        if (timeLeft <= 5) {
            shotClockDisplay.style.color = "red";
        }

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            handleTimeOut();
        }
    }, 1000);
}

function handleTimeOut() {
    streak = 0;
    updateScoreBoard();
    const currentQuestion = questionsData[currentQuestionIndex];
    
    const buttons = document.querySelectorAll('.option-btn');
    buttons.forEach(btn => {
        btn.disabled = true;
        if (btn.textContent === currentQuestion.answer) {
            btn.classList.add('correct');
        }
    });

    funFactText.textContent = "Shot clock violation! " + currentQuestion.funFact;
    funFactText.classList.remove('hidden');
    nextBtn.classList.remove('hidden');
}

function loadNextQuestion() {
    currentQuestionIndex++;
    if (currentQuestionIndex < questionsData.length) {
        loadQuestion();
    } else {
        showResults();
    }
}

function resetTurn() {
    clearInterval(timerInterval);
    optionsContainer.innerHTML = '';
    funFactText.classList.add('hidden');
    nextBtn.classList.add('hidden');
}

function showResults() {
    quizScreen.classList.add('hidden');
    resultsScreen.classList.remove('hidden');
    finalScoreDisplay.textContent = score;

    // Trigger Confetti!
    confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#006BB6', '#F58426', '#ffffff']
    });
}

// Kickoff
startBtn.disabled = true;
startBtn.textContent = "Loading playbooks...";
fetchQuestions();