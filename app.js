'use strict';

if (!process.env.IMAGINARY_APPLICATION_DOMAIN) {
    console.log("Please set the following ENV variables:");
    console.log("IMAGINARY_APPLICATION_DOMAIN");
    process.exit(1);
}

let restify = require('restify')
    ,rq = require('request')
    ,fs = require('fs')
    ,service = require('node-health-service').Service

let maxBodySize = process.env.MAX_BODY_SIZE || 0

let healthConfig = {
	imaginary:{
		probe:"ping",
		url:process.env.IMAGINARY_APPLICATION_DOMAIN.concat("/health")
	}
}

const server = restify.createServer({
  name: 'imagesvc',
  version: '1.0.0'
});

server.use(restify.bodyParser({
    maxBodySize: maxBodySize,
    mapParams: true,
    mapFiles: true,
    overrideParams: false
 }));

let processImage = (req, callback) => {
    let proxy_url = process.env.IMAGINARY_APPLICATION_DOMAIN.concat(req.url);

    return rq({
        uri: proxy_url,
        method: req.route.method,
        body: req.params.file
    }, callback)
}

let uploadImage = (req, res, next) => {
    if (req.params && req.params.file) {
        processImage(req, (err, resp, body) => {
            if (err) {
                res.json(500, {status:"error", msg: "Internal error: Cannot contact Imaginary service"})
                next()
            } else {
                let contentType = resp.headers['content-type']

                if (contentType == "application/json") {
                    res.json(body)
                    next()
                } else {
                    console.log("TODO Upload")
                    next()
                }
            }
        })
    }
}

server.get('/healthz',service.route(healthConfig))

server.post('/.*/', function (req, res, next) {
    if (req.params && req.params.file)
        uploadImage(req, res, next)
    else {
        res.json(400, {status: "error", msg: "Not a proper file"})
        next()
    }
});

server.listen(8080, function () {
  console.log('%s listening at %s', server.name, server.url);
});
