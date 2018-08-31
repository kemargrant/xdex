
# Testing
git clone https://github.com/kemargrant/xdex   

npm test

# Usage
```
npm install xdex
var xdex = require('xdex')
var switcheoTest = new xdex.switcheo({
	NEO:{
		wif:"Your neo wif",
		api:"test-api.switcheo.network || api.switcheo.network"
		contract:"a195c1549e7da61b8da315765a790ac7e7633b82 || 48756743d524af03aa75729e911651ffd3cbe7d8"
	}
})
```

## Switcheo Methods
https://docs.switcheo.network
### List balances

```
var balance = await switcheoTest.balances.list_balances({
	addresses: ["67655526ea983cf4a1841775d4d018afd9731904"],
	contract_hashes: ["a195c1549e7da61b8da315765a790ac7e7633b82"],
})
```
or
```
switcheoTest.balances.list_balances({
	addresses: ["67655526ea983cf4a1841775d4d018afd9731904"],
	contract_hashes: ["a195c1549e7da61b8da315765a790ac7e7633b82"],
})
.then(console.log)
.catch(console.error)
```				
### Cancel

Should create a cancellation
```
var order = await switcheoTest.orders.create_order({
  pair: 'SWTH_NEO',
  blockchain: 'neo',
  side: 'sell',
  price: 100,
  want_amount: 100,
  use_native_tokens: true,
  order_type: 'limit',
})
```
or
```
switcheoTest.orders.create_order({
  pair: 'SWTH_NEO',
  blockchain: 'neo',
  side: 'sell',
  price: 100,
  want_amount: 100,
  use_native_tokens: true,
  order_type: 'limit',
})
.then(console.log)
.catch(console.error)
```
Execute a cancellation
```
var order = await switcheoTest.orders.create_order({
  pair: 'SWTH_NEO',
  blockchain: 'neo',
  side: 'sell',
  price: 100,
  want_amount: 100,
  use_native_tokens: true,
  order_type: 'limit',
})
var execute = await switcheoTest.orders.execute_order(order);
```
or
```
switcheoTest.orders.create_order({
  pair: 'SWTH_NEO',
  blockchain: 'neo',
  side: 'sell',
  price: 100,
  want_amount: 100,
  use_native_tokens: true,
  order_type: 'limit',
})
.then(switcheoTest.orders.execute_order)
.then(console.log)
.catch(console.error)		
```

### Deposits
Should create a deposit
```
var deposit = await switcheoTest.deposit.create_deposits({
  blockchain: 'neo',
  asset_id: 'SWTH',
  amount: 2,
})
```
or
```
switcheoTest.deposit.create_deposits({
  blockchain: 'neo',
  asset_id: 'SWTH',
  amount: 2,
})
.then(console.log)
.catch(console.error)	
```
Execute a deposit
```
var deposit = await switcheoTest.deposit.create_deposits({
  blockchain: 'neo',
  asset_id: 'SWTH',
  amount: 2,
})
var executed = await switcheoTest.deposit.execute_deposits(deposit);
```
or
```
switcheoTest.deposit.create_deposits({
  blockchain: 'neo',
  asset_id: 'SWTH',
  amount: 2,
})
.then(switcheoTest.deposit.execute_deposit)
.then(console.log)
.catch(console.error)	
```
### Tickers
Should return candlestick chart data filtered by url parameters
```
var candles = await switcheoTest.tickers.candlesticks({
	"pair": "SWTH_NEO",
	"interval": 1,
	"start_time": new Date().getTime()/1000 - 360,
	"end_time": new Date().getTime()/1000,
	"contract_hash": "a195c1549e7da61b8da315765a790ac7e7633b82"
})
```
or
```
switcheoTest.tickers.candlesticks({
	"pair": "SWTH_NEO",
	"interval": 1,
	"start_time": new Date().getTime()/1000 - 360,
	"end_time": new Date().getTime()/1000,
	"contract_hash": "a195c1549e7da61b8da315765a790ac7e7633b82"
})
.then(console.log)
.catch(console.error)	
```		
Should return 24-hour data for all pairs and markets	
```
var pairs = await switcheoTest.tickers.last_24_hours()
```
or
```
switcheoTest.tickers.last_24_hours()	
.then(console.log)
.catch(console.error)	
```

