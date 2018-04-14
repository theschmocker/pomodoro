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

export default SettingsStore;
