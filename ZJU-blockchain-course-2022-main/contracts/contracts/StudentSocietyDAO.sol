// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

// Uncomment the line to use openzeppelin/ERC20
// You can use this dependency directly because it has been installed already
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
//import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "./MyERC20.sol";

// Uncomment this line to use console.log
import "hardhat/console.sol";

contract StudentSocietyDAO {

    // use a event if you want
    //event ProposalInitiated(uint32 proposalIndex);
    

    struct Proposal {
        uint32 index;      // index of this proposal
        address proposer;  // who make this proposal
        uint256 startTime; // proposal start time
        uint256 duration;  // proposal duration
        string name;       // proposal name
        uint32 result; 
        bool finish;// ...
        // TODO add any member if you want
    }


    struct Student{
        bool exist;
        address studentid;
        uint32 proposalID;
        uint32 success;
        string name;
        uint32[] proposals;
        uint256 giftget;
    }

    MyERC20 public studentERC20;
    //ERC721 public studentERC721;
    uint32 public propid;

    uint32 public VOTE;
    uint32 public PROPUP;
    uint32 public BONUS;
    
    mapping(uint32 => Proposal) proposals; // A map from proposal index to proposal
    mapping(address=>Student) students;// ...
    


    constructor() {
        // maybe you need a constructor
        //studentERC20 = new ERC20(100);
       // studentERC721 = new ERC721();
        propid = 1;
        PROPUP = 5;
        VOTE = 1;
        BONUS = 10;
    }


    function getInformation() external returns (uint) {
        studentERC20.approve(address(this), 200);
        studentERC20.approve(msg.sender, 200);
        return studentERC20.allowance(msg.sender, address(this));
    }

    function getToken() external {
        studentERC20.transfer(msg.sender, 100);
    }

    function addpropsal(string memory name, uint256 duration) external {
        require(students[msg.sender].exist, "please log in");
        require(studentERC20.allowance(msg.sender, address(this)) >= PROPUP,"insufficient fund");
        require(students[msg.sender].proposalID == 0,"You have a propose already");
        proposals[propid] = Proposal(
            propid,
            msg.sender,
            block.timestamp,
            duration, 
            name,
            0,
            false
        );
        students[msg.sender].proposalID = propid;
        students[msg.sender].proposals.push(propid);
        propid++;

        studentERC20.transferFrom(msg.sender, address(this), PROPUP);

    }

    function check(uint32 id) public {
        if ((!proposals[id].finish) &&(proposals[id].startTime + proposals[id].duration <= block.timestamp)) {
            proposals[id].finish = true;

            if (proposals[id].result >= 0) {
                students[proposals[id].proposer].success++;
            } else {
                students [proposals[id].proposer].proposalID = 0;
            }
        }
    }

    function VoteY(uint32 id) external {
        require(students[msg.sender].exist, "please log in");
        require(proposals[id].index != 0, "no proposal");
        //require(proposals[id].proposer != msg.sender,"you cannot vote for yourself");
        require(proposals[id].finish == false, "proposal finished");
        require(studentERC20.balanceOf(msg.sender) >= VOTE,"insufficient fund");

        studentERC20.transferFrom(msg.sender, address(this), VOTE);
        proposals[id].result++;
    }

    function VoteN(uint32 id) external {
        require(students[msg.sender].exist, "please log in");
        require(proposals[id].index != 0, "no proposal");
        //require(proposals[id].proposer != msg.sender,"you cannot vote for yourself");
        require(proposals[id].finish == false, "proposal finished");
        require(studentERC20.balanceOf(msg.sender) >= VOTE,"insufficient fund");

        studentERC20.transferFrom(msg.sender, address(this), VOTE);
        proposals[id].result--;
    }


    function Bonus() external {
        require(students[msg.sender].exist, "please log in");


        require(proposals[students[msg.sender].proposalID].finish, "during voting...");
        require(proposals[students[msg.sender].proposalID].result >= 0," proposal do not pass");

        
        studentERC20.transfer(msg.sender, BONUS);    
    }




    //function gift(uint32 id) external returns (string memory) {
        //require(students[msg.sender].exist, "please log in");
        //require(students[msg.sender].success >= 3,"you cannot receive gift");
        //require(students[msg.sender].giftget != 0,"you have received the gift");
        //students[msg.sender].giftget = studentERC721.award(msg.sender);    
    //}



}
