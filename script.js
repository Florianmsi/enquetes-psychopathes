// Configuration
const CHAPTERS = {
    1: { max: 10, values: [0, 10] },
    2: { max: 15, values: [0, 15] },
    3: { max: 15, values: [0, 5, 10, 15] },
    4: { max: 5, values: [0, 5] },
    5: { max: 10, values: [0, 3, 7, 10] },
    6: { max: 25, values: [0, 12, 25] },
    7: { max: 20, values: [0, 10, 20] }
};

const BONUS_QUESTIONS = [
    { id: 1, q: "Parmi ces symptômes, lequel fait partie des \"symptômes négatifs\" de la schizophrénie ?", opts: ["L'émoussement affectif et l'avolition (perte de motivation)", "Le sentiment de communiquer avec des personnes réelles, mais absentes.", "Les hallucinations visuelles."], correct: 0 },
    { id: 2, q: "TOC - Une personne atteinte de TOC se caractérise principalement par :", opts: ["Des obsessions et des compulsions répétitives", "Des troubles de l'attention.", "Une tendance à mentir de façon compulsive"], correct: 0 },
    { id: 3, q: "TSPT - Quel symptôme N'est PAS typique du TSPT ?", opts: ["Des points communs avec la dépression.", "Des idées délirantes de persécution", "Les reviviscences (flashbacks) de l'événement traumatique"], correct: 1 },
    { id: 4, q: "Dépression - Qu'est-ce qui ne caractérise PAS nécessairement une dépression clinique ?", opts: ["Une tristesse profonde et durable avec perte d'intérêt", "Se sentir faible émotionnellement.", "Faire de chaque échange un conflit avec autrui."], correct: 2 },
    { id: 5, q: "Quel neurotransmetteur est souvent impliqué dans les troubles du comportement alimentaire comme la boulimie ?", opts: ["La sérotonine", "La dopamine", "L'insuline"], correct: 0 },
    { id: 6, q: "Un mythomane se définit par :", opts: ["Le besoin pathologique de mentir de façon excessive", "Modifier la réalité dans l'unique but de manipuler.", "Ne pas avoir de limites pour parvenir à son objectif."], correct: 0 },
    { id: 7, q: "La paranoïa peut accompagner plusieurs autres troubles, mais lequel n'en fait quasiment pas partie ?", opts: ["Dépression majeure", "TSPT", "Mythomanie"], correct: 2 },
    { id: 8, q: "Psychopathie - La psychopathie se caractérise principalement par :", opts: ["Un manque d'empathie et de remords", "Une agressivité soudaine.", "Une grande anxiété sociale"], correct: 0 },
    { id: 9, q: "Parmi ces troubles, lequel n'est pas abordé dans ce livre ?", opts: ["La dépression.", "La bipolarité.", "La boulimie."], correct: 1 },
    { id: 10, q: "Trouble de la personnalité paranoïaque - Quel est le pourcentage de notre population qui en souffre réellement ?", opts: ["0,1 à 0,4 %", "0,5 à 2,5 %", "2,6 à 3 %"], correct: 1 }
];

// Variables globales
let currentUser = null;
let currentChapter = null;
let selectedScore = null;

// ============ BASE DE DONNÉES ============
function getAllUsers() {
    return JSON.parse(localStorage.getItem('users') || '{}');
}

function saveAllUsers(users) {
    localStorage.setItem('users', JSON.stringify(users));
}

function getUser(pseudo) {
    const users = getAllUsers();
    return users[pseudo] || null;
}

function createUser(pseudo) {
    const users = getAllUsers();
    users[pseudo] = { pseudo, chapters: {}, bonus: {} };
    saveAllUsers(users);
    return users[pseudo];
}

function saveScore(pseudo, chapter, score) {
    const users = getAllUsers();
    if (users[pseudo]) {
        // S'assurer que le score est bien un nombre
        users[pseudo].chapters[String(chapter)] = Number(score);
        saveAllUsers(users);
    }
}

function saveBonusAnswer(pseudo, questionId, answer) {
    const users = getAllUsers();
    if (users[pseudo]) {
        users[pseudo].bonus[questionId] = answer;
        saveAllUsers(users);
    }
}

