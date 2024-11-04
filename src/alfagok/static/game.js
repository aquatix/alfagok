/* API calls **/
async function getGameID() {
    let response = await fetch('/api/game');
    let result = await response.json();
    console.log(result);
    if (result.game) {
        return result.game;
    }
}

async function doGuess(guessWord) {
    if (guessWord === '') {
        console.log('Nothing filled in');
        Alpine.store('alfagok').guessError = 'Vul een woord in';
        return;
    }

    if (Alpine.store('alfagok').startTime === '') {
        console.log('Setting startTime to now');
    }

    let response = await fetch('/api/guess/' + guessWord);
    let result = await response.json();
    console.log(result);
    if (result.error) {
        console.log('Error occurred during guess');
        if (result.error === 'Word not in dictionary') {
            Alpine.store('alfagok').guessError = 'Woord komt niet in de woordenlijst voor';
        }
    }
    if (result.hint && result.hint === 'after') {
        console.log('na');
        Alpine.store('alfagok').guessesBefore.push(guessWord);
    }
    if (result.hint && result.hint === 'before') {
        console.log('voor');
        Alpine.store('alfagok').guessesAfter.push(guessWord);
    }
    if (result.hint && result.hint === 'it') {
        console.log('gevonden');
    }

}

/* Time formatting **/

function getFormattedTime(milliseconds) {
    if (!Number.isInteger(milliseconds)) {
        return '';
    }
    let seconds = Math.round((milliseconds) / 1000);
    const hours = Math.floor(seconds / 3600);
    seconds %= 3600;
    const minutes = Math.floor(seconds / 60);
    seconds %= 60;

    const formattedTime = [];
    if (hours) {
        formattedTime.push(`${hours}h`);
    }
    if (minutes) {
        formattedTime.push(`${minutes}m`);
    }
    if (seconds) {
        formattedTime.push(`${seconds}s`);
    }

    return formattedTime.join(' ') || '0s';
}

/* Clipboard stuff **/

var clip = new Clipboard('.copy');

clip.on("success", function(e) {
  document.getElementById('copyresults').innerHTML = '<p style="font-size:var(--small);opacity:50%">Gekopieerd! Deel je resultaat.</p>';
  e.clearSelection();
});

clip.on("error", function() {
  document.getElementById('copyresults').innerHTML = '<p style="font-size:var(--small);opacity:50%">Fout. Graag handmatig kopi&euml;ren...</p>';
});


/* Game timer, original from alphaguess.com **/

function go() {
  window.timerID = window.setInterval(timer, 0);
}

function timer(){
  var nextgame = document.getElementById('nextgame');
  var now = new Date();
  var midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate()+1, 0, 0, 0);
  var diff =  Math.floor((midnight - now)/1000);
  var hoursRemain   = Math.floor(diff/(60*60));
  var minutesRemain = Math.floor((diff-hoursRemain*60*60)/60);
  var secondsRemain = Math.floor(diff%60);
  nextgame.innerHTML   = '<span class="nextgame">'+addZero(hoursRemain)+':'+addZero(minutesRemain)+':'+addZero(secondsRemain)+' over</span>';
}

function addZero(num){
  if(num <=9) return '0'+num;
  else return num;
}

go();
