var express = require('express');
var router = express.Router()
const apiAdapter = require('./apiAdapter')

const BASE_URL = 'http://api_auth:3003'
const api = apiAdapter(BASE_URL)

router.post('/signin', (req, res) => {
  api.post('/auth/signin', req.body).then(resp => {
    res.json(resp.data)
  })
})

router.post('/signup', (req, res) => {
  api.post('/auth/signup', req.body).then(resp => {
    res.json(resp.data)
  })
})

module.exports = router