// ============ AUTHENTIFICATION ============
document.addEventListener('DOMContentLoaded', function() {
    const input = document.getElementById('pseudoInput');
    const btn = document.getElementById('loginBtn');
    const warning = document.getElementById('newUserWarning');
    const status = document.getElementById('pseudoStatus');
    
    input.addEventListener('input', function() {
        const pseudo = this.value.trim();
        if (pseudo.length < 3) {
            btn.disabled = true;
            status.textContent = '';
            warning.style.display = 'none';
            return;
        }
        
        const exists = getUser(pseudo) !== null;
        if (exists) {
            status.textContent = '✓ Compte existant';
            status.style.color = '#27ae60';
            warning.style.display = 'none';
            btn.textContent = '🔓 ACCÉDER AUX ENQUÊTES';
        } else {
            status.textContent = '✨ Nouveau pseudo';
            status.style.color = '#f4d03f';
            warning.style.display = 'flex';
            btn.textContent = '📝 CRÉER MON COMPTE';
        }
        btn.disabled = false;
    });
    
    btn.addEventListener('click', login);
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !btn.disabled) login();
    });
    
    document.getElementById('logoutBtn').addEventListener('click', logout);
});

function login() {
    const pseudo = document.getElementById('pseudoInput').value.trim();
    if (pseudo.length < 3) {
        alert('Le pseudo doit contenir au moins 3 caractères');
        return;
    }
    
    currentUser = getUser(pseudo) || createUser(pseudo);
    
    document.getElementById('loginScreen').classList.remove('active');
    document.getElementById('gameScreen').classList.add('active');
    document.getElementById('currentUser').textContent = pseudo;
    
    loadUserData();
}

function logout() {
    currentUser = null;
    document.getElementById('gameScreen').classList.remove('active');
    document.getElementById('loginScreen').classList.add('active');
    document.getElementById('pseudoInput').value = '';
    document.getElementById('loginBtn').disabled = true;
}

// ============ CHARGEMENT DONNÉES ============
function loadUserData() {
    debugLog('📊 loadUserData démarrée');
    const user = getUser(currentUser.pseudo);
    debugLog('User récupéré: ' + JSON.stringify(user.chapters));
    let total = 0;
    
    // Chapitres 1-7
    for (let i = 1; i <= 7; i++) {
        // Convertir la clé en string pour la compatibilité
        const score = user.chapters[String(i)];
        const el = document.getElementById('score' + i);
        const chItem = document.getElementById('ch' + i);
        
        debugLog('--- Chapitre ' + i + ' ---');
        debugLog('Score: ' + (score !== undefined && score !== null ? score : 'aucun'));
        debugLog('Element trouvé: ' + (el ? 'OUI' : 'NON'));
        
        // Vérifier si le score existe ET n'est pas null
        if (score !== undefined && score !== null) {
            const text = score + '/' + CHAPTERS[i].max;
            debugLog('📝 Tentative affichage: "' + text + '"');
            
            if (el) {
                el.textContent = text;
                el.style.color = '#27ae60';
                debugLog('✅ Score ' + i + ' AFFICHÉ avec succès');
            } else {
                debugLog('❌ ERREUR: Element score' + i + ' INTROUVABLE !');
            }
            
            total += Number(score);
            
            // Badge parfait
            if (Number(score) === CHAPTERS[i].max) {
                debugLog('🏆 Badge parfait pour chapitre ' + i);
                if (chItem) {
                    chItem.classList.add('perfect');
                    if (!chItem.querySelector('.badge-perfect')) {
                        const badge = document.createElement('div');
                        badge.className = 'badge-perfect';
                        badge.textContent = '🏆 PARFAIT';
                        chItem.appendChild(badge);
                        debugLog('✅ Badge ajouté');
                    }
                }
            }
        } else {
            if (el) {
                el.textContent = '-';
                el.style.color = '';
            }
            if (chItem) {
                chItem.classList.remove('perfect');
                const badge = chItem.querySelector('.badge-perfect');
                if (badge) badge.remove();
            }
        }
    }
    
    // Bonus
    let bonusScore = 0;
    BONUS_QUESTIONS.forEach(q => {
        if (user.bonus[q.id] === q.correct) bonusScore++;
    });
    
    const bonusEl = document.getElementById('scoreBonus');
    if (bonusScore > 0) {
        bonusEl.textContent = bonusScore + '/10';
        bonusEl.style.color = '#27ae60';
        total += bonusScore;
    } else {
        bonusEl.textContent = '-';
        bonusEl.style.color = '';
    }
    
    debugLog('💯 Score total calculé: ' + total);
    document.getElementById('playerScore').textContent = total;
    
    // Vérifier déblocage bonus
    debugLog('🔓 Vérification déblocage bonus...');
    checkBonusUnlock();
    
    debugLog('✅ loadUserData terminée');
}

