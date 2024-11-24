document.addEventListener('alpine:init', () => {
    Alpine.store('alfagok', {
        /** Main alfagok application, state etc */
        gameID: Alpine.$persist(0).as('gameID'),
        countingDown: '',
        nextGameIn: 0,
        gameFetchedAt: null,

        loading: false,

        winTime: Alpine.$persist(null).as('winTime'),
        startTime: Alpine.$persist(null).as('startTime'),
        gaveUpTime: Alpine.$persist(null).as('gaveUpTime'), // not implemented yet

        nrGuesses: Alpine.$persist(0).as('nrGuesses'),
        guessesBefore: Alpine.$persist([]).as('guessesBefore'),
        guessesAfter: Alpine.$persist([]).as('guessesAfter'),

        guessValue: Alpine.$persist('').as('guessValue'),

        guessError: '',

        resultGameID: Alpine.$persist('').as('resultGameID'),
        resultGuesses: Alpine.$persist('').as('resultGuesses'),
        resultTimeTaken: Alpine.$persist('').as('resultTimeTaken'),

        resultsCopied: false,

        async init() {
            /** Initialise the application after loading */
            await this.getGameID();
            setInterval(() => {
                // Update counter to next game (midnight UTC, fetched from API) every second
                this.countDownTimer();
            }, 1000);
        },
        async getGameID() {
            /** Get the game number from the backend */
            this.loading = true;
            console.log('Loading gameID...');
            let response = await fetch('/api/game');
            let result = await response.json();
            console.log(result);
            this.loading = false;
            if (result.game) {
                if (this.gameID !== result.game) {
                    this.setEmptyGameState();
                }
                this.nextGameIn = result.deadline;
                this.gameFetchedAt = new Date();
                if (this.countingDown === '') {
                    this.countDownTimer();
                }
                return this.gameID = result.game;
            }
        },
        async doGuess() {
            /** Handle the newly entered guess */
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
                let winTimeDate = new Date(this.winTime);
                let startTimeDate = new Date(this.startTime);
                this.resultTimeTaken = '⏱️ ' + this.getFormattedTime(winTimeDate - startTimeDate);
            }
        },
        setEmptyGameState() {
            /** Clean slate for new game */
            this.winTime = null;
            this.startTime = null;
            this.gaveUpTime = null;

            this.nrGuesses = 0;
            this.guessesBefore = [];
            this.guessesAfter = [];

            this.guessValue = '';

            this.guessError = '';

            this.resultGameID = '';
            this.resultGuesses = '';
            this.resultTimeTaken = '';
        },
        getFormattedTime(milliseconds) {
            /** Nicely format time for 'time played' */
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
        // # Countdown timer
        addZero(num){
            /** Pad with 0 if needed */
            if (num <= 9) return '0' + num;
            else return num;
        },
        countDownTimer(){
            /** Update counter to next game (midnight UTC, fetched from API) */
            if (this.gameFetchedAt === null) { return; }
            let now = new Date();
            let gameDataFetched = new Date(this.gameFetchedAt);
            let nextGameStart = gameDataFetched.setSeconds(gameDataFetched.getSeconds() + this.nextGameIn);
            let diff =  Math.floor((nextGameStart - now) / 1000);
            let hoursRemain = Math.floor(diff / (60*60));
            let minutesRemain = Math.floor((diff - hoursRemain*60*60) / 60);
            let secondsRemain = Math.floor(diff % 60);

            this.countingDown = this.addZero(hoursRemain) + ':' + this.addZero(minutesRemain) + ':' + this.addZero(secondsRemain) + ' over';
        }
    })

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

// document.addEventListener('alpine:initialized', () => {
    /* On AlpineJS completely loaded, do all this */
    // Alpine.store('alfagok').getGameID();
// })
