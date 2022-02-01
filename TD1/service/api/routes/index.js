var express = require('express')
var router = express.Router()

/* GET home page. */
router.route('/')
  .copy(notAllowed)
  .delete(notAllowed)
  .patch(notAllowed)
  .post(notAllowed)
  .put(notAllowed)
  .get(function (req, res, next) {
    res.json({ "api_home": "Welcome to the API !" })
  })

router.route('*')
  .copy(notAllowed)
  .delete(notAllowed)
  .patch(notAllowed)
  .post(notAllowed)
  .put(notAllowed)
  .get(function (req, res, next) {
    res.status(400).json({
      type: "error",
      error: 400,
      message: "requete mal formee : " + req.url
    })
  })

function notAllowed(req, res, next) {
  res.status(405).json({
    type: "error",
    error: 405,
    message: "methode non authorisee : " + req.method + " sur la route : " + req.url
  })
}

module.exports = router
