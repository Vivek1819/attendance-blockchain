// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Attendance {
    address public owner;

    struct Student {
        string name;
        address wallet;
        bool exists;
    }

    // studentId => Student
    mapping(uint256 => Student) public students;
    // studentId => (dateKey => present)
    mapping(uint256 => mapping(uint256 => bool)) public attendance;

    event StudentRegistered(uint256 indexed id, string name, address wallet);
    event MarkedPresent(uint256 indexed id, uint256 indexed dateKey, address by);

    modifier onlyOwner() {
        require(msg.sender == owner, "only owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function registerStudent(uint256 id, string calldata name, address wallet) external onlyOwner {
        require(!students[id].exists, "already exists");
        students[id] = Student({name: name, wallet: wallet, exists: true});
        emit StudentRegistered(id, name, wallet);
    }

    // dateKey can be YYYYMMDD (e.g., 20251109) or any uint
    function markPresent(uint256 id, uint256 dateKey) external onlyOwner {
        require(students[id].exists, "no such student");
        attendance[id][dateKey] = true;
        emit MarkedPresent(id, dateKey, msg.sender);
    }

    function isPresent(uint256 id, uint256 dateKey) external view returns (bool) {
        return attendance[id][dateKey];
    }

    function getStudent(uint256 id) external view returns (string memory name, address wallet, bool exists) {
        Student storage s = students[id];
        return (s.name, s.wallet, s.exists);
    }
}
