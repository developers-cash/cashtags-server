'use strict'

const config = require('./config')

// Application
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const routes = require('./routes')
const webSocket = require('./services/websocket')

class App {
  async start () {
    //
    // Setup ExpressJS middleware, routes, etc
    //
    var app = express()
    app.enable('trust proxy')
    app.use(cors())

    app.use(bodyParser.json({
      verify: (req, res, buf) => {
        req.rawBody = buf
      }
    }))

    app.use(routes)

    //
    // Set port and start ExpressJS Server
    //
    var server = app.listen(config.port, function () {
      console.log('[ExpressJS] Server Starting')
      console.log(`[ExpressJS] listening at http://${server.address().address}:${server.address().port}`)

      console.log('[Websockets] Server Starting')
      webSocket.startServer(server)
    })
  }
}

new App().start()
