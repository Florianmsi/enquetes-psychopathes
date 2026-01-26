// ============================================
// ENQUÊTES ET PSYCHOPATHES - APPLICATION
// ============================================

// Configuration des chapitres
const CHAPTERS_CONFIG = [
    {
        number: 1,
        title: "Madame BONPOIL encaisse bien",
        difficulty: 2.1,
        maxPoints: 10,
        possibleValues: [0, 10]
    },
    {
        number: 2,
        title: "Un fonctionnaire en moins",
        difficulty: 3.5,
        maxPoints: 15,
        possibleValues: [0, 15]
    },
    {
        number: 3,
        title: "Une pute en moins",
        difficulty: 3.1,
        maxPoints: 15,
        possibleValues: [0, 5, 10, 15]
    },
    {
        number: 4,
        title: "L'encre de la vengeance",
        difficulty: 1.7,
        maxPoints: 5,
        possibleValues: [0, 5]
    },
    {
        number: 5,
        title: "Potins de Stars",
        difficulty: 3.2,
        maxPoints: 10,
        possibleValues: [0, 3, 7, 10]
    },
    {
        number: 6,
        title: "Toc toc toc",
        difficulty: 4.8,
        maxPoints: 25,
        possibleValues: [0, 12, 25]
    },
    {
        number: 7,
        title: "Choisis ta folie",
        difficulty: 4.5,
        maxPoints: 20,
        possibleValues: [0, 10, 20]
    }
];

// Configuration du questionnaire bonus
const QUIZ_QUESTIONS = [
    {
        question: "Parmi ces symptômes, lequel fait partie des \"symptômes négatifs\" de la schizophrénie ?",
        options: [
            "A) L'émoussement affectif et l'avolition (perte de motivation)",
            "B) Le sentiment de communiquer avec des personnes réelles, mais absentes.",
            "C) Les hallucinations visuelles."
        ],
        correct: 0
    },
    {
        question: "TOC (Trouble Obsessionnel Compulsif) - Une personne atteinte de TOC se caractérise principalement par :",
        options: [
            "A) Des obsessions et des compulsions répétitives",
            "B) Des troubles de l'attention.",
            "C) Une tendance à mentir de façon compulsive"
        ],
        correct: 0
    },
    {
        question: "TSPT (Trouble de Stress Post-Traumatique) - Quel symptôme N'est PAS typique du TSPT ?",
        options: [
            "A) Des points communs avec la dépression.",
            "B) Des idées délirantes de persécution",
            "C) Les reviviscences (flashbacks) de l'événement traumatique"
        ],
        correct: 1
    },
    {
        question: "Dépression - Qu'est-ce qui ne caractérise PAS nécessairement une dépression clinique ?",
        options: [
            "A) Une tristesse profonde et durable avec perte d'intérêt",
            "B) Se sentir faible émotionnellement.",
            "C) Faire de chaque échange un conflit avec autrui."
        ],
        correct: 2
    },
    {
        question: "Quel neurotransmetteur est souvent impliqué dans les troubles du comportement alimentaire comme la boulimie ?",
        options: [
            "A) La sérotonine",
            "B) La dopamine",
            "C) L'insuline"
        ],
        correct: 0
    },
    {
        question: "Un mythomane se définit par :",
        options: [
            "A) Le besoin pathologique de mentir de façon excessive",
            "B) Modifier la réalité dans l'unique but de manipuler.",
            "C) Ne pas avoir de limites pour parvenir à son objectif."
        ],
        correct: 0
    },
    {
        question: "La paranoïa peut accompagner plusieurs autres troubles, mais lequel n'en fait quasiment pas partie ?",
        options: [
            "A) Dépression majeure",
            "B) TSPT",
            "C) Mythomanie"
        ],
        correct: 2
    },
    {
        question: "Psychopathie - La psychopathie se caractérise principalement par :",
        options: [
            "A) Un manque d'empathie et de remords",
            "B) Une agressivité soudaine.",
            "C) Une grande anxiété sociale"
        ],
        correct: 0
    },
    {
        question: "Parmi ces troubles, lequel n'est pas abordé dans ce livre ?",
        options: [
            "A) La dépression.",
            "B) La bipolarité.",
            "C) La boulimie."
        ],
        correct: 1
    },
    {
        question: "Trouble de la personnalité paranoïaque - Quel est le pourcentage de notre population qui en souffre réellement ?",
        options: [
            "A) 0,1 à 0,4 %",
            "B) 0,5 à 2,5 %",
            "C) 2,6 à 3 %"
        ],
        correct: 1
    }
];

