const express = require('express')
const router = express.Router()

const response = require('../utils/response')

/* GET home page. */
router.route('/')
  .copy(response.methodNotAllowed)
  .delete(response.methodNotAllowed)
  .patch(response.methodNotAllowed)
  .post(response.methodNotAllowed)
  .put(response.methodNotAllowed)
  .get(function (req, res, next) {
    res.json({ "api_home": "Welcome to the API !" })
  })

router.route('*')
  .copy(response.methodNotAllowed)
  .delete(response.methodNotAllowed)
  .patch(response.methodNotAllowed)
  .post(response.methodNotAllowed)
  .put(response.methodNotAllowed)
  .get(function (req, res, next) {
    res.status(400).json({
      type: "error",
      error: 400,
      message: "requete mal formee : " + req.url
    })
  })

module.exports = router