function checkBonusUnlock() {
    const user = getUser(currentUser.pseudo);
    let completed = 0;
    
    for (let i = 1; i <= 7; i++) {
        if (user.chapters[String(i)] !== undefined && user.chapters[String(i)] !== null) {
            completed++;
        }
    }
    
    debugLog('Chapitres complétés: ' + completed + '/7');
    
    const bonusItem = document.getElementById('chBonus');
    const bonusBtn = document.getElementById('btnBonus');
    
    if (completed === 7) {
        debugLog('🎉 BONUS DÉBLOQUÉ !');
        bonusItem.classList.remove('locked');
        bonusBtn.disabled = false;
    } else {
        debugLog('🔒 Bonus verrouillé (il manque ' + (7-completed) + ' chapitres)');
        bonusItem.classList.add('locked');
        bonusBtn.disabled = true;
    }
}

// ============ CHAPITRES ============
function openChapter(num) {
    currentChapter = num;
    selectedScore = null;
    
    document.getElementById('modalTitle').textContent = 'Chapitre ' + num;
    
    const user = getUser(currentUser.pseudo);
    const currentScore = user.chapters[String(num)];
    
    const container = document.getElementById('scoreOptions');
    container.innerHTML = '';
    
    CHAPTERS[num].values.forEach(val => {
        const btn = document.createElement('button');
        btn.className = 'score-btn';
        btn.textContent = val + '/' + CHAPTERS[num].max + ' points';
        btn.onclick = () => selectScore(val, btn);
        
        if (val === currentScore) {
            btn.classList.add('current');
        }
        
        container.appendChild(btn);
    });
    
    document.getElementById('modalChapter').style.display = 'block';
}

function selectScore(score, event) {
    selectedScore = score;
    document.querySelectorAll('.score-btn').forEach(b => b.classList.remove('selected'));
    event.classList.add('selected');
    document.getElementById('btnValidate').disabled = false;
}

// Debug visible sur la page
function debugLog(message) {
    let debugBox = document.getElementById('debugBox');
    if (!debugBox) {
        debugBox = document.createElement('div');
        debugBox.id = 'debugBox';
        debugBox.style.cssText = 'position:fixed;top:10px;right:10px;background:black;color:lime;padding:20px;max-width:400px;max-height:80vh;overflow-y:auto;z-index:9999;border:3px solid lime;font-size:12px;';
        document.body.appendChild(debugBox);
    }
    const time = new Date().toLocaleTimeString();
    debugBox.innerHTML += `<div>[${time}] ${message}</div>`;
    debugBox.scrollTop = debugBox.scrollHeight;
}

function validateScore() {
    debugLog('🔵 validateScore appelée');
    debugLog('selectedScore = ' + selectedScore);
    debugLog('currentChapter = ' + currentChapter);
    
    if (selectedScore === null) {
        debugLog('❌ ERREUR: selectedScore est null');
        return;
    }
    
    debugLog('💾 Sauvegarde du score...');
    saveScore(currentUser.pseudo, currentChapter, selectedScore);
    
    // Vérifier que ça a bien été sauvegardé
    const user = getUser(currentUser.pseudo);
    debugLog('✅ Score sauvegardé: ' + JSON.stringify(user.chapters));
    
    closeModal();
    
    // Animation score parfait
    const maxScore = CHAPTERS[currentChapter].max;
    debugLog('Score max: ' + maxScore + ', Score validé: ' + selectedScore);
    
    if (selectedScore === maxScore) {
        debugLog('🏆 SCORE PARFAIT DÉTECTÉ ! Lancement animation...');
        showPerfectAnimation(currentChapter);
    } else {
        debugLog('⚪ Score normal (pas parfait)');
    }
    
    debugLog('🔄 Rechargement des données...');
    loadUserData();
    debugLog('✅ validateScore terminée');
}

function showPerfectAnimation(chNum) {
    debugLog('🏆 showPerfectAnimation appelée pour chapitre ' + chNum);
    const item = document.getElementById('ch' + chNum);
    
    if (!item) {
        debugLog('❌ ERREUR: Element ch' + chNum + ' INTROUVABLE !');
        return;
    }
    
    debugLog('✅ Element trouvé, création overlay...');
    
    // Créer overlay
    const overlay = document.createElement('div');
    overlay.className = 'perfect-overlay';
    overlay.innerHTML = '<div class="trophy-big">🏆</div><div class="perfect-text">SCORE PARFAIT !</div>';
    item.appendChild(overlay);
    
    debugLog('🎬 Overlay ajouté ! Animation visible pendant 3 secondes');
    
    setTimeout(() => {
        overlay.classList.add('fade-out');
        setTimeout(() => {
            overlay.remove();
            debugLog('✅ Animation terminée');
        }, 500);
    }, 3000);
}