// Variables globales
let currentUser = null;
let userScores = {};
let allScores = {};
let quizAnswers = {};
let currentQuizQuestion = 0;

// ============================================
// INITIALISATION
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // Vérifier la connexion Firebase
    if (!firebase.apps.length) {
        console.error('Firebase n\'est pas initialisé !');
        alert('Erreur : La connexion à la base de données a échoué. Veuillez vérifier la configuration Firebase.');
        return;
    }

    // Écouteurs d'événements
    document.getElementById('pseudoInput').addEventListener('input', checkPseudoAvailability);
    document.getElementById('loginBtn').addEventListener('click', handleLogin);
    document.getElementById('logoutBtn').addEventListener('click', handleLogout);
    document.getElementById('confirmYes').addEventListener('click', confirmAction);
    document.getElementById('confirmNo').addEventListener('click', closeConfirmModal);
    document.getElementById('startBonusBtn').addEventListener('click', startQuiz);

    // Charger tous les scores au démarrage
    loadAllScores();
}

// ============================================
// AUTHENTIFICATION
// ============================================

function checkPseudoAvailability() {
    const pseudo = document.getElementById('pseudoInput').value.trim();
    const statusDiv = document.getElementById('pseudoStatus');
    const loginBtn = document.getElementById('loginBtn');

    if (pseudo.length === 0) {
        statusDiv.textContent = '';
        statusDiv.className = 'pseudo-status';
        loginBtn.disabled = true;
        return;
    }

    if (pseudo.length < 3) {
        statusDiv.textContent = '⚠️ Le pseudo doit contenir au moins 3 caractères';
        statusDiv.className = 'pseudo-status taken';
        loginBtn.disabled = true;
        return;
    }

    statusDiv.textContent = '🔍 Vérification...';
    statusDiv.className = 'pseudo-status checking';

    // Vérifier si le pseudo existe dans Firebase
    firebase.database().ref('users/' + pseudo).once('value')
        .then(snapshot => {
            if (snapshot.exists()) {
                statusDiv.textContent = '✓ Pseudo trouvé ! Cliquez pour vous reconnecter';
                statusDiv.className = 'pseudo-status available';
            } else {
                statusDiv.textContent = '✓ Pseudo disponible ! Cliquez pour créer votre profil';
                statusDiv.className = 'pseudo-status available';
            }
            loginBtn.disabled = false;
        })
        .catch(error => {
            console.error('Erreur lors de la vérification:', error);
            statusDiv.textContent = '❌ Erreur de connexion';
            statusDiv.className = 'pseudo-status taken';
            loginBtn.disabled = true;
        });
}

function handleLogin() {
    const pseudo = document.getElementById('pseudoInput').value.trim();
    
    if (!pseudo || pseudo.length < 3) {
        alert('Veuillez entrer un pseudo valide (minimum 3 caractères)');
        return;
    }

    currentUser = pseudo;

    // Vérifier si l'utilisateur existe
    firebase.database().ref('users/' + pseudo).once('value')
        .then(snapshot => {
            if (snapshot.exists()) {
                // Utilisateur existant
                showGameScreen(`Bienvenue ${pseudo}, nous avons retrouvé vos enquêtes !`);
            } else {
                // Nouvel utilisateur
                createNewUser(pseudo);
            }
        })
        .catch(error => {
            console.error('Erreur lors de la connexion:', error);
            alert('Erreur lors de la connexion. Veuillez réessayer.');
        });
}

