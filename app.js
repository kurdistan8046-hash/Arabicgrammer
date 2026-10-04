// گۆڕاوە سەرەکییەکان
let currentQuestions = [];
let currentQuestionIndex = 0;
let score = 0;
let currentCategory = ""; 
let currentTopicName = ""; 

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
    // پشکنینی سەیڤ بە بەکارهێنانی ئاگادارکەرەوەی ئاسایی وێبگەڕەکە (بێ ئەوەی دیزاین تێکبدات)
    const savedState = localStorage.getItem('quizProgress');
    if (savedState) {
        const parsedState = JSON.parse(savedState);
        if (parsedState.category === category) {
            const wantToResume = confirm("تۆ پێشتر گەیشتوویتە پرسیاری " + (parsedState.currentIndex + 1) + " لەم بابەتە. دەتەوێت لەوێوە بەردەوام بیت؟\n\n(بۆ دەستپێکردنەوە لە سەرەتا Cancel لێبدە)");
            if (wantToResume) {
                currentCategory = parsedState.category;
                currentTopicName = parsedState.topicName;
                currentQuestions = parsedState.questions;
                currentQuestionIndex = parsedState.currentIndex;
                score = parsedState.score;
                
                document.getElementById('home-screen').classList.remove('active');
                document.getElementById('home-screen').classList.add('hidden');
                document.getElementById('quiz-screen').classList.remove('hidden');
                document.getElementById('quiz-screen').classList.add('active');
                document.getElementById('current-topic-title').innerText = currentTopicName;
                document.getElementById('total-score').innerText = score;
                
                loadNextQuestion();
                return;
            } else {
                localStorage.removeItem('quizProgress');
            }
        } else {
            localStorage.removeItem('quizProgress');
        }
    }

    let rawQuestions = [];
    currentCategory = category;

    // هێنانی پرسیارەکان بەپێی ئەو بەشەی دیاری کراوە
    if (category === 'muqadimat') {
        rawQuestions = window.muqadimatData || [];
        currentTopicName = "١. پێشەکی و بنەماکان";
    } else if (category === 'marfooat') {
        rawQuestions = window.marfooatData || [];
        currentTopicName = "٢. مەرفووعات";
    } else if (category === 'mansoobat') {
        rawQuestions = window.mansoobatData || [];
        currentTopicName = "٣. مەنسووبات";
    } else if (category === 'tawabi') {
        rawQuestions = window.tawabiData || [];
        currentTopicName = "٤. پاشکۆکان و مەخفووزات";
    } else if (category === 'makhfoodat') {
        rawQuestions = window.makhfoodatData || [];
        currentTopicName = "٥. مەخفووزات (المخفوضات)";
    } else if (category === 'mix') {
        // لێرەدا هەموو فایلەکان تێکەڵ دەکەین
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

    // تێکەڵکردنی پرسیارەکان و دەستپێکردن
    currentQuestions = shuffleArray([...rawQuestions]);
    currentQuestionIndex = 0;
    score = 0;

    // گۆڕینی شاشەکان
    document.getElementById('home-screen').classList.remove('active');
    document.getElementById('home-screen').classList.add('hidden');
    document.getElementById('quiz-screen').classList.remove('hidden');
    document.getElementById('quiz-screen').classList.add('active');
    
    document.getElementById('current-topic-title').innerText = currentTopicName;
    document.getElementById('total-score').innerText = score;

    loadNextQuestion();
}

// هێنانی پرسیاری داهاتوو
function loadNextQuestion() {
    if (currentQuestionIndex >= currentQuestions.length) {
        alert("ئافەرین! پرسیارەکانی ئەم بەشەت تەواو کرد. کۆی خاڵەکانت: " + score);
        localStorage.removeItem('quizProgress');
        goHome();
        return;
    }

    // سەیڤکردنی پڕۆگرێس
    localStorage.setItem('quizProgress', JSON.stringify({
        category: currentCategory,
        topicName: currentTopicName,
        questions: currentQuestions,
        currentIndex: currentQuestionIndex,
        score: score
    }));

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
