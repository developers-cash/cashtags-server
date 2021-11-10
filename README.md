# CashTags Server

This service generates printable QR Codes (Payment URLs) whose value amounts can be specified in fiat (e.g. USD). When a user scans these QR Codes/Payment URLs into their wallet, the fiat amount specified is converted to its BCH equivalent using Coinbase Exchange Rates.

This helps mitigate BCH price volatility relative to fiat. If $1USD is the amount specified on the QR Code, this will always be converted to its BCH equivalent at the time the user scans it, meaning that in real-life self-serve scenarios the QR Codes will not need constant reprinting.

Note that this is basically just a proxy to [CashPayServer](https://github.com/developers-cash/cash-pay-server) to allow for the above use-case.

## Setup

Running:

```
git clone https://github.com/developers-cash/cashtags-server
cd cashtags-server
npm install
npm run dev // npm run start
```

Environment variables:

```
CASHPAYSERVER=https://v1.pay.infra.cash
CASHPAYSERVER_APIKEY=0acdc0d838e17cb2ab877c95d465e612
```

... where CASHPAYSERVER_APIKEY can be used to access (admin interface)[https://admin.v1.pay.infra.cash/] for CashPayServer

## Note

Code's a bit messy and things could've been done better. But I'm more interested in demonstrating the use-case. Hope someone else may pick this up if useful and perhaps provide an instance that takes commission (could be done by just doing another CashPay.addAddress).
