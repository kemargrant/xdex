'use strict'

const https = require('https');
const { wallet } = require('@cityofzion/neon-js');

const endpoints = {
	//Balances
	"list_balances":{
		"path":"/v2/balances",
		"type":"GET"
	},		
	//Cancel
	"create_cancellation":{
		"path":"/v2/cancellations",
		"type":"POST"
	},	
	"execute_cancellation":{
		"path":"/v2/cancellations/:id/broadcast",
		"type":"POST"
	},		
	//Deposits
	"create_deposits":{
		"path":"/v2/deposits",
		"type":"POST"
	},	
	"execute_deposits":{
		"path":"/v2/deposits/:id/broadcast",
		"type":"POST"
	},		
	//Offers
	"list_offers":{
		"path":"/v2/offers",
		"type":"GET"
	},
	//Orders
	"list_orders":{
		"path":"/v2/orders",
		"type":"GET"
	},	
	"create_order":{
		"path":"/v2/orders",
		"type":"POST"
	},	
	"execute_order":{
		"path":"/v2/orders/:id/broadcast",
		"type":"POST"
	},				
	//Tickers
	"candlesticks":{
		"path":"/v2/tickers/candlesticks",
		"type":"GET"
	},
	"last_24_hours":{
		"path":"/v2/tickers/last_24_hours",
		"type":"GET"
	},
	"last_price":{
		"path":"/v2/tickers/last_price",
		"type":"GET"
	},	
	//Trades
	"list_trades":{
		"path":"/v2/trades",
		"type":"GET"
	},
	//Withdrawals	
	"create_withdrawal":{
		"path":"/v2/withdrawals",
		"type":"POST"
	},
	"execute_withdrawal":{
		"path":"/v2/withdrawals/:id/broadcast",
		"type":"POST"
	}				
}

//Sign an order
const signOrder = {
	"NEO":function(wif,makes,fills){
		const { tx } = require('@cityofzion/neon-js');
		const _makes = {}
		const _fills = {}
		for(let i=0;i < makes.length;i++){
			_makes[makes[i].id] = signMessage["NEO"](tx.serializeTransaction(makes[i].txn, false),wif);
		}
		for(let i=0;i < fills.length;i++){
			_fills[fills[i].id] = signMessage["NEO"](tx.serializeTransaction(fills[i].txn, false),wif);
		}		
		return {signatures:{makes:_makes,fills:_fills}}
	}
}

//Sign a message
const signMessage = {
	"NEO":function(messageToSign,wif){
		return wallet.generateSignature(messageToSign,wallet.getPrivateKeyFromWIF(wif));
	}
}

// Sign Requests
const signRequest = {
	"NEO":function(wif,rawParams,address){
		// 1. Serialize parameters into a string
		// Note that parameters must be ordered alphanumerically
		//const rawParams = { blockchain: 'neo', timestamp: 1529380859, apple: 'Z', }
		const stringify = require('json-stable-stringify')
		const parameterString = stringify(rawParams);
		//console.log(parameterString)
		// parameterString: '{"apple":"Z","blockchain":"neo","timestamp":1529380859}'

		// 2. Serialize the parameter string into a hex string
		const Neon = require('@cityofzion/neon-js');
		const parameterHexString = Neon.u.str2hexstring(parameterString);

		// 3. Zero pad parameterHexString.length into a two digit hex string
		const lengthHex = (parameterHexString.length / 2).toString(16).padStart(2, '0')
		// lengthHex: 37

		// 4. Concat lengthHex and parameterHexString
		const concatenatedString = lengthHex + parameterHexString

		// 5. Wrap concatenatedString in an empty neo transaction and serialize it
		const serializedTransaction = '010001f0' + concatenatedString + '0000'

		// 6. Sign serializedTransaction with the user's privateKey
		const signature = signMessage["NEO"](serializedTransaction,wif);

		// 7. Combine the raw parameters with the signature
		// to get the final parameters to send
		if(address){
			return { ...rawParams,address,signature }
		}
		return { signature }
	}
}