function createNewUser(pseudo) {
    const userData = {
        pseudo: pseudo,
        createdAt: Date.now(),
        scores: {}
    };

    firebase.database().ref('users/' + pseudo).set(userData)
        .then(() => {
            showGameScreen(`Bienvenue détective ${pseudo} ! Votre dossier a été ouvert.`);
        })
        .catch(error => {
            console.error('Erreur lors de la création:', error);
            alert('Erreur lors de la création du profil.');
        });
}

function showGameScreen(welcomeMessage) {
    // Charger les données de l'utilisateur
    loadUserData().then(() => {
        // Masquer l'écran de connexion
        document.getElementById('loginScreen').classList.remove('active');
        
        // Afficher l'écran de jeu
        setTimeout(() => {
            document.getElementById('gameScreen').classList.add('active');
            document.getElementById('playerName').textContent = currentUser;
            
            // Initialiser l'interface
            renderChapters();
            updateScoreDisplay();
            updateLeaderboard();
            
            // Auto-scroll léger pour montrer qu'il y a du contenu en dessous
            setTimeout(() => {
                window.scrollTo({
                    top: 150,
                    behavior: 'smooth'
                });
                // Retour en haut après 1 seconde
                setTimeout(() => {
                    window.scrollTo({
                        top: 0,
                        behavior: 'smooth'
                    });
                }, 1000);
            }, 800);
            
            // Message de bienvenue
            if (welcomeMessage) {
                console.log(welcomeMessage);
            }
        }, 300);
    });
}

function handleLogout() {
    currentUser = null;
    userScores = {};
    quizAnswers = {};
    
    document.getElementById('gameScreen').classList.remove('active');
    
    setTimeout(() => {
        document.getElementById('loginScreen').classList.add('active');
        document.getElementById('pseudoInput').value = '';
        document.getElementById('pseudoStatus').textContent = '';
        document.getElementById('loginBtn').disabled = true;
    }, 300);
}

// ============================================
// CHARGEMENT DES DONNÉES
// ============================================

function loadUserData() {
    return firebase.database().ref('users/' + currentUser).once('value')
        .then(snapshot => {
            const data = snapshot.val();
            if (data && data.scores) {
                userScores = data.scores;
            } else {
                userScores = {};
            }
            
            // Charger les réponses du quiz
            if (data && data.quizAnswers) {
                quizAnswers = data.quizAnswers;
            } else {
                quizAnswers = {};
            }
        })
        .catch(error => {
            console.error('Erreur lors du chargement:', error);
        });
}

function loadAllScores() {
    firebase.database().ref('users').on('value', snapshot => {
        allScores = {};
        snapshot.forEach(childSnapshot => {
            const userData = childSnapshot.val();
            if (userData && userData.scores) {
                allScores[userData.pseudo] = userData.scores;
            }
        });
        
        // Mettre à jour l'affichage si on est connecté
        if (currentUser) {
            updateScoreDisplay();
            updateLeaderboard();
        }
    });
}

// ============================================
// RENDU DES CHAPITRES
// ============================================

function renderChapters() {
    const container = document.getElementById('chaptersGrid');
    container.innerHTML = '';

    CHAPTERS_CONFIG.forEach(chapter => {
        const card = createChapterCard(chapter);
        container.appendChild(card);
    });

    // Vérifier si tous les chapitres sont complétés pour afficher le bonus
    checkBonusAvailability();
}

