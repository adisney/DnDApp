pragma solidity ^0.4.4;

contract GMToken {

    struct GM {
        string name;
        int32 id;
    }

    mapping (address => GM) GMs; 

    function newGM(string name, int32 id) public {
    require(GMs[tx.origin].id == 0);
    require(id > 0);
    GMs[tx.origin] = GM(name, id);
    }

    function hasToken() public returns (bool) {
        return GMs[tx.origin].id > 0;
    }

    function getName() public returns (string) {
        GM storage gm = GMs[tx.origin];
        require(gm.id != 0);
        return gm.name;
    }

    function getID() public returns (int32) {
        GM storage gm = GMs[tx.origin];
        require(gm.id != 0);
        return gm.id;
    }
}