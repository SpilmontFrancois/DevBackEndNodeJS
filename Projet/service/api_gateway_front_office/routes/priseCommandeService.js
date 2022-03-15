var express = require('express');
var router = express.Router()
const apiAdapter = require('./apiAdapter')

const BASE_URL = 'http://api_prise_commandes:3000'
const api = apiAdapter(BASE_URL)

router.route('/')
  .get((req, res) => {
    api.get('/commandes' + req.path).then(resp => {
      res.json(resp.data)
    })
  })
  .post((req, res) => {
    api.post('/commandes' + req.path, req.body).then(resp => {
      res.json(resp.data)
    })
  })

router.route('/:id')
  .get((req, res) => {
    let url = '/commandes/' + req.path
    if (req.query.embed)
      if (req.query.token)
        url += '?embed=' + req.query.embed + '&token=' + req.query.token
      else if (req.headers.x_lbs_token)
        url += '?embed=' + req.query.embed + '&token=' + req.headers.x_lbs_token
      else
        url += '?embed=' + req.query.embed
    else if (req.query.token)
      url += '?token=' + req.query.token
    else if (req.headers.x_lbs_token)
      url += '?token=' + req.headers.x_lbs_token

    api.get(url).then(resp => {
      res.json(resp.data)
    })
  })
  .put((req, res) => {
    let url = '/commandes/' + req.path
    if (req.query.token)
      url += '?token=' + req.query.token
    else if (req.headers.x_lbs_token)
      url += '?token=' + req.headear.x_lbs_token

    api.put(url, req.body).then(resp => {
      res.status(204).send()
    })
  })

router.route('/:id/items')
  .get((req, res) => {
    api.get('/commandes' + req.path).then(resp => {
      res.json(resp.data)
    })
  })

module.exports = router