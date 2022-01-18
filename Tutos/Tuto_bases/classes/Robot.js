const { v4: uuidv4 } = require('uuid')

class Robot {
    constructor(color) {
        this.ref = uuidv4()
        this.color = color
    }

    whoAmI() {
        return `I am ${this.ref} and I am ${this.color}`
    }
}

module.exports = Robot