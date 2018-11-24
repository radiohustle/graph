const _extenders = require('./_extenders.js')

class Core {
    constructor() {
        _extenders.String.run()
    }

    static sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms))
    }
}

module.exports = Core