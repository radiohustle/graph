const Collection = require('./Collection.js')

class Stack extends Collection {
    push(element) {
        this._data.push(element)
    }

    pop() {
        return this._data.pop()
    }
}

module.exports = Stack