// Get DOM nodes
const timerSettings = Array.from(document.getElementsByClassName('time-setting'));
const timerControls = document.querySelector('.controls');

const sessionLengthElement = document.getElementById('session-length');
const breakLengthElement = document.getElementById('break-length');


// Application State

function Timer() {
    this.sessionDuration;
    let currentTimer = new Pomodoro(this);
    this.setSessionDuration = (time) => {
        this.sessionDuration = time;
        currentTimer = new Pomodoro(this);
        this.updateDisplay();
    };
    this.isRunning = () => currentTimer.isRunning;

    this.changeTimer = (nextTimer, shouldStart=true) => {
        currentTimer = nextTimer;
        if (shouldStart) nextTimer.start();
        else this.updateDisplay();
    };

    this.updateDisplay = () => {
        const countdown = document.getElementById('countdown');
        countdown.innerText = currentTimer.time;
    };

    this.start = () => currentTimer.start();

    this.stop = () => currentTimer.stop();

    this.reset = () => {
        if (!currentTimer.isRunning) {
            this.changeTimer(new Pomodoro(this), false);
        }
    }
}

function Pomodoro(timer) {
    this.timer = timer;
    this.isRunning = false;
    //default display value
    this.time = timer.sessionDuration;
    // used for timerLoop
    this.currentTime = this.time * 60;

    let timerLoop;

    let duration;
    
    this.start = () => {
        this.isRunning = true;
        timerLoop = setInterval(() => {
            if (this.currentTime === 0) {
                this.stop();
                return;
            }
            this.currentTime--;
            this.time = formatTime(this.currentTime);
            this.timer.updateDisplay();

        }, 1000);
    };
    this.stop = () => {
        this.isRunning = false;
        clearInterval(timerLoop);
    };
}


function updateSessionLengthDisplay(minutes) {
    const display = document.getElementById('session-length');
    display.innerText = minutes;
}


// Event Handlers
function settingsChange(e) {
    if (e.target.nodeName === 'BUTTON' && !AppTimer.isRunning()) {
        //const minuteDisplay = this.querySelector('.minute-setting');
        //updateMinuteDisplay(minuteDisplay, e.target.className);
        if (this.id === 'session-setting') {
            switch (e.target.className) {
                case 'increment':
                    sessionLength(sessionLength() + 1);
                    break;
                case 'decrement':
                    sessionLength(sessionLength() - 1);
                    break;
                default:
                    break;
            }
            
        }
    }
}

// Helper Methods
function updateMinuteDisplay(el, action) {
    let minutes = Number(el.innerText);
    switch (action) {
        case 'increment':
            if (minutes !== 60) minutes++;
            break;
        case 'decrement':
            if (minutes !== 1) minutes--;
            break;
        default:
            break;
    }

    el.innerText = minutes;
}

function formatTime(inSeconds) {
    return `${Math.floor(inSeconds / 60)}:${inSeconds % 60}`;
}

function observable(value) {
    let listeners = [];

    function notify(newValue) {
        listeners.forEach(listener => listener(newValue));
    }

    function accessor(newValue) {
        if (arguments.length && newValue !== value) {
            value = newValue;
            notify(newValue);
        }
        return value;
    }
    accessor.subscribe = listener => listeners.push(listener);

    return accessor;
}

const sessionLength = observable();
const breakLength = observable();

sessionLength.subscribe(updateSessionLengthDisplay);

const AppTimer = new Timer();
sessionLength.subscribe(AppTimer.setSessionDuration);
sessionLength(25);

// add event listeners
timerSettings.forEach(el => {
    el.addEventListener('click', settingsChange);
});

timerControls.addEventListener('click', e => {
    
});

