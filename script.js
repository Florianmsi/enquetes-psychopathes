// ==============================================
// CONFIGURATION DES CHAPITRES
// ==============================================
const CHAPTERS_CONFIG = {
    1: { title: "Madame BONPOIL encaisse bien", difficulty: "2.1/5", max: 10, values: [0, 10] },
    2: { title: "Un fonctionnaire en moins", difficulty: "3.5/5", max: 15, values: [0, 15] },
    3: { title: "Une pute en moins", difficulty: "3.1/5", max: 15, values: [0, 5, 10, 15] },
    4: { title: "L'encre de la vengeance", difficulty: "1.7/5", max: 5, values: [0, 5] },
    5: { title: "Potins de Stars", difficulty: "3.2/5", max: 10, values: [0, 3, 7, 10] },
    6: { title: "Toc toc toc", difficulty: "4.8/5", max: 25, values: [0, 12, 25] },
    7: { title: "Choisis ta folie", difficulty: "4.5/5", max: 20, values: [0, 10, 20] }
};

// ==============================================
// QUESTIONS BONUS
// ==============================================
const BONUS_QUESTIONS = [
    {
        id: 1,
        question: "Parmi ces symptômes, lequel fait partie des \"symptômes négatifs\" de la schizophrénie ?",
        options: [
            "L'émoussement affectif et l'avolition (perte de motivation)",
            "Le sentiment de communiquer avec des personnes réelles, mais absentes.",
            "Les hallucinations visuelles."
        ],
        correct: 0
    },
    {
        id: 2,
        question: "TOC (Trouble Obsessionnel Compulsif) - Une personne atteinte de TOC se caractérise principalement par :",
        options: [
            "Des obsessions et des compulsions répétitives",
            "Des troubles de l'attention.",
            "Une tendance à mentir de façon compulsive"
        ],
        correct: 0
    },
    {
        id: 3,
        question: "TSPT (Trouble de Stress Post-Traumatique) - Quel symptôme N'est PAS typique du TSPT ?",
        options: [
            "Des points communs avec la dépression.",
            "Des idées délirantes de persécution",
            "Les reviviscences (flashbacks) de l'événement traumatique"
        ],
        correct: 1
    },
    {
        id: 4,
        question: "Dépression - Qu'est-ce qui ne caractérise PAS nécessairement une dépression clinique ?",
        options: [
            "Une tristesse profonde et durable avec perte d'intérêt",
            "Se sentir faible émotionnellement.",
            "Faire de chaque échange un conflit avec autrui."
        ],
        correct: 2
    },
    {
        id: 5,
        question: "Quel neurotransmetteur est souvent impliqué dans les troubles du comportement alimentaire comme la boulimie ?",
        options: [
            "La sérotonine",
            "La dopamine",
            "L'insuline"
        ],
        correct: 0
    },
    {
        id: 6,
        question: "Un mythomane se définit par :",
        options: [
            "Le besoin pathologique de mentir de façon excessive",
            "Modifier la réalité dans l'unique but de manipuler.",
            "Ne pas avoir de limites pour parvenir à son objectif."
        ],
        correct: 0
    },
    {
        id: 7,
        question: "La paranoïa peut accompagner plusieurs autres troubles, mais lequel n'en fait quasiment pas partie ?",
        options: [
            "Dépression majeure",
            "TSPT",
            "Mythomanie"
        ],
        correct: 2
    },
    {
        id: 8,
        question: "Psychopathie - La psychopathie se caractérise principalement par :",
        options: [
            "Un manque d'empathie et de remords",
            "Une agressivité soudaine.",
            "Une grande anxiété sociale"
        ],
        correct: 0
    },
    {
        id: 9,
        question: "Parmi ces troubles, lequel n'est pas abordé dans ce livre ?",
        options: [
            "La dépression.",
            "La bipolarité.",
            "La boulimie."
        ],
        correct: 1
    },
    {
        id: 10,
        question: "Trouble de la personnalité paranoïaque - Quel est le pourcentage de notre population qui en souffre réellement ?",
        options: [
            "0,1 à 0,4 %",
            "0,5 à 2,5 %",
            "2,6 à 3 %"
        ],
        correct: 1
    }
];

