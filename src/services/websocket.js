'use strict'

const config = require('../config')
const SocketIO = require('socket.io')

/**
 * WebSocket Library for Notifying Clients of Payment Events
 */
class WebSocket {
  constructor () {
    this.subscriptions = {}
  }

  /**
   * Setup the Websocket server
   */
  async startServer (server) {
    // Setup Websockets
    const socket = SocketIO(server, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST']
      }
    })

    socket.on('connection', (client) => this._onConnection(client))
  }

  /**
   * Notify any Websocket connections that are subscribed to
   * the given invoiceId that an event has occurred.
   * @param invoiceId The ID of the invoice
   * @param event The event that was triggered
   * @param invoice The Invoice data
   */
  async notify (channel, event, payload) {
    try {
      if (this.subscriptions[channel]) {
        for (const client of this.subscriptions[channel]) {
          client.emit(event, payload)
        }
      }
    } catch (err) {
      console.log(err)
    }
  }

  /**
   * Triggered when a Websocket client connects
   * @param ws The Websocket of the client
   * @private
   */
  async _onConnection (client) {
    console.log(`[Websockets] Connected ${client.id}`)

    // Setup event listeners
    client.on('subscribe', (msg) => this._onSubscribe(client, msg))
    client.on('unsubscribe', (msg) => this._onUnsubscribe(client, msg))
    client.on('disconnect', (msg) => this._onDisconnect(client, msg))
  }

  /**
   * Triggered when a Websocket client subscribes to an Invoice ID
   * @param client The Websocket of the client
   * @param msg The payload
   * @private
   */
  async _onSubscribe (client, msg) {
    if (!this.subscriptions[msg.channel]) {
      this.subscriptions[msg.channel] = []
    }

    this.subscriptions[msg.channel].push(client)

    return client.emit('subscribed', {
      message: `Subscribed client to channel ${msg.channel}`
    })
  }

  /**
   * Triggered when a Websocket client unsubscribes from an Invoice ID
   * @param client The Websocket of the client
   * @param msg The payload
   * @private
   */
  async _onUnsubscribe (client, msg) {
    delete this.subscriptions[msg.channel]

    return client.emit('unsubscribed', {
      message: `Unsubscribed from ${msg.channel}`
    })
  }

  async _onDisconnect (client, msg) {
    console.log(`[Websockets] Disconnected ${client.id}: ${msg}`)

    for (const channel of Object.keys(this.subscriptions)) {
      const sub = this.subscriptions[channel]
      const socketIndex = sub.findIndex(socket => client.conn.id === socket.conn.id)
      sub.splice(socketIndex, 1)
    }

    console.log(this.subscriptions)

    console.log(client.conn.id)
    // TODO Find exact client ?

    delete this.subscriptions[msg.invoiceId]
  }
}

const webSocket = new WebSocket()

module.exports = webSocket
