class Stack {
    constructor() {
        this._data = []
    }

    isEmpty() {
        return this._data.length === 0
    }

    size() {
        return this._data.length
    }

    push(element) {
        this._data.push(element)
    }

    pop() {
        return this._data.pop()
    }

    toString() {
        return this._data.join()
    }
}

module.exports = Stack