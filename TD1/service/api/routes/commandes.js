var express = require('express')
var router = express.Router()

const db = require('../db')

router.route('/')
  .copy(methodNotAllowed)
  .delete(methodNotAllowed)
  .patch(methodNotAllowed)
  .post(methodNotAllowed)
  .put(methodNotAllowed)
  // GET ALL COMMANDES
  .get(function (req, res, next) {
    db.query('SELECT * FROM commande', (err, results) => {
      if (err)
        res.status(500).json({
          type: "error",
          error: 500,
          message: "une erreur est survenue :" + err.message
        })
      else
        if (results.length === 0) {
          res.status(404).json({
            type: "error",
            error: 404,
            message: "ressource non disponible : /commandes/"
          })
        } else {
          res.json(results)
        }
    })
  })

router.route('/:id')
  .copy(methodNotAllowed)
  .delete(methodNotAllowed)
  .patch(methodNotAllowed)
  .post(methodNotAllowed)
  // EDIT ONE COMMANDE
  .put(function (req, res, next) {
    req.body.updated_at = new Date()
    db.query('UPDATE commande SET ? WHERE id = ?', [req.body, req.params.id], (err, results) => {
      if (err)
        res.status(500).json({
          type: "error",
          error: 500,
          message: "une erreur est survenue : " + err.message
        })
      else if (results.affectedRows === 0)
        res.status(404).json({
          type: "error",
          error: 404,
          message: "la commande " + req.params.id + " n'a pas ete trouvee : "
        })
      else
        res.status(204).json(results)
    })
  })
  // GET ONE COMMANDE
  .get(function (req, res, next) {
    db.query('SELECT * FROM commande WHERE id=?', [req.params.id], (err, results) => {
      if (err)
        res.status(500).json({
          type: "error",
          error: 500,
          message: "une erreur est survenue :" + err.message
        })
      else {
        if (results.length === 0) {
          res.status(404).json({
            type: "error",
            error: 404,
            message: "ressource non disponible : /commandes/" + req.params.id
          })
        } else {
          res.json(results)
        }
      }
    })
  })

function methodNotAllowed(req, res, next) {
  res.status(405).json({
    type: "error",
    error: 405,
    message: "methode non authorisee : " + req.method + " sur la route : /commandes" + req.url
  })
}

module.exports = router;
