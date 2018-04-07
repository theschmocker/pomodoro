// Get DOM nodes
const timerSettings = Array.from(document.getElementsByClassName('time-setting'));

const timerStartStop = document.querySelector('.timer');
const resetButton = document.getElementById('reset');

const sessionLengthElement = document.getElementById('session-length');
const breakLengthElement = document.getElementById('break-length');

// Application State

function Timer() {
    this.sessionDuration;
    this.breakDuration;
    let currentTimer = new Pomodoro(this);
    this.setSessionDuration = (time) => {
        this.sessionDuration = time;
        currentTimer = new Pomodoro(this);
        this.updateDisplay();
    };

    this.setBreakDuration = (time) => {
        this.breakDuration = time;
    };
    this.isRunning = () => currentTimer.isRunning;

    this.changeTimer = (nextTimer, shouldStart=true) => {
        currentTimer = nextTimer;
        document.getElementById('timer-label').innerText = nextTimer.type;
        if (shouldStart) nextTimer.start();
        else this.updateDisplay();
    };

    this.updateDisplay = () => {
        const countdown = document.getElementById('countdown');
        countdown.innerText = currentTimer.time;
    };

    this.start = () => {
        if (!this.isRunning()) currentTimer.start()
    }

    this.stop = () => currentTimer.stop();

    this.reset = () => {
        if (!currentTimer.isRunning) {
            this.changeTimer(new Pomodoro(this), false);
        }
    }
}

function Pomodoro(timer) {
    this.timer = timer;
    this.type = 'Pomodoro';
    this.isRunning = false;
    // used for timerLoop
    this.currentTime = timer.sessionDuration * 60;
    //default display value
    this.time = formatTime(this.currentTime);

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
        if (this.currentTime === 0) timer.changeTimer(new Break(timer));
    };
}

function Break(timer) {
    this.timer = timer;
    this.type = 'Break';
    this.isRunning = false;
    // used for timerLoop
    this.currentTime = timer.breakDuration * 60;
    //default display value
    this.time = formatTime(this.currentTime);

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
        if (this.currentTime === 0) timer.changeTimer(new Pomodoro(timer));
    };
}


function updateSessionLengthDisplay(minutes) {
    const display = document.getElementById('session-length');
    display.innerText = minutes;
}

function updateBreakLengthDisplay(minutes) {
    const display = document.getElementById('break-length');
    display.innerText = minutes;
}


// Event Handlers
function settingsChange(e) {
    if (e.target.nodeName === 'BUTTON' && !AppTimer.isRunning()) {
        switch (this.id) {
            case 'session-setting':
                updateSetting(sessionLength, e.target.className);
                break;
            case 'break-setting':
                updateSetting(breakLength, e.target.className);
                break;
            default:
                break;
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
    function twoDigit(time) {
        if (String(time).length == 1) time = '0' + time;
        return time;
    }

    const minutes = twoDigit(Math.floor(inSeconds / 60));
    const seconds = twoDigit(inSeconds % 60);

    return `${minutes}:${seconds}`;
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

function updateSetting(observ, action) {
    console.log(action);
    switch (action) {
        case 'increment':
            if (observ() !== 60) observ(observ() + 1);
            break;
        case 'decrement':
            if (observ() !== 1) observ(observ() - 1);
            break;
        default:
            break;
        
    }
}

const sessionLength = observable();
const breakLength = observable();

sessionLength.subscribe(updateSessionLengthDisplay);
breakLength.subscribe(updateBreakLengthDisplay);

const AppTimer = new Timer();

sessionLength.subscribe(AppTimer.setSessionDuration);
sessionLength(25);
breakLength.subscribe(AppTimer.setBreakDuration);
breakLength(5);

// add event listeners
timerSettings.forEach(el => {
    el.addEventListener('click', settingsChange);
});

timerStartStop.addEventListener('click', function() {
    const timerStateElements = Array.from(this.querySelector('#timer-state').children);
    timerStateElements.forEach(el => el.classList.toggle('hidden'));
    (AppTimer.isRunning()) ? AppTimer.stop() : AppTimer.start();
});

resetButton.addEventListener('click', () => AppTimer.reset());
