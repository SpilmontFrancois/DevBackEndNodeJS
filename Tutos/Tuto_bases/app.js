const { sayHello, sum, multiply } = require('./utils/hello')
const Robot = require('./classes/Robot')

sayHello('World')

const total = sum(1, 2)
console.log(total)

const total2 = multiply(2, 3)
console.log(total2)

const bot = new Robot('R2D2', 'blue')
console.log(bot.whoAmI())