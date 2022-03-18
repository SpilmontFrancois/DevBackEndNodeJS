var express = require('express');
var router = express.Router()
require('dotenv').config();
const apiAdapter = require('./apiAdapter')

const BASE_URL = process.env.AUTH_BASE_URL
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