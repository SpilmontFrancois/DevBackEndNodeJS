function error(res, code, message) {
    res.status(code).json({
        type: "error",
        error: code,
        message
    })
}

function success(res, code, type, dataName, data, links) {
    res.status(code).json({
        type,
        count: data.length,
        [dataName]: data,
        links
    })
}

function paginate(res, type, count, dataName, data, links) {
    res.status(206).json({
        type,
        count,
        size: data.length,
        [dataName]: data,
        links
    })
}

function created(res, dataName, data) {
    res.status(201).json({ [dataName]: data })
}

function modified(res) {
    res.status(204).json({})
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
    created,
    modified,
    paginate,
    methodNotAllowed
}