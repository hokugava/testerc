//SPDX-License-Identifier: MIT
pragma solidity ^0.6.3;

import "./Ownable.sol";
import './interface/IERC721.sol';
import './interface/ERC721Enumerable.sol';
import './interface/ERC721TokenReceiver.sol';
import './library/AddressUtils.sol';

contract ERC721Token is IERC721, ERC721Enumerable, Ownable{
    using AddressUtils for address;
    
    bytes4 internal constant MAGIC_ON_ERC721_RECEIVED = 0x150b7a02;
    address public creator;
    uint public price;
    uint public nextTokenId;
    uint[] public tokenIndexes;
    mapping(address => uint) internal ownerTokensCount;
    mapping(address => uint[]) internal ownerTokenIndexes;
    mapping(address => mapping(address => bool)) internal ownerToOperators;
    mapping(uint => address) internal tokenIdToOwner;
    mapping(uint => address) internal tokenToApprove;

    constructor (uint _totalSupply) public {
        creator = msg.sender;
        ownerTokensCount[creator] = _totalSupply;
        for(uint i = 0; i < _totalSupply; i++) {
            tokenIndexes.push(i+1);
            ownerTokenIndexes[creator].push(i+1);
        }
    }
    
    function mint() external onlyOwner{
        ownerTokensCount[creator]++;
        tokenIdToOwner[nextTokenId] = creator;
        emit Transfer(address(0), creator, nextTokenId);
        tokenIndexes.push(tokenIndexes.length + 1);
        ownerTokenIndexes[creator].push(ownerTokenIndexes[creator].length+1);
        nextTokenId++;
    }

    function balanceOf(address _owner) external view override returns (uint) {
        return ownerTokensCount[_owner];
    }

    function ownerOf(uint256 _tokenId) external view override returns (address) {
        return tokenIdToOwner[_tokenId];
    }

    function transferFrom(address _from, address _to, uint256 _tokenId) external payable override {
        _transfer(_from, _to, _tokenId);
    }

    function safeTransferFrom(address _from, address _to, uint256 _tokenId, bytes calldata data) external payable override {
        _safeTransferFrom(_from, _to, _tokenId, data);
    }

    function safeTransferFrom(address _from, address _to, uint256 _tokenId) public payable override {
        _safeTransferFrom(_from, _to, _tokenId, "");
    }

    function _safeTransferFrom(address _from, address _to, uint _tokenId, bytes memory data) internal {
       _transfer(_from, _to, _tokenId);
        
        if(_to.isContract()) {
          bytes4 retval = ERC721TokenReceiver(_to).onERC721Received(msg.sender, _from, _tokenId, data);
          require(retval == MAGIC_ON_ERC721_RECEIVED, 'recipient SC cannot handle ERC721 tokens');
        }
    }

    function setApprovalForAll(address _operator, bool _approved) external override {
        ownerToOperators[msg.sender][_operator] = _approved;
        emit ApprovalForAll(msg.sender, _operator, _approved);
    }
    
    function getApproved(uint256 _tokenId) external view override returns (address) {
        return tokenToApprove[_tokenId];
    }

    function isApprovedForAll(address _owner, address _operator) external view override returns (bool) {
        return ownerToOperators[_owner][_operator];
    }

    function approve(address _approved, uint256 _tokenId) external payable override {
        address owner = tokenIdToOwner[_tokenId];
        require(msg.sender == owner, "Not authorized");
        tokenToApprove[_tokenId] = _approved;
        emit Approval(owner, _approved, _tokenId);
    }

    function _transfer(address _from, address _to, uint _tokenId) internal canTransfer(_tokenId) {
        ownerTokensCount[_from] -= 1;
        ownerTokensCount[_to] += 1;
        tokenIdToOwner[_tokenId] = _to;
        emit Transfer(_from, _to, _tokenId);
    }

    modifier canTransfer(uint _tokenId) {
        address owner = tokenIdToOwner[_tokenId];
        require(owner == msg.sender || tokenToApprove[_tokenId] == msg.sender || ownerToOperators[owner][msg.sender] == true, "Transfer not authorized");
        _;
    }
    
    function totalSupply() external view override returns (uint256) {
        return tokenIndexes.length;
    }
    
    function tokenByIndex(uint256 _index) external view override returns (uint256) {
        require(_index < tokenIndexes.length);
        return tokenIndexes[_index];
    }
    
    function tokenOfOwnerByIndex(address _owner, uint256 _index) external view override returns (uint256) {
        require(_owner != address(0) && _index < ownerTokensCount[_owner]);
        return ownerTokenIndexes[_owner][_index];
    }

    function setTokenPrice(uint _price) public onlyOwner {
        price = _price;
    }
    
}