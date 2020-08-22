pragma solidity ^0.5.16;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20Detailed.sol";

contract TradeToken is ERC20, ERC20Detailed {
	constructor () public ERC20Detailed("TradeToken", "TT", 18) {
		_mint(msg.sender, 10000 * (10 ** 18));
    }
}