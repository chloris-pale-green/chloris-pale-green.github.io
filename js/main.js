//
// Global variables
//

// Whether to play sound
var sound = false;
// Questions imported from JSON
var questions = null;
// Personas imported from JSON
var personas = null;
// Scores for each persona
var personaScores = [];
// The order of questions by array indices
var questionOrder = null;

//
// Functions
//

// Start the personality test.
function start() {
    let d1 = $.getJSON('/json/questions.json', function(data) {
        questions = data;
        questionOrder = generateQuestionOrder(questions.length);
    });
    let d2 = $.getJSON('/json/personas.json', function(data) {
        personas = data;
    });

    $.when(d1, d2).done(function() {
        presentNextQuestion();
    });
}

// Returns an array of randomised indices from 0 to n-1.
function generateQuestionOrder(n) {
    let order = [];
    for (let i = 0; i < n; i++) {
        order.push(i);
    }

    // Randomize
    for (let i = 0; i < 100; i++) {
        let i1 = Math.floor(Math.random() * n);
        let i2 = Math.floor(Math.random() * n);
        let tmp = order[i1];
        order[i1] = order[i2];
        order[i2] = tmp;
    }

    return order;
}

// Presents the referenced question object to the foreground.
// Does not manipulate visibility.
function presentQuestion(q) {
    let fg = $('#foreground');
    fg.html(`
        <div class='question'>
            ${q.question}
        </div>
        <ul class='answers'></ul>
    `);
    
    let answers = $('#foreground .answers');
    q.answers.forEach((a) => answers.append(
        $('<li>')
            .data('persona', a.persona)
            .text(a.text)
            .on('click', onAnswerClicked)
    ));
}

function presentNextQuestion() {
    let i = questionOrder.pop();
    presentQuestion(questions[i]);
}

function presentResults() {
    let fg = $('#foreground');
    fg.html('');

    personaScores.sort();
    for (let persona in personaScores) {
        let score = personaScores[persona];
        fg.append( $('<p>').text(`${persona} => ${score}`) )
        console.debug(`${persona} => ${score}`);
    }
}

//
// Event handlers
//

function onAnswerClicked(target) {
    // Update persona score
    let persona = $(this).data('persona');
    if (persona in personaScores) {
        let score = personaScores[persona];
        personaScores[persona] = score + 1;
    } else {
        personaScores[persona] = 1;
    }

    // Present next question, if it exists
    if (questionOrder.length > 0) {
        presentNextQuestion();
    } else {
        presentResults();
    }
}

//
// Main
//

window.onload = function() {
    // Load the starting slide
    $('#foreground').load('/html/start.html', function() {
        // Register button handlers
        $('#btn-start').on('click', function() {
            sound = true;
            var player = $('#player-beep')[0];
            player.volume = 0.5;
            player.play();
            start();
        });
        $('#btn-start-quiet').on('click', function() {
            sound = false;
            start();
        });
    });
}
