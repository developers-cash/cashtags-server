module.exports = {
  env: process.env.NODE_ENV,
  port: process.env.PORT || 8080,
  cashPayServer: process.env.CASHPAYSERVER || 'https://v1.pay.infra.cash',
  cashPayAPIKey: process.env.CASHPAYSERVER_APIKEY || 'testkey'
}
