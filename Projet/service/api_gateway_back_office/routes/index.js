var express = require('express');
var router = express.Router()
var commandeService = require('./commandeService')

router.use((req, res, next) => {
    console.log("Called: ", req.path)
    next()
})

router.use(commandeService)

module.exports = router