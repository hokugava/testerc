pragma solidity ^0.5.16;

contract CatCoin{
	// Constructor
	// Set the total num of tokens
	// Read the total num of tokens
	uint public totalSupply;

	constructor () public {
		totalSupply = 1000000;
	}
} 