// ==============================================
// VARIABLES GLOBALES
// ==============================================
let currentUser = null;
let currentChapter = null;
let selectedScore = null;

// ==============================================
// SYSTÈME DE BASE DE DONNÉES SIMULÉE (LocalStorage)
// ==============================================
class Database {
    static getAllUsers() {
        const users = localStorage.getItem('enquetes_users');
        return users ? JSON.parse(users) : {};
    }

    static saveAllUsers(users) {
        localStorage.setItem('enquetes_users', JSON.stringify(users));
    }

    static userExists(pseudo) {
        const users = this.getAllUsers();
        return users.hasOwnProperty(pseudo);
    }

    static createUser(pseudo) {
        const users = this.getAllUsers();
        users[pseudo] = {
            pseudo: pseudo,
            createdAt: new Date().toISOString(),
            chapters: {},
            bonusAnswers: {}
        };
        this.saveAllUsers(users);
        return users[pseudo];
    }

    static getUser(pseudo) {
        const users = this.getAllUsers();
        return users[pseudo] || null;
    }

    static updateUserChapter(pseudo, chapter, score) {
        const users = this.getAllUsers();
        if (users[pseudo]) {
            users[pseudo].chapters[chapter] = score;
            this.saveAllUsers(users);
        }
    }

    static updateUserBonus(pseudo, answers) {
        const users = this.getAllUsers();
        if (users[pseudo]) {
            users[pseudo].bonusAnswers = answers;
            this.saveAllUsers(users);
        }
    }

    static calculateUserScore(userData) {
        let total = 0;
        for (let i = 1; i <= 7; i++) {
            total += userData.chapters[i] || 0;
        }
        // Ajouter le score bonus
        let bonusScore = 0;
        Object.keys(userData.bonusAnswers || {}).forEach(qId => {
            const question = BONUS_QUESTIONS.find(q => q.id == qId);
            if (question && userData.bonusAnswers[qId] === question.correct) {
                bonusScore++;
            }
        });
        total += bonusScore;
        return total;
    }

    static getLeaderboard() {
        const users = this.getAllUsers();
        const leaderboard = [];
        
        Object.values(users).forEach(user => {
            const score = this.calculateUserScore(user);
            leaderboard.push({ pseudo: user.pseudo, score: score });
        });
        
        leaderboard.sort((a, b) => b.score - a.score);
        return leaderboard;
    }

    static getAverageScores() {
        const users = this.getAllUsers();
        const usersList = Object.values(users);
        if (usersList.length === 0) return { chapters: {}, total: 0, bonus: 0 };

        const sums = { chapters: {}, total: 0, bonus: 0 };
        
        usersList.forEach(user => {
            for (let i = 1; i <= 7; i++) {
                sums.chapters[i] = (sums.chapters[i] || 0) + (user.chapters[i] || 0);
            }
            sums.total += this.calculateUserScore(user);
        });

        const averages = { chapters: {}, total: 0 };
        for (let i = 1; i <= 7; i++) {
            averages.chapters[i] = (sums.chapters[i] / usersList.length).toFixed(1);
        }
        averages.total = (sums.total / usersList.length).toFixed(1);

        return averages;
    }
}

// ==============================================
// GESTION DES SECTIONS
// ==============================================
function showSection(sectionName) {
    // Cacher toutes les sections
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Désactiver tous les boutons
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Afficher la section demandée
    if (sectionName === 'chapitres') {
        document.getElementById('sectionChapitres').classList.add('active');
        document.querySelectorAll('.nav-btn')[0].classList.add('active');
    } else if (sectionName === 'classement' || sectionName === 'statistiques') {
        document.getElementById('sectionClassement').classList.add('active');
        document.querySelectorAll('.nav-btn')[1].classList.add('active');
        updateStatisticsSection();
    }
}

