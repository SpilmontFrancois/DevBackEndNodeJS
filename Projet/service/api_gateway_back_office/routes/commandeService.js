var express = require('express');
var router = express.Router()

router.get('/commandes', (req, res) => {
  res.send(req.path + " called")
})

router.get('/commandes/:id', (req, res) => {
  res.send(req.path + " called")
})

router.post('/commandes', (req, res) => {
  res.send(req.path + " called")
})

module.exports = router