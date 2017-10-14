pragma solidity ^0.4.4;

contract GMToken {

    struct GM {
        string name;
        int32 id;
    }

    mapping (address => GM) GMs; 

    function newGM(address beneficiary, string name, int32 id) {
    require(GMs[beneficiary].id == 0);
    GMs[beneficiary] = GM(name, id);
    }

    
}