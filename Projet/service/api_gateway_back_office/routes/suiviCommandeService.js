var express = require('express');
var router = express.Router()
const apiAdapter = require('./apiAdapter')

const BASE_URL = process.env.SUIVI_BASE_URL
const api = apiAdapter(BASE_URL)

router.get('/', (req, res) => {
  api.get('/commandes' + req.path).then(resp => {
    res.json(resp.data)
  })
})

module.exports = router