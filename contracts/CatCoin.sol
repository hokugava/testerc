//SPDX-License-Identifier: MIT
pragma solidity ^0.6.3;

import "./Ownable.sol";

contract CatCoin is Ownable {

	string public name = "Cat Coin";
	string public symbol = "CAT";
	uint8 public decimals = 18;

	uint256 public totalSupply;

	mapping(address => uint256) public balanceOf;
	mapping(address => mapping(address => uint256)) public allowance;

	constructor (uint256 _initialSupply) public {
		balanceOf[msg.sender] = _initialSupply;
		totalSupply = _initialSupply;
	}

	event Approval(address indexed _owner, address indexed _spender, uint256 _value);
  	event BurnCats(address indexed _burner, uint256 _value);
  	event MintCats(address indexed _to, uint256 _amount);
	event Transfer(address indexed _from, address indexed _to, uint256 _value);

	function transfer(address _to,uint256 _value) public payable returns (bool success) {
		require(balanceOf[msg.sender] >= _value && (balanceOf[_to] + _value) >= balanceOf[_to]);
		balanceOf[msg.sender] -= _value;
		balanceOf[_to] += _value;
		emit Transfer(msg.sender, _to, _value);
        return true;
	}

	function addition(uint8 _a, uint8 _b) public pure returns (uint8) {
		return _a+_b;
	}

	function approve(address _spender, uint256 _value) public returns (bool) {
		allowance[msg.sender][_spender] = _value;
        emit Approval(msg.sender, _spender, _value);
		return true;
	}

	function transferFrom(address _from, address _to, uint256 _value) public payable returns (bool) {
		require(_value <= balanceOf[_from] && _value <= allowance[_from][msg.sender]);
        balanceOf[_from] -= _value;
        balanceOf[_to] += _value;
        allowance[_from][msg.sender] -= _value;
		emit Transfer(_from, _to, _value);
		return true;
	}

	function mintCats(address _owner, uint256 _amount) public onlyOwner returns (bool){
		require(balanceOf[owner] + _amount <= totalSupply);
		balanceOf[owner] += _amount;
		totalSupply += _amount;
		emit MintCats(_owner,_amount);
		emit Transfer(address(0), _owner, _amount);
		return true;
	}

	function burnCats(uint256 _amount) public returns (bool success){
		require(_amount <= balanceOf[msg.sender]);
		balanceOf[msg.sender] -= _amount;
		totalSupply -= _amount;
		emit BurnCats(msg.sender,_amount);
		return true;
	}
}