function createChapterCard(chapter) {
    const card = document.createElement('div');
    card.className = 'chapter-card';
    
    const userScore = userScores[`chapter${chapter.number}`];
    const isLocked = userScore !== null && userScore !== undefined;

    // Ajouter les classes selon le score
    if (isLocked) {
        if (userScore === 0) {
            card.classList.add('score-zero');
        } else if (userScore === chapter.maxPoints) {
            card.classList.add('score-max');
        }
    }

    // Calculer les étoiles
    const fullStars = Math.floor(chapter.difficulty);
    const hasHalfStar = chapter.difficulty % 1 >= 0.5;
    const starsHTML = '★'.repeat(fullStars) + (hasHalfStar ? '½' : '') + '☆'.repeat(5 - fullStars - (hasHalfStar ? 1 : 0));

    card.innerHTML = `
        <div class="chapter-header">
            <div class="chapter-number">CHAPITRE ${chapter.number}</div>
            <h3 class="chapter-title">${chapter.title}</h3>
            <div class="chapter-difficulty">
                <span class="difficulty-label">Difficulté:</span>
                <span class="stars">${starsHTML}</span>
                <span class="difficulty-label">${chapter.difficulty}/5</span>
            </div>
        </div>

        ${isLocked ? `
            <div class="chapter-locked">
                ${userScore === 0 ? 
                    '<span class="trophy trophy-zero">🏆❌</span>' : 
                    '<span class="trophy">🏆</span>'
                }
                <p><strong>${userScore}/${chapter.maxPoints} points</strong></p>
                <p style="color: var(--jaune-moutarde);">Score verrouillé</p>
            </div>
        ` : `
            <div class="chapter-points">
                <div class="points-options" id="pointsChapter${chapter.number}">
                    ${chapter.possibleValues.map(value => `
                        <button class="point-option" data-chapter="${chapter.number}" data-value="${value}">
                            ${value}
                        </button>
                    `).join('')}
                </div>
                <button class="btn-secondary validate-btn" data-chapter="${chapter.number}" style="display: none;">
                    VALIDER CE SCORE
                </button>
            </div>
        `}

        <div class="chapter-stats">
            <div class="stat-row">
                <span>Votre score:</span>
                <strong>${userScore !== null ? userScore : '-'} / ${chapter.maxPoints}</strong>
            </div>
            <div class="stat-row">
                <span>Moyenne des joueurs:</span>
                <strong id="avgChapter${chapter.number}">-</strong>
            </div>
            <div class="comparison-bar">
                <div class="comparison-fill" id="barChapter${chapter.number}" style="width: 0%"></div>
            </div>
        </div>
    `;

    // Ajouter les écouteurs si le chapitre n'est pas verrouillé
    if (!isLocked) {
        setTimeout(() => {
            const pointOptions = card.querySelectorAll('.point-option');
            const validateBtn = card.querySelector('.validate-btn');

            pointOptions.forEach(option => {
                option.addEventListener('click', function() {
                    // Désélectionner les autres
                    pointOptions.forEach(opt => opt.classList.remove('selected'));
                    // Sélectionner celui-ci
                    this.classList.add('selected');
                    // Afficher le bouton de validation
                    validateBtn.style.display = 'block';
                });
            });

            validateBtn.addEventListener('click', function() {
                const chapterNum = this.dataset.chapter;
                const selectedOption = card.querySelector('.point-option.selected');
                if (selectedOption) {
                    const value = parseInt(selectedOption.dataset.value);
                    confirmScore(chapterNum, value);
                }
            });
        }, 0);
    }

    // Calculer et afficher les statistiques
    updateChapterStats(chapter.number);

    return card;
}

function updateChapterStats(chapterNumber) {
    const scores = [];
    
    Object.values(allScores).forEach(playerScores => {
        const score = playerScores[`chapter${chapterNumber}`];
        if (score !== undefined && score !== null) {
            scores.push(score);
        }
    });

    if (scores.length > 0) {
        const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
        const avgElement = document.getElementById(`avgChapter${chapterNumber}`);
        if (avgElement) {
            avgElement.textContent = avg.toFixed(1);
        }

        // Mettre à jour la barre de comparaison
        const userScore = userScores[`chapter${chapterNumber}`];
        if (userScore !== null && userScore !== undefined) {
            const chapter = CHAPTERS_CONFIG.find(c => c.number === chapterNumber);
            const percentage = (userScore / chapter.maxPoints) * 100;
            const barElement = document.getElementById(`barChapter${chapterNumber}`);
            if (barElement) {
                barElement.style.width = percentage + '%';
            }
        }
    }
}

// ============================================
// VALIDATION DES SCORES
// ============================================

let pendingValidation = null;

function confirmScore(chapterNumber, value) {
    pendingValidation = { chapterNumber, value };
    
    const modal = document.getElementById('confirmModal');
    const message = document.getElementById('confirmMessage');
    
    message.textContent = `Vous allez valider ${value} points pour le Chapitre ${chapterNumber}. Une fois validé, vous ne pourrez plus modifier ce score. Êtes-vous sûr(e) ?`;
    
    modal.classList.add('active');
}

