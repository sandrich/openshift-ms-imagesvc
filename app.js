'use strict';

if (!process.env.IMAGINARY_APPLICATION_DOMAIN || !process.env.GCSIMAGEUPLOAD_APPLICATION_DOMAIN) {
    console.log("Please set the following ENV variables:");
    console.log("IMAGINARY_APPLICATION_DOMAIN, GCSIMAGEUPLOAD_APPLICATION_DOMAIN");
    process.exit(1);
}

let restify = require('restify')
    ,rq = require('request')
    ,httprq = require('http').request
    ,service = require('node-health-service').Service
    ,fs = require('fs')

let maxBodySize = process.env.MAX_BODY_SIZE || 0

let healthConfig = {
	imaginary:{
		probe:"ping",
		url:process.env.IMAGINARY_APPLICATION_DOMAIN.concat("/health")
	},
    gcsImageUpload: {
        probe: "ping",
        url:process.env.GCSIMAGEUPLOAD_APPLICATION_DOMAIN.concat("/healthz")
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

const imaginaryClient = restify.createClient({
     url: process.env.IMAGINARY_APPLICATION_DOMAIN
})

let processImage = (req, callback) => {
    let proxy_url = process.env.IMAGINARY_APPLICATION_DOMAIN;

    return imaginaryClient.post(req.url,callback)
}

let uploadImage = (req, res, next) => {
    if (req.params && req.params.file) {

        processImage(req, (err, postReq) => {
            if (err) {
                res.json(500, {status:"error", msg: "Internal error: Cannot contact Imaginary service"})
                next()
            }

            postReq.on('result', (err, resp) => {
                let contentType = resp.headers['content-type']

                if (contentType == "application/json") {
                    resp.pipe(res)
                    next()
                } else {
                    resp.pipe(rq.put(process.env.GCSIMAGEUPLOAD_APPLICATION_DOMAIN.concat("/upload"), (err, resp, body) => {
                        if (err) {
                            res.json(500, {status:"error", msg: "Internal error: Cannot contact gcsImageUpload service"})
                            next()
                        }

                        if (resp.statusCode && resp.statusCode == 200) {
                            let b = JSON.parse(body)
                            if (b && b.imageName)
                                res.json(200, {status: "ok", imageName: b.imageName})
                            else
                                res.json(500, {status:"error", msg: body})

                            next()
                        }


                    }))
                }
            })

            postReq.write(req.params.file)
            postReq.end()
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