const signTransaction = {
	"NEO":function(transaction,wif){
		const { tx } = require('@cityofzion/neon-js');
		const serializedTxn = tx.serializeTransaction(transaction, false);
		return {signature:signMessage["NEO"](serializedTxn,wif)};
	}
}

function getTimestamp (){
	return new Date().getTime();
}

function switcheo(config){
	this.config = config;
	
	this.apiHost = config.api ? config.api :  this.apiHost;
	this.NEO.V2 = config.contract ? config.contract : this.NEO.V2
	
	this.balances = {
		"list_balances":(params)=>{
			return this.apiCall("list_balances",params)
		}
	}
	this.cancel = {
		"create_cancellation":(params)=>{
			if(params.blockchain === "neo"){
				delete params.blockchain;
				params.timestamp = getTimestamp();
				var address = wallet.getScriptHashFromPublicKey(wallet.getPublicKeyFromPrivateKey(wallet.getPrivateKeyFromWIF(this.config.NEO.wif)));		
				params = signRequest["NEO"](this.config.NEO.wif,params,address);
				return this.apiCall("create_cancellation",params)
					.then((response)=>{
						response.type = "NEO";
						return response;
					})
				}
		},
		"execute_cancellation":(pending)=>{
			if(pending.type === "NEO"){
				let signedTransaction = signTransaction["NEO"](pending.transaction,this.config.NEO.wif);
				signedTransaction.id = pending.id;
				return this.apiCall("execute_cancellation",signedTransaction);
			}
		}
	}
	this.deposit = {
		"create_deposits":(params)=>{
			if(params.blockchain === "neo"){
				if (params.asset_id === "NEO" && params.amount % 1 > 0){
					return console.log("Not a whole neo!")
				}
				params.timestamp = getTimestamp();
				params.contract_hash = this.NEO.V2;
				if(params.asset_id !== "NEO"){
					params.amount = this.toAssetAmount["NEO"](params.amount);
				}
				var address = wallet.getScriptHashFromPublicKey(wallet.getPublicKeyFromPrivateKey(wallet.getPrivateKeyFromWIF(this.config.NEO.wif)));		
				params = signRequest["NEO"](this.config.NEO.wif,params,address);
				return this.apiCall("create_deposits",params)
					.then((response)=>{
						response.type = "NEO";
						return response;
					})
				}
		},
		"execute_deposits":(pending)=>{
			if(pending.type === "NEO"){
				var signedTransaction = signTransaction["NEO"](pending.transaction,this.config.NEO.wif);
				signedTransaction.id = pending.id;
				return this.apiCall("execute_deposits",signedTransaction)
			}
		}
	}


	this.offers ={
		"list_offers":(params)=>{return this.apiCall("list_offers",params)}	
	}
	
	this.orders = {
		"list_orders":(params)=>{return this.apiCall("list_orders",params)},
		"create_order": (params)=>{
			if(params.blockchain === "neo"){
				params.price = params.price.toFixed(8);
				params.timestamp = getTimestamp();
				params.contract_hash = this.NEO.V2;
				params.want_amount = this.toAssetAmount["NEO"](params.want_amount);
				let address = wallet.getScriptHashFromPublicKey(wallet.getPublicKeyFromPrivateKey(wallet.getPrivateKeyFromWIF(this.config.NEO.wif)));		
				params = signRequest["NEO"](this.config.NEO.wif,params,address);			
				return this.apiCall("create_order",params)
					.then((response)=>{
						response.type = "NEO";
						return response;
					});
				}
		},
		"execute_order":(pending)=>{
			if(pending.type === "NEO"){
				var signatures = signOrder["NEO"](this.config.NEO.wif,pending.makes,pending.fills);
				signatures.id = pending.id;
				return this.apiCall("execute_order",signatures);
			}
		}
	}
	
	this.tickers ={
		"candlesticks":(params)=>{return this.apiCall("candlesticks",params)},
		"last_24_hours":(params)=>{return this.apiCall("last_24_hours",params)},
		"last_price":(params)=>{return this.apiCall("last_price",params)},
	}
	
	this.toAssetAmount = {
		"NEO":(amount)=>{
			const { BigNumber } = require('bignumber.js');
			const value = amount;
			const bigNumber = new BigNumber(value);
			const assetMultiplier = Math.pow(10, this.NEO.NEO_ASSET_PRECISION);
			return bigNumber.times(assetMultiplier).toFixed(0)	
		}
	}
	
	this.trades ={
		"list_trades":(params)=>{return this.apiCall("list_trades",params)}
	}
	
	this.withdrawal = {
	"create_withdrawal":(params)=>{
		if(params.blockchain === "neo"){
			if (params.asset_id === "NEO" && params.amount % 1 > 0){
				return console.log("Not a whole neo!")
			}
			params.timestamp = getTimestamp();
			params.contract_hash = this.NEO.V2;
			if(params.asset_id !== "NEO"){
				params.amount = this.toAssetAmount["NEO"](params.amount);
			}
			var address = wallet.getScriptHashFromPublicKey(wallet.getPublicKeyFromPrivateKey(wallet.getPrivateKeyFromWIF(this.config.NEO.wif)));		
			params = signRequest["NEO"](this.config.NEO.wif,params,address);
			return this.apiCall("create_withdrawal",params)
				.then((response)=>{
					response.type = "NEO";
					return response;
				})
			}
	},
	"execute_withdrawl":(transaction)=>{
		if(transaction.type === "NEO"){
			var timestamp = getTimestamp();
			var id = transaction.id
			var signedTransaction = signRequest["NEO"](this.config.NEO.wif,{id,timestamp});
			signedTransaction.id = id;
			signedTransaction.timestamp = timestamp;
			return this.apiCall("execute_withdrawal",signedTransaction).catch(console.error);			
		}
	}
}
}  

