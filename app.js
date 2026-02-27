// ============================================
// ENQUÊTES ET PSYCHOPATHES - APPLICATION
// ============================================

// Configuration des chapitres
const CHAPTERS_CONFIG = [
    { number: 1, title: "Madame BONPOIL encaisse bien", difficulty: 2.1, maxPoints: 10, possibleValues: [0, 10] },
    { number: 2, title: "Un fonctionnaire en moins", difficulty: 3.5, maxPoints: 15, possibleValues: [0, 15] },
    { number: 3, title: "Une pute en moins", difficulty: 3.1, maxPoints: 15, possibleValues: [0, 5, 10, 15] },
    { number: 4, title: "L'encre de la vengeance", difficulty: 1.7, maxPoints: 5, possibleValues: [0, 5] },
    { number: 5, title: "Potins de Stars", difficulty: 3.2, maxPoints: 10, possibleValues: [0, 3, 7, 10] },
    { number: 6, title: "Toc toc toc", difficulty: 4.8, maxPoints: 25, possibleValues: [0, 12, 25] },
    { number: 7, title: "Choisis ta folie", difficulty: 4.5, maxPoints: 20, possibleValues: [0, 10, 20] }
];

// Configuration du questionnaire quiz (10 questions, 1 pt chacune)
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
// Bonne réponse Bonus1=A(1pt), Bonus2=B(2pts), Bonus3=B(3pts), Bonus4=A(4pts)
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
        alert('Erreur : La connexion à la base de données a échoué.');
        return;
    }

    firebase.auth().signInAnonymously()
        .then(() => {
            document.getElementById('pseudoInput').addEventListener('input', checkPseudoAvailability);
            document.getElementById('loginBtn').addEventListener('click', handleLogin);
            document.getElementById('logoutBtn').addEventListener('click', handleLogout);
            document.getElementById('confirmYes').addEventListener('click', confirmAction);
            document.getElementById('confirmNo').addEventListener('click', closeConfirmModal);
            document.getElementById('startBonusBtn').addEventListener('click', startQuiz);
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
            } else {
                statusDiv.textContent = '✓ Pseudo disponible ! Cliquez pour créer votre profil';
            }
            statusDiv.className = 'pseudo-status available';
            loginBtn.disabled = false;
        })
        .catch(error => {
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
                // CORRECTION : normaliser les clés de bonusAnswers en entiers
                const rawBonus = userData.bonusAnswers || {};
                bonusAnswers = {};
                Object.keys(rawBonus).forEach(k => {
                    bonusAnswers[parseInt(k)] = { selected: rawBonus[k].selected };
                });
            } else {
                userScores = {};
                quizAnswers = {};
                bonusAnswers = {};
                firebase.database().ref('users/' + currentUser).set({
                    scores: {},
                    quizAnswers: {},
                    bonusAnswers: {},
                    createdAt: Date.now()
                });
            }
            showGame();
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
                    if (!scrolled) { scrolled = true; transitionToGameScreen(); }
                };
                window.addEventListener('scroll', scrollHandler, { once: true });
                setTimeout(() => { if (!scrolled) transitionToGameScreen(); }, 3000);
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
                    // CORRECTION : normaliser les clés en entiers
                    const rawBonus = userData.bonusAnswers || {};
                    bonusAnswers = {};
                    Object.keys(rawBonus).forEach(k => {
                        // Stocker avec clé entière, on ne garde que selected
                        bonusAnswers[parseInt(k)] = { selected: rawBonus[k].selected };
                    });
                }
            });
            updateLeaderboard();
        })
        .catch(error => console.error('Erreur chargement scores:', error));
}

// ============================================
// GÉNÉRATION DES CHAPITRES
// ============================================

function generateChapters() {
    const grid = document.getElementById('chaptersGrid');
    grid.innerHTML = '';
    CHAPTERS_CONFIG.forEach(chapter => grid.appendChild(createChapterCard(chapter)));
}

