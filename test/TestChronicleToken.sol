pragma solidity ^0.4.10;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/GMToken.sol";

contract TestChronicleToken {

  /*function testNewGMCreatesMyGMToken() {
    GMToken gmtoken = GMToken(DeployedAddresses.GMToken());

    Assert.equal(gmtoken.hasToken(), false, "We shouldn't yet have an address");

    gmtoken.newGM("ADisney", 1);

    Assert.equal(gmtoken.hasToken(), true, "We should have a token after creating one.");
  }

  function testNewLocalGMTokenWorks() {
      GMToken gmtoken = new GMToken();

      Assert.equal(gmtoken.hasToken(), false, "When we make a new instance of the contract, it shouldn't already have my token");
  } */

  /*function testGMTokenHasMyName() {
       GMToken gmtoken = new GMToken();
       string memory name = "ADisney";
       gmtoken.newGM(name, 1);
       bool fEqual = sha3(name) == sha3(gmtoken.getName());
       Assert.equal(fEqual, true, "The name on my token should match what was passed in");
  }*/

  /* function testGMTokenHasMyID() {
       GMToken gmtoken = new GMToken();
       int32 id = 1;
       gmtoken.newGM("ADisney", id);

       Assert.equal(gmtoken.getID(), id, "The name on my token should match what was passed in");
  } */
}
