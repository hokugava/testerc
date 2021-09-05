const CatCoin = artifacts.require("CatCoin");
const Ownable = artifacts.require("Ownable");
const ERC721Token = artifacts.require("ERC721Token");

module.exports = function (deployer) {
  deployer.deploy(CatCoin,1000000);
  deployer.deploy(Ownable);
  deployer.deploy(ERC721Token, 0);
};
