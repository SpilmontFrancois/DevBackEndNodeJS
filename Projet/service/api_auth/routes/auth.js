var express = require('express');
var router = express.Router();
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs');
const response = require('../utils/response');
const db = require('../knex')
const Joi = require('joi');

router.route('/signup')
  .copy(response.methodNotAllowed)
  .delete(response.methodNotAllowed)
  .patch(response.methodNotAllowed)
  .post(async function (req, res, next) {

    const schema = Joi.object().keys({
      nom_client: Joi.string().required(),
      mail_client: Joi.string().email().required(),
      passwd: Joi.string().required()
    })

    try {
      Joi.assert(req.body, schema)
    } catch (error) {
      return response.error(res, 422, "wrong inputs")
    }

    req.body.passwd = await bcrypt.hash(req.body.passwd, 8)

    try {
      const cmd = await db.select('id').from('client').where('mail_client', req.body.mail_client)
      if (cmd.length > 0) {
        return response.error(res, 500, "client déjà existant")
      } else {
        await db.insert(req.body).into('client')
        const user = await db.select('nom_client', 'mail_client').from('client').where('mail_client', req.body.mail_client)
        return response.created(res, 'user', user)
      }
    } catch (error) {
      console.log(error);
      return response.error(res, 500, "erreur lors de la recuperation des clients")
    }
  })
  .put(response.methodNotAllowed)
  // GET ALL COMMANDES
  .get(function (req, res, next) {
    try {
      return res.json({
        'hello': '/signup'
      })
    } catch (error) {
      return response.error(res, 404, "ressource non disponible : /auth/signup")
    }
  })

router.route('/signin')
  .copy(response.methodNotAllowed)
  .delete(response.methodNotAllowed)
  .patch(response.methodNotAllowed)
  .post(async function (req, res, next) {
    try {
      const user = await db.select('passwd').from('client').where('mail_client', req.body.mail_client)
      if (user.length > 0) {
        if (bcrypt.compareSync(req.body.passwd, user[0].passwd)) {
          // JWT OK
          // Créer un jwt et le renvoyer OK
          // Créer un middleware qui vérifie le JWT à fin d'accéder à la ressource
          const token = jwt.sign({

          },
            process.env.JWT_SECRET)

          return res.json({
            "Status": "connected",
            token
          })
        }
        else {
          return response.error(res, 401, "informations de connection incorrectes")
        }
      } else {
        return response.error(res, 404, "ressource non disponible : /signin")
      }

    } catch (error) {
      return response.error(res, 404, "ressource non disponible : /signin")
    }
  })
  .put(response.methodNotAllowed)
  // GET ALL COMMANDES
  .get(function (req, res, next) {
    try {
      return res.json({
        'hello': '/signin'
      })
    } catch (error) {
      return response.error(res, 404, "ressource non disponible : /signin")
    }
  })

module.exports = router;
