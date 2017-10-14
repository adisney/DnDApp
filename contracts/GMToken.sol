pragma solidity ^0.4.4;

contract GMToken 
{

    struct GM 
    {
        string name;
        uint id;
        bool isValue;
    }

    mapping (address => GM) GMs; 

    function newGM(string name, uint id) public returns(uint) 
    {
        GMs[tx.origin] = GM(name, id, true);
        return id;
    }

    function deleteMyself() public
    {
        GMs[tx.origin] = GM("", 0, false);
    }

    function hasToken() public returns (bool) 
    {
        GM storage gm = GMs[tx.origin];
        return gm.isValue;
    }

    function getName() public returns (string) 
    {
        GM storage gm = GMs[tx.origin];
        require(gm.id != 0);
        return gm.name;
    }

    function getID() public returns (uint)
    {
        GM storage gm = GMs[tx.origin];
        require(gm.id != 0);
        return gm.id;
    }

    function getIsValue() public returns (bool)
    {
        GM storage gm = GMs[tx.origin];
        require(gm.id != 0);
        return gm.isValue;
    }
}
