var express = require('express');
var router = express.Router()

router.route('*')
.get(function (req, res, next) {
  res.status(400).json({
    type: "error",
    error: 400,
    message: "requete mal formee : " + req.url
  })
})

module.exports = router

