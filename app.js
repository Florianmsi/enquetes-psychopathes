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
    
    if (pseudo.length < 3) {
        alert('Le pseudo doit contenir au moins 3 caractères.');
        return;
    }

    currentUser = pseudo;
    
    // Charger ou créer le profil utilisateur
    firebase.database().ref('users/' + currentUser).once('value')
        .then(snapshot => {
            if (snapshot.exists()) {
                // Utilisateur existant
                const userData = snapshot.val();
                userScores = userData.scores || {};
                quizAnswers = userData.quizAnswers || {};
                
                showGame();
            } else {
                // Nouvel utilisateur
                userScores = {};
                quizAnswers = {};
                
                // Créer le profil
                firebase.database().ref('users/' + currentUser).set({
                    scores: userScores,
                    quizAnswers: quizAnswers,
                    createdAt: Date.now()
                }).then(() => {
                    showGame();
                });
            }
        })
        .catch(error => {
            console.error('Erreur de connexion:', error);
            alert('Erreur lors de la connexion. Veuillez réessayer.');
        });
}

function showGame() {
    // Masquer l'écran de connexion
    document.getElementById('loginScreen').classList.remove('active');
    
    // Afficher l'animation d'intro
    const introAnimation = document.getElementById('introAnimation');
    introAnimation.style.display = 'flex';
    
    // Simuler le scan d'empreinte
    const scanProgress = document.getElementById('scanProgress');
    const scanText = document.getElementById('scanText');
    
    let progress = 0;
    const scanInterval = setInterval(() => {
        progress += 2;
        scanProgress.style.width = progress + '%';
        
        if (progress >= 100) {
            clearInterval(scanInterval);
            scanText.textContent = 'IDENTITÉ VÉRIFIÉE';
            
            // Afficher le prompt de scroll après un délai
            setTimeout(() => {
                document.getElementById('scrollPrompt').style.opacity = '1';
                
                // Attendre un scroll ou un délai avant de passer au gameScreen
                let scrolled = false;
                const scrollHandler = () => {
                    if (!scrolled) {
                        scrolled = true;
                        transitionToGameScreen();
                    }
                };
                
                window.addEventListener('scroll', scrollHandler, { once: true });
                
                // Ou passer automatiquement après 3 secondes
                setTimeout(() => {
                    if (!scrolled) {
                        transitionToGameScreen();
                    }
                }, 3000);
            }, 500);
        }
    }, 30);
}

function transitionToGameScreen() {
    const introAnimation = document.getElementById('introAnimation');
    const gameScreen = document.getElementById('gameScreen');
    
    // Faire disparaître l'intro
    introAnimation.style.opacity = '0';
    
    setTimeout(() => {
        introAnimation.style.display = 'none';
        
        // Afficher le gameScreen
        gameScreen.classList.add('active');
        
        // Initialiser l'affichage du jeu
        initializeGameDisplay();
        
        // Scroller tout en haut
        window.scrollTo(0, 0);
    }, 500);
}

function initializeGameDisplay() {
    // Afficher le nom du joueur
    document.getElementById('playerName').textContent = currentUser;
    
    // Générer les chapitres
    generateChapters();
    
    // Charger tous les scores et mettre à jour l'affichage
    loadAllScores().then(() => {
        updateScoreDisplay();
        updateLeaderboard();
        checkBonusAvailability();
    });
}

function handleLogout() {
    if (confirm('Êtes-vous sûr de vouloir fermer le dossier ? Votre progression est sauvegardée.')) {
        currentUser = null;
        userScores = {};
        quizAnswers = {};
        
        document.getElementById('gameScreen').classList.remove('active');
        document.getElementById('loginScreen').classList.add('active');
        document.getElementById('pseudoInput').value = '';
        document.getElementById('pseudoStatus').textContent = '';
        document.getElementById('loginBtn').disabled = true;
    }
}

// ============================================
// CHARGEMENT DES DONNÉES
// ============================================

function loadAllScores() {
    return firebase.database().ref('users').once('value')
        .then(snapshot => {
            allScores = {};
            snapshot.forEach(childSnapshot => {
                const pseudo = childSnapshot.key;
                const userData = childSnapshot.val();
                
                // Stocker les scores de tous les joueurs
                allScores[pseudo] = userData.scores || {};
                
                // Si c'est l'utilisateur actuel, mettre à jour ses données
                if (pseudo === currentUser) {
                    userScores = userData.scores || {};
                    quizAnswers = userData.quizAnswers || {};
                }
            });
            
            // Mettre à jour le classement après le chargement
            updateLeaderboard();
        })
        .catch(error => {
            console.error('Erreur lors du chargement des scores:', error);
        });
}

