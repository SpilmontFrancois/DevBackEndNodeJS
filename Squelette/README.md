# DEMO IUT

## Variables d'environnement

- ./service/api/.env

## Commandes utiles

- Installer les dépendances :
`docker-compose run <nom_du_service> npm i`

- Démarrer le container :
`docker-compose up`

- Entrer dans le container (si container est up):
`docker exec -it <nom_du_service> bash`

- Consulter l'API:
`curl http://localhost:3333`