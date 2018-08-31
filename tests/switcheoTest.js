const switcheo = require("../src/switcheo.js");
var assert = require('assert');

var NEO = {
	//V2 Testnet Contract
	"V2":"a195c1549e7da61b8da315765a790ac7e7633b82",
}

describe('Switcheo API Tests(NEO)', function() {
	const switcheoTest = new switcheo({
			"NEO":{"wif":"L4FSnRosoUv22cCu5z7VEEGd2uQWTK7Me83vZxgQQEsJZ2MReHbu"}
		})	
	describe('Balances', function() {
		it('List contract balances of the given address and contract.', async function() {
			this.timeout(10000);
			var balance = await switcheoTest.balances.list_balances({
				addresses: ["67655526ea983cf4a1841775d4d018afd9731904"],
				contract_hashes: [NEO.V2],
			})
			return assert.equal(balance.GAS && balance.SWTH && balance.NEO);				
		});
	});			
	
	describe('Cancel', function() {
		it('Should create a cancellation',async function() {
			this.timeout(15000);
			var order = await switcheoTest.orders.create_order({
			  pair: 'SWTH_NEO',
			  blockchain: 'neo',
			  side: 'sell',
			  price: 100,
			  want_amount: 100,
			  use_native_tokens: true,
			  order_type: 'limit',
			})
			var ordered = await switcheoTest.orders.execute_order(order);
			var cancel = await switcheoTest.cancel.create_cancellation({order_id:ordered.id,blockchain:'neo'})
			var canceled = await switcheoTest.cancel.execute_cancellation(cancel);
			assert(cancel.id)	
		});
		
		it('Should execute a cancellation',async function() {
			this.timeout(15000);
			var order = await switcheoTest.orders.create_order({
			  pair: 'SWTH_NEO',
			  blockchain: 'neo',
			  side: 'sell',
			  price: 100,
			  want_amount: 101,
			  use_native_tokens: true,
			  order_type: 'limit',
			})
			var ex = await switcheoTest.orders.execute_order(order);
			var cancel = await switcheoTest.cancel.create_cancellation({ order_id: ex.id,blockchain:'neo'});
			var canceled = await switcheoTest.cancel.execute_cancellation(cancel);
			return assert(canceled.status === "processed")	
		})		
	
	});		
	
	describe('Deposits', function() {
		it('Should create a deposit',async function() {
			this.timeout(7000);
			var offer = await switcheoTest.deposit.create_deposits({
			  blockchain: 'neo',
			  asset_id: 'SWTH',
			  amount: 2,
			})
			return assert(offer && offer.id)
		});
		it('Should execute a deposit',async function() {
			this.timeout(7000)
			var offer = await switcheoTest.deposit.create_deposits({
			  blockchain: 'neo',
			  asset_id: 'SWTH',
			  amount: 2,
			})
			var executed = await switcheoTest.deposit.execute_deposits(offer);
			return assert(executed && executed.result === "ok");	
		});		
	});		
	describe('Tickers', function() {
		it('Should return candlestick chart data filtered by url parameters',async function() {
			this.timeout(7000);
			var candles = await switcheoTest.tickers.candlesticks({
				"pair": "SWTH_NEO",
				"interval": 1,
				"start_time": new Date().getTime()/1000 - 360,
				"end_time": new Date().getTime()/1000,
				"contract_hash": NEO["V2"]})
			return assert(candles instanceof Array);
		});
		
		it('Should return 24-hour data for all pairs and markets.',async function() {
			this.timeout(7000);
			var pairs = await switcheoTest.tickers.last_24_hours()
			return assert(pairs instanceof Array);
		});
		
		it('Should return last price of given symbol(s). Defaults to all symbols.',async function() {
			this.timeout(7000)
			var price = await switcheoTest.tickers.last_price();
			return assert(price.NEO && price.GAS);
		});
		
		it('Should return an error request candlestick(Missing End Time)',async function() {
			this.timeout(7000);
			try{
				var error =  await switcheoTest.tickers.candlesticks({
				  "pair": "SWTH_NEO",
				  "interval": 1,
				  "start_time": 1531213200,
				  })
			}
			catch(e){
				assert.equal(e.error,'param is missing or the value is empty: end_time')
			}
		});		
	});

	describe('Orders', function() {
		it('Should return orders from a specific address filtered by the given parameters.',async function() {
			this.timeout(9000);
			var order = await switcheoTest.orders.list_orders({
			  "address": "87cf67daa0c1e9b6caa1443cf5555b09cb3f8e5f",
			  "contract_hash": NEO.V2
			})
			return assert(order instanceof Array)
		});
		it('Should creates an order which can be executed ',async function() {
			//Sell 1 switcheo for 1 neo
			this.timeout(7000);
			var order = await switcheoTest.orders.create_order({
			  pair: 'SWTH_NEO',
			  blockchain: 'neo',
			  side: 'sell',
			  price: 1,
			  want_amount: 1,
			  use_native_tokens: true,
			  order_type: 'limit',
			})
			return assert(order && order.id);
		});
		
		it("Should execute an order",async function(){
			//buy 10 switcheo @ 0.001
			this.timeout(10000);
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
			var cancel = await switcheoTest.cancel.create_cancellation({order_id:ordered.id,blockchain:'neo'});
			var canceled = await switcheoTest.cancel.execute_cancellation(cancel);
			return assert(ordered.status === "processed")
		})				
	});

	describe('Offers', function() {
		it('Should retrieves the best 70 offers (per side) on the offer book.',async function() {
			this.timeout(10000)
			var offers =  await switcheoTest.offers.list_offers({
			  "blockchain": "neo",
			  "pair": "SWTH_GAS",
			})
			return assert(offers instanceof Array);
		});
	});		
	
	describe('Trades', function() {
		it('Should retrieves trades that have already occurred on Switcheo Exchange filtered by the request parameters.',async function() {
			this.timeout(10000)
			var trades = await switcheoTest.trades.list_trades({
			  "blockchain": "neo",
			  "pair": "SWTH_NEO",
			  "contract_hash": NEO.V2
			})
			return assert(trades instanceof Array)
		});	
	});	
	describe('Withdrawals', function() {
		it('Should create a withdrawal transaction', async function() {
			this.timeout(7000)
			var withdrawal = await switcheoTest.withdrawal.create_withdrawal({
				  blockchain: 'neo',
				  asset_id: 'SWTH',
				  amount: 2,
			})
			return assert(withdrawal && withdrawal.id);
		});
		it('Should execute a withdrawal', async function() {
			this.timeout(10000)
			var withdrawal = await switcheoTest.withdrawal.create_withdrawal({
			  blockchain: 'neo',
			  asset_id: 'SWTH',
			  amount: 2,
			})
			var withdrew = await switcheoTest.withdrawal.execute_withdrawl(withdrawal);
			return assert(withdrew.status === "confirming");
		})
	});	
						
})
