document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const startScreen = document.getElementById('quiz-start-screen');
    const questionsScreen = document.getElementById('quiz-questions');
    const resultsScreen = document.getElementById('quiz-results');
    const reviewScreen = document.getElementById('review-container');
    
    const startButton = document.getElementById('start-quiz-btn');
    const nextButton = document.getElementById('next-btn');
    const retryButton = document.getElementById('retry-quiz-btn');
    const reviewButton = document.getElementById('review-answers-btn');
    const backToResultsButton = document.getElementById('back-to-results-btn');
    const categoryButtons = document.querySelectorAll('.category-btn');
    
    const questionText = document.getElementById('question-text');
    const optionsContainer = document.getElementById('options-container');
    const explanationText = document.getElementById('explanation-text');
    const progressBar = document.getElementById('progress');
    const currentQuestionNum = document.getElementById('current-question');
    const scoreText = document.getElementById('score-text');
    const scorePercent = document.getElementById('score-percent');
    const resultMessage = document.getElementById('result-message');
    const confettiContainer = document.getElementById('confetti-container');
    const reviewList = document.getElementById('review-list');
    
    // State variables
    let currentQuestions = [];
    let currentQuestionIndex = 0;
    let score = 0;
    let selectedCategory = 'indian_history';
    let selectedAnswer = null;
    let userAnswers = [];
    let customQuestions = {};
    let adminMode = false;
    
    // Load custom questions from localStorage
    loadCustomQuestions();
    
    // Create Admin Panel
    createAdminPanel();
    
    // Sounds
    const sounds = {
        correct: new Howl({
            src: ['https://assets.mixkit.co/active_storage/sfx/2004/2004-preview.mp3'],
            volume: 0.7
        }),
        wrong: new Howl({
            src: ['https://assets.mixkit.co/active_storage/sfx/2008/2008-preview.mp3'],
            volume: 0.7
        }),
        complete: new Howl({
            src: ['https://assets.mixkit.co/active_storage/sfx/1500/1500-preview.mp3'],
            volume: 0.7
        }),
        click: new Howl({
            src: ['https://assets.mixkit.co/active_storage/sfx/270/270-preview.mp3'],
            volume: 0.5
        })
    };
    
    // Event Listeners
    startButton.addEventListener('click', startQuiz);
    nextButton.addEventListener('click', showNextQuestion);
    retryButton.addEventListener('click', resetQuiz);
    reviewButton.addEventListener('click', showReview);
    backToResultsButton.addEventListener('click', showResults);
    
    categoryButtons.forEach(button => {
        button.addEventListener('click', function() {
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            selectedCategory = this.dataset.category;
            sounds.click.play();
        });
    });
    
    // Admin toggle (press Alt + A)
    document.addEventListener('keydown', function(e) {
        if (e.altKey && e.key.toLowerCase() === 'a') {
            toggleAdminMode();
        }
    });
    
    // Initialize the first category button as active
    categoryButtons[0].classList.add('active');
    
    // Create Admin Panel
    function createAdminPanel() {
        const adminPanel = document.createElement('div');
        adminPanel.id = 'admin-panel';
        adminPanel.style.cssText = `
            position: fixed;
            top: 0;
            left: -400px;
            width: 400px;
            height: 100vh;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            box-shadow: 2px 0 10px rgba(0,0,0,0.3);
            transition: left 0.3s ease;
            z-index: 1000;
            overflow-y: auto;
            box-sizing: border-box;
        `;
        
        adminPanel.innerHTML = `
            <div style="position: sticky; top: 0; background: inherit; padding-bottom: 20px; margin-bottom: 20px; border-bottom: 2px solid rgba(255,255,255,0.3);">
                <h2 style="margin: 0 0 10px 0; font-size: 24px;">🛠️ Question Manager</h2>
                <button id="close-admin" style="position: absolute; top: 10px; right: 10px; background: rgba(255,255,255,0.2); border: none; color: white; padding: 5px 10px; border-radius: 5px; cursor: pointer;">✕</button>
                <p style="margin: 0; font-size: 14px; opacity: 0.8;">Press Alt + A to toggle this panel</p>
            </div>
            
            <div id="question-form" style="background: rgba(255,255,255,0.1); padding: 20px; border-radius: 10px; margin-bottom: 20px;">
                <h3 style="margin-top: 0;">➕ Add New Question</h3>
                
                <div style="margin-bottom: 15px;">
                    <label style="display: block; margin-bottom: 5px; font-weight: bold;">Category:</label>
                    <select id="admin-category" style="width: 100%; padding: 8px; border: none; border-radius: 5px; background: white; color: #333;">
                        <option value="indian_history">Indian History</option>
                        <option value="mythology">Mythology</option>
                        <option value="first_in_india">First in India</option>
                        <option value="current_affairs">Current Affairs</option>
                    </select>
                </div>
                
                <div style="margin-bottom: 15px;">
                    <label style="display: block; margin-bottom: 5px; font-weight: bold;">Question:</label>
                    <textarea id="admin-question" placeholder="Enter your question here..." style="width: 100%; height: 60px; padding: 8px; border: none; border-radius: 5px; resize: vertical; box-sizing: border-box;"></textarea>
                </div>
                
                <div style="margin-bottom: 15px;">
                    <label style="display: block; margin-bottom: 5px; font-weight: bold;">Options:</label>
                    <input type="text" id="admin-option-1" placeholder="Option 1" style="width: 100%; padding: 8px; margin-bottom: 8px; border: none; border-radius: 5px; box-sizing: border-box;">
                    <input type="text" id="admin-option-2" placeholder="Option 2" style="width: 100%; padding: 8px; margin-bottom: 8px; border: none; border-radius: 5px; box-sizing: border-box;">
                    <input type="text" id="admin-option-3" placeholder="Option 3" style="width: 100%; padding: 8px; margin-bottom: 8px; border: none; border-radius: 5px; box-sizing: border-box;">
                    <input type="text" id="admin-option-4" placeholder="Option 4" style="width: 100%; padding: 8px; margin-bottom: 8px; border: none; border-radius: 5px; box-sizing: border-box;">
                </div>
                
                <div style="margin-bottom: 15px;">
                    <label style="display: block; margin-bottom: 5px; font-weight: bold;">Correct Answer:</label>
                    <select id="admin-correct" style="width: 100%; padding: 8px; border: none; border-radius: 5px; background: white; color: #333;">
                        <option value="0">Option 1</option>
                        <option value="1">Option 2</option>
                        <option value="2">Option 3</option>
                        <option value="3">Option 4</option>
                    </select>
                </div>
                
                <div style="margin-bottom: 20px;">
                    <label style="display: block; margin-bottom: 5px; font-weight: bold;">Explanation:</label>
                    <textarea id="admin-explanation" placeholder="Explain why this is the correct answer..." style="width: 100%; height: 60px; padding: 8px; border: none; border-radius: 5px; resize: vertical; box-sizing: border-box;"></textarea>
                </div>
                
                <button id="add-question-btn" style="width: 100%; padding: 12px; background: #10b981; color: white; border: none; border-radius: 5px; font-size: 16px; font-weight: bold; cursor: pointer; transition: background 0.3s;">
                    ➕ Add Question
                </button>
            </div>
            
            <div id="questions-list" style="background: rgba(255,255,255,0.1); padding: 20px; border-radius: 10px;">
                <h3 style="margin-top: 0;">📋 Your Custom Questions</h3>
                <div id="custom-questions-container"></div>
            </div>
        `;
        
        document.body.appendChild(adminPanel);
        
        // Admin panel event listeners
        document.getElementById('close-admin').addEventListener('click', toggleAdminMode);
        document.getElementById('add-question-btn').addEventListener('click', addCustomQuestion);
        
        // Update questions list
        updateCustomQuestionsList();
    }
    
    // Toggle admin mode
    function toggleAdminMode() {
        adminMode = !adminMode;
        const adminPanel = document.getElementById('admin-panel');
        adminPanel.style.left = adminMode ? '0' : '-400px';
        
        if (adminMode) {
            sounds.click.play();
        }
    }
    
    // Add custom question
    function addCustomQuestion() {
        const category = document.getElementById('admin-category').value;
        const questionText = document.getElementById('admin-question').value.trim();
        const option1 = document.getElementById('admin-option-1').value.trim();
        const option2 = document.getElementById('admin-option-2').value.trim();
        const option3 = document.getElementById('admin-option-3').value.trim();
        const option4 = document.getElementById('admin-option-4').value.trim();
        const correctAnswer = parseInt(document.getElementById('admin-correct').value);
        const explanation = document.getElementById('admin-explanation').value.trim();
        
        // Validation
        if (!questionText || !option1 || !option2 || !option3 || !option4 || !explanation) {
            alert('❌ Please fill in all fields!');
            return;
        }
        
        // Create question object
        const newQuestion = {
            text: questionText,
            options: [option1, option2, option3, option4],
            correctAnswer: correctAnswer,
            explanation: explanation
        };
        
        // Add to custom questions
        if (!customQuestions[category]) {
            customQuestions[category] = [];
        }
        
        customQuestions[category].push(newQuestion);
        
        // Save to localStorage
        saveCustomQuestions();
        
        // Clear form
        clearAdminForm();
        
        // Update questions list
        updateCustomQuestionsList();
        
        // Success message
        showNotification('✅ Question added successfully!', 'success');
        
        sounds.correct.play();
    }
    
    // Clear admin form
    function clearAdminForm() {
        document.getElementById('admin-question').value = '';
        document.getElementById('admin-option-1').value = '';
        document.getElementById('admin-option-2').value = '';
        document.getElementById('admin-option-3').value = '';
        document.getElementById('admin-option-4').value = '';
        document.getElementById('admin-explanation').value = '';
        document.getElementById('admin-correct').value = '0';
    }
    
    // Update custom questions list
    function updateCustomQuestionsList() {
        const container = document.getElementById('custom-questions-container');
        container.innerHTML = '';
        
        if (Object.keys(customQuestions).length === 0) {
            container.innerHTML = '<p style="text-align: center; opacity: 0.7; font-style: italic;">No custom questions yet. Add some above! 👆</p>';
            return;
        }
        
        Object.keys(customQuestions).forEach(category => {
            if (customQuestions[category].length > 0) {
                const categoryDiv = document.createElement('div');
                categoryDiv.style.marginBottom = '20px';
                
                categoryDiv.innerHTML = `
                    <h4 style="margin: 0 0 10px 0; color: #fbbf24; text-transform: capitalize;">
                        📚 ${category.replace('_', ' ')} (${customQuestions[category].length} questions)
                    </h4>
                `;
                
                customQuestions[category].forEach((question, index) => {
                    const questionDiv = document.createElement('div');
                    questionDiv.style.cssText = `
                        background: rgba(255,255,255,0.1);
                        padding: 15px;
                        margin-bottom: 10px;
                        border-radius: 8px;
                        border-left: 4px solid #10b981;
                    `;
                    
                    questionDiv.innerHTML = `
                        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px;">
                            <p style="margin: 0; font-weight: bold; flex: 1;">${question.text}</p>
                            <button onclick="deleteCustomQuestion('${category}', ${index})" style="background: #ef4444; color: white; border: none; padding: 5px 8px; border-radius: 4px; cursor: pointer; margin-left: 10px;">🗑️</button>
                        </div>
                        <div style="font-size: 14px; opacity: 0.9;">
                            <strong>Answer:</strong> ${question.options[question.correctAnswer]}
                        </div>
                    `;
                    
                    categoryDiv.appendChild(questionDiv);
                });
                
                container.appendChild(categoryDiv);
            }
        });
    }
    
    // Delete custom question
    window.deleteCustomQuestion = function(category, index) {
        if (confirm('Are you sure you want to delete this question?')) {
            customQuestions[category].splice(index, 1);
            
            // Remove category if empty
            if (customQuestions[category].length === 0) {
                delete customQuestions[category];
            }
            
            saveCustomQuestions();
            updateCustomQuestionsList();
            showNotification('🗑️ Question deleted!', 'error');
            sounds.wrong.play();
        }
    };
    
    // Save custom questions to localStorage
    function saveCustomQuestions() {
        localStorage.setItem('quizCustomQuestions', JSON.stringify(customQuestions));
    }
    
    // Load custom questions from localStorage
    function loadCustomQuestions() {
        const saved = localStorage.getItem('quizCustomQuestions');
        if (saved) {
            try {
                customQuestions = JSON.parse(saved);
            } catch (e) {
                customQuestions = {};
            }
        }
    }
    
    // Show notification
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 8px;
            color: white;
            font-weight: bold;
            z-index: 2000;
            animation: slideInRight 0.3s ease;
            max-width: 300px;
            ${type === 'success' ? 'background: #10b981;' : 
              type === 'error' ? 'background: #ef4444;' : 
              'background: #3b82f6;'}
        `;
        
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
    
    // Start the quiz
    function startQuiz() {
        sounds.click.play();
        startScreen.classList.remove('active');
        startScreen.classList.add('hidden');
        questionsScreen.classList.remove('hidden');
        
        fetchQuestions().then(questions => {
            if (questions.length === 0) {
                alert('No questions available for this category. Please add some questions first!');
                resetQuiz();
                return;
            }
            
            currentQuestions = questions;
            currentQuestionIndex = 0;
            score = 0;
            userAnswers = [];
            displayQuestion();
        });
    }
    
    // Fetch questions from database (now includes custom questions)
    async function fetchQuestions() {
        let questions = [];
        
        // Get custom questions for selected category
        if (customQuestions[selectedCategory] && customQuestions[selectedCategory].length > 0) {
            questions = [...customQuestions[selectedCategory]];
        }
        
        // If no custom questions, fall back to sample questions
        if (questions.length === 0) {
            questions = getSampleQuestions(selectedCategory);
        }
        
        // Shuffle questions
        for (let i = questions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [questions[i], questions[j]] = [questions[j], questions[i]];
        }
        
        // Limit to 10 questions max
        return questions.slice(0, 10);
    }
    
    // Display the current question
    function displayQuestion() {
        const question = currentQuestions[currentQuestionIndex];
        questionText.textContent = question.text;
        
        // Update progress
        const progress = ((currentQuestionIndex) / currentQuestions.length) * 100;
        progressBar.style.width = `${progress}%`;
        currentQuestionNum.textContent = currentQuestionIndex + 1;
        
        // Reset card state
        const cardInner = document.querySelector('.card-inner');
        cardInner.classList.remove('flip');
        selectedAnswer = null;
        
        // Create options
        optionsContainer.innerHTML = '';
        question.options.forEach((option, index) => {
            const optionElement = document.createElement('div');
            optionElement.classList.add('option');
            optionElement.textContent = option;
            optionElement.dataset.index = index;
            
            optionElement.addEventListener('click', function() {
                if (selectedAnswer !== null) return;
                
                sounds.click.play();
                selectedAnswer = index;
                
                // Remove selected class from all options
                document.querySelectorAll('.option').forEach(opt => {
                    opt.classList.remove('selected');
                });
                
                // Add selected class to this option
                this.classList.add('selected');
                
                // Save user's answer
                userAnswers[currentQuestionIndex] = {
                    question: question.text,
                    userAnswer: option,
                    correctAnswer: question.options[question.correctAnswer],
                    isCorrect: index === question.correctAnswer
                };
                
                // After a short delay, show answer
                setTimeout(() => {
                    document.querySelectorAll('.option').forEach((opt, idx) => {
                        opt.classList.remove('selected');
                        
                        if (idx === question.correctAnswer) {
                            opt.classList.add('correct');
                        } else if (idx === selectedAnswer && selectedAnswer !== question.correctAnswer) {
                            opt.classList.add('wrong');
                        }
                    });
                    
                    // Update score if correct
                    if (index === question.correctAnswer) {
                        score++;
                        sounds.correct.play();
                    } else {
                        sounds.wrong.play();
                    }
                    
                    // Show explanation
                    explanationText.textContent = question.explanation;
                    
                    // Flip card after a delay
                    setTimeout(() => {
                        cardInner.classList.add('flip');
                    }, 1000);
                    
                }, 500);
            });
            
            optionsContainer.appendChild(optionElement);
        });
    }
    
    // Show the next question
    function showNextQuestion() {
        sounds.click.play();
        currentQuestionIndex++;
        
        if (currentQuestionIndex < currentQuestions.length) {
            displayQuestion();
        } else {
            showResults();
        }
    }
    
    // Show quiz results
    function showResults() {
        questionsScreen.classList.add('hidden');
        reviewScreen.classList.add('hidden');
        resultsScreen.classList.remove('hidden');
        
        const percentage = (score / currentQuestions.length) * 100;
        scoreText.textContent = score;
        scorePercent.textContent = `${Math.round(percentage)}%`;
        
        // Update score circle with correct percentage
        const scoreCircle = document.querySelector('.score-circle');
        scoreCircle.style.background = `conic-gradient(
            var(--primary-color) 0%, 
            var(--secondary-color) ${percentage / 2}%, 
            #e5e7eb ${percentage / 2}%
        )`;
        
        // Display appropriate message based on score
        if (percentage >= 80) {
            resultMessage.textContent = "Excellent! You've mastered this topic.";
            resultMessage.style.borderLeft = "4px solid var(--correct-color)";
        } else if (percentage >= 60) {
            resultMessage.textContent = "Good job! You're on the right track.";
            resultMessage.style.borderLeft = "4px solid var(--primary-color)";
        } else {
            resultMessage.textContent = "Keep practicing! You'll improve with time.";
            resultMessage.style.borderLeft = "4px solid var(--wrong-color)";
        }
        
        // Play completion sound
        sounds.complete.play();
        
        // Create confetti animation if score is good
        if (percentage >= 60) {
            createConfetti();
        }
    }
    
    // Show the answer review screen
    function showReview() {
        sounds.click.play();
        resultsScreen.classList.add('hidden');
        reviewScreen.classList.remove('hidden');
        
        // Create review list
        reviewList.innerHTML = '';
        userAnswers.forEach((answer, index) => {
            const reviewItem = document.createElement('div');
            reviewItem.classList.add('review-item');
            
            reviewItem.innerHTML = `
                <div class="review-question">${index + 1}. ${answer.question}</div>
                <div class="review-answer ${answer.isCorrect ? 'correct' : 'wrong'}">
                    <i class="fas ${answer.isCorrect ? 'fa-check-circle' : 'fa-times-circle'}"></i>
                    Your answer: ${answer.userAnswer}
                </div>
                ${!answer.isCorrect ? `
                <div class="review-answer correct">
                    <i class="fas fa-check-circle"></i>
                    Correct answer: ${answer.correctAnswer}
                </div>` : ''}
            `;
            
            reviewList.appendChild(reviewItem);
        });
    }
    
    // Reset the quiz
    function resetQuiz() {
        sounds.click.play();
        resultsScreen.classList.add('hidden');
        startScreen.classList.add('active');
        startScreen.classList.remove('hidden');
        
        currentQuestionIndex = 0;
        score = 0;
        userAnswers = [];
        
        // Clear confetti
        confettiContainer.innerHTML = '';
    }
    
    // Create confetti animation
    function createConfetti() {
        confettiContainer.innerHTML = '';
        const colors = ['#6366f1', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];
        
        for (let i = 0; i < 100; i++) {
            const confetti = document.createElement('div');
            confetti.classList.add('confetti');
            confetti.style.left = `${Math.random() * 100}%`;
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.width = `${Math.random() * 10 + 5}px`;
            confetti.style.height = `${Math.random() * 10 + 5}px`;
            confetti.style.animationDuration = `${Math.random() * 3 + 2}s`;
            confetti.style.animationDelay = `${Math.random() * 0.5}s`;
            
            confettiContainer.appendChild(confetti);
        }
    }
    
    // Sample questions (fallback when no custom questions exist)
    function getSampleQuestions(category) {
        const questions = {
            indian_history: [
                {
                    text: "Who was the first Emperor of the Mauryan Empire?",
                    options: ["Ashoka", "Chandragupta Maurya", "Bindusara", "Brihadratha"],
                    correctAnswer: 1,
                    explanation: "Chandragupta Maurya founded the Mauryan Empire in 321 BCE and was its first emperor."
                },
                {
                    text: "In which year did India gain independence?",
                    options: ["1945", "1946", "1947", "1948"],
                    correctAnswer: 2,
                    explanation: "India gained independence from British rule on August 15, 1947."
                }
            ],
            mythology: [
                {
                    text: "Who is known as the destroyer in the Hindu Trinity?",
                    options: ["Brahma", "Vishnu", "Shiva", "Indra"],
                    correctAnswer: 2,
                    explanation: "Shiva is known as the destroyer in the Hindu Trinity (Trimurti) consisting of Brahma, Vishnu, and Shiva."
                }
            ],
            first_in_india: [
                {
                    text: "Who was the first President of India?",
                    options: ["Jawaharlal Nehru", "Dr. Rajendra Prasad", "Dr. A.P.J. Abdul Kalam", "Dr. S. Radhakrishnan"],
                    correctAnswer: 1,
                    explanation: "Dr. Rajendra Prasad was the first President of India, serving from 1950 to 1962."
                }
            ],
            current_affairs: [
                {
                    text: "What is the current capital of India?",
                    options: ["Mumbai", "Kolkata", "New Delhi", "Chennai"],
                    correctAnswer: 2,
                    explanation: "New Delhi is the capital of India and serves as the seat of all three branches of the Government."
                }
            ]
        };
        
        return questions[category] || [];
    }
});

// CSS with the animation and additional styles
document.head.insertAdjacentHTML('beforeend', `
<style>
    @keyframes confettiFall {
        0% {
            transform: translateY(-100px) rotate(0deg);
            opacity: 1;
        }
        100% {
            transform: translateY(calc(100vh - 100px)) rotate(720deg);
            opacity: 0;
        }
    }
    
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .confetti {
        position: absolute;
        top: 0;
        border-radius: 0;
        animation: confettiFall linear forwards;
        z-index: 100;
    }
    
    #admin-panel::-webkit-scrollbar {
        width: 8px;
    }
    
    #admin-panel::-webkit-scrollbar-track {
        background: rgba(255,255,255,0.1);
        border-radius: 4px;
    }
    
    #admin-panel::-webkit-scrollbar-thumb {
        background: rgba(255,255,255,0.3);
        border-radius: 4px;
    }
    
    #admin-panel::-webkit-scrollbar-thumb:hover {
        background: rgba(255,255,255,0.5);
    }
    
    #add-question-btn:hover {
        background: #059669 !important;
        transform: translateY(-2px);
    }
</style>
`);