switcheo.prototype.apiCall = function(method,payload){
	return new Promise((resolve,reject)=>{
		if(!endpoints[method]){
			return reject("Endpoint does not exist")
		}
		let parameters = "";
		let path = endpoints[method].path;
		let options = {
				hostname: this.apiHost,
				method: endpoints[method].type,
		}
		if(endpoints[method].path.search(":id") > -1){
			path = endpoints[method].path.replace(":id",payload.id);
		}				
		if(payload && endpoints[method].type === "GET"){
			parameters += "?"
			Object.keys(payload).map((key)=>{
				parameters += key +"="+ payload[key] +"&"
			});
			parameters = parameters.slice(0, parameters.length-1);
		}
		options.path = path + parameters;
		console.log("https://"+ this.apiHost+ path + parameters);
		if(endpoints[method].type === "POST"){
			const stringify = require('json-stable-stringify')
			payload = stringify(payload);
			options.headers = {
					'Content-Type': 'application/json',
					'Content-Length': payload.length
			}
		}
		const req = https.request(options,(response)=>{
			let body = "";
			response.on("data",(d)=>{
				body += d;
			});
			response.on("end",()=>{
				try{body = JSON.parse(body);}
				catch(e){
					return reject({error:response.statusCode,path:endpoints[method].path});
				}
				if(body && body.error){
					//console.log("Bad parameters:",endpoints[method].path,payload);
					return reject({error:body.error,path:endpoints[method].path})
				}
				//console.log(endpoints[method],body);
				return resolve(body);
			});
			response.on('error',(e)=>{
				return reject({error:e,path});
			})
		});
		if(endpoints[method].type === "POST"){
			req.write(payload);
		}
		req.end();
	})
}
  
switcheo.prototype.apiHost = "test-api.switcheo.network"

switcheo.prototype.NEO = {
	 "NEO_ASSET_PRECISION":8,
	 "V2":"a195c1549e7da61b8da315765a790ac7e7633b82"
}

module.exports = switcheo 
