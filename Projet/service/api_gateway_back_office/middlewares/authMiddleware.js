const jwt = require('jsonwebtoken')

module.exports = function (req, res, next) {
    try {
        if (!req.path.includes('/auth'))
            if (req.headers.authorization) {
                const token = req.headers.authorization.split(' ')[1]
                if (jwt.verify(token, process.env.JWT_SECRET))
                    next()
                else
                    throw new Error()
            }
            else
                throw new Error()
        else
            next()
    } catch (error) {
        res.status(401).json({
            "type": "error",
            "error": 401,
            "message": "Vous devez être connecté pour accéder à cette ressource"
        })
    }

}