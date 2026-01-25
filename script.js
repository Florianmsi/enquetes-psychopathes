// Questions du questionnaire BONUS
const bonusQuestions = [
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

// Variables globales
let currentDossier = null;
let scores = {
    dossier1: 0,
    dossier2: 0,
    dossier3: 0,
    dossier4: 0,
    dossier5: 0,
    dossier6: 0,
    dossier7: 0,
    bonus: 0
};

let bonusAnswers = {};

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', function() {
    loadScores();
    loadBonusProgress();
    updateTotalScore();
    checkBonusUnlock();
});

// Sauvegarder les scores dans localStorage
function saveScores() {
    localStorage.setItem('enqueteurScores', JSON.stringify(scores));
    updateTotalScore();
    checkBonusUnlock();
}

// Charger les scores depuis localStorage
function loadScores() {
    const saved = localStorage.getItem('enqueteurScores');
    if (saved) {
        scores = JSON.parse(saved);
        updateScoreDisplay();
    }
}

// Sauvegarder la progression du bonus
function saveBonusProgress() {
    localStorage.setItem('bonusAnswers', JSON.stringify(bonusAnswers));
}

// Charger la progression du bonus
function loadBonusProgress() {
    const saved = localStorage.getItem('bonusAnswers');
    if (saved) {
        bonusAnswers = JSON.parse(saved);
        calculateBonusScore();
    }
}

// Mettre à jour l'affichage des scores
function updateScoreDisplay() {
    for (let i = 1; i <= 7; i++) {
        document.getElementById(`score${i}`).textContent = scores[`dossier${i}`];
    }
    document.getElementById('scoreBonus').textContent = scores.bonus;
}

// Calculer et afficher le score total
function updateTotalScore() {
    let total = 0;
    for (let i = 1; i <= 7; i++) {
        total += scores[`dossier${i}`];
    }
    total += scores.bonus;
    document.getElementById('totalScore').textContent = total;
}

// Vérifier si tous les dossiers sont complétés pour débloquer le bonus
function checkBonusUnlock() {
    let allCompleted = true;
    for (let i = 1; i <= 7; i++) {
        if (scores[`dossier${i}`] === 0) {
            allCompleted = false;
            break;
        }
    }
    
    const bonusButton = document.getElementById('bonusButton');
    const bonusCard = document.getElementById('bonusCard');
    
    if (allCompleted) {
        bonusButton.disabled = false;
        bonusCard.classList.add('unlocked');
        bonusCard.classList.remove('locked');
    } else {
        bonusButton.disabled = true;
        bonusCard.classList.add('locked');
        bonusCard.classList.remove('unlocked');
    }
}

// Ouvrir un dossier
function openDossier(dossierNum) {
    if (dossierNum === 3) {
        openModal('dossier3Modal');
        document.getElementById('currentDossier3Points').textContent = scores.dossier3;
    } else {
        currentDossier = dossierNum;
        document.getElementById('modalTitle').textContent = `Dossier ${dossierNum}`;
        document.getElementById('dossierPoints').value = scores[`dossier${dossierNum}`];
        openModal('dossierModal');
    }
}

// Définir les points pour le dossier 3
function setDossier3Points(points) {
    scores.dossier3 = points;
    document.getElementById('currentDossier3Points').textContent = points;
    document.getElementById('score3').textContent = points;
    saveScores();
}

// Sauvegarder les points d'un dossier générique
function saveDossierPoints() {
    if (currentDossier) {
        const points = parseInt(document.getElementById('dossierPoints').value);
        if (points >= 0 && points <= 15) {
            scores[`dossier${currentDossier}`] = points;
            saveScores();
            updateScoreDisplay();
            closeModal('dossierModal');
        } else {
            alert('Veuillez entrer un nombre entre 0 et 15');
        }
    }
}

// Ouvrir le questionnaire BONUS
function openBonus() {
    renderBonusQuestions();
    openModal('bonusModal');
}

// Générer les questions du bonus
function renderBonusQuestions() {
    const container = document.getElementById('questionsContainer');
    container.innerHTML = '';
    
    bonusQuestions.forEach((q, index) => {
        const questionDiv = document.createElement('div');
        questionDiv.className = 'question-block';
        questionDiv.id = `question${q.id}`;
        
        const isAnswered = bonusAnswers[q.id] !== undefined;
        const userAnswer = bonusAnswers[q.id];
        const isCorrect = userAnswer === q.correct;
        
        let questionHTML = `
            <div class="question-header">
                <h4>Question ${q.id}</h4>
                ${isAnswered && isCorrect ? '<span class="trophy">🏆</span>' : ''}
            </div>
            <p class="question-text">${q.question}</p>
            <div class="options">
        `;
        
        q.options.forEach((option, optIndex) => {
            const optionLetter = String.fromCharCode(65 + optIndex); // A, B, C
            const isSelected = userAnswer === optIndex;
            const disabledAttr = isAnswered ? 'disabled' : '';
            const selectedClass = isSelected ? 'selected' : '';
            
            questionHTML += `
                <label class="option-label ${selectedClass} ${isAnswered ? 'answered' : ''}">
                    <input type="radio" 
                           name="question${q.id}" 
                           value="${optIndex}" 
                           ${isSelected ? 'checked' : ''} 
                           ${disabledAttr}
                           onchange="answerQuestion(${q.id}, ${optIndex})">
                    <span class="option-text">${optionLetter}) ${option}</span>
                </label>
            `;
        });
        
        questionHTML += `
            </div>
            ${isAnswered ? `<p class="answer-status ${isCorrect ? 'correct' : 'incorrect'}">${isCorrect ? '✓ Bonne réponse !' : '✗ Mauvaise réponse'}</p>` : ''}
        `;
        
        questionDiv.innerHTML = questionHTML;
        container.appendChild(questionDiv);
    });
    
    updateBonusScoreDisplay();
}

// Répondre à une question
function answerQuestion(questionId, answerIndex) {
    if (bonusAnswers[questionId] === undefined) {
        bonusAnswers[questionId] = answerIndex;
        saveBonusProgress();
        calculateBonusScore();
        renderBonusQuestions();
    }
}

// Calculer le score du bonus
function calculateBonusScore() {
    let correctCount = 0;
    bonusQuestions.forEach(q => {
        if (bonusAnswers[q.id] === q.correct) {
            correctCount++;
        }
    });
    scores.bonus = correctCount;
    saveScores();
    updateScoreDisplay();
}

// Mettre à jour l'affichage du score bonus
function updateBonusScoreDisplay() {
    const answeredCount = Object.keys(bonusAnswers).length;
    document.getElementById('bonusCurrentScore').textContent = `${scores.bonus} (${answeredCount}/10 réponses)`;
}

// Gestion des modales
function openModal(modalId) {
    document.getElementById(modalId).style.display = 'block';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Fermer la modale en cliquant en dehors
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
    }
}

// Reset (pour debug/test - à retirer en production si nécessaire)
function resetAll() {
    if (confirm('Êtes-vous sûr de vouloir réinitialiser tous les scores ?')) {
        localStorage.clear();
        scores = {
            dossier1: 0,
            dossier2: 0,
            dossier3: 0,
            dossier4: 0,
            dossier5: 0,
            dossier6: 0,
            dossier7: 0,
            bonus: 0
        };
        bonusAnswers = {};
        updateScoreDisplay();
        updateTotalScore();
        checkBonusUnlock();
        location.reload();
    }
}