function confirmAction() {
    if (!pendingValidation) return;

    const { chapterNumber, value } = pendingValidation;
    
    // Sauvegarder dans Firebase
    firebase.database().ref(`users/${currentUser}/scores/chapter${chapterNumber}`).set(value)
        .then(() => {
            userScores[`chapter${chapterNumber}`] = value;
            closeConfirmModal();
            renderChapters();
            updateScoreDisplay();
            updateLeaderboard();
            pendingValidation = null;
        })
        .catch(error => {
            console.error('Erreur lors de la sauvegarde:', error);
            alert('Erreur lors de la sauvegarde du score.');
        });
}

function closeConfirmModal() {
    document.getElementById('confirmModal').classList.remove('active');
    pendingValidation = null;
}

// ============================================
// AFFICHAGE DES SCORES
// ============================================

function updateScoreDisplay() {
    // Calculer le score total de l'utilisateur
    let totalScore = 0;
    CHAPTERS_CONFIG.forEach(chapter => {
        const score = userScores[`chapter${chapter.number}`];
        if (score !== null && score !== undefined) {
            totalScore += score;
        }
    });

    // Ajouter le score du quiz
    const quizScore = Object.keys(quizAnswers).length;
    totalScore += quizScore;

    // Mettre à jour l'affichage
    document.getElementById('currentScore').textContent = totalScore;
    document.getElementById('finalScore').textContent = totalScore;

    // Calculer la moyenne globale
    const allTotalScores = [];
    Object.values(allScores).forEach(playerScores => {
        let playerTotal = 0;
        CHAPTERS_CONFIG.forEach(chapter => {
            const score = playerScores[`chapter${chapter.number}`];
            if (score !== null && score !== undefined) {
                playerTotal += score;
            }
        });
        allTotalScores.push(playerTotal);
    });

    if (allTotalScores.length > 0) {
        const avgTotal = allTotalScores.reduce((a, b) => a + b, 0) / allTotalScores.length;
        document.getElementById('avgScore').textContent = avgTotal.toFixed(1);
    }

    // Mettre à jour le classement
    updateRanking(totalScore);

    // Mettre à jour les statistiques détaillées
    updateDetailedStats();
}

function updateRanking(userTotalScore) {
    const rankings = [];
    
    Object.entries(allScores).forEach(([pseudo, scores]) => {
        let total = 0;
        CHAPTERS_CONFIG.forEach(chapter => {
            const score = scores[`chapter${chapter.number}`];
            if (score !== null && score !== undefined) {
                total += score;
            }
        });
        rankings.push({ pseudo, score: total });
    });

    rankings.sort((a, b) => b.score - a.score);

    const userRank = rankings.findIndex(r => r.pseudo === currentUser) + 1;
    document.getElementById('currentRank').textContent = userRank > 0 ? `#${userRank}` : '-';
}

function updateDetailedStats() {
    const container = document.getElementById('detailedStats');
    container.innerHTML = '';

    CHAPTERS_CONFIG.forEach(chapter => {
        const userScore = userScores[`chapter${chapter.number}`];
        
        if (userScore !== null && userScore !== undefined) {
            const card = document.createElement('div');
            card.className = 'stat-card';
            
            const percentage = (userScore / chapter.maxPoints * 100).toFixed(0);
            
            card.innerHTML = `
                <div class="stat-card-header">
                    <div class="stat-card-title">${chapter.title}</div>
                    <div class="stat-card-chapter">Chapitre ${chapter.number}</div>
                </div>
                <div class="stat-row">
                    <span>Votre score:</span>
                    <strong>${userScore}/${chapter.maxPoints}</strong>
                </div>
                <div class="stat-row">
                    <span>Performance:</span>
                    <strong>${percentage}%</strong>
                </div>
                <div class="comparison-bar">
                    <div class="comparison-fill" style="width: ${percentage}%"></div>
                </div>
            `;
            
            container.appendChild(card);
        }
    });
}