function createChapterCard(chapter) {
    const card = document.createElement('div');
    card.className = 'chapter-card';

    const userScore = userScores[`chapter${chapter.number}`];
    const isCompleted = userScore !== null && userScore !== undefined;

    if (isCompleted) {
        card.classList.add('completed');
        if (userScore === 0) card.classList.add('score-zero');
        else if (userScore === chapter.maxPoints) card.classList.add('score-max');
        else card.classList.add('score-partial');
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
                    ${chapter.possibleValues.map(val => `<option value="${val}">${val}</option>`).join('')}
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
    pendingValidation = { type: 'chapter', chapterNumber, score: parseInt(score) };
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
                console.error('Erreur sauvegarde:', error);
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
// CALCUL DES SCORES
// ============================================

function getQuizScore() {
    return Object.values(quizAnswers).filter(a => a && a.correct).length;
}

function getBonusScore() {
    return BONUS_CONFIG.reduce((total, bonus, i) => {
        if (isBonusCorrect(bonusAnswers[i], i)) {
            return total + bonus.points;
        }
        return total;
    }, 0);
}

function isBonusCorrect(answer, index) {
    // On compare uniquement la lettre choisie à la lettre correcte dans BONUS_CONFIG.
    // Jamais de booléen Firebase : zéro ambiguïté de type.
    if (!answer || answer.selected === undefined || answer.selected === null) return false;
    return answer.selected === BONUS_CONFIG[index].correct;
}

function getTotalScore() {
    let total = 0;
    CHAPTERS_CONFIG.forEach(chapter => {
        const score = userScores[`chapter${chapter.number}`];
        if (score !== null && score !== undefined) total += score;
    });
    total += getQuizScore();
    total += getBonusScore();
    return total;
}

// ============================================
// AFFICHAGE DES SCORES
// ============================================

function updateScoreDisplay() {
    const totalScore = getTotalScore();

    document.getElementById('currentScore').textContent = totalScore;
    document.getElementById('finalScore').textContent = totalScore;

    // Moyenne globale
    const allTotalScores = Object.entries(allScores).map(([pseudo, playerScores]) => {
        let playerTotal = 0;
        CHAPTERS_CONFIG.forEach(chapter => {
            const score = playerScores[`chapter${chapter.number}`];
            if (score !== null && score !== undefined) playerTotal += score;
        });
        if (pseudo === currentUser) {
            playerTotal += getQuizScore();
            playerTotal += getBonusScore();
        }
        return playerTotal;
    });

    if (allTotalScores.length > 0) {
        const avg = allTotalScores.reduce((a, b) => a + b, 0) / allTotalScores.length;
        document.getElementById('avgScore').textContent = avg.toFixed(1);
    }

    updateRanking(totalScore);
}

function updateRanking(userTotalScore) {
    const rankings = buildRankings();
    rankings.sort((a, b) => b.score - a.score);

    const userRank = rankings.findIndex(r => r.pseudo === currentUser) + 1;
    const totalPlayers = rankings.length;

    document.getElementById('currentRank').textContent = userRank > 0 ? `#${userRank}` : '-';

    const userPositionElement = document.getElementById('userPosition');
    const totalParticipantsElement = document.getElementById('totalParticipants');
    if (userPositionElement) userPositionElement.textContent = userRank > 0 ? `#${userRank}` : '-';
    if (totalParticipantsElement) totalParticipantsElement.textContent = totalPlayers;
}

function buildRankings() {
    return Object.entries(allScores).map(([pseudo, scores]) => {
        let total = 0;
        CHAPTERS_CONFIG.forEach(chapter => {
            const score = scores[`chapter${chapter.number}`];
            if (score !== null && score !== undefined) total += score;
        });
        if (pseudo === currentUser) {
            total += getQuizScore();
            total += getBonusScore();
        }
        return { pseudo, score: total };
    });
}

// ============================================
// CLASSEMENT
// ============================================

function updateLeaderboard() {
    const rankings = buildRankings();
    rankings.sort((a, b) => b.score - a.score);

    const tbody = document.getElementById('leaderboardBody');
    tbody.innerHTML = '';

    rankings.slice(0, 10).forEach((player, index) => {
        const row = document.createElement('tr');
        if (player.pseudo === currentUser) row.classList.add('current-player');
        const rankClass = index === 0 ? 'rank-1' : index === 1 ? 'rank-2' : index === 2 ? 'rank-3' : 'rank-other';
        row.innerHTML = `
            <td><span class="rank-badge ${rankClass}">${index + 1}</span></td>
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
    const allChaptersCompleted = CHAPTERS_CONFIG.every(chapter =>
        userScores[`chapter${chapter.number}`] !== null &&
        userScores[`chapter${chapter.number}`] !== undefined
    );

    // Afficher le Chapitre BONUS et le Quiz seulement si tous les chapitres sont complétés
    document.getElementById('bonusChapter').style.display = allChaptersCompleted ? 'block' : 'none';
    document.getElementById('quizSection').style.display = allChaptersCompleted ? 'block' : 'none';

    if (allChaptersCompleted) {
        renderBonusLines();
        updateBonusProgress();
    }
}

function renderBonusLines() {
    const container = document.getElementById('bonusLines');
    container.innerHTML = '';

    BONUS_CONFIG.forEach((bonus, index) => {
        const answered = bonusAnswers[index];
        // Conversion explicite en booléen pour éviter tout problème de type Firebase
        const isCorrect = isBonusCorrect(answered, index);

        const lineDiv = document.createElement('div');
        lineDiv.className = 'bonus-line' + (answered ? (isCorrect ? ' correct' : ' wrong') : '');

        const rowDiv = document.createElement('div');
        rowDiv.className = 'bonus-line-row';

        const labelDiv = document.createElement('div');
        labelDiv.className = 'bonus-line-label';
        labelDiv.textContent = bonus.label;
        rowDiv.appendChild(labelDiv);

        const optionsDiv = document.createElement('div');
        optionsDiv.className = 'bonus-options';

        ['A', 'B', 'C'].forEach(letter => {
            const btn = document.createElement('button');
            btn.className = 'bonus-option-btn';
            btn.textContent = letter;
            btn.disabled = !!answered;

            if (answered && answered.selected === letter) {
                btn.classList.add(isCorrect ? 'selected-correct' : 'selected-wrong');
            }

            if (!answered) {
                btn.addEventListener('click', () => handleBonusChoice(index, letter));
            }

            optionsDiv.appendChild(btn);
        });
        rowDiv.appendChild(optionsDiv);

        // Points — toujours créés, visibles uniquement si bonne réponse
        const pointsDiv = document.createElement('div');
        pointsDiv.className = 'bonus-points-reveal';
        pointsDiv.textContent = `🏅 ${bonus.points} point${bonus.points > 1 ? 's' : ''} obtenu${bonus.points > 1 ? 's' : ''} !`;
        // Forcer l'affichage inline-flex si correct
        pointsDiv.style.cssText = isCorrect
            ? 'display:inline-flex !important; visibility:visible !important;'
            : 'display:none;';
        rowDiv.appendChild(pointsDiv);

        lineDiv.appendChild(rowDiv);
        container.appendChild(lineDiv);
    });

    checkBonusTrophy();
    updateBonusSummary();
}

function updateBonusSummary() {
    const summaryDiv = document.getElementById('bonusSummary');
    if (!summaryDiv) return;

    // Construire chaque item : "1/1" si gagné, "0/2" si raté ou pas encore répondu
    const items = BONUS_CONFIG.map((bonus, i) => {
        const answered = bonusAnswers[i];
        const earned = isBonusCorrect(answered, i);
        const pts = earned ? bonus.points : 0;
        return { label: `${pts}/${bonus.points}`, earned };
    });

    const totalEarned = items.reduce((sum, item, i) => {
        return sum + (item.earned ? BONUS_CONFIG[i].points : 0);
    }, 0);
    const totalMax = BONUS_CONFIG.reduce((sum, b) => sum + b.points, 0);

    summaryDiv.innerHTML = `
        <span class="bonus-summary-label">POINTS BONUS :</span>
        ${items.map(item => `
            <span class="bonus-summary-item ${item.earned ? 'earned' : 'missed'}">${item.label}</span>
        `).join('<span style="color:var(--gris-moyen)">—</span>')}
        <span class="bonus-summary-total">= ${totalEarned} / ${totalMax} pts</span>
    `;
}

function handleBonusChoice(index, letter) {
    pendingValidation = { type: 'bonus', index, letter };
    showConfirmModal(
        `Vous êtes sur le point de valider votre réponse pour le ${BONUS_CONFIG[index].label}.\n\n` +
        `Réponse choisie : ${letter}\n\n` +
        `⚠️ ATTENTION : Cette action est définitive et ne peut pas être annulée !`
    );
}

function applyBonusAnswer(index, letter) {
    // On stocke uniquement la lettre choisie.
    // isCorrect est recalculé à la volée depuis BONUS_CONFIG, jamais depuis Firebase.
    bonusAnswers[index] = { selected: letter };

    firebase.database().ref(`users/${currentUser}/bonusAnswers/${index}`).set({
        selected: letter
    }).then(() => {
        renderBonusLines();
        updateScoreDisplay();
        updateLeaderboard();
    });
}

function checkBonusTrophy() {
    const trophyArea = document.getElementById('bonusTrophyArea');
    const allAnswered = BONUS_CONFIG.every((_, i) => bonusAnswers[i]);
    const allCorrect = BONUS_CONFIG.every((_, i) => isBonusCorrect(bonusAnswers[i], i));

    if (allAnswered && allCorrect) {
        trophyArea.innerHTML = '<div class="bonus-trophy-area">🏆</div>';
    } else {
        trophyArea.innerHTML = '';
    }
}

// ============================================
// QUIZ DE CONNAISSANCES (10 questions)
// ============================================

function updateBonusProgress() {
    const answeredCount = Object.keys(quizAnswers).length;
    const progressDiv = document.getElementById('bonusProgress');
    if (answeredCount > 0) {
        const correctCount = Object.values(quizAnswers).filter(a => a.correct).length;
        progressDiv.innerHTML = `
            <p style="margin-top: 15px;">
                <strong>Progression :</strong> ${answeredCount}/10 questions répondues<br>
                <strong>Score actuel :</strong> ${correctCount}/10 points
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
    const alreadyAnswered = quizAnswers[questionNumber];

    document.getElementById('currentQuestion').textContent = questionNumber;
    document.getElementById('quizScore').textContent = getQuizScore();

    container.innerHTML = `
        <div class="quiz-question">
            <div class="question-text">
                <strong>Question ${questionNumber} :</strong><br>${questionData.question}
            </div>
            <div class="quiz-options" id="quizOptions">
                ${questionData.options.map((option, index) => `
                    <div class="quiz-option
                        ${alreadyAnswered && alreadyAnswered.selected === index ? 'selected' : ''}
                        ${alreadyAnswered ? 'locked' : ''}
                        ${alreadyAnswered && index === questionData.correct ? 'correct' : ''}
                        ${alreadyAnswered && alreadyAnswered.selected === index && !alreadyAnswered.correct ? 'incorrect' : ''}"
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

    if (!alreadyAnswered) {
        document.querySelectorAll('.quiz-option').forEach(option => {
            option.addEventListener('click', function() {
                if (this.classList.contains('locked')) return;
                const selectedIndex = parseInt(this.dataset.index);
                const isCorrect = selectedIndex === questionData.correct;

                document.querySelectorAll('.quiz-option').forEach(opt => opt.classList.add('locked'));
                this.classList.add('selected');
                this.classList.add(isCorrect ? 'correct' : 'incorrect');
                if (!isCorrect) document.querySelectorAll('.quiz-option')[questionData.correct].classList.add('correct');

                saveQuizAnswer(questionNumber, selectedIndex, isCorrect);

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
    quizAnswers[questionNumber] = { selected: selectedIndex, correct: isCorrect };
    firebase.database().ref(`users/${currentUser}/quizAnswers/${questionNumber}`).set({
        selected: selectedIndex,
        correct: isCorrect
    }).then(() => {
        document.getElementById('quizScore').textContent = getQuizScore();
        updateScoreDisplay();
        updateLeaderboard();
        updateBonusProgress();
    });
}

function previousQuestion() {
    if (currentQuizQuestion > 0) { currentQuizQuestion--; showQuizQuestion(); }
}

function nextQuestion() {
    if (currentQuizQuestion < QUIZ_QUESTIONS.length - 1) { currentQuizQuestion++; showQuizQuestion(); }
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
// FERMETURE DES MODALS
// ============================================

window.onclick = function(event) {
    const confirmModal = document.getElementById('confirmModal');
    if (event.target === confirmModal) closeConfirmModal();
}

// ============================================
// SCROLL VERS LE TOP 10
// ============================================

function scrollToLeaderboard() {
    const leaderboardSection = document.querySelector('.leaderboard-section');
    if (leaderboardSection) {
        leaderboardSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}
