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
      return response.error(res, 422, "wrong inputs")
    }

    const livraison = req.body.livraison.date + " " + req.body.livraison.heure
    const uuid = uuidv4()
    const token = jwt.sign({ foo: 'bar' }, process.env.PRIVATEKEY);
    let total = 0
    let items = req.body.items
    items.forEach(item => {
      total += item.tarif * item.quantite
    })

    try {
      db.transaction(trx => {
        trx.insert({
          id: uuid,
          nom: req.body.nom,
          mail: req.body.mail,
          livraison: livraison,
          montant: total,
          token: token,
          created_at: new Date(),
          updated_at: new Date()
        }).into('commande').then(async function (data) {
          items.forEach(item => {
            trx.insert({
              libelle: item.libelle,
              uri: item.uri,
              quantite: item.quantite,
              tarif: item.tarif,
              commande_id: uuid
            }).into('item')
          })
        }).then(async function () {
          trx.commit
          const commande = await trx.select('*').from('commande').where('id', uuid)
          return response.success(res, 201, commande)
        })
          .catch(trx.rollback)
      })
    } catch (error) {
      return response.error(res, 500, "erreur lors de la creation de la commande")
    }
  })
  .put(response.methodNotAllowed)
  // GET ALL COMMANDES
  .get(async function (req, res, next) {
    try {
      const commandes = await db.select().from('commande')
      if (commandes.length > 0)
        return response.success(res, 200, commandes)
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
  // EDIT ONE COMMANDE
  .put(async function (req, res, next) {
    req.body.updated_at = new Date()
    try {
      const affectedRows = await db.select().from('commande').where('id', req.params.id).update(req.body)
      const commande = (await db.select().from('commande').where('id', req.params.id))[0]
      if (affectedRows)
        return response.success(res, 200, commande)
      else
        return response.error(res, 404, "ressource non disponible : /commandes/" + req.params.id)
    }
    catch (error) {
      return response.error(res, 500, "une erreur est survenue : " + error.message)
    }
  })
  // GET ONE COMMANDE
  .get(async function (req, res, next) {
    if (req.query.token || req.headers.x_lbs_token) {
      const token = req.query.token || req.headers.x_lbs_token
      try {
        const commande = (await db.select().from('commande').where('id', req.params.id).andWhere('token', token))[0]
        if (commande) {
          if (req.query.embed === "items") {
            try {
              const items = await db.select().from('item').where('command_id', req.params.id)
              if (items.length > 0)
                commande.items = items
            } catch (error) {
              return response.error(res, 500, "une erreur est survenue : " + error.message)
            }
          }

          commande.links = {
            self: {
              href: "/commandes/" + commande.id
            },
            items: {
              href: "/commandes/" + commande.id + "/items"
            }
          }

          return response.success(res, 200, commande)
        }
        else
          return response.error(res, 404, "ressource non disponible : /commandes/" + req.params.id)
      } catch (error) {
        return response.error(res, 500, "une erreur est survenue : " + error.message)
      }
    } else
      return response.error(res, 401, "vous n'avez pas les droits nécessaires afin d'acceder a cette ressource")
  })

router.route('/:id/items')
  .copy(response.methodNotAllowed)
  .delete(response.methodNotAllowed)
  .patch(response.methodNotAllowed)
  .post(response.methodNotAllowed)
  .put(response.methodNotAllowed)
  // GET ALL ITEMS OF ONE COMMANDE
  .get(async function (req, res, next) {
    try {
      const items = await db.select().from('item').where('command_id', req.params.id)
      if (items.length > 0)
        return response.success(res, 200, items)
      else
        return response.error(res, 404, "ressource non disponible : /commandes/" + req.params.id + "/items")
    } catch (error) {
      return response.error(res, 500, "une erreur est survenue : " + error.message)
    }
  })

module.exports = router;
