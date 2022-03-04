var express = require('express')
var router = express.Router()

const db = require('../knex')

const uuidv4 = require('uuid').v4

const jwt = require('jsonwebtoken');

const Joi = require('joi');

const response = require('../utils/response')

router.route('/')
  .copy(response.methodNotAllowed)
  .delete(response.methodNotAllowed)
  .patch(response.methodNotAllowed)
  .post(response.methodNotAllowed)
  .put(response.methodNotAllowed)
  .get(async function (req, res, next) {
    try {
      let commandes
      if (req.query.s)
        commandes = await db.select().from('commande').where('status', req.query.s)
      else
        commandes = await db.select().from('commande')

      const toReturn = []
      commandes.forEach((commande) => {
        const links = {
          self: {
            href: "/commandes/" + commande.id
          }
        }

        toReturn.push({
          commande,
          links
        })
      })
      if (commandes.length > 0)
        return response.success(res, 200, "collection", "commandes", toReturn)
      else
        return response.error(res, 404, "ressource non disponible : /commandes/")
    } catch (error) {
      return response.error(res, 500, "erreur lors de la recuperation des commandes")
    }
  })

router.route('/:id')
  .copy(response.methodNotAllowed)
  .delete(response.methodNotAllowed)
  .patch(response.methodNotAllowed)
  .post(response.methodNotAllowed)
  .put(response.methodNotAllowed)
  .get(response.methodNotAllowed)

router.route('/:id/items')
  .copy(response.methodNotAllowed)
  .delete(response.methodNotAllowed)
  .patch(response.methodNotAllowed)
  .post(response.methodNotAllowed)
  .put(response.methodNotAllowed)
  .get(response.methodNotAllowed)

module.exports = router;
