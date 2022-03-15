const jwt = require('jsonwebtoken')

module.exports = function (req, res, next) {
    try {
        if (!req.path.includes('/auth')) {
            if (req.headers.authorization) {
                const token = req.headers.authorization.split(' ')[1]
                jwt.verify(token, process.env.JWT_SECRET)
            }
        }
        next()
    } catch (error) {
        //res.send(error)
        console.log(error);
    }

}