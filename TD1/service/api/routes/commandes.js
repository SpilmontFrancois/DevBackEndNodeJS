var express = require('express')
var router = express.Router()

const db = require('../db')

const uuidv4 = require('uuid').v4

const jwt = require('jsonwebtoken');

router.route('/')
  .copy(methodNotAllowed)
  .delete(methodNotAllowed)
  .patch(methodNotAllowed)
  .post(function (req, res, next) {
    const livraison = req.body.livraison.date + " " + req.body.livraison.heure
    const uuid = uuidv4()
    const token = jwt.sign({ foo: 'bar' }, process.env.PRIVATEKEY);
    db.query('INSERT INTO commande (id, nom, mail, livraison, montant, token, created_at, updated_at) VALUES (?, ?, ?, ?, 0, ?, ?, ?)', [uuid, req.body.nom, req.body.mail, livraison, token, new Date(), new Date()], function (err, result) {
      if (err) {
        console.log(err);
        res.status(500).json({
          type: "error",
          error: 500,
          message: "erreur lors de la creation de la commande"
        })
      } else
        res.status(201).json({
          "commande": {
            "id": uuid,
            "nom": req.body.nom,
            "mail": req.body.mail,
            "livraison": livraison,
            "montant": 0,
            "token": token,
          }
        })
    })
  })
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
          if (req.query.embed === 'items')
            results.forEach((elem) => {
              elem.links = {
                self: {
                  href: "/commandes/" + elem.id
                },
                items: {
                  href: "/commandes/" + elem.id + "/items"
                }
              }
            })
          res.json(results)
        }
      }
    })
  })

router.route('/:id/items')
  .copy(methodNotAllowed)
  .delete(methodNotAllowed)
  .patch(methodNotAllowed)
  .post(methodNotAllowed)
  .put(methodNotAllowed)
  // GET ALL ITEMS OF ONE COMMANDE
  .get(function (req, res, next) {
    db.query('SELECT * FROM item WHERE command_id=?', [req.params.id], (err, results) => {
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
            message: "ressource non disponible : /commandes/" + req.params.id + "/items"
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