// ============================================
// GÉNÉRATION DES CHAPITRES
// ============================================

function generateChapters() {
    const grid = document.getElementById('chaptersGrid');
    grid.innerHTML = '';

    CHAPTERS_CONFIG.forEach(chapter => {
        const card = createChapterCard(chapter);
        grid.appendChild(card);
    });
}

function createChapterCard(chapter) {
    const card = document.createElement('div');
    card.className = 'chapter-card';
    
    const userScore = userScores[`chapter${chapter.number}`];
    const isCompleted = userScore !== null && userScore !== undefined;
    
    if (isCompleted) {
        card.classList.add('completed');
        
        // Ajouter les classes d'animation selon le score
        if (userScore === 0) {
            card.classList.add('score-zero');
        } else if (userScore === chapter.maxPoints) {
            card.classList.add('score-max');
        } else {
            card.classList.add('score-partial');
        }
    }
    
    // Étoiles de difficulté
    const stars = '★'.repeat(Math.round(chapter.difficulty));
    
    card.innerHTML = `
        <div class="chapter-number">CHAPITRE ${chapter.number}</div>
        <div class="chapter-title">${chapter.title}</div>
        <div class="chapter-difficulty">${stars}</div>
        <div class="chapter-points">${chapter.maxPoints} POINTS</div>
        ${isCompleted ? `
            <div class="chapter-score">
                <span class="score-label">VOTRE SCORE:</span>
                <span class="score-value">${userScore}/${chapter.maxPoints}</span>
            </div>
        ` : ''}
        <div class="chapter-selector">
            <label for="score${chapter.number}">Votre score :</label>
            <select id="score${chapter.number}" ${isCompleted ? 'disabled' : ''}>
                <option value="">-</option>
                ${chapter.possibleValues.map(val => `
                    <option value="${val}" ${userScore === val ? 'selected' : ''}>${val}</option>
                `).join('')}
            </select>
        </div>
        <button class="btn-validate" onclick="validateChapterScore(${chapter.number})" ${isCompleted ? 'disabled' : ''}>
            ${isCompleted ? '✓ VALIDÉ' : 'VALIDER'}
        </button>
    `;
    
    return card;
}

// ============================================
// VALIDATION DES SCORES
// ============================================

let pendingValidation = null;

function validateChapterScore(chapterNumber) {
    const select = document.getElementById(`score${chapterNumber}`);
    const score = select.value;
    
    if (score === '') {
        alert('Veuillez sélectionner un score avant de valider.');
        return;
    }
    
    const chapter = CHAPTERS_CONFIG.find(c => c.number === chapterNumber);
    
    pendingValidation = {
        type: 'chapter',
        chapterNumber: chapterNumber,
        score: parseInt(score)
    };
    
    showConfirmModal(
        `Vous êtes sur le point de valider votre score pour le chapitre ${chapterNumber} : "${chapter.title}".\n\n` +
        `Score : ${score}/${chapter.maxPoints} points\n\n` +
        `⚠️ ATTENTION : Cette action est définitive et ne peut pas être annulée !`
    );
}

function showConfirmModal(message) {
    document.getElementById('confirmMessage').textContent = message;
    document.getElementById('confirmModal').classList.add('active');
}

function confirmAction() {
    if (!pendingValidation) return;
    
    if (pendingValidation.type === 'chapter') {
        const { chapterNumber, score } = pendingValidation;
        
        // Sauvegarder dans l'objet local
        userScores[`chapter${chapterNumber}`] = score;
        
        // Sauvegarder dans Firebase
        firebase.database().ref(`users/${currentUser}/scores/chapter${chapterNumber}`).set(score)
            .then(() => {
                // Recharger tous les scores pour mettre à jour le classement
                return loadAllScores();
            })
            .then(() => {
                // Régénérer les cartes de chapitres
                generateChapters();
                
                // Mettre à jour l'affichage des scores immédiatement
                updateScoreDisplay();
                
                // Vérifier si le bonus est disponible
                checkBonusAvailability();
                
                closeConfirmModal();
            })
            .catch(error => {
                console.error('Erreur lors de la sauvegarde:', error);
                alert('Erreur lors de la sauvegarde. Veuillez réessayer.');
            });
    }
}