function updateStatisticsSection() {
    const leaderboard = Database.getLeaderboard();
    const totalPlayers = leaderboard.length;
    const playerRank = leaderboard.findIndex(entry => entry.pseudo === currentUser.pseudo) + 1;
    const playerScore = Database.calculateUserScore(currentUser);
    const averages = Database.getAverageScores();
    
    // Mettre à jour le rang
    document.getElementById('statsRankValue').textContent = playerRank > 0 ? `#${playerRank}` : '-';
    document.getElementById('statsRank').textContent = playerRank > 0 ? `${playerRank}${getOrdinalSuffix(playerRank)}` : '-';
    document.getElementById('statsTotalPlayers').textContent = totalPlayers;
    
    // Mettre à jour les scores
    document.getElementById('statsPlayerScore').textContent = playerScore;
    document.getElementById('statsAvgScore').textContent = averages.total;
    
    // Afficher le leaderboard
    const container = document.getElementById('statsLeaderboard');
    container.innerHTML = '';
    
    const top10 = leaderboard.slice(0, 10);
    
    top10.forEach((entry, index) => {
        const rank = index + 1;
        const isCurrentUser = entry.pseudo === currentUser.pseudo;
        
        const row = document.createElement('div');
        row.className = `leaderboard-row ${isCurrentUser ? 'current-user' : ''}`;
        
        let medal = '';
        if (rank === 1) medal = '🥇';
        else if (rank === 2) medal = '🥈';
        else if (rank === 3) medal = '🥉';
        
        row.innerHTML = `
            <div class="rank">${medal || rank}</div>
            <div class="player-name">${entry.pseudo} ${isCurrentUser ? '(Vous)' : ''}</div>
            <div class="player-score">${entry.score} pts</div>
        `;
        
        container.appendChild(row);
    });
}

// ==============================================
// AUTHENTIFICATION
// ==============================================
function initAuth() {
    const pseudoInput = document.getElementById('pseudoInput');
    const loginBtn = document.getElementById('loginBtn');
    const newUserWarning = document.getElementById('newUserWarning');
    const pseudoStatus = document.getElementById('pseudoStatus');

    pseudoInput.addEventListener('input', function() {
        const pseudo = this.value.trim();
        
        if (pseudo.length < 3) {
            loginBtn.disabled = true;
            pseudoStatus.textContent = '';
            newUserWarning.style.display = 'none';
            return;
        }

        const exists = Database.userExists(pseudo);
        
        if (exists) {
            pseudoStatus.textContent = '✓ Compte existant';
            pseudoStatus.className = 'status-indicator existing';
            newUserWarning.style.display = 'none';
            loginBtn.disabled = false;
            loginBtn.innerHTML = '<span class="btn-icon">🔓</span> ACCÉDER AUX ENQUÊTES';
        } else {
            pseudoStatus.textContent = '✨ Nouveau pseudo';
            pseudoStatus.className = 'status-indicator new';
            newUserWarning.style.display = 'flex';
            loginBtn.disabled = false;
            loginBtn.innerHTML = '<span class="btn-icon">📝</span> CRÉER MON COMPTE';
        }
    });

    loginBtn.addEventListener('click', handleLogin);
    
    pseudoInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && !loginBtn.disabled) {
            handleLogin();
        }
    });
}

function handleLogin() {
    const pseudo = document.getElementById('pseudoInput').value.trim();
    
    if (pseudo.length < 3) {
        alert('Le pseudo doit contenir au moins 3 caractères');
        return;
    }

    let userData;
    if (Database.userExists(pseudo)) {
        userData = Database.getUser(pseudo);
        console.log(`Bienvenue ${pseudo}, nous avons retrouvé vos enquêtes !`);
    } else {
        userData = Database.createUser(pseudo);
        console.log(`Nouveau compte créé pour ${pseudo}`);
    }

    currentUser = userData;
    showGameScreen();
}

function showGameScreen() {
    console.log('=== AFFICHAGE ÉCRAN DE JEU ===');
    document.getElementById('loginScreen').classList.remove('active');
    document.getElementById('gameScreen').classList.add('active');
    document.getElementById('currentUser').textContent = currentUser.pseudo;
    
    console.log('User connecté:', currentUser);
    console.log('Chapitres de l\'user:', currentUser.chapters);
    
    // Attendre que le DOM soit bien rendu
    setTimeout(() => {
        console.log('Chargement des données utilisateur...');
        
        // Vérifier que les éléments existent
        for (let i = 1; i <= 7; i++) {
            const scoreEl = document.getElementById(`score${i}`);
            const cardEl = document.querySelector(`.chapter-card[data-chapter="${i}"]`);
            console.log(`Ch${i}: scoreElement=${scoreEl ? 'OK' : 'MANQUANT'}, card=${cardEl ? 'OK' : 'MANQUANT'}`);
        }
        
        loadUserData();
        updateLeaderboard();
        checkBonusUnlock();
    }, 100);
}

