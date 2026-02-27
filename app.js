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

// Configuration du questionnaire bonus (quiz existant)
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

// Configuration du Chapitre BONUS (A/B/C)
const BONUS_CONFIG = [
    { label: "Bonus 1", correct: "A", points: 1 },
    { label: "Bonus 2", correct: "B", points: 2 },
    { label: "Bonus 3", correct: "B", points: 3 },
    { label: "Bonus 4", correct: "A", points: 4 }
];

// Variables globales
let currentUser = null;
let userScores = {};
let allScores = {};
let quizAnswers = {};
let bonusAnswers = {};
let currentQuizQuestion = 0;

// ============================================
// INITIALISATION
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    if (!firebase.apps.length) {
        console.error('Firebase n\'est pas initialisé !');
        alert('Erreur : La connexion à la base de données a échoué. Veuillez vérifier la configuration Firebase.');
        return;
    }

    firebase.auth().signInAnonymously()
        .then(() => {
            document.getElementById('pseudoInput').addEventListener('input', checkPseudoAvailability);
            document.getElementById('loginBtn').addEventListener('click', handleLogin);
            document.getElementById('logoutBtn').addEventListener('click', handleLogout);
            document.getElementById('confirmYes').addEventListener('click', confirmAction);
            document.getElementById('confirmNo').addEventListener('click', closeConfirmModal);

            loadAllScores();
        })
        .catch(error => {
            console.error('Erreur auth anonyme:', error);
            alert('Erreur de connexion. Veuillez réessayer.');
        });
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
    
    firebase.database().ref('users/' + currentUser).once('value')
        .then(snapshot => {
            if (snapshot.exists()) {
                const userData = snapshot.val();
                userScores = userData.scores || {};
                quizAnswers = userData.quizAnswers || {};
                bonusAnswers = userData.bonusAnswers || {};
                showGame();
            } else {
                userScores = {};
                quizAnswers = {};
                bonusAnswers = {};
                firebase.database().ref('users/' + currentUser).set({
                    scores: userScores,
                    quizAnswers: quizAnswers,
                    bonusAnswers: bonusAnswers,
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
    document.getElementById('loginScreen').classList.remove('active');
    
    const introAnimation = document.getElementById('introAnimation');
    introAnimation.style.display = 'flex';
    
    const scanProgress = document.getElementById('scanProgress');
    const scanText = document.getElementById('scanText');
    
    let progress = 0;
    const scanInterval = setInterval(() => {
        progress += 2;
        scanProgress.style.width = progress + '%';
        
        if (progress >= 100) {
            clearInterval(scanInterval);
            scanText.textContent = 'IDENTITÉ VÉRIFIÉE';
            
            setTimeout(() => {
                document.getElementById('scrollPrompt').style.opacity = '1';
                
                let scrolled = false;
                const scrollHandler = () => {
                    if (!scrolled) {
                        scrolled = true;
                        transitionToGameScreen();
                    }
                };
                
                window.addEventListener('scroll', scrollHandler, { once: true });
                
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
    
    introAnimation.style.opacity = '0';
    
    setTimeout(() => {
        introAnimation.style.display = 'none';
        gameScreen.classList.add('active');
        initializeGameDisplay();
        window.scrollTo(0, 0);
    }, 500);
}

function initializeGameDisplay() {
    document.getElementById('playerName').textContent = currentUser;
    generateChapters();
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
        bonusAnswers = {};
        
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
                allScores[pseudo] = userData.scores || {};
                if (pseudo === currentUser) {
                    userScores = userData.scores || {};
                    quizAnswers = userData.quizAnswers || {};
                    bonusAnswers = userData.bonusAnswers || {};
                }
            });
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
        if (userScore === 0) {
            card.classList.add('score-zero');
        } else if (userScore === chapter.maxPoints) {
            card.classList.add('score-max');
        } else {
            card.classList.add('score-partial');
        }
    }
    
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
        ` : `
            <div class="chapter-selector">
                <label for="score${chapter.number}">Votre score :</label>
                <select id="score${chapter.number}">
                    <option value="">-</option>
                    ${chapter.possibleValues.map(val => `
                        <option value="${val}">${val}</option>
                    `).join('')}
                </select>
            </div>
        `}
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
        userScores[`chapter${chapterNumber}`] = score;
        
        firebase.database().ref(`users/${currentUser}/scores/chapter${chapterNumber}`).set(score)
            .then(() => loadAllScores())
            .then(() => {
                generateChapters();
                updateScoreDisplay();
                checkBonusAvailability();
                closeConfirmModal();
            })
            .catch(error => {
                console.error('Erreur lors de la sauvegarde:', error);
                alert('Erreur lors de la sauvegarde. Veuillez réessayer.');
            });

    } else if (pendingValidation.type === 'bonus') {
        const { index, letter } = pendingValidation;
        closeConfirmModal();
        applyBonusAnswer(index, letter);
    }
}

function closeConfirmModal() {
    document.getElementById('confirmModal').classList.remove('active');
    pendingValidation = null;
}

// ============================================
// AFFICHAGE DES SCORES
// ============================================

function updateScoreDisplay() {
    let totalScore = 0;
    CHAPTERS_CONFIG.forEach(chapter => {
        const score = userScores[`chapter${chapter.number}`];
        if (score !== null && score !== undefined) {
            totalScore += score;
        }
    });

    // Ajouter le score du quiz existant
    const quizScore = Object.values(quizAnswers).filter(a => a.correct).length;
    totalScore += quizScore;

    // Ajouter le score du Chapitre BONUS
    totalScore += getBonusScore();

    document.getElementById('currentScore').textContent = totalScore;
    document.getElementById('finalScore').textContent = totalScore;

    // Calculer la moyenne globale
    const allTotalScores = [];
    Object.entries(allScores).forEach(([pseudo, playerScores]) => {
        let playerTotal = 0;
        CHAPTERS_CONFIG.forEach(chapter => {
            const score = playerScores[`chapter${chapter.number}`];
            if (score !== null && score !== undefined) {
                playerTotal += score;
            }
        });
        if (pseudo === currentUser) {
            playerTotal += quizScore;
            playerTotal += getBonusScore();
        }
        allTotalScores.push(playerTotal);
    });

    if (allTotalScores.length > 0) {
        const avgTotal = allTotalScores.reduce((a, b) => a + b, 0) / allTotalScores.length;
        document.getElementById('avgScore').textContent = avgTotal.toFixed(1);
    }

    updateRanking(totalScore);
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
        if (pseudo === currentUser) {
            const quizScore = Object.values(quizAnswers).filter(a => a.correct).length;
            total += quizScore;
            total += getBonusScore();
        }
        rankings.push({ pseudo, score: total });
    });

    rankings.sort((a, b) => b.score - a.score);

    const userRank = rankings.findIndex(r => r.pseudo === currentUser) + 1;
    const totalPlayers = rankings.length;
    
    document.getElementById('currentRank').textContent = userRank > 0 ? `#${userRank}` : '-';
    
    const userPositionElement = document.getElementById('userPosition');
    const totalParticipantsElement = document.getElementById('totalParticipants');
    
    if (userPositionElement) {
        userPositionElement.textContent = userRank > 0 ? `#${userRank}` : '-';
    }
    if (totalParticipantsElement) {
        totalParticipantsElement.textContent = totalPlayers;
    }
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
        if (pseudo === currentUser) {
            const quizScore = Object.values(quizAnswers).filter(a => a.correct).length;
            total += quizScore;
            total += getBonusScore();
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

    document.getElementById('playerCount').textContent = Object.keys(allScores).length;
}

// ============================================
// CHAPITRE BONUS (A/B/C)
// ============================================

function checkBonusAvailability() {
    const allChaptersCompleted = CHAPTERS_CONFIG.every(chapter => {
        return userScores[`chapter${chapter.number}`] !== null &&
               userScores[`chapter${chapter.number}`] !== undefined;
    });

    const bonusChapter = document.getElementById('bonusChapter');
    if (allChaptersCompleted) {
        bonusChapter.style.display = 'block';
        renderBonusLines();
    } else {
        bonusChapter.style.display = 'none';
    }
}

function renderBonusLines() {
    const container = document.getElementById('bonusLines');
    container.innerHTML = '';

    BONUS_CONFIG.forEach((bonus, index) => {
        const answered = bonusAnswers[index];
        const lineDiv = document.createElement('div');
        lineDiv.className = 'bonus-line' +
            (answered ? (answered.correct ? ' correct' : ' wrong') : '');
        lineDiv.id = `bonusLine${index}`;

        const labelDiv = document.createElement('div');
        labelDiv.className = 'bonus-line-label';
        labelDiv.textContent = bonus.label;

        const optionsDiv = document.createElement('div');
        optionsDiv.className = 'bonus-options';

        const pointsDiv = document.createElement('div');
        pointsDiv.className = 'bonus-points-reveal';
        pointsDiv.textContent = `+ ${bonus.points} point${bonus.points > 1 ? 's' : ''} bonus !`;
        if (answered && answered.correct) {
            pointsDiv.style.display = 'block';
        }

        ['A', 'B', 'C'].forEach(letter => {
            const btn = document.createElement('button');
            btn.className = 'bonus-option-btn';
            btn.textContent = letter;
            btn.disabled = !!answered;

            if (answered && answered.selected === letter) {
                btn.classList.add(answered.correct ? 'selected-correct' : 'selected-wrong');
            }

            if (!answered) {
                btn.addEventListener('click', () => handleBonusChoice(index, letter));
            }

            optionsDiv.appendChild(btn);
        });

        lineDiv.appendChild(labelDiv);
        lineDiv.appendChild(optionsDiv);
        lineDiv.appendChild(pointsDiv);
        container.appendChild(lineDiv);
    });

    checkBonusTrophy();
}

function handleBonusChoice(index, letter) {
    const bonus = BONUS_CONFIG[index];

    pendingValidation = {
        type: 'bonus',
        index: index,
        letter: letter
    };

    showConfirmModal(
        `Vous êtes sur le point de valider votre réponse pour le ${bonus.label}.\n\n` +
        `Réponse choisie : ${letter}\n\n` +
        `⚠️ ATTENTION : Cette action est définitive et ne peut pas être annulée !`
    );
}

function applyBonusAnswer(index, letter) {
    const bonus = BONUS_CONFIG[index];
    const isCorrect = letter === bonus.correct;

    bonusAnswers[index] = { selected: letter, correct: isCorrect };

    firebase.database().ref(`users/${currentUser}/bonusAnswers/${index}`).set({
        selected: letter,
        correct: isCorrect
    }).then(() => {
        renderBonusLines();
        updateScoreDisplay();
        updateLeaderboard();
    });
}

function checkBonusTrophy() {
    const trophyArea = document.getElementById('bonusTrophyArea');
    const allCorrect = BONUS_CONFIG.every((_, i) => bonusAnswers[i] && bonusAnswers[i].correct);
    const allAnswered = BONUS_CONFIG.every((_, i) => bonusAnswers[i]);

    if (allAnswered && allCorrect) {
        trophyArea.innerHTML = '<div class="bonus-trophy-area">🏆</div>';
    } else {
        trophyArea.innerHTML = '';
    }
}

function getBonusScore() {
    return BONUS_CONFIG.reduce((total, bonus, i) => {
        if (bonusAnswers[i] && bonusAnswers[i].correct) {
            return total + bonus.points;
        }
        return total;
    }, 0);
}

// ============================================
// FERMETURE DES MODALS (clic extérieur)
// ============================================

window.onclick = function(event) {
    const confirmModal = document.getElementById('confirmModal');
    if (event.target === confirmModal) {
        closeConfirmModal();
    }
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
