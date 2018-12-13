const Collection = require('./Collection.js')

class Queue extends Collection {
    push(element) {
        this._data.push(element)
    }

    pop() {
        return this._data.shift()
    }
}

module.exports = Queue