function logout() {
    currentUser = null;
    document.getElementById('gameScreen').classList.remove('active');
    document.getElementById('loginScreen').classList.add('active');
    document.getElementById('pseudoInput').value = '';
    document.getElementById('pseudoStatus').textContent = '';
    document.getElementById('newUserWarning').style.display = 'none';
    document.getElementById('loginBtn').disabled = true;
}

// ==============================================
// GESTION DES CHAPITRES
// ==============================================
function loadUserData() {
    console.log('=== CHARGEMENT DONNÉES UTILISATEUR ===');
    const userData = Database.getUser(currentUser.pseudo);
    const averages = Database.getAverageScores();
    
    console.log('userData:', userData);
    console.log('Chapitres:', userData.chapters);
    
    let playerTotal = 0;

    // Charger les scores des chapitres
    for (let i = 1; i <= 7; i++) {
        const score = userData.chapters[i];
        const scoreElement = document.getElementById(`score${i}`);
        const avgElement = document.getElementById(`avg${i}`);
        const progressElement = document.getElementById(`progress${i}`);
        const chapterCard = document.querySelector(`.chapter-card[data-chapter="${i}"]`);
        
        console.log(`--- Chapitre ${i} ---`);
        console.log(`Score: ${score}`);
        console.log(`ScoreElement trouvé: ${scoreElement !== null}`);
        console.log(`Card trouvée: ${chapterCard !== null}`);
        
        if (score !== undefined && score !== null) {
            const displayText = `${score}/${CHAPTERS_CONFIG[i].max}`;
            console.log(`Affichage du score: ${displayText}`);
            
            if (scoreElement) {
                scoreElement.textContent = displayText;
                scoreElement.classList.add('completed');
                console.log(`✓ Score ${i} affiché`);
            } else {
                console.error(`✗ Element score${i} non trouvé !`);
            }
            
            playerTotal += score;
            
            if (progressElement) {
                const percentage = (score / CHAPTERS_CONFIG[i].max) * 100;
                progressElement.style.width = `${percentage}%`;
            }
            
            // Vérifier si c'est un score parfait et ajouter le badge
            if (chapterCard && score === CHAPTERS_CONFIG[i].max) {
                console.log(`Score parfait pour chapitre ${i} !`);
                // Retirer l'ancien badge s'il existe
                const oldBadge = chapterCard.querySelector('.perfect-badge');
                if (oldBadge) oldBadge.remove();
                
                // Ajouter le badge de score parfait
                const perfectBadge = document.createElement('div');
                perfectBadge.className = 'perfect-badge';
                perfectBadge.innerHTML = '🏆 PARFAIT';
                chapterCard.appendChild(perfectBadge);
                
                // Ajouter une classe spéciale à la carte
                chapterCard.classList.add('has-perfect-score');
            }
        } else {
            console.log(`Pas de score pour chapitre ${i}`);
            if (scoreElement) {
                scoreElement.textContent = '-';
                scoreElement.classList.remove('completed');
            }
            if (progressElement) {
                progressElement.style.width = '0%';
            }
            
            if (chapterCard) {
                // Retirer le badge si pas de score
                const oldBadge = chapterCard.querySelector('.perfect-badge');
                if (oldBadge) oldBadge.remove();
                chapterCard.classList.remove('has-perfect-score');
            }
        }
        
        if (avgElement) {
            avgElement.textContent = averages.chapters[i] ? `${averages.chapters[i]}/${CHAPTERS_CONFIG[i].max}` : '-';
        }
    }

    // Charger le score bonus
    const bonusScore = calculateBonusScore(userData.bonusAnswers);
    const scoreBonusElement = document.getElementById('scoreBonus');
    console.log('Score bonus:', bonusScore);
    
    if (bonusScore > 0) {
        if (scoreBonusElement) {
            scoreBonusElement.textContent = `${bonusScore}/10`;
            scoreBonusElement.classList.add('completed');
        }
        playerTotal += bonusScore;
    } else {
        if (scoreBonusElement) {
            scoreBonusElement.textContent = '-';
        }
    }

    // Afficher le score total
    console.log('=== SCORE TOTAL ===');
    console.log('Total calculé:', playerTotal);
    console.log('Détail chapitres:', userData.chapters);
    console.log('Bonus:', bonusScore);
    
    const playerScoreEl = document.getElementById('playerScore');
    const avgScoreEl = document.getElementById('avgScore');
    
    if (playerScoreEl) {
        playerScoreEl.textContent = playerTotal;
        console.log('✓ Score total affiché:', playerTotal);
    } else {
        console.error('✗ Element playerScore non trouvé !');
    }
    
    if (avgScoreEl) {
        avgScoreEl.textContent = averages.total;
    }
    
    // Mettre à jour les mini-scores dans le score-board
    for (let i = 1; i <= 7; i++) {
        const miniScoreElement = document.getElementById(`miniScore${i}`);
        const score = userData.chapters[i];
        if (miniScoreElement) {
            miniScoreElement.textContent = score !== undefined ? score : '-';
        }
    }
    
    const miniScoreBonusElement = document.getElementById('miniScoreBonus');
    if (miniScoreBonusElement) {
        miniScoreBonusElement.textContent = bonusScore > 0 ? bonusScore : '-';
    }
    
    console.log('=== FIN CHARGEMENT ===');
}

