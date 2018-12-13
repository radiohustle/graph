class Collection {
    constructor() {
        this._data = []
    }

    isEmpty() {
        return this._data.length === 0
    }

    size() {
        return this._data.length
    }

    push() {

    }

    pop() {

    }

    toString() {
        return this._data.join()
    }
}

module.exports = Collection