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
      const page = parseInt(req.query.page) || 1
      const size = parseInt(req.query.size) || 10

      if (req.query.s) {
        commandes = await db.select('id', 'nom', 'created_at', 'livraison', 'status').from('commande').where('status', req.query.s).orderBy('livraison', 'desc').orderBy('created_at', 'desc').paginate({ perPage: size, currentPage: page, isLengthAware: true })
        if (page > commandes.pagination.lastPage)
          commandes = await db.select('id', 'nom', 'created_at', 'livraison', 'status').from('commande').where('status', req.query.s).orderBy('livraison', 'desc').orderBy('created_at', 'desc').paginate({ perPage: size, currentPage: commandes.pagination.lastPage, isLengthAware: true })
      }
      else {
        commandes = await db.select('id', 'nom', 'created_at', 'livraison', 'status').from('commande').orderBy('livraison', 'desc').orderBy('created_at', 'desc').paginate({ perPage: size, currentPage: page, isLengthAware: true })
        if (page > commandes.pagination.lastPage)
          commandes = await db.select('id', 'nom', 'created_at', 'livraison', 'status').from('commande').orderBy('livraison', 'desc').orderBy('created_at', 'desc').paginate({ perPage: size, currentPage: commandes.pagination.lastPage, isLengthAware: true })
      }

      if (commandes.data.length > 0) {
        const count = commandes.pagination.total
        const toReturn = []
        commandes.data.forEach((command) => {
          command.links = {
            self: {
              href: "/commandes/" + command.id
            }
          }

          toReturn.push({
            command
          })
        })

        const links = {
          next: {
            href: "/commandes?page=" + (page + 1) + "&size=" + size
          },
          prev: {
            href: "/commandes?page=" + (page - 1) + "&size=" + size
          },
          last: {
            href: "/commandes?page=" + commandes.pagination.lastPage + "&size=" + size
          },
          first: {
            href: "/commandes?page=1&size=" + size
          }
        }

        return response.paginate(res, "collection", count, "commandes", toReturn, links)
      }
      else {
        return response.error(res, 404, "ressource non disponible : /commandes/")
      }
    } catch (error) {
      console.log(error);
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
