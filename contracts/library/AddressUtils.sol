//SPDX-License-Identifier: MIT
pragma solidity ^0.6.3;

library AddressUtils {
  /** 
   * @dev Returns whether the target address is a contract.
   * @param _addr Address to check.
   * @param addressCheck True if _addr is a contract, false if not.
   * @return addressCheck True if _addr is a contract, false if not.
   */
  function isContract(address _addr) internal view returns (bool addressCheck)
  {
    uint256 size;

    /**
     * XXX Currently there is no better way to check if there is a contract in an address than to
     * check the size of the code at that address.
     * See https://ethereum.stackexchange.com/a/14016/36603 for more details about how this works.
     * TODO: Check this again before the Serenity release, because all addresses will be
     * contracts then.
     */
    assembly { size := extcodesize(_addr) } // solhint-disable-line
    addressCheck = size > 0;
  }
}