// ============================================
// CLASSEMENT
// ============================================

function updateLeaderboard() {
    const rankings = [];
    
    Object.entries(allScores).forEach(([pseudo, scores]) => {
        let total = 0;
        CHAPTERS_CONFIG.forEach(chapter => {
            const score = scores[`chapter${chapter.number}`];
            if (score !== null && score !== undefined) {
                total += score;
            }
        });
        rankings.push({ pseudo, score: total });
    });

    rankings.sort((a, b) => b.score - a.score);

    const tbody = document.getElementById('leaderboardBody');
    tbody.innerHTML = '';

    const top10 = rankings.slice(0, 10);

    top10.forEach((player, index) => {
        const row = document.createElement('tr');
        if (player.pseudo === currentUser) {
            row.classList.add('current-player');
        }

        const rankClass = index === 0 ? 'rank-1' : index === 1 ? 'rank-2' : index === 2 ? 'rank-3' : 'rank-other';
        
        row.innerHTML = `
            <td>
                <span class="rank-badge ${rankClass}">${index + 1}</span>
            </td>
            <td class="player-name">${player.pseudo}</td>
            <td class="player-score">${player.score}</td>
        `;
        
        tbody.appendChild(row);
    });

    // Mettre à jour le nombre total de joueurs
    document.getElementById('playerCount').textContent = Object.keys(allScores).length;
}

// ============================================
// CHAPITRE BONUS
// ============================================

function checkBonusAvailability() {
    const allChaptersCompleted = CHAPTERS_CONFIG.every(chapter => {
        return userScores[`chapter${chapter.number}`] !== null && 
               userScores[`chapter${chapter.number}`] !== undefined;
    });

    const bonusChapter = document.getElementById('bonusChapter');
    if (allChaptersCompleted) {
        bonusChapter.style.display = 'block';
        updateBonusProgress();
    } else {
        bonusChapter.style.display = 'none';
    }
}

function updateBonusProgress() {
    const answeredCount = Object.keys(quizAnswers).length;
    const progressDiv = document.getElementById('bonusProgress');
    
    if (answeredCount > 0) {
        const correctCount = Object.values(quizAnswers).filter(a => a.correct).length;
        progressDiv.innerHTML = `
            <p style="margin-top: 15px;">
                <strong>Progression:</strong> ${answeredCount}/10 questions répondues<br>
                <strong>Score actuel:</strong> ${correctCount}/10 points
            </p>
        `;
    }
}

function startQuiz() {
    currentQuizQuestion = 0;
    showQuizQuestion();
    document.getElementById('bonusModal').classList.add('active');
}

