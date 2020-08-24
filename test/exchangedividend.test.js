import { expect } from 'chai';

require('chai')
  .use(require('chai-as-promised'))
  .should();

const truffleAssert = require('truffle-assertions');

const ExchangeDividend = artifacts.require('./ExchangeDividend');
const TradeToken = artifacts.require("./TradeToken.sol");
const BaseToken = artifacts.require("./BaseToken.sol");

contract('ExchangeDividend', function(accounts) {

  describe('constructor', function() {
    it('should construct with the appropriate initial state', async function() {
      const tradeToken = await TradeToken.new({from: accounts[0]});
      const baseToken = await BaseToken.new({from: accounts[0]});
      const contract = await ExchangeDividend.new(baseToken.address,tradeToken.address,{from: accounts[0]});

      assert.equal(await contract.tradetoken.call(), tradeToken.address);
      assert.equal(await contract.basetoken.call(), baseToken.address);
      assert.equal((await baseToken.balanceOf(contract.address)), 0);
      assert.equal((await tradeToken.balanceOf(contract.address)), 0);
    })
  })


  describe('set share holders', function() {
    beforeEach(async function() {
      this.tradeToken = await TradeToken.new({from: accounts[0]});
      this.baseToken = await BaseToken.new({from: accounts[0]});
      this.contract = await ExchangeDividend.new(this.baseToken.address,this.tradeToken.address,{from: accounts[0]});

    });

    it('should set multiple shareholders, total shares less than 100, and no decimal percentage shares', async function () {
      //let dd = web3.utils.toWei((1001*10**18).toString,'ether');
      //console.log(dd);
      await truffleAssert.reverts(
        this.contract.setShares(accounts[1],web3.utils.toWei('1010000000000000000', 'wei')),
        "Should be less than 100"
      );
      
      await this.contract.setShares(accounts[2],web3.utils.toWei('100000000000000000', 'wei'));
      let acc1 = await this.contract.shareHolders.call(0);
      let share_acc1 = await this.contract.shareHolderPercentage.call(acc1);
      //console.log((share_acc1).toString());
      let share_acc1_num = parseInt(share_acc1.toString());
      assert.equal(await this.contract.shareHolders.call(0), accounts[2]);
      assert.equal(share_acc1_num, web3.utils.toWei('100000000000000000', 'wei'));

      await this.contract.setShares(accounts[3],web3.utils.toWei('500000000000000000', 'wei'));
      let acc2 = await this.contract.shareHolders.call(1);
      let share_acc2 =  await this.contract.shareHolderPercentage.call(acc2);
      let share_acc2_num = parseInt(share_acc2.toString());

      let total_pre = share_acc1_num + share_acc2_num;
      let check = false;
      if (total_pre <= 1000000000000000000) {
        check = true;
      } else {
        check = false
      }
      assert.equal(check, true);

      await this.contract.setShares(accounts[4],web3.utils.toWei('500000000000000000', 'wei'));
      await truffleAssert.fails(
        this.contract.setShares(accounts[4],web3.utils.toWei('500000000000000000', 'wei')),
        "Total should be less than 100"
      );
    }); 
  });

  describe('get share holder shares', function() {
    beforeEach(async function() {
      this.tradeToken = await TradeToken.new({from: accounts[0]});
      this.baseToken = await BaseToken.new({from: accounts[0]});
      this.contract = await ExchangeDividend.new(this.baseToken.address,this.tradeToken.address,{from: accounts[0]});
    });

    it('should get multiple shareholders', async function () {
      await this.contract.setShares(accounts[0],web3.utils.toWei('100000000000000000', 'wei'));
      let share_acc = await this.contract.getShares(accounts[0]);
      let percent = parseInt(share_acc)

      assert.equal(percent, 100000000000000000);

    }); 
  });

  describe('get share holder list', function() {
    beforeEach(async function() {
      this.tradeToken = await TradeToken.new({from: accounts[0]});
      this.baseToken = await BaseToken.new({from: accounts[0]});
      this.contract = await ExchangeDividend.new(this.baseToken.address,this.tradeToken.address,{from: accounts[0]});
    });

    it('should get shareholders list', async function () {
      await this.contract.setShares(accounts[0],10);
      await this.contract.setShares(accounts[1],30);
      await this.contract.setShares(accounts[2],2);
      
      let share_list = await this.contract.getShareHolderList();
      expect(share_list).to.deep.equal( accounts.slice(0, 3));
    }); 
  });

  describe('dispense dividend', function() {
    beforeEach(async function() {
      this.tradeToken = await TradeToken.new({from: accounts[0]});
      this.baseToken = await BaseToken.new({from: accounts[0]});
      this.contract = await ExchangeDividend.new(this.baseToken.address,this.tradeToken.address,{from: accounts[0]});
    });

    it('should distribute dividend', async function () {
      await this.tradeToken.transfer(this.contract.address, web3.utils.toWei('100', 'ether'), {from: accounts[0]});
      await this.baseToken.transfer(this.contract.address, web3.utils.toWei('100', 'ether'), {from: accounts[0]});

      await this.contract.setShares(accounts[1],web3.utils.toWei('150000000000000000', 'wei'));
      await this.contract.setShares(accounts[2],web3.utils.toWei('50000000000000000', 'wei'));
      await this.contract.setShares(accounts[3],web3.utils.toWei('300000000000000000', 'wei'));
      await this.contract.setShares(accounts[4],web3.utils.toWei('500000000000000000', 'wei'));
      await this.contract.dispense();
      assert.equal(await this.tradeToken.balanceOf(accounts[1]), web3.utils.toWei('15', 'ether'));
      assert.equal(await this.tradeToken.balanceOf(accounts[2]), web3.utils.toWei('5', 'ether'));
      assert.equal(await this.tradeToken.balanceOf(accounts[3]), web3.utils.toWei('30', 'ether'));
      assert.equal(await this.tradeToken.balanceOf(accounts[4]), web3.utils.toWei('50', 'ether'));
      assert.equal(await this.baseToken.balanceOf(accounts[1]), web3.utils.toWei('15', 'ether'));
      assert.equal(await this.baseToken.balanceOf(accounts[2]), web3.utils.toWei('5', 'ether'));
      assert.equal(await this.baseToken.balanceOf(accounts[3]), web3.utils.toWei('30', 'ether'));
      assert.equal(await this.baseToken.balanceOf(accounts[4]), web3.utils.toWei('50', 'ether'));

    }); 
  });


});