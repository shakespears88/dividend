pragma solidity ^0.5.16;


import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/ownership/Ownable.sol";

/**
 * The Dividend contract does this and that...
 */
contract ExchangeDividend is Ownable {
	using SafeMath for uint;

	address public feeDestinationOne;
	uint public feeDestinationOnePercentage;
	address public feeDestinationTwo;
	uint public feeDestinationTwoPercentage;

	address[] public shareHolders;
	mapping (address => uint) public shareHolderPercentage;

	constructor(address _feeDestinationOne,
							uint _feeDestinationOnePercentage,
							address _feeDestinationTwo,
							uint _feeDestinationTwoPercentage)
							public
	{
		feeDestinationOne = _feeDestinationOne;
		feeDestinationOnePercentage = _feeDestinationOnePercentage;
		feeDestinationTwo = _feeDestinationTwo;
		feeDestinationTwoPercentage = _feeDestinationTwoPercentage;
	}

	function dispense (address _token) public {
		uint amountToDisburse = ERC20(_token).balanceOf(address(this));
		// dispense for feeDestinationOne
		ERC20(_token).transfer(feeDestinationOne, amountToDisburse.mul(feeDestinationOnePercentage).div(1e18));
		// dispense for feeDestinationTwo
		ERC20(_token).transfer(feeDestinationTwo, amountToDisburse.mul(feeDestinationTwoPercentage).div(1e18));
		// dispense for shareHolders
		uint amountLeft = amountToDisburse.mul(uint(1e18).sub(feeDestinationOnePercentage).sub(feeDestinationTwoPercentage)).div(1e18);
		for(uint i = 0; i < shareHolders.length; i++) {
  		ERC20(_token).transfer(shareHolders[i], amountLeft.mul(shareHolderPercentage[shareHolders[i]]).div(1e18));
		}
	}

	function setShares (address _shareHolder, uint _percentage)
		public
		onlyOwner
	{
		require(_percentage <= 1e18, "Should be less than 100 percent");

		shareHolderPercentage[_shareHolder] = _percentage;
		shareHolders.push(_shareHolder);

		uint total = 0;
		for(uint i = 0; i < shareHolders.length; i++) {
			total = total.add(shareHolderPercentage[shareHolders[i]]);
		}
		require(total <= 1e18, "Total should be less than 100 percent");
	}

	function getShares (address _shareHolder) public view returns (uint) {
		return shareHolderPercentage[_shareHolder];
	}

	function getShareHolders () public view returns(address [] memory) {
  	return shareHolders;
	}
}
