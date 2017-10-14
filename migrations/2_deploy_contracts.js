var GMToken = artifacts.require("./GMToken.sol");

module.exports = function(deployer) {
  deployer.deploy(GMToken);
};
