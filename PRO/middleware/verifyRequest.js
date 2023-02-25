let express = require('express');
let database = require('../config/mysql')

function verifyRequest(req, res, next) {

    if (req.headers.accept !== 'application/json') {

        res.send({error:'Invalid format application / json required!'});

    } else {
        next();
    }
}



module.exports = verifyRequest;