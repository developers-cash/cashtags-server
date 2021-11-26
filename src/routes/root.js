'use strict'

const config = require('../config')

const express = require('express')
const router = express.Router()

const axios = require('axios')
const CashPay = require('@developers.cash/cash-pay-server-js')

class RootRoute {
  constructor () {
    // Public
    router.get('/', async (req, res, next) => this.root(req, res, next))

    return router
  }

  async root (req, res, next) {
    try {
      // Make sure user isn't trying to access this url directly
      if (!req.get('accept').startsWith('application')) {
        throw new Error('Invalid "accept" header. Did you remember to add the bitcoincash:?r= prefix to the URL and URI encode the query parameters?')
      }

      console.log(req.headers['x-forwarded-for'])

      // Add 'bitcoincash:' prefix if not present
      if (!req.query.to.startsWith('bitcoincash:')) {
        req.query.to = `bitcoincash:${req.query.to}`
      }

      // Create invoice
      const invoice = new CashPay.Invoice()
        .setAPIKey(config.cashPayAPIKey)
        .setExpires(60*5)
        .addAddress(req.query.to, req.query.a)

      // Memo is given, add it
      if (req.query.m) {
        console.log(req.query.m)
        invoice.setMemo(req.query.m)
      }

      // If Memo Paid is given, add it
      if (req.query.mp) {
        if (req.query.mp === 'auto') {
          const ref = Math.floor(1000 + Math.random() * 9000)
          invoice.setMemoPaid(`Ref: ${ref}`)
        } else {
          invoice.setMemoPaid(req.query.mp)
        }
      }

      // If Webhook given, add it
      if (req.query.wh) {
        invoice.setWebhook(req.query.wh)
      }

      // If data given, add it
      if (req.query.d) {
        invoice.setPrivateData(req.query.d)
      }

      await invoice.create()

      // Detect request type (BIP70 vs JPP)
      const type = req.get('accept') === 'application/bitcoincash-paymentrequest' ? 'BIP70' : 'JPP'

      // Proxy the Payment Request
      const payload = await axios.get(invoice.service.paymentURI, {
        responseType: type === 'BIP70' ? 'arraybuffer' : 'json',
        headers: {
          accept: req.headers.accept,
          'user-agent': req.headers['user-agent']
        }
      })

      // Send the response
      return res.set(payload.headers)
                .send(payload.data)
    } catch (err) {
      return next(err)
    }
  }
}

module.exports = new RootRoute()
