let currentQuestions = [];
let currentQuestionIndex = 0;
let score = 0;
let currentCategory = ""; 
let currentTopicName = "";
let pendingState = null;

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function startQuiz(category) {
    currentCategory = category;
    const savedState = localStorage.getItem('quizProgress');
    
    if (savedState) {
        const parsedState = JSON.parse(savedState);
        if (parsedState.category === category) {
            pendingState = parsedState;
            document.getElementById('modal-msg').innerText = `تۆ پێشتر گەیشتوویتە پرسیاری ${parsedState.currentIndex + 1}. دەتەوێت لەوێوە بەردەوام بیت؟`;
            document.getElementById('custom-modal').classList.remove('hidden');
            return;
        } else {
            localStorage.removeItem('quizProgress');
        }
    }

    startFreshQuiz();
}

function resumeSavedQuiz() {
    document.getElementById('custom-modal').classList.add('hidden');
    currentTopicName = pendingState.topicName;
    currentQuestions = pendingState.questions;
    currentQuestionIndex = pendingState.currentIndex;
    score = pendingState.score;
    
    showQuizScreen();
    loadNextQuestion();
}

function restartQuizFromZero() {
    document.getElementById('custom-modal').classList.add('hidden');
    localStorage.removeItem('quizProgress');
    startFreshQuiz();
}

function startFreshQuiz() {
    let rawQuestions = [];
    
    if (currentCategory === 'muqadimat') {
        rawQuestions = window.muqadimatData || [];
        currentTopicName = "١. پێشەکی و بنەماکان";
    } else if (currentCategory === 'marfooat') {
        rawQuestions = window.marfooatData || [];
        currentTopicName = "٢. مەرفووعات";
    } else if (currentCategory === 'mansoobat') {
        rawQuestions = window.mansoobatData || [];
        currentTopicName = "٣. مەنسووبات";
    } else if (currentCategory === 'tawabi') {
        rawQuestions = window.tawabiData || [];
        currentTopicName = "٤. پاشکۆکان (التوابع)";
    } else if (currentCategory === 'makhfoodat') {
        rawQuestions = window.makhfoodatData || [];
        currentTopicName = "٥. مەخفووزات (المخفوضات)";
    } else if (currentCategory === 'mix') {
        rawQuestions = [
            ...(window.muqadimatData || []),
            ...(window.marfooatData || []),
            ...(window.mansoobatData || []),
            ...(window.tawabiData || []),
            ...(window.makhfoodatData || [])
        ];
        currentTopicName = "🔀 تاقیکردنەوەی تێکەڵە (Mix)";
    }

    if (rawQuestions.length === 0) {
        alert("ببوورە، هێشتا پرسیار بۆ ئەم بەشە زیاد نەکراوە!");
        return;
    }

    currentQuestions = shuffleArray([...rawQuestions]);
    currentQuestionIndex = 0;
    score = 0;

    showQuizScreen();
    loadNextQuestion();
}

function showQuizScreen() {
    document.getElementById('home-screen').classList.remove('active');
    document.getElementById('home-screen').classList.add('hidden');
    document.getElementById('quiz-screen').classList.remove('hidden');
    document.getElementById('quiz-screen').classList.add('active');
    
    document.getElementById('current-topic-title').innerText = currentTopicName;
    document.getElementById('total-score').innerText = score;
}

function loadNextQuestion() {
    if (currentQuestionIndex >= currentQuestions.length) {
        alert("ئافەرین! پرسیارەکانی ئەم بەشەت تەواو کرد. کۆی خاڵەکانت: " + score);
        localStorage.removeItem('quizProgress');
        goHome();
        return;
    }

    localStorage.setItem('quizProgress', JSON.stringify({
        category: currentCategory,
        topicName: currentTopicName,
        questions: currentQuestions,
        currentIndex: currentQuestionIndex,
        score: score
    }));

    const q = currentQuestions[currentQuestionIndex];
    document.getElementById('question-text').innerText = q.question;
    document.getElementById('feedback-box').classList.add('hidden');
    
    const optionsContainer = document.getElementById('options-container');
    optionsContainer.innerHTML = '';
    
    q.options.forEach((opt, index) => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.innerText = opt;
        btn.onclick = () => checkAnswer(index, btn, q);
        optionsContainer.appendChild(btn);
    });
}

function checkAnswer(selectedIndex, clickedBtn, questionData) {
    const buttons = document.querySelectorAll('.option-btn');
    buttons.forEach(btn => btn.classList.add('disabled'));
    
    if (selectedIndex === questionData.correct) {
        clickedBtn.classList.add('correct');
        score += 10;
    } else {
        clickedBtn.classList.add('wrong');
        buttons[questionData.correct].classList.add('correct');
        score = Math.max(0, score - 5);
    }
    
    document.getElementById('total-score').innerText = score;
    document.getElementById('stidlal-text').innerText = questionData.stidlal;
    document.getElementById('feedback-box').classList.remove('hidden');
    
    currentQuestionIndex++;
}

function goHome() {
    document.getElementById('quiz-screen').classList.remove('active');
    document.getElementById('quiz-screen').classList.add('hidden');
    document.getElementById('home-screen').classList.remove('hidden');
    document.getElementById('home-screen').classList.add('active');
    document.getElementById('total-score').innerText = score;
}
