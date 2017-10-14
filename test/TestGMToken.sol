pragma solidity ^0.4.2;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/GMToken.sol";

contract TestGMToken {

  function testInitialBalanceUsingDeployedContract() {
    GMToken gmtoken = GMToken(DeployedAddresses.GMToken());

    Assert.equal(gmtoken.hasToken(), false, "We shouldn't yet have an address");

    gmtoken.newGM("ADisney", 1);

    Assert.equal(gmtoken.hasToken(), true, "We should have a token after creating one.");
  }
}
