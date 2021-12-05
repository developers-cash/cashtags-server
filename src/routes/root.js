'use strict'

const config = require('../config')

const express = require('express')
const router = express.Router()

const axios = require('axios')
const CashPay = require('@developers.cash/cash-pay-server-js')

class RootRoute {
  constructor () {
    // Setup CashPayServer
    CashPay.config.options.endpoint = config.cashPayServer
    CashPay.config.invoice.apiKey = config.cashPayAPIKey

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

      // Create invoice
      const invoice = new CashPay.Invoice()
        .setExpires(60*5)

      // Add address outputs
      const addresses = req.query.to.split(',')
      const amounts = req.query.a.split(',')

      // Validate address and amounts
      if (!addresses.length) {
        throw new Error('To address is required')
      }

      if (!amounts.length) {
        throw new Error('Amount is required')
      }

      // Make sure that addresses and amounts are same length
      if (addresses.length !== amounts.length) {
        throw new Error(`You have ${addresses.length} addresses but ${amounts.length} amounts.`)
      }

      // Add them to invoice
      addresses.forEach((address, i) => {
        // Add 'bitcoincash:' prefix if not present
        if (!address.startsWith('bitcoincash:')) {
          address = `bitcoincash:${address}`
        }

        invoice.addAddress(address, amounts[i])
      })

      // Memo is given, add it
      if (req.query.m) {
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
