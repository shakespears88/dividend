var ExchangeDividend = artifacts.require("./ExchangeDividend.sol");
const TradeToken = artifacts.require("./TradeToken.sol");
const BaseToken = artifacts.require("./BaseToken.sol");

module.exports = function(deployer, network, accounts) {
	deployer.deploy(BaseToken).then(function() {
		deployer.deploy(TradeToken).then(function() {
  			deployer.deploy(ExchangeDividend,BaseToken.address, TradeToken.address);
  		})
  	})
};