
// گۆڕاوە سەرەکییەکان
let currentQuestions = [];
let currentQuestionIndex = 0;
let score = 0;

// فانکشنی تێکەڵکردنی ڕیزبەندی (Shuffle) بۆ ئەوەی پرسیارەکان هەڕەمەکی بن
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// دەستپێکردنی تاقیکردنەوە بەپێی بابەت
function startQuiz(category) {
    let rawQuestions = [];
    let topicName = "";

    // هێنانی پرسیارەکان بەپێی ئەو بەشەی دیاری کراوە
    if (category === 'muqadimat') {
        rawQuestions = window.muqadimatData || [];
        topicName = "١. پێشەکی و بنەماکان";
    } else if (category === 'marfooat') {
        rawQuestions = window.marfooatData || [];
        topicName = "٢. مەرفووعات";
    } else if (category === 'mansoobat') {
        rawQuestions = window.mansoobatData || [];
        topicName = "٣. مەنسووبات";
    } else if (category === 'tawabi') {
        rawQuestions = window.tawabiData || [];
        topicName = "٤. پاشکۆکان و مەخفووزات";
    } else if (category === 'mix') {
        // لێرەدا هەموو فایلەکان تێکەڵ دەکەین
        rawQuestions = [
            ...(window.muqadimatData || []),
            ...(window.marfooatData || []),
            ...(window.mansoobatData || []),
            ...(window.tawabiData || [])
        ];
        topicName = "🔀 تاقیکردنەوەی تێکەڵە (هەموو بابەتەکان)";
    }

    if (rawQuestions.length === 0) {
        alert("ببوورە، هێشتا پرسیار بۆ ئەم بەشە زیاد نەکراوە!");
        return;
    }

    // تێکەڵکردنی پرسیارەکان و دەستپێکردن
    currentQuestions = shuffleArray([...rawQuestions]);
    currentQuestionIndex = 0;

    // گۆڕینی شاشەکان
    document.getElementById('home-screen').classList.remove('active');
    document.getElementById('home-screen').classList.add('hidden');
    document.getElementById('quiz-screen').classList.remove('hidden');
    document.getElementById('quiz-screen').classList.add('active');
    
    document.getElementById('current-topic-title').innerText = topicName;

    loadNextQuestion();
}

// هێنانی پرسیاری داهاتوو
function loadNextQuestion() {
    if (currentQuestionIndex >= currentQuestions.length) {
        alert("ئافەرین! پرسیارەکانی ئەم بەشەت تەواو کرد. کۆی خاڵەکانت: " + score);
        goHome();
        return;
    }

    const q = currentQuestions[currentQuestionIndex];
    
    // دانانی دەقی پرسیارەکە
    document.getElementById('question-text').innerText = q.question;
    
    // شاردنەوەی بەڵگە و ڕوونکردنەوە
    document.getElementById('feedback-box').classList.add('hidden');
    
    // دروستکردنی بژاردەکان
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

// پشکنینی وەڵام
function checkAnswer(selectedIndex, clickedBtn, questionData) {
    const buttons = document.querySelectorAll('.option-btn');
    
    // لەکارخستنی دوگمەکان بۆ ئەوەی دوو جار کلیک نەکرێت
    buttons.forEach(btn => btn.classList.add('disabled'));
    
    if (selectedIndex === questionData.correct) {
        clickedBtn.classList.add('correct');
        score += 10; // زیادکردنی ١٠ خاڵ بۆ وەڵامی ڕاست
    } else {
        clickedBtn.classList.add('wrong');
        buttons[questionData.correct].classList.add('correct');
        score = Math.max(0, score - 5); // لێدەرکردنی ٥ خاڵ بۆ وەڵامی هەڵە
    }
    
    // نوێکردنەوەی خاڵەکان لەسەر شاشە
    document.getElementById('total-score').innerText = score;
    
    // نیشاندانی بەڵگە و ئیستیدلال
    document.getElementById('stidlal-text').innerText = questionData.stidlal;
    document.getElementById('feedback-box').classList.remove('hidden');
    
    currentQuestionIndex++;
}

// گەڕانەوە بۆ شاشەی سەرەکی
function goHome() {
    document.getElementById('quiz-screen').classList.remove('active');
    document.getElementById('quiz-screen').classList.add('hidden');
    document.getElementById('home-screen').classList.remove('hidden');
    document.getElementById('home-screen').classList.add('active');
    document.getElementById('total-score').innerText = score;
}
