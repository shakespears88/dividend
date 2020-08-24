pragma solidity ^0.5.16;


import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/ownership/Ownable.sol";

/**
 * The Dividend contract does this and that...
 */
contract ExchangeDividend is Ownable{
	using SafeMath for uint;

	address[] public shareHolders;
	mapping (address => uint) public shareHolderPercentage;

	address public basetoken;
	address public tradetoken;

	constructor(address _basetoken, address _tradetoken) public {
        basetoken = _basetoken;
        tradetoken = _tradetoken;
	}
	

	function dispense () public {
		uint basetokenBal = ERC20(basetoken).balanceOf(address(this));
		uint tradetokenBal = ERC20(tradetoken).balanceOf(address(this));
  		for(uint i = 0; i < shareHolders.length; i++) {
    		uint basetokendividend = (basetokenBal.mul(shareHolderPercentage[shareHolders[i]])).div(1e18);
    		uint tradetokendividend = (tradetokenBal.mul(shareHolderPercentage[shareHolders[i]])).div(1e18);
    		ERC20(basetoken).transfer(shareHolders[i], basetokendividend);
    		ERC20(tradetoken).transfer(shareHolders[i], tradetokendividend);
  		}
	}

	function setShares (address _addr, uint _percent) public onlyOwner {
		require(_percent<= 1e18, "Should be less than 100");
		uint total = 0;
		for(uint i = 0; i < shareHolders.length; i++) {
			total = total.add(shareHolderPercentage[shareHolders[i]]);
		}
		require(total<= 1e18, "Total should be less than 100");
        shareHolderPercentage[_addr] = _percent;
		shareHolders.push(_addr);
	}
	
	function getShares (address _addr) public view returns(uint percent) {
		return shareHolderPercentage[_addr];
	}
	
	function getShareHolderList () public view returns( address  [] memory){
    	return shareHolders;
		
	}

}
