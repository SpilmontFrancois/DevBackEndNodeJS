function sayHello(word) {
    console.log(`Hello ${word} !`)
}

function sum(nb1, nb2) {
    return nb1 + nb2
}

const multiply = (nb1, nb2) => { return nb1 * nb2 }

module.exports = {
    sayHello,
    sum,
    multiply
}