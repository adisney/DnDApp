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
        GMs[msg.sender] = GM(name, id, true);
        return id;
    }

    function deleteMyself() public
    {
        GMs[msg.sender] = GM("", 0, false);
    }

  modifier onlyIfValid()
    {
        require(hasToken());
        _;
    }

    function hasToken() public view returns (bool) 
    {
        GM storage gm = GMs[msg.sender];
        return gm.isValue;
    }

    function getName() public view onlyIfValid() returns (string) 
    {
        GM storage gm = GMs[msg.sender];
        return gm.name;
    }

    function getID() public view onlyIfValid() returns (uint)
    {
        GM storage gm = GMs[msg.sender];
        require(gm.id != 0);
        return gm.id;
    }

    function getIsValue() public view onlyIfValid() returns (bool)
    {
        GM storage gm = GMs[msg.sender];
        require(gm.id != 0);
        return gm.isValue;
    }


    // Start Chronicle section


    // TODO: This is max path length, update when we figure out what our real path limit is.
    mapping (address => bytes32[]) chronicles; 

    function getNumChronicles(address player) public view returns(uint)
    {
        return chronicles[player].length;
    }

    function getChronicleForPlayerAt(address player, uint chronicleNumber) public view returns(bytes32)
    {
        require(chronicleNumber < getNumChronicles(player));
        return chronicles[player][chronicleNumber];
    }

    function addChronicle(bytes32 storageLocation, address playerAddress) public onlyIfValid()
    {
        chronicles[playerAddress].push(storageLocation);
    }
}
