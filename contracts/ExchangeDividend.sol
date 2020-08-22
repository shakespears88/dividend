pragma solidity ^0.5.16;


import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";

/**
 * The Dividend contract does this and that...
 */
contract ExchangeDividend {
	using SafeMath for uint;
	
	struct Account {
		address addr;
	  	uint percent;
	}
	mapping (address => Account) public accountMapping;
	address[] public shaccounts;
	address public basetoken;
	address public tradetoken;

	constructor(address _basetoken, address _tradetoken) public {
        basetoken = _basetoken;
        tradetoken = _tradetoken;
	}
	

	function disburse () public {
		uint basetokenBal = ERC20(basetoken).balanceOf(address(this));
		uint tradetokenBal = ERC20(tradetoken).balanceOf(address(this));
  		for(uint i = 0; i < shaccounts.length; i++) {
    		uint basetokendividend = (basetokenBal.mul(accountMapping[shaccounts[i]].percent)).div(100);
    		uint tradetokendividend = (tradetokenBal.mul(accountMapping[shaccounts[i]].percent)).div(100);
    		ERC20(basetoken).transfer(shaccounts[i], basetokendividend);
    		ERC20(tradetoken).transfer(shaccounts[i], tradetokendividend);
  		}
	}

	function setShares (address _addr, uint _percent) public {
		require(_percent<= 100, "Should be less than 100");
		uint total;
		for(uint i = 0; i < shaccounts.length; i++) {
			total = total + accountMapping[shaccounts[i]].percent;
		}
		require(total<= 100, "Total should be less than 100");
		accountMapping[_addr].addr = _addr;
        accountMapping[_addr].percent = _percent;
		shaccounts.push(_addr);
	}
	
	function getShares (address _addr) public view returns(address addr, uint percent) {
		Account memory ac = accountMapping[_addr];
		addr = ac.addr;
		percent = ac.percent;
		return (addr, percent);
	}
	
	function getShareHolderList () public view returns( address  [] memory){
    	return shaccounts;
		
	}
/*
	function resetShareHolders () returns(bool res) public {
		
	}
	*/
}
