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
  .post(async function (req, res, next) {
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

    new Promise((resolve, reject) => {
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
        })
          .into('commande')
          .then(trx.commit)
          .catch(() => {
            trx.rollback
            return response.error(res, 500, "erreur lors de la creation de la commande")
          })
      })
        // Une fois la commande créée, on crée les items
        .then(() => {
          items.forEach(item => {
            db.transaction(trx => {
              trx.insert({
                libelle: item.libelle,
                uri: item.uri,
                quantite: item.quantite,
                tarif: item.tarif,
                command_id: uuid
              })
                .into('item')
                .then(trx.commit)
                .catch(() => {
                  trx.rollback
                  return response.error(res, 500, "erreur lors de la creation des items de la commande")
                })
            })
          })
          // Une fois les items créés, on resout la promesse pour retourner la commande
          resolve()
        })
    })
      .then(async () => {
        const commande = await db.select('nom', 'mail', 'livraison as date_livraison', 'commande.id', 'token', 'montant').from('commande').where('commande.id', uuid)
          .join('item as items', 'items.command_id', 'commande.id').options({ nestTables: true }).select('uri', 'quantite as q', 'libelle', 'tarif').where('command_id', uuid)
        return response.created(res, "commande", commande)
      })
  })
  .put(response.methodNotAllowed)
  // GET ALL COMMANDES
  .get(async function (req, res, next) {
    try {
      const commandes = await db.select('id', 'created_at as date_commande', 'mail as mail_client', 'montant as montant').from('commande')
      if (commandes.length > 0)
        return response.success(res, 200, "collection", "commandes", commandes)
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
    if (req.query.token || req.headers.x_lbs_token) {
      const token = req.query.token || req.headers.x_lbs_token
      req.body.updated_at = new Date()
      try {
        const affectedRows = await db.select().from('commande').where('id', req.params.id).andWhere('token', token).update(req.body)
        if (affectedRows)
          return response.modified(res)
        else
          return response.error(res, 404, "ressource non disponible : /commandes/" + req.params.id)
      }
      catch (error) {
        return response.error(res, 500, "une erreur est survenue : " + error.message)
      }
    } else
      return response.error(res, 401, "vous n'avez pas les droits nécessaires afin d'acceder a cette ressource")
  })
  // GET ONE COMMANDE
  .get(async function (req, res, next) {
    if (req.query.token || req.headers.x_lbs_token) {
      const token = req.query.token || req.headers.x_lbs_token
      try {
        const commande = (await db.select('id', 'mail', 'nom', 'created_at as date_commande', 'livraison as date_livraison', 'montant').from('commande').where('id', req.params.id).andWhere('token', token))[0]
        if (commande) {
          if (req.query.embed === "items") {
            try {
              const items = await db.select('id', 'libelle', 'tarif', 'quantite').from('item').where('command_id', req.params.id)
              if (items.length > 0)
                commande.items = items
            } catch (error) {
              return response.error(res, 500, "une erreur est survenue : " + error.message)
            }
          }

          const links = {
            self: {
              href: "/commandes/" + commande.id
            },
            items: {
              href: "/commandes/" + commande.id + "/items"
            }
          }

          return response.success(res, 200, "resource", "commande", commande, links)
        }
        else
          return response.error(res, 404, "ressource non disponible : /commandes/" + req.params.id)
      } catch (error) {
        return response.error(res, 500, "une erreur est survenue : " + error.message)
      }
    } else{
      console.log(req.query);
      return response.error(res, 401, "vous n'avez pas les droits nécessaires afin d'acceder a cette ressource")
    }
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
      const items = await db.select('id', 'libelle', 'tarif', 'quantite').from('item').where('command_id', req.params.id)
      if (items.length > 0)
        return response.success(res, 200, "collection", "items", items)
      else
        return response.error(res, 404, "ressource non disponible : /commandes/" + req.params.id + "/items")
    } catch (error) {
      return response.error(res, 500, "une erreur est survenue : " + error.message)
    }
  })

module.exports = router;