function closeConfirmModal() {
    document.getElementById('confirmModal').classList.remove('active');
    pendingValidation = null;
}

// ============================================
// AFFICHAGE DES SCORES (CORRIGÉ)
// ============================================

function updateScoreDisplay() {
    // Calculer le score total de l'utilisateur (chapitres)
    let totalScore = 0;
    CHAPTERS_CONFIG.forEach(chapter => {
        const score = userScores[`chapter${chapter.number}`];
        if (score !== null && score !== undefined) {
            totalScore += score;
        }
    });

    // Ajouter le score du quiz (points bonus automatiques)
    const quizScore = Object.values(quizAnswers).filter(a => a.correct).length;
    totalScore += quizScore;

    // Mettre à jour l'affichage
    document.getElementById('currentScore').textContent = totalScore;
    document.getElementById('finalScore').textContent = totalScore;

    // Calculer la moyenne globale (avec bonus inclus)
    const allTotalScores = [];
    Object.entries(allScores).forEach(([pseudo, playerScores]) => {
        let playerTotal = 0;
        CHAPTERS_CONFIG.forEach(chapter => {
            const score = playerScores[`chapter${chapter.number}`];
            if (score !== null && score !== undefined) {
                playerTotal += score;
            }
        });
        
        // Ajouter le bonus du quiz pour chaque joueur s'il existe
        if (pseudo === currentUser && quizAnswers) {
            playerTotal += quizScore;
        }
        
        allTotalScores.push(playerTotal);
    });

    if (allTotalScores.length > 0) {
        const avgTotal = allTotalScores.reduce((a, b) => a + b, 0) / allTotalScores.length;
        document.getElementById('avgScore').textContent = avgTotal.toFixed(1);
    }

    // Mettre à jour le classement avec le score actuel (incluant bonus)
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
        
        // Ajouter le bonus quiz pour l'utilisateur actuel
        if (pseudo === currentUser) {
            const quizScore = Object.values(quizAnswers).filter(a => a.correct).length;
            total += quizScore;
        }
        
        rankings.push({ pseudo, score: total });
    });

    rankings.sort((a, b) => b.score - a.score);

    const userRank = rankings.findIndex(r => r.pseudo === currentUser) + 1;
    const totalPlayers = rankings.length;
    
    // Mettre à jour le classement dans le header
    document.getElementById('currentRank').textContent = userRank > 0 ? `#${userRank}` : '-';
    
    // Mettre à jour la position détaillée dans la section scores
    const userPositionElement = document.getElementById('userPosition');
    const totalParticipantsElement = document.getElementById('totalParticipants');
    
    if (userPositionElement) {
        userPositionElement.textContent = userRank > 0 ? `#${userRank}` : '-';
    }
    if (totalParticipantsElement) {
        totalParticipantsElement.textContent = totalPlayers;
    }
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
    
    // Ajouter une carte pour le bonus quiz s'il est complété
    const quizScore = Object.values(quizAnswers).filter(a => a.correct).length;
    if (Object.keys(quizAnswers).length > 0) {
        const card = document.createElement('div');
        card.className = 'stat-card';
        
        const percentage = (quizScore / 10 * 100).toFixed(0);
        
        card.innerHTML = `
            <div class="stat-card-header">
                <div class="stat-card-title">Questionnaire Bonus</div>
                <div class="stat-card-chapter">Points Bonus</div>
            </div>
            <div class="stat-row">
                <span>Votre score:</span>
                <strong>${quizScore}/10</strong>
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
}

// ============================================
// CLASSEMENT (CORRIGÉ)
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
        
        // Ajouter le bonus quiz pour l'utilisateur actuel
        if (pseudo === currentUser) {
            const quizScore = Object.values(quizAnswers).filter(a => a.correct).length;
            total += quizScore;
        }
        
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
        // Mettre à jour le score immédiatement
        const currentScore = Object.values(quizAnswers).filter(a => a.correct).length;
        document.getElementById('quizScore').textContent = currentScore;
        
        // Mettre à jour l'affichage global et le classement
        updateScoreDisplay();
        updateLeaderboard();
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
    updateLeaderboard();
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
