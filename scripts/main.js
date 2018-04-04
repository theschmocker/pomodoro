(function main(){
    // Get DOM nodes
    const timerSettings = Array.from(document.getElementsByClassName('time-setting'));

    // add event listeners
    timerSettings.forEach(el => {
        el.addEventListener('click', function(e) {console.log(e.target, this)});
    });
})()
