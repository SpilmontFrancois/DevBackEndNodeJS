var express = require('express')
var router = express.Router()

router.get('/', function (req, res, next) {
  res.json({
    "type": "collection",
    "count": 3,
    "commandes": [
      {
        "id": "AuTR4-65ZTY",
        "mail_client": "jan.neymar@yaboo.fr",
        "date_commande": "2022-01-05 12:00:23",
        "montant": 25.95
      },
      {
        "id": "657GT-I8G443",
        "mail_client": "jan.neplin@gmal.fr",
        "date_commande": "2022-01-06 16:05:47",
        "montant": 42.95
      },
      {
        "id": "K9J67-4D6F5",
        "mail_client": "claude.francois@grorange.fr",
        "date_commande": "2022-01-07 17:36:45",
        "montant": 14.95
      },
    ]
  })
})

router.get('/:id', function (req, res, next) {
  res.json({
    "type": "resource",
    "commande": {
      "id": "K9J67-4D6F5",
      "mail_client": "claude.francois@grorange.fr",
      "nom_client": "claude francois",
      "date_commande": "2022-01-07 17:36:45",
      "date_livraison": "2022-01-08 12:30",
      "montant": 14.95
    }
  })
})

module.exports = router
