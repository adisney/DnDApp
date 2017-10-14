pragma solidity ^0.4.4;

contract GMToken {

    struct GM {
        string name;
        int32 id;
    }

    mapping (address => GM) GMs; 

    function newGM(string name, int32 id) {
    require(GMs[tx.origin].id == 0);
    GMs[beneficiary] = GM(name, id);
    }

    function hasToken() returns (bool) {
        return GMs[tx.origin].id > 0;
    }
}