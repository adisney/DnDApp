pragma solidity ^0.4.10;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/GMToken.sol";

contract TestGMToken {

  function testNewGMCreatesMyGMToken() {
    GMToken gmtoken = GMToken(DeployedAddresses.GMToken());

    Assert.equal(gmtoken.hasToken(), false, "We shouldn't yet have an address");

    gmtoken.newGM("ADisney", 1);

    Assert.equal(gmtoken.hasToken(), true, "We should have a token after creating one.");
  }

  function testNewLocalGMTokenWorks() {
      GMToken gmtoken = new GMToken();

      Assert.equal(gmtoken.hasToken(), false, "When we make a new instance of the contract, it shouldn't already have my token");
  }

  /*function testGMTokenHasMyName() {
       GMToken gmtoken = new GMToken();
       string memory name = "ADisney";
       gmtoken.newGM(name, 1);
       bool fEqual = sha3(name) == sha3(gmtoken.getName());
       Assert.equal(fEqual, true, "The name on my token should match what was passed in");
  }*/

  function testGMTokenHasMyID() {
       GMToken gmtoken = new GMToken();
       uint id = 1;
       gmtoken.newGM("ADisney", id);

       Assert.equal(gmtoken.getID(), id, "The name on my token should match what was passed in");
  }

    function testDeleteWorks() {
       GMToken gmtoken = new GMToken();
       uint id = 1;
       gmtoken.newGM("ADisney", id);

       Assert.equal(gmtoken.getID(), id, "The name on my token should match what was passed in");

       gmtoken.deleteMyself();

       Assert.equal(gmtoken.hasToken(), false, "After I delete myself, it shouldn't already have my token");
  }

  function stringToBytes32(string memory source) returns (bytes32 result) {
    assembly {
        result := mload(add(source, 32))
    }
}

  address testPlayerOne = 0xf6b0ed6c362b3dd9c4eb334b828ff7dff89f4d8c;

  function testAddOneChronicle() {
      GMToken gmtoken = new GMToken();
      uint id = 1;
      gmtoken.newGM("ADisney", id);

      bytes32 verifyChronicle = stringToBytes32("ThisIsChronicleOne");

      gmtoken.addChronicle(verifyChronicle, testPlayerOne);


      uint numChronicles = gmtoken.getNumChronicles(testPlayerOne);
      bytes32 chronicle = gmtoken.getChronicleForPlayerAt(testPlayerOne, 0);

      Assert.equal(numChronicles, 1, "We should have one chronicle");
      

      for (uint i = 0; i < chronicle.length; i++)
      {
        if (chronicle[i] != verifyChronicle[i])
        {
          Assert.fail("The string wasn't persisted correctly");
        }
      }
  }

    function testUserHasNoTokensIntially() {
      GMToken gmtoken = new GMToken();

      uint numChronicles = gmtoken.getNumChronicles(testPlayerOne);

      Assert.equal(numChronicles, 0, "We should have no chronicle");
  }

  function testAddOneChronicleNoTokenFails() {
    GMToken gmtoken = new GMToken();

      bytes32 verifyChronicle = stringToBytes32("ThisIsChronicleOne");

      gmtoken.addChronicle(verifyChronicle, testPlayerOne);
  }
}
