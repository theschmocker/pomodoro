export function formatTwoDigit(time) {
    if (String(time).length == 1) time = '0' + time;
    return time;
}

export function formatTime(inSeconds) {
    const minutes = formatTwoDigit(Math.floor(inSeconds / 60));
    const seconds = formatTwoDigit(inSeconds % 60);

    return `${minutes}:${seconds}`;
}
