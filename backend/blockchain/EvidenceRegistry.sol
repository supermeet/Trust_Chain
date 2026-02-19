// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract EvidenceRegistry {
    struct Evidence {
        bytes32 fileHash;
        uint256 timestamp;
        string caseId;
        string uploader;
        bool exists;
    }
    
    mapping(bytes32 => Evidence) public evidenceRecords;
    event EvidenceRegistered(bytes32 indexed fileHash, string caseId, uint256 timestamp);
    
    function register(bytes32 _fileHash, string memory _caseId, string memory _uploader) public {
        require(!evidenceRecords[_fileHash].exists, "Evidence already registered");
        evidenceRecords[_fileHash] = Evidence(_fileHash, block.timestamp, _caseId, _uploader, true);
        emit EvidenceRegistered(_fileHash, _caseId, block.timestamp);
    }
    
    function verify(bytes32 _fileHash) public view returns (bool exists, uint256 timestamp, string memory caseId) {
        Evidence memory e = evidenceRecords[_fileHash];
        return (e.exists, e.timestamp, e.caseId);
    }
}
