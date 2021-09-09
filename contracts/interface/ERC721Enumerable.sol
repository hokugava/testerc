//SPDX-License-Identifier: MIT
pragma solidity ^0.6.3;

import './IERC721.sol';

interface ERC721Enumerable is IERC721 {
    function totalSupply() external view returns (uint256);
    function tokenByIndex(uint256 _index) external view returns (uint256);
    function tokenOfOwnerByIndex(address _owner, uint256 _index) external view returns (uint256);
}