function openChapter(chapterNum) {
    const userData = Database.getUser(currentUser.pseudo);
    
    // Vérifier si le chapitre est déjà complété
    if (userData.chapters[chapterNum] !== undefined) {
        alert('Vous avez déjà validé ce chapitre. Les scores ne peuvent pas être modifiés.');
        return;
    }

    currentChapter = chapterNum;
    const config = CHAPTERS_CONFIG[chapterNum];
    
    document.getElementById('modalTitle').textContent = `Chapitre ${chapterNum} : ${config.title}`;
    document.getElementById('modalDifficulty').textContent = `Difficulté: ${config.difficulty}`;
    
    const scoreOptions = document.getElementById('scoreOptions');
    scoreOptions.innerHTML = '';
    
    config.values.forEach(value => {
        const button = document.createElement('button');
        button.className = 'score-option';
        button.textContent = `${value} points`;
        button.onclick = () => selectScore(value);
        scoreOptions.appendChild(button);
    });
    
    selectedScore = null;
    document.getElementById('validateBtn').disabled = true;
    document.getElementById('chapterModal').style.display = 'block';
}

function selectScore(score) {
    selectedScore = score;
    
    const buttons = document.querySelectorAll('.score-option');
    buttons.forEach(btn => btn.classList.remove('selected'));
    
    event.target.classList.add('selected');
    document.getElementById('validateBtn').disabled = false;
}

function validateChapter() {
    if (selectedScore === null) return;
    
    console.log('=== VALIDATION CHAPITRE ===');
    console.log('Chapitre:', currentChapter);
    console.log('Score sélectionné:', selectedScore);
    
    Database.updateUserChapter(currentUser.pseudo, currentChapter, selectedScore);
    currentUser = Database.getUser(currentUser.pseudo);
    
    console.log('Données après sauvegarde:', currentUser.chapters);
    
    // Vérifier si c'est un score parfait
    const config = CHAPTERS_CONFIG[currentChapter];
    const isPerfectScore = selectedScore === config.max;
    
    console.log(`Score max possible: ${config.max}, Est parfait: ${isPerfectScore}`);
    
    closeModal();
    
    // Recharger les données AVANT l'animation
    loadUserData();
    checkBonusUnlock();
    updateLeaderboard();
    
    // Lancer l'animation après le rechargement
    if (isPerfectScore) {
        console.log('LANCEMENT ANIMATION SCORE PARFAIT');
        showPerfectScoreAnimation(currentChapter);
    }
}

