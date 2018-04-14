import registerSW from './registerServiceWorker.js';
import SettingsStore from './SettingsStore.js';
import observable from './observable.js';
import { formatTime, formatTwoDigit } from './timeFormat.js';
import Timer from './Timer.js';

import './styles.css';

const alarm = new Audio('static/alarm.mp3');
// Get DOM nodes
const timerSettings = Array.from(document.getElementsByClassName('time-setting'));
const timerStartStop = document.querySelector('.timer');
const resetButton = document.getElementById('reset');
const timerToggleButton = document.getElementById('change-timer');

const sessionLengthElement = document.getElementById('session-length');
const breakLengthElement = document.getElementById('break-length');

function updateSessionLengthDisplay(minutes) {
    const display = document.getElementById('session-length');
    display.textContent = formatTwoDigit(minutes);
}

function updateBreakLengthDisplay(minutes) {
    const display = document.getElementById('break-length');
    display.textContent = formatTwoDigit(minutes);
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
    AppTimer.toggleTimer();
}

// Helper Methods
function updateMinuteDisplay(el, action) {
    let minutes = Number(el.textContent);
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

    el.textContent = minutes;
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
