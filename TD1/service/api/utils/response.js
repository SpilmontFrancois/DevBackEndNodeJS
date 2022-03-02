function error(res, code, message) {
    res.status(code).json({
        "type": "error",
        "error": code,
        "message": message
    })
}

function success(res, code, data) {
    res.status(code).json({
        "type": "success",
        "data": data
    })
}

function methodNotAllowed(req, res) {
    res.status(405).json({
        type: "error",
        error: 405,
        message: "methode non authorisee : " + req.method + " sur la route : /commandes" + req.url
    })
}

module.exports = {
    error,
    success,
    methodNotAllowed
}