function showPerfectScoreAnimation(chapterNum) {
    console.log('showPerfectScoreAnimation appelée pour chapitre', chapterNum);
    
    const chapterCard = document.querySelector(`.chapter-card[data-chapter="${chapterNum}"]`);
    console.log('Carte trouvée:', chapterCard);
    
    if (!chapterCard) {
        console.error('Carte de chapitre non trouvée !');
        return;
    }
    
    // Ajouter la classe d'animation
    chapterCard.classList.add('perfect-score');
    console.log('Classe perfect-score ajoutée');
    
    // Créer l'overlay d'animation
    const overlay = document.createElement('div');
    overlay.className = 'perfect-score-overlay';
    overlay.innerHTML = `
        <div class="perfect-score-content">
            <div class="perfect-trophy-big">🏆</div>
            <div class="perfect-title">SCORE PARFAIT !</div>
            <div class="perfect-stars">⭐⭐⭐</div>
            <div class="perfect-message">Mission accomplie avec brio !</div>
        </div>
    `;
    chapterCard.appendChild(overlay);
    console.log('Overlay ajouté');
    
    // Retirer l'animation après 3 secondes
    setTimeout(() => {
        overlay.classList.add('fade-out');
        setTimeout(() => {
            overlay.remove();
            chapterCard.classList.remove('perfect-score');
        }, 500);
    }, 3500);
}

function closeModal() {
    document.getElementById('chapterModal').style.display = 'none';
    currentChapter = null;
    selectedScore = null;
}

// ==============================================
// GESTION DU BONUS
// ==============================================
function checkBonusUnlock() {
    const userData = Database.getUser(currentUser.pseudo);
    let allCompleted = true;
    
    console.log('Vérification déblocage bonus pour:', currentUser.pseudo);
    console.log('Chapitres complétés:', userData.chapters);
    
    for (let i = 1; i <= 7; i++) {
        if (userData.chapters[i] === undefined) {
            console.log(`Chapitre ${i} non complété`);
            allCompleted = false;
            break;
        }
    }
    
    console.log('Tous chapitres complétés?', allCompleted);
    
    const bonusCard = document.getElementById('bonusCard');
    const bonusButton = bonusCard.querySelector('button');
    
    if (allCompleted) {
        console.log('Déblocage du BONUS');
        bonusCard.classList.remove('locked');
        bonusCard.classList.add('unlocked');
        bonusButton.disabled = false;
        
        // Retirer le message de verrouillage
        const lockedMsg = bonusCard.querySelector('.locked-message');
        if (lockedMsg) lockedMsg.style.display = 'none';
    } else {
        bonusCard.classList.add('locked');
        bonusCard.classList.remove('unlocked');
        bonusButton.disabled = true;
        
        const lockedMsg = bonusCard.querySelector('.locked-message');
        if (lockedMsg) lockedMsg.style.display = 'block';
    }
}

function openBonus() {
    renderBonusQuestions();
    document.getElementById('bonusModal').style.display = 'block';
}

function closeBonusModal() {
    document.getElementById('bonusModal').style.display = 'none';
}

function renderBonusQuestions() {
    const userData = Database.getUser(currentUser.pseudo);
    const container = document.getElementById('questionsContainer');
    container.innerHTML = '';
    
    BONUS_QUESTIONS.forEach((q, index) => {
        const questionDiv = document.createElement('div');
        questionDiv.className = 'bonus-question';
        
        const isAnswered = userData.bonusAnswers[q.id] !== undefined;
        const userAnswer = userData.bonusAnswers[q.id];
        const isCorrect = userAnswer === q.correct;
        
        let html = `
            <div class="question-header">
                <h4>Question ${q.id}</h4>
                ${isAnswered && isCorrect ? '<span class="trophy-icon">🏆</span>' : ''}
            </div>
            <p class="question-text">${q.question}</p>
            <div class="question-options">
        `;
        
        q.options.forEach((option, optIndex) => {
            const letter = String.fromCharCode(65 + optIndex);
            const isSelected = userAnswer === optIndex;
            const disabledAttr = isAnswered ? 'disabled' : '';
            const checkedAttr = isSelected ? 'checked' : '';
            
            html += `
                <label class="bonus-option ${isSelected ? 'selected' : ''} ${isAnswered ? 'answered' : ''}">
                    <input type="radio" 
                           name="question${q.id}" 
                           value="${optIndex}" 
                           ${checkedAttr}
                           ${disabledAttr}
                           onchange="answerBonusQuestion(${q.id}, ${optIndex})">
                    <span>${letter}) ${option}</span>
                </label>
            `;
        });
        
        html += '</div>';
        
        if (isAnswered) {
            html += `<div class="answer-feedback ${isCorrect ? 'correct' : 'incorrect'}">
                ${isCorrect ? '✓ Bonne réponse !' : '✗ Mauvaise réponse'}
            </div>`;
        }
        
        questionDiv.innerHTML = html;
        container.appendChild(questionDiv);
    });
    
    updateBonusScoreDisplay();
}

