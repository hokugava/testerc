const CatCoin = artifacts.require("CatCoin");

module.exports = function (deployer) {
  deployer.deploy(CatCoin);
};
