// گۆڕاوە سەرەکییەکان
let currentQuestions = [];
let currentQuestionIndex = 0;
let score = 0;
let currentCategory = ""; 
let currentTopicName = "";

// فانکشنی تێکەڵکردنی ڕیزبەندی (Shuffle)
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// دەستپێکردنی تاقیکردنەوە بەپێی بابەت
function startQuiz(category) {
    // ١. پشکنین بۆ ئەوەی بزانین پێشتر سەیڤ کراوە یان نا
    const savedState = localStorage.getItem('quizProgress');
    
    if (savedState) {
        const parsedState = JSON.parse(savedState);
        
        // ئەگەر هەمان ئەو بابەتەیە کە پێشتر جێی هێشتووە
        if (parsedState.category === category) {
            const wantToResume = confirm("تۆ پێشتر ئەم تاقیکردنەوەیەت کردووە و گەیشتوویتەتە پرسیاری " + (parsedState.currentIndex + 1) + ". دەتەوێت لەوێوە بەردەوام بیت؟ \n\n(Cancel لێبدە ئەگەر دەتەوێت لە سفرەوە دەست پێ بکەیتەوە)");
            
            if (wantToResume) {
                currentCategory = parsedState.category;
                currentTopicName = parsedState.topicName;
                currentQuestions = parsedState.questions;
                currentQuestionIndex = parsedState.currentIndex;
                score = parsedState.score;
                
                showQuizScreen();
                loadNextQuestion();
                return; // لێرەدا دەوەستێت و ناچێتە خوارەوە بۆ دروستکردنی پرسیاری نوێ
            } else {
                localStorage.removeItem('quizProgress'); // ئەگەر ویستی لە سفرەوە دەست پێ بکات
            }
        } else {
            // ئەگەر بابەتێکی تری جێهێشتبوو و ئێستا دەیەوێت یەکێکی تر بکات
            const wantToClear = confirm("تۆ پێشتر تاقیکردنەوەیەکی ترت جێهێشتووە. دەتەوێت ئەوەی پێشوو بسڕیتەوە و ئەمەیان دەست پێ بکەیت؟");
            if (!wantToClear) return; // ئەگەر پەشیمان بووەوە
            localStorage.removeItem('quizProgress');
        }
    }

    // ٢. ئەگەر سەیڤ نەبوو یان ویستی لە سفرەوە دەست پێ بکات
    let rawQuestions = [];
    currentCategory = category;

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
        currentTopicName = "٤. پاشکۆکان (التوابع)";
    } else if (category === 'makhfoodat') {
        rawQuestions = window.makhfoodatData || [];
        currentTopicName = "٥. مەخفووزات (المخفوضات)";
    } else if (category === 'mix') {
        rawQuestions = [
            ...(window.muqadimatData || []),
            ...(window.marfooatData || []),
            ...(window.mansoobatData || []),
            ...(window.tawabiData || []),
            ...(window.makhfoodatData || [])
        ];
        currentTopicName = "🔀 تاقیکردنەوەی تێکەڵە (هەموو بابەتەکان)";
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

// نیشاندانی شاشەی پرسیارەکان
function showQuizScreen() {
    document.getElementById('home-screen').classList.remove('active');
    document.getElementById('home-screen').classList.add('hidden');
    document.getElementById('quiz-screen').classList.remove('hidden');
    document.getElementById('quiz-screen').classList.add('active');
    
    document.getElementById('current-topic-title').innerText = currentTopicName;
    document.getElementById('total-score').innerText = score;
}

// هێنانی پرسیاری داهاتوو
function loadNextQuestion() {
    if (currentQuestionIndex >= currentQuestions.length) {
        alert("ئافەرین! پرسیارەکانی ئەم بەشەت تەواو کرد. کۆی خاڵەکانت: " + score);
        localStorage.removeItem('quizProgress'); // سڕینەوەی سەیڤەکە چونکە تەواو بوو
        goHome();
        return;
    }

    // سەیڤکردنی پڕۆگرێسەکە لەم ساتەدا
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

// پشکنینی وەڵام
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

// گەڕانەوە بۆ شاشەی سەرەکی
function goHome() {
    document.getElementById('quiz-screen').classList.remove('active');
    document.getElementById('quiz-screen').classList.add('hidden');
    document.getElementById('home-screen').classList.remove('hidden');
    document.getElementById('home-screen').classList.add('active');
    document.getElementById('total-score').innerText = score;
}
