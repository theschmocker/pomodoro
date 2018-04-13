import registerSW from './registerServiceWorker.js';

const alarm = new Audio('static/alarm.mp3');
// Get DOM nodes
const timerSettings = Array.from(document.getElementsByClassName('time-setting'));
const timerStartStop = document.querySelector('.timer');
const resetButton = document.getElementById('reset');
const timerToggleButton = document.getElementById('change-timer');

const sessionLengthElement = document.getElementById('session-length');
const breakLengthElement = document.getElementById('break-length');

// Application State

function Timer() {
    this.sessionDuration;
    this.breakDuration;
    this.currentTimer = new Pomodoro(this);
    this.setSessionDuration = (time) => {
        this.sessionDuration = time;
        this.reset();
    };

    this.setBreakDuration = (time) => {
        this.breakDuration = time;
        this.reset();
    };
    this.isRunning = () => this.currentTimer.isRunning;

    this.changeTimer = (nextTimer, shouldStart=true) => {
        this.currentTimer = nextTimer;
        document.getElementById('timer-label').innerText = nextTimer.type;
        if (shouldStart) nextTimer.start();
        else this.updateDisplay();
    };

    this.updateDisplay = () => {
        const countdown = document.getElementById('countdown');
        countdown.innerText = this.currentTimer.time;
    };

    this.start = () => {
        if (!this.isRunning()) this.currentTimer.start()
    }

    this.stop = () => {
        if (this.currentTimer.currentTime === 0) alarm.play();
        this.currentTimer.stop()
    };

    this.reset = () => {
        if (!this.currentTimer.isRunning) {
            const newTimer = (this.currentTimer.type === 'Pomodoro') ? new Pomodoro(this) : new Break(this);
            this.changeTimer(newTimer, false);
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
                timer.stop();
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
                timer.stop();
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

const SettingsStore = (function() {
    // Set defaults
    if (!localStorage.getItem('sessionLength')) localStorage.setItem('sessionLength', '25');
    if (!localStorage.getItem('breakLength')) localStorage.setItem('breakLength', '5');

    return {
        session: function (newDuration) {
            if (arguments.length) {
                localStorage.setItem('sessionLength', newDuration);
            }
            return Number(localStorage.getItem('sessionLength'));
        },
        break: function (newDuration) {
            if (arguments.length) {
                localStorage.setItem('breakLength', newDuration);
            }
            return Number(localStorage.getItem('breakLength'));
        },
    }
})();

function updateSessionLengthDisplay(minutes) {
    const display = document.getElementById('session-length');
    display.innerText = formatTwoDigit(minutes);
}

function updateBreakLengthDisplay(minutes) {
    const display = document.getElementById('break-length');
    display.innerText = formatTwoDigit(minutes);
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

function timerToggleHandler() {
    if (!AppTimer.isRunning()) {
        const nextTimer = (AppTimer.currentTimer.type === 'Pomodoro') ? new Break(AppTimer) : new Pomodoro(AppTimer);
        AppTimer.changeTimer(nextTimer, false);
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

function formatTwoDigit(time) {
    if (String(time).length == 1) time = '0' + time;
    return time;
}

function formatTime(inSeconds) {
    const minutes = formatTwoDigit(Math.floor(inSeconds / 60));
    const seconds = formatTwoDigit(inSeconds % 60);

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

sessionLength.subscribe(SettingsStore.session);
breakLength.subscribe(SettingsStore.break);

const AppTimer = new Timer();

sessionLength.subscribe(AppTimer.setSessionDuration);
sessionLength(SettingsStore.session());
breakLength.subscribe(AppTimer.setBreakDuration);
breakLength(SettingsStore.break());

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
timerToggleButton.addEventListener('click', timerToggleHandler);

registerSW();
