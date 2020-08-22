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
        
      await truffleAssert.reverts(
        this.contract.setShares(accounts[1],1001),
        "Should be less than 100"
      );

      await truffleAssert.fails(
        this.contract.setShares(accounts[1],0.1)
      );

      await truffleAssert.fails(
        this.contract.setShares(accounts[1],11.99)
      );
      
      await this.contract.setShares(accounts[2],10);
      let acc1 = await this.contract.shaccounts.call(0);
      let share_acc1 = await this.contract.accountMapping.call(acc1);
      let share_acc1_num = parseInt(share_acc1.percent.toString());
      assert.equal(await this.contract.shaccounts.call(0), accounts[2]);
      assert.equal(share_acc1_num, 10);

      await this.contract.setShares(accounts[3],50);
      let acc2 = await this.contract.shaccounts.call(1);
      let share_acc2 =  await this.contract.accountMapping.call(acc2);
      let share_acc2_num = parseInt(share_acc2.percent.toString());

      let total_pre = share_acc1_num + share_acc2_num;
      let check = false;
      if (total_pre <= 100) {
        check = true;
      } else {
        check = false
      }
      assert.equal(check, true);

      await this.contract.setShares(accounts[4],50);
      await truffleAssert.fails(
        this.contract.setShares(accounts[4],50),
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
      await this.contract.setShares(accounts[0],10);
      let share_acc = await this.contract.getShares(accounts[0]);
      let percent = parseInt(share_acc.percent.toString())
      let addr = share_acc.addr

      assert.equal(percent, 10);
      assert.equal(addr, accounts[0]);

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

  describe('disburse dividend', function() {
    beforeEach(async function() {
      this.tradeToken = await TradeToken.new({from: accounts[0]});
      this.baseToken = await BaseToken.new({from: accounts[0]});
      this.contract = await ExchangeDividend.new(this.baseToken.address,this.tradeToken.address,{from: accounts[0]});
    });

    it('should distribute dividend', async function () {
      await this.tradeToken.transfer(this.contract.address, web3.utils.toWei('100', 'ether'), {from: accounts[0]});
      await this.baseToken.transfer(this.contract.address, web3.utils.toWei('100', 'ether'), {from: accounts[0]});

      await this.contract.setShares(accounts[1],10);
      await this.contract.setShares(accounts[2],30);
      await this.contract.setShares(accounts[3],60);
      await this.contract.disburse();
      assert.equal(await this.tradeToken.balanceOf(accounts[1]), web3.utils.toWei('10', 'ether'));
      assert.equal(await this.tradeToken.balanceOf(accounts[2]), web3.utils.toWei('30', 'ether'));
      assert.equal(await this.tradeToken.balanceOf(accounts[3]), web3.utils.toWei('60', 'ether'));
      assert.equal(await this.baseToken.balanceOf(accounts[1]), web3.utils.toWei('10', 'ether'));
      assert.equal(await this.baseToken.balanceOf(accounts[2]), web3.utils.toWei('30', 'ether'));
      assert.equal(await this.baseToken.balanceOf(accounts[3]), web3.utils.toWei('60', 'ether'));



    }); 
  });


});