function closeModal() {
    document.getElementById('modalChapter').style.display = 'none';
    currentChapter = null;
    selectedScore = null;
}

// ============ BONUS ============
function openBonus() {
    const user = getUser(currentUser.pseudo);
    const container = document.getElementById('questionsContainer');
    container.innerHTML = '';
    
    let score = 0;
    BONUS_QUESTIONS.forEach(q => {
        if (user.bonus[q.id] === q.correct) score++;
        
        const div = document.createElement('div');
        div.className = 'question-block';
        
        const answered = user.bonus[q.id] !== undefined;
        const correct = user.bonus[q.id] === q.correct;
        
        let html = '<h4>Question ' + q.id + ' ' + (answered && correct ? '🏆' : '') + '</h4>';
        html += '<p>' + q.q + '</p>';
        
        q.opts.forEach((opt, idx) => {
            const selected = user.bonus[q.id] === idx;
            const letter = String.fromCharCode(65 + idx);
            html += '<label class="opt-label' + (selected ? ' selected' : '') + '">';
            html += '<input type="radio" name="q' + q.id + '" value="' + idx + '" ';
            html += (selected ? 'checked ' : '') + (answered ? 'disabled ' : '');
            html += 'onchange="answerQuestion(' + q.id + ',' + idx + ')">';
            html += letter + ') ' + opt + '</label>';
        });
        
        if (answered) {
            html += '<div class="feedback ' + (correct ? 'correct' : 'incorrect') + '">';
            html += (correct ? '✓ Bonne réponse' : '✗ Mauvaise réponse') + '</div>';
        }
        
        div.innerHTML = html;
        container.appendChild(div);
    });
    
    document.getElementById('bonusScore').textContent = score;
    document.getElementById('modalBonus').style.display = 'block';
    
    // Auto-redirect si terminé
    if (Object.keys(user.bonus).length === 10) {
        setTimeout(() => {
            closeBonusModal();
            showTab('classement');
        }, 2000);
    }
}

function answerQuestion(qId, answer) {
    const user = getUser(currentUser.pseudo);
    if (user.bonus[qId] !== undefined) return;
    
    saveBonusAnswer(currentUser.pseudo, qId, answer);
    openBonus();
    loadUserData();
}

function closeBonusModal() {
    document.getElementById('modalBonus').style.display = 'none';
}

// ============ ONGLETS ============
function showTab(name) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    
    if (name === 'chapitres') {
        document.getElementById('tabChapitres').classList.add('active');
        document.querySelectorAll('.nav-btn')[0].classList.add('active');
    } else {
        document.getElementById('tabClassement').classList.add('active');
        document.querySelectorAll('.nav-btn')[1].classList.add('active');
        updateLeaderboard();
    }
}

// ============ CLASSEMENT ============
function updateLeaderboard() {
    const users = getAllUsers();
    const rankings = [];
    
    Object.values(users).forEach(u => {
        let total = 0;
        Object.values(u.chapters).forEach(s => total += Number(s));
        BONUS_QUESTIONS.forEach(q => {
            if (u.bonus[q.id] === q.correct) total++;
        });
        rankings.push({ pseudo: u.pseudo, score: total });
    });
    
    rankings.sort((a, b) => b.score - a.score);
    
    const container = document.getElementById('leaderboard');
    container.innerHTML = '';
    
    rankings.slice(0, 10).forEach((r, i) => {
        const div = document.createElement('div');
        div.className = 'rank-row' + (r.pseudo === currentUser.pseudo ? ' highlight' : '');
        
        let medal = '';
        if (i === 0) medal = '🥇';
        else if (i === 1) medal = '🥈';
        else if (i === 2) medal = '🥉';
        
        div.innerHTML = '<span class="rank-num">' + (medal || (i+1)) + '</span>';
        div.innerHTML += '<span class="rank-name">' + r.pseudo + (r.pseudo === currentUser.pseudo ? ' (Vous)' : '') + '</span>';
        div.innerHTML += '<span class="rank-score">' + r.score + ' pts</span>';
        container.appendChild(div);
    });
    
    const myRank = rankings.findIndex(r => r.pseudo === currentUser.pseudo) + 1;
    document.getElementById('yourRank').textContent = myRank > 0 ? myRank + (myRank === 1 ? 'er' : 'ème') : '-';
    document.getElementById('totalPlayers').textContent = rankings.length;
}

// Fermer modales en cliquant dehors
window.onclick = (e) => {
    if (e.target.classList.contains('modal')) {
        e.target.style.display = 'none';
    }
};
