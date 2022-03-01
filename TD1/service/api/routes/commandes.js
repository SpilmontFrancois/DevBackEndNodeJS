var express = require('express')
var router = express.Router()

const db = require('../db')

const uuidv4 = require('uuid').v4

const jwt = require('jsonwebtoken');

const Joi = require('joi');

router.route('/')
  .copy(methodNotAllowed)
  .delete(methodNotAllowed)
  .patch(methodNotAllowed)
  .post(function (req, res, next) {
    const schema = Joi.object().keys({
      livraison: Joi.object().keys({
        date: Joi.date().greater('now').required(),
        heure: Joi.string().required(),
      }),
      nom: Joi.string().required(),
      mail: Joi.string().email().required(),
      items: Joi.array().items(Joi.object().keys({
        libelle: Joi.string().required(),
        uri: Joi.string().required(),
        quantite: Joi.number().required(),
        tarif: Joi.number().required(),
      }))
    })

    try {
      Joi.assert(req.body, schema)
    } catch (error) {
      return res.status(422).json({
        type: "error",
        error: 422,
        message: "wrong inputs"
      })
    }

    const livraison = req.body.livraison.date + " " + req.body.livraison.heure
    const uuid = uuidv4()
    const token = jwt.sign({ foo: 'bar' }, process.env.PRIVATEKEY);
    let total = 0
    let items = req.body.items
    items.forEach(item => {
      total += item.tarif * item.quantite
    })

    db.query('INSERT INTO commande (id, nom, mail, livraison, montant, token, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [uuid, req.body.nom, req.body.mail, livraison, total, token, new Date(), new Date()], function (err, result) {
      if (err) {
        res.status(500).json({
          type: "error",
          error: 500,
          message: "erreur lors de la creation de la commande"
        })
      } else {
        items.forEach(item => {
          db.query('INSERT INTO item (libelle, uri, quantite, tarif, command_id) VALUES (?, ?, ?, ?, ?)', [item.libelle, item.uri, item.quantite, item.tarif, uuid], function (err, results) {
            if (err) {
              res.status(500).json({
                type: "error",
                error: 500,
                message: "erreur lors de la creation des items de la commande"
              })
            }
          })
        })

        res.status(201).json({
          "commande": {
            "id": uuid,
            "nom": req.body.nom,
            "mail": req.body.mail,
            "livraison": livraison,
            "montant": total,
            "token": token,
          }
        })
      }
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
    // Bon on a pas les items dans la requete ça marche pas
    let toReturn = {}
    if (req.query.token || req.headers.x_lbs_token) {
      db.query('SELECT * FROM commande WHERE id = ? AND token = ?', [req.params.id, req.query.token || req.headers.x_lbs_token], (err, results) => {
        if (err) {
          res.status(500).json({
            type: "error",
            error: 500,
            message: "une erreur est survenue : " + err.message
          })
        } else {
          if (results.length === 0) {
            res.status(404).json({
              type: "error",
              error: 404,
              message: "ressource non disponible : /commandes/" + req.params.id
            })
          } else {
            toReturn = results[0]
            let items = []
            if (req.query.embed === 'items') {
              db.query('SELECT * FROM item WHERE command_id=?', [req.params.id], (error, resu) => {
                if (error)
                  res.status(500).json({
                    type: "error",
                    error: 500,
                    message: "une erreur est survenue :" + error.message
                  })
                else {
                  if (resu.length === 0) {
                    res.status(404).json({
                      type: "error",
                      error: 404,
                      message: "ressource non disponible : /commandes/" + req.params.id + "/items"
                    })
                  }
                  else {
                    items = resu
                  }
                }
              })
              toReturn.items = items
            }

            toReturn.links = {
              self: {
                href: "/commandes/" + toReturn.id
              },
              items: {
                href: "/commandes/" + toReturn.id + "/items"
              }
            }

            res.json(toReturn)
          }
        }
      })
    } else
      res.status(403).json({
        type: "error",
        error: 403,
        message: "vous n'êtes pas authorisé à accéder à cette commande"
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
