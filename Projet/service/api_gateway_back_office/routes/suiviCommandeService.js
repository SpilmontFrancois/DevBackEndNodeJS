var express = require('express');
var router = express.Router()
const apiAdapter = require('./apiAdapter')

const BASE_URL = 'http://api_suivi_commandes:3001'
const api = apiAdapter(BASE_URL)

router.get('/', (req, res) => {
  api.get('/commandes' + req.path).then(resp => {
    res.json(resp.data)
  })
})

module.exports = router