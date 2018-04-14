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

export default observable;
