'use strict'

const express = require('express')
const router = express.Router()

class IndexRoute {
  constructor () {
    // Public
    router.use('/', require('./root'))
    router.use('/wh', require('./kiosk'))

    return router
  }
}

module.exports = new IndexRoute()