function showQuizQuestion() {
    const container = document.getElementById('quizContainer');
    const questionData = QUIZ_QUESTIONS[currentQuizQuestion];
    const questionNumber = currentQuizQuestion + 1;
    
    // Vérifier si cette question a déjà été répondue
    const alreadyAnswered = quizAnswers[questionNumber];
    
    document.getElementById('currentQuestion').textContent = questionNumber;
    
    // Calculer le score actuel
    const currentScore = Object.values(quizAnswers).filter(a => a.correct).length;
    document.getElementById('quizScore').textContent = currentScore;
    
    container.innerHTML = `
        <div class="quiz-question">
            <div class="question-text">
                <strong>Question ${questionNumber}:</strong><br>
                ${questionData.question}
            </div>
            <div class="quiz-options" id="quizOptions">
                ${questionData.options.map((option, index) => `
                    <div class="quiz-option ${alreadyAnswered && alreadyAnswered.selected === index ? 'selected' : ''} ${alreadyAnswered ? 'locked' : ''}" 
                         data-index="${index}">
                        ${option}
                    </div>
                `).join('')}
            </div>
            ${alreadyAnswered ? `
                <div class="quiz-result ${alreadyAnswered.correct ? 'correct' : 'incorrect'}">
                    ${alreadyAnswered.correct ? '✓ Bonne réponse !' : '✗ Mauvaise réponse'}
                    ${!alreadyAnswered.correct ? `<br>La bonne réponse était : ${questionData.options[questionData.correct]}` : ''}
                </div>
            ` : ''}
            <div class="quiz-navigation">
                ${currentQuizQuestion > 0 ? '<button class="btn-secondary" onclick="previousQuestion()">← Précédent</button>' : ''}
                ${currentQuizQuestion < QUIZ_QUESTIONS.length - 1 ? '<button class="btn-secondary" onclick="nextQuestion()">Suivant →</button>' : ''}
                ${currentQuizQuestion === QUIZ_QUESTIONS.length - 1 ? '<button class="btn-primary" onclick="finishQuiz()">Terminer</button>' : ''}
            </div>
        </div>
    `;

    // Ajouter les écouteurs pour les options si pas déjà répondu
    if (!alreadyAnswered) {
        const options = document.querySelectorAll('.quiz-option');
        options.forEach(option => {
            option.addEventListener('click', function() {
                if (this.classList.contains('locked')) return;
                
                const selectedIndex = parseInt(this.dataset.index);
                const isCorrect = selectedIndex === questionData.correct;
                
                // Verrouiller toutes les options
                options.forEach(opt => opt.classList.add('locked'));
                
                // Marquer la sélection
                this.classList.add('selected');
                if (isCorrect) {
                    this.classList.add('correct');
                } else {
                    this.classList.add('incorrect');
                    options[questionData.correct].classList.add('correct');
                }
                
                // Sauvegarder la réponse
                saveQuizAnswer(questionNumber, selectedIndex, isCorrect);
                
                // Afficher le résultat
                const resultDiv = document.createElement('div');
                resultDiv.className = `quiz-result ${isCorrect ? 'correct' : 'incorrect'}`;
                resultDiv.innerHTML = `
                    ${isCorrect ? '✓ Bonne réponse !' : '✗ Mauvaise réponse'}
                    ${!isCorrect ? `<br>La bonne réponse était : ${questionData.options[questionData.correct]}` : ''}
                `;
                document.querySelector('.quiz-question').appendChild(resultDiv);
            });
        });
    }
}

function saveQuizAnswer(questionNumber, selectedIndex, isCorrect) {
    quizAnswers[questionNumber] = {
        selected: selectedIndex,
        correct: isCorrect
    };
    
    // Sauvegarder dans Firebase
    firebase.database().ref(`users/${currentUser}/quizAnswers/${questionNumber}`).set({
        selected: selectedIndex,
        correct: isCorrect
    }).then(() => {
        // Mettre à jour le score
        const currentScore = Object.values(quizAnswers).filter(a => a.correct).length;
        document.getElementById('quizScore').textContent = currentScore;
        updateScoreDisplay();
        updateBonusProgress();
    });
}

function previousQuestion() {
    if (currentQuizQuestion > 0) {
        currentQuizQuestion--;
        showQuizQuestion();
    }
}

function nextQuestion() {
    if (currentQuizQuestion < QUIZ_QUESTIONS.length - 1) {
        currentQuizQuestion++;
        showQuizQuestion();
    }
}

function finishQuiz() {
    const answeredCount = Object.keys(quizAnswers).length;
    if (answeredCount < QUIZ_QUESTIONS.length) {
        alert(`Vous n'avez répondu qu'à ${answeredCount} questions sur ${QUIZ_QUESTIONS.length}. Complétez toutes les questions avant de terminer.`);
        return;
    }
    
    document.getElementById('bonusModal').classList.remove('active');
    updateBonusProgress();
    updateScoreDisplay();
}

// ============================================
// FERMETURE DES MODALS (clic extérieur)
// ============================================

window.onclick = function(event) {
    const confirmModal = document.getElementById('confirmModal');
    const bonusModal = document.getElementById('bonusModal');
    
    if (event.target === confirmModal) {
        closeConfirmModal();
    }
    
    // Ne pas fermer le modal du quiz par clic extérieur
}

// ============================================
// FONCTION POUR DÉFILER VERS LE TOP 10
// ============================================

function scrollToLeaderboard() {
    const leaderboardSection = document.querySelector('.leaderboard-section');
    if (leaderboardSection) {
        leaderboardSection.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
        });
    }
}
