var express = require('express');
var router = express.Router()
var suiviCommandeService = require('./suiviCommandeService')

router.use((req, res, next) => {
    console.log("Called: ", req.path)
    next()
})

router.use(suiviCommandeService)

module.exports = router