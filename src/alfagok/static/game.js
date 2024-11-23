document.addEventListener('alpine:init', () => {
    Alpine.store('alfagok', {
        // isLocalStorageAvailable: this.testLocalStorage(),
        isLocalStorageAvailable: false,

        /* Main alfagok application, state etc */
        gameID: 0,
        countingDown: '',

        loading: false,

        winTime: null,
        startTime: null,
        gaveUpTime: null, // not implemented yet

        nrGuesses: 0,
        guessesBefore: [],
        guessesAfter: [],

        guessValue: '',

        guessError: '',

        resultGameID: '',
        resultGuesses: '',
        resultTimeTaken: '',

        async getGameID() {
            /* Get the game number from the backend */
            this.loading = true;
            console.log('Loading gameID...');
            let response = await fetch('/api/game');
            let result = await response.json();
            console.log(result);
            this.loading = false;
            if (result.game) {
                return this.gameID = result.game;
            }
        },

        async doGuess() {
            this.guessError = null;

            /* Normalise on lowercase, and strip whitespace from begin and end, just in case */
            this.guessValue = this.guessValue.toLowerCase().trim();

            if (this.guessValue === '') {
                console.log('Nothing filled in');
                this.guessError = 'Vul een woord in';
                return;
            }
            if (this.guessesBefore.includes(this.guessValue) || this.guessesAfter.includes(this.guessValue)) {
                this.guessError = 'Woord is al gebruikt';
                return;
            }

            if (this.startTime === null) {
                console.log('Setting startTime to now');
                this.startTime = new Date();
            }

            /* Check guess against server */
            this.loading = true;

            let response = await fetch('/api/guess/' + this.guessValue);
            let result = await response.json();
            console.log(result);

            this.loading = false;

            if (result.error) {
                console.log('Error occurred during guess');
                if (result.error === 'Word not in dictionary') {
                    this.guessError = 'Woord komt niet in de woordenlijst voor';
                }
                return;
            }
            this.nrGuesses++;
            if (result.hint && result.hint === 'after') {
                this.guessesBefore.push(this.guessValue);
                this.guessesBefore.sort();
                this.guessValue = '';
            }
            if (result.hint && result.hint === 'before') {
                this.guessesAfter.push(this.guessValue);
                this.guessesAfter.sort();
                this.guessValue = '';
            }
            if (result.hint && result.hint === 'it') {
                console.log('gevonden!');
                this.winTime = new Date();
                this.resultGameID = '🧩 Puzzel #' + this.gameID;
                this.resultGuesses = '🤔 '+ this.nrGuesses + ' gokken';
                this.resultTimeTaken = '⏱️ ' + getFormattedTime(this.winTime - this.startTime);
            }
        },
        setEmptyGameState() {
            this.winTime = null;
            this.startTime = null;

            this.nrGuesses = 0;
            this.guessesBefore = [];
            this.guessesAfter = [];

            this.guessValue = '';

            this.guessError = '';

            this.resultGameID = '';
            this.resultGuesses = '';
            this.resultTimeTaken = '';

            this.getGameID();
        },
        // # Local Storage Persistence
        storeGameState() {
        },
        getStoredGameState() {
            if (!this.isLocalStorageAvailable) return undefined;

            const savedGameJson = localStorage.getItem('saveGame');
            try {
                return savedGameJson && JSON.parse(savedGameJson);
            } catch (e) {
                localStorage.removeItem('saveGame');
            }
            return undefined;
        },
        loadGameState() {
            const savedGame = this.getStoredGameState();

            if (!savedGame || !savedGame.gameID || (savedGame.gameID !== this.gameID)) {
                this.setEmptyGameState();
                return;
            }
            if (!savedGame || !savedGame.startTime) {
                this.setEmptyGameState();
                return;
            }
            const startTime = new Date(savedGame.startTime);
            if (!isPlayDateToday(app.playDate)) {
                this.setEmptyGameState();
                return;
            }
            const savedGameForToday = getDOY(startTime) === getDOY(now());
            if (!savedGameForToday) {
                this.resetSavedGames();
                this.setEmptyGameState();
                return;
            }
            const {
                winTime,
                guessesBefore,
                guessesAfter,
                guessValue,
            } = savedGame;
            const gaveUpTime = null; // to be implemented
            this.startTime = startTime;
            this.winTime = (winTime && new Date(winTime)) || null;
            this.guessesBefore = guessesBefore || [];
            this.guessesAfter = guessesAfter || [];
            if (gaveUpTime || this.winTime) {
                this.guessValue = guessValue;
            }
        },
            resetSavedGames() {
            localStorage.removeItem('saveGame');
        },
        testLocalStorage() {
            // stolen from https://stackoverflow.com/questions/16427636/check-if-localstorage-is-available
            const test = 'test';
            try {
                localStorage.setItem(test, test);
                localStorage.removeItem(test);
                this.isLocalStorageAvailable = true;
            } catch (e) {
                this.isLocalStorageAvailable = false;
            }
            console.log('Local storage is available? ' + this.isLocalStorageAvailable);
        },
        getFormattedTime(milliseconds) {
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
                formattedTime.push(`${hours}u`);
            }
            if (minutes) {
                formattedTime.push(`${minutes}m`);
            }
            if (seconds) {
                formattedTime.push(`${seconds}s`);
            }

            return formattedTime.join(' ') || '0s';
        },
        addZero(num){
            if(num <=9) return '0'+num;
            else return num;
        },
        countDownTimer(){
            let nextgame = document.getElementById('nextgame');
            let now = new Date();
            let midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate()+1, 0, 0, 0);
            let diff =  Math.floor((midnight - now)/1000);
            let hoursRemain   = Math.floor(diff/(60*60));
            let minutesRemain = Math.floor((diff-hoursRemain*60*60)/60);
            let secondsRemain = Math.floor(diff%60);
            nextgame.innerHTML   = '<span class="nextgame">'+addZero(hoursRemain)+':'+addZero(minutesRemain)+':'+addZero(secondsRemain)+' over</span>';
        }
    }),

    Alpine.store('darkMode', {
        /* Different Alpine app, dark mode settings for the game */
        init() {
            this.on = window.matchMedia('(prefers-color-scheme: dark)').matches
        },

        on: false,

        toggle() {
            this.on = ! this.on
        }
    })

});


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
        formattedTime.push(`${hours}u`);
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

let clip = new ClipboardJS('.copy');

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
    let nextgame = document.getElementById('nextgame');
    let now = new Date();
    let midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate()+1, 0, 0, 0);
    let diff =  Math.floor((midnight - now)/1000);
    let hoursRemain   = Math.floor(diff/(60*60));
    let minutesRemain = Math.floor((diff-hoursRemain*60*60)/60);
    let secondsRemain = Math.floor(diff%60);
    nextgame.innerHTML   = '<span class="nextgame">'+addZero(hoursRemain)+':'+addZero(minutesRemain)+':'+addZero(secondsRemain)+' over</span>';
}

function addZero(num){
    if(num <=9) return '0'+num;
    else return num;
}

go();


/* Get current gameID etc **/

document.addEventListener('alpine:initialized', () => {
    /* On AlpineJS completely loaded, do all this */
    Alpine.store('alfagok').getGameID();
    Alpine.store('alfagok').testLocalStorage();
})
