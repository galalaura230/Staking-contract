var TokenMock = artifacts.require("./TokenMock.sol");
var LpStaking = artifacts.require("./LpStaking.sol");

module.exports = function (deployer) {
  deployer.deploy(TokenMock);
  deployer.deploy(LpStaking);
};