function answerBonusQuestion(questionId, answerIndex) {
    const userData = Database.getUser(currentUser.pseudo);
    
    if (userData.bonusAnswers[questionId] !== undefined) {
        return;
    }
    
    userData.bonusAnswers[questionId] = answerIndex;
    Database.updateUserBonus(currentUser.pseudo, userData.bonusAnswers);
    currentUser = userData;
    
    renderBonusQuestions();
    loadUserData();
    updateLeaderboard();
    
    // Vérifier si toutes les questions ont été répondues
    const answeredCount = Object.keys(userData.bonusAnswers || {}).length;
    if (answeredCount === 10) {
        // Attendre 2 secondes puis fermer la modale et aller au classement
        setTimeout(() => {
            closeBonusModal();
            showSection('classement');
        }, 2000);
    }
}

function calculateBonusScore(bonusAnswers) {
    let score = 0;
    Object.keys(bonusAnswers || {}).forEach(qId => {
        const question = BONUS_QUESTIONS.find(q => q.id == qId);
        if (question && bonusAnswers[qId] === question.correct) {
            score++;
        }
    });
    return score;
}

function updateBonusScoreDisplay() {
    const userData = Database.getUser(currentUser.pseudo);
    const bonusScore = calculateBonusScore(userData.bonusAnswers);
    const answeredCount = Object.keys(userData.bonusAnswers || {}).length;
    document.getElementById('bonusCurrentScore').textContent = `${bonusScore} (${answeredCount}/10 réponses)`;
    
    // Si toutes les questions sont répondues, afficher un message
    if (answeredCount === 10) {
        const container = document.getElementById('questionsContainer');
        const completionMessage = document.createElement('div');
        completionMessage.className = 'bonus-completion-message';
        completionMessage.innerHTML = `
            <h3>✅ Questionnaire terminé !</h3>
            <p>Votre score final : <strong>${bonusScore}/10</strong></p>
            <p>Redirection vers le classement dans 2 secondes...</p>
        `;
        container.appendChild(completionMessage);
    }
}

// ==============================================
// CLASSEMENT
// ==============================================
function updateLeaderboard() {
    const leaderboard = Database.getLeaderboard();
    const container = document.getElementById('leaderboard');
    const totalPlayers = leaderboard.length;
    
    document.getElementById('totalPlayers').textContent = totalPlayers;
    
    // Trouver le rang du joueur actuel
    const playerRank = leaderboard.findIndex(entry => entry.pseudo === currentUser.pseudo) + 1;
    document.getElementById('playerRank').textContent = playerRank > 0 ? `${playerRank}${getOrdinalSuffix(playerRank)}` : '-';
    
    container.innerHTML = '';
    
    const top10 = leaderboard.slice(0, 10);
    
    top10.forEach((entry, index) => {
        const rank = index + 1;
        const isCurrentUser = entry.pseudo === currentUser.pseudo;
        
        const row = document.createElement('div');
        row.className = `leaderboard-row ${isCurrentUser ? 'current-user' : ''}`;
        
        let medal = '';
        if (rank === 1) medal = '🥇';
        else if (rank === 2) medal = '🥈';
        else if (rank === 3) medal = '🥉';
        
        row.innerHTML = `
            <div class="rank">${medal || rank}</div>
            <div class="player-name">${entry.pseudo} ${isCurrentUser ? '(Vous)' : ''}</div>
            <div class="player-score">${entry.score} pts</div>
        `;
        
        container.appendChild(row);
    });
}

function getOrdinalSuffix(num) {
    if (num === 1) return 'er';
    return 'ème';
}

// ==============================================
// INITIALISATION
// ==============================================
document.addEventListener('DOMContentLoaded', function() {
    initAuth();
    
    document.getElementById('logoutBtn').addEventListener('click', logout);
    document.getElementById('validateBtn').addEventListener('click', validateChapter);
    
    // Fermer les modales en cliquant en dehors
    window.onclick = function(event) {
        if (event.target.classList.contains('modal')) {
            event.target.style.display = 'none';
        }
    };
});
