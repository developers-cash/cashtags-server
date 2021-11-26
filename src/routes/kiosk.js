'use strict'

const config = require('../config')

const express = require('express')
const router = express.Router()

const webSocket = require('../services/websocket')

const _ = require('lodash')
const axios = require('axios')
const CashPay = require('@developers.cash/cash-pay-server-js')

class KioskRoute {
  constructor () {
    router.post('/:channel', async (req, res, next) => this.postWebhook(req, res, next))

    return router
  }

  // TODO Add Webhook Signature Verification
  async postWebhook (req, res, next) {
    try {
      /*await CashPay.Signatures.verifyWebhook(req.rawBody, {
        digest: req.headers['digest'],
        identity: req.headers['x-identity'],
        signature: req.headers['x-signature'],
        signatureType: req.headers['x-signature-type']
      })*/

      webSocket.notify(req.params.channel, req.body.event, {
        memo: req.body.invoice.memo,
        memoPaid: req.body.invoice.memoPaid,
        ref: req.body.invoice.privateData,
        currency: req.body.invoice.userCurrency,
        total: req.body.invoice.totals.userCurrencyTotal,
        bchTotal: req.body.invoice.totals.nativeTotal,
        broadcasted: req.body.invoice.broadcasted,
        ago: 0
      })

      return res.send(200)
    } catch (err) {
      return next(err)
    }
  }
}

module.exports = new KioskRoute()