Should return last price of given symbol(s). Defaults to all symbols
```
var price = await switcheoTest.tickers.last_price();
```
or
```
switcheoTest.tickers.last_price();
.then(console.log)
.catch(console.error)	
```

### Offers
Should retrieves the best 70 offers (per side) on the offer book
```
var book =  await switcheoTest.offers.list_offers({
  "blockchain": "neo",
  "pair": "SWTH_GAS",
})
```
or
```
switcheoTest.offers.list_offers({
  "blockchain": "neo",
  "pair": "SWTH_GAS",
})
.then(console.log)
.catch(console.error)	
```

### Orders
Should return orders from a specific address filtered by the given parameters
```
var orders = await switcheoTest.orders.list_orders({
  "address": "87cf67daa0c1e9b6caa1443cf5555b09cb3f8e5f",
  "contract_hash": "a195c1549e7da61b8da315765a790ac7e7633b82"
})
```
or
```
switcheoTest.orders.list_orders({
  "address": "87cf67daa0c1e9b6caa1443cf5555b09cb3f8e5f",
  "contract_hash": "a195c1549e7da61b8da315765a790ac7e7633b82"
})
.then(console.log)
.catch(console.error)	
```

Should creates an order which can be executed
```
var order = await switcheoTest.orders.create_order({
  pair: 'SWTH_NEO',
  blockchain: 'neo',
  side: 'sell',
  price: 1,
  want_amount: 1,
  use_native_tokens: true,
  order_type: 'limit',
})
```
or
```
switcheoTest.orders.create_order({
  pair: 'SWTH_NEO',
  blockchain: 'neo',
  side: 'sell',
  price: 1,
  want_amount: 1,
  use_native_tokens: true,
  order_type: 'limit',
})
.then(console.log)
.catch(console.error)	
```

Should execute an order
```
var order = await switcheoTest.orders.create_order({
  pair: 'SWTH_NEO',
  blockchain: 'neo',
  side: 'sell',
  price: 1,
  want_amount: 100,
  use_native_tokens: true,
  order_type: 'limit',
})
var ordered = await switcheoTest.orders.execute_order(order);
```
or
```
switcheoTest.orders.create_order({
  pair: 'SWTH_NEO',
  blockchain: 'neo',
  side: 'sell',
  price: 1,
  want_amount: 100,
  use_native_tokens: true,
  order_type: 'limit',
})
.then(switcheoTest.orders.execute_order)
.then(console.log)
.catch(console.error)	
```
### Trades
Should retrieves trades that have already occurred on Switcheo Exchange filtered by the request parameters.
```
var trades = await switcheoTest.trades.list_trades({
  "blockchain": "neo",
  "pair": "SWTH_NEO",
  "contract_hash": "a195c1549e7da61b8da315765a790ac7e7633b82"
})
```
or
```
switcheoTest.trades.list_trades({
  "blockchain": "neo",
  "pair": "SWTH_NEO",
  "contract_hash": "a195c1549e7da61b8da315765a790ac7e7633b82"
})
.then(console.log)
.catch(console.error)	
```
### Withdrawals
Should create a withdrawal transaction
```
var withdrawal = await switcheoTest.withdrawal.create_withdrawal({
	  blockchain: 'neo',
	  asset_id: 'SWTH',
	  amount: 2,
})
```
or
```
switcheoTest.withdrawal.create_withdrawal({
	  blockchain: 'neo',
	  asset_id: 'SWTH',
	  amount: 2,
})
.then(console.log)
.catch(console.error)	
```		

Should execute a withdrawal
```
var withdrawal = await switcheoTest.withdrawal.create_withdrawal({
  blockchain: 'neo',
  asset_id: 'SWTH',
  amount: 2,
})
var withdrawn = switcheoTest.withdrawal.execute_withdrawl(withdrawal)
```
or
```
switcheoTest.withdrawal.execute_withdrawl(withdrawal);
		witcheoTest.withdrawal.create_withdrawal({
  blockchain: 'neo',
  asset_id: 'SWTH',
  amount: 2,
})
.then(switcheoTest.withdrawal.execute_withdrawl)
.then(console.log)
.catch(console.error)
```
