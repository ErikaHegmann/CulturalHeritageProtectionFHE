// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { FHE, euint32, euint64, ebool } from "@fhevm/solidity/lib/FHE.sol";
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

/**
 * @title CulturalHeritageProtection
 * @notice Privacy-preserving cultural artifact management using FHE with Gateway callback pattern
 * @dev Implements refund mechanism, timeout protection, and secure decryption via Gateway
 */
contract CulturalHeritageProtection is SepoliaConfig {

    address public curator;
    uint32 public totalArtifacts;
    uint256 public constant DECRYPTION_TIMEOUT = 1 days;
    uint256 public constant REGISTRATION_FEE = 0.01 ether;
    uint256 public platformFees;

    struct HeritageArtifact {
        euint32 encryptedId;
        euint64 encryptedValue;
        euint32 encryptedAge;
        ebool isAuthentic;
        bool isActive;
        address owner;
        uint256 timestamp;
        string category;
        uint256 registrationFee;
        uint256 decryptionRequestId;
        bool isDecryptionPending;
        uint256 decryptionRequestTime;
    }

    struct AccessRecord {
        address accessor;
        uint256 accessTime;
        string purpose;
        bool approved;
    }

    struct DecryptionRequest {
        uint32 artifactIndex;
        address requester;
        uint256 timestamp;
        bool isProcessed;
        bool isRefunded;
    }

    mapping(uint32 => HeritageArtifact) public artifacts;
    mapping(uint32 => mapping(address => bool)) public authorizedViewers;
    mapping(uint32 => AccessRecord[]) public accessHistory;
    mapping(address => bool) public certifiedExperts;
    mapping(uint256 => DecryptionRequest) public decryptionRequests;
    mapping(uint256 => uint32) internal artifactByRequestId;

    event ArtifactRegistered(uint32 indexed artifactIndex, address indexed owner, string category);
    event AccessGranted(uint32 indexed artifactIndex, address indexed viewer, string purpose);
    event AccessRevoked(uint32 indexed artifactIndex, address indexed viewer);
    event AuthenticityVerified(uint32 indexed artifactIndex, bool authentic);
    event ExpertCertified(address indexed expert, bool certified);
    event DecryptionRequested(uint32 indexed artifactIndex, uint256 requestId, address requester);
    event DecryptionCompleted(uint32 indexed artifactIndex, uint256 requestId);
    event DecryptionFailed(uint32 indexed artifactIndex, uint256 requestId, string reason);
    event RefundIssued(uint32 indexed artifactIndex, address indexed user, uint256 amount);
    event PlatformFeesWithdrawn(address indexed to, uint256 amount);

    modifier onlyCurator() {
        require(msg.sender == curator, "Not authorized curator");
        _;
    }

    modifier onlyAuthorized(uint32 _artifactIndex) {
        require(
            msg.sender == artifacts[_artifactIndex].owner ||
            authorizedViewers[_artifactIndex][msg.sender] ||
            certifiedExperts[msg.sender],
            "Not authorized to view artifact"
        );
        _;
    }

    modifier onlyExpert() {
        require(certifiedExperts[msg.sender], "Not a certified expert");
        _;
    }

    modifier validArtifactIndex(uint32 _artifactIndex) {
        require(_artifactIndex < totalArtifacts, "Artifact does not exist");
        _;
    }

    modifier nonZeroAddress(address _address) {
        require(_address != address(0), "Invalid address: zero address");
        _;
    }

    constructor() {
        curator = msg.sender;
        totalArtifacts = 0;
    }

    /**
     * @notice Register a new cultural heritage artifact with encrypted data
     * @dev Uses registration fee to fund potential refunds for failed decryptions
     * @param _id Artifact identifier (will be encrypted)
     * @param _value Artifact estimated value (will be encrypted)
     * @param _age Artifact age in years (will be encrypted)
     * @param _isAuthentic Initial authenticity status (will be encrypted)
     * @param _category Artifact category (stored as plaintext for filtering)
     */
    function registerArtifact(
        uint32 _id,
        uint64 _value,
        uint32 _age,
        bool _isAuthentic,
        string memory _category
    ) external payable {
        require(_id > 0, "Invalid artifact ID: must be positive");
        require(bytes(_category).length > 0, "Category required: cannot be empty");
        require(msg.value >= REGISTRATION_FEE, "Insufficient registration fee");

        // Add excess payment to platform fees
        if (msg.value > REGISTRATION_FEE) {
            platformFees += (msg.value - REGISTRATION_FEE);
        }

        // Encrypt sensitive artifact data
        euint32 encryptedId = FHE.asEuint32(_id);
        euint64 encryptedValue = FHE.asEuint64(_value);
        euint32 encryptedAge = FHE.asEuint32(_age);
        ebool isAuthentic = FHE.asEbool(_isAuthentic);

        artifacts[totalArtifacts] = HeritageArtifact({
            encryptedId: encryptedId,
            encryptedValue: encryptedValue,
            encryptedAge: encryptedAge,
            isAuthentic: isAuthentic,
            isActive: true,
            owner: msg.sender,
            timestamp: block.timestamp,
            category: _category,
            registrationFee: REGISTRATION_FEE,
            decryptionRequestId: 0,
            isDecryptionPending: false,
            decryptionRequestTime: 0
        });

        // Grant contract access to encrypted data
        FHE.allowThis(encryptedId);
        FHE.allowThis(encryptedValue);
        FHE.allowThis(encryptedAge);
        FHE.allowThis(isAuthentic);

        // Grant owner access to their encrypted data
        FHE.allow(encryptedId, msg.sender);
        FHE.allow(encryptedValue, msg.sender);
        FHE.allow(encryptedAge, msg.sender);
        FHE.allow(isAuthentic, msg.sender);

        emit ArtifactRegistered(totalArtifacts, msg.sender, _category);
        totalArtifacts++;
    }

    /**
     * @notice Grant access to view encrypted artifact data
     * @dev Implements fine-grained access control with audit trail
     * @param _artifactIndex Index of the artifact
     * @param _viewer Address to grant access to
     * @param _purpose Reason for granting access (audit trail)
     */
    function grantAccess(
        uint32 _artifactIndex,
        address _viewer,
        string memory _purpose
    ) external validArtifactIndex(_artifactIndex) nonZeroAddress(_viewer) {
        require(
            msg.sender == artifacts[_artifactIndex].owner ||
            msg.sender == curator,
            "Not authorized to grant access"
        );
        require(bytes(_purpose).length > 0, "Purpose required for audit trail");

        authorizedViewers[_artifactIndex][_viewer] = true;

        accessHistory[_artifactIndex].push(AccessRecord({
            accessor: _viewer,
            accessTime: block.timestamp,
            purpose: _purpose,
            approved: true
        }));

        HeritageArtifact storage artifact = artifacts[_artifactIndex];
        FHE.allow(artifact.encryptedId, _viewer);
        FHE.allow(artifact.encryptedValue, _viewer);
        FHE.allow(artifact.encryptedAge, _viewer);
        FHE.allow(artifact.isAuthentic, _viewer);

        emit AccessGranted(_artifactIndex, _viewer, _purpose);
    }

    /**
     * @notice Revoke access to view encrypted artifact data
     * @param _artifactIndex Index of the artifact
     * @param _viewer Address to revoke access from
     */
    function revokeAccess(uint32 _artifactIndex, address _viewer)
        external
        validArtifactIndex(_artifactIndex)
    {
        require(
            msg.sender == artifacts[_artifactIndex].owner ||
            msg.sender == curator,
            "Not authorized to revoke access"
        );

        authorizedViewers[_artifactIndex][_viewer] = false;

        emit AccessRevoked(_artifactIndex, _viewer);
    }

    /**
     * @notice Request authenticity verification via Gateway callback
     * @dev Uses Gateway decryption pattern for async processing with timeout protection
     * @param _artifactIndex Index of the artifact to verify
     */
    function verifyAuthenticity(uint32 _artifactIndex)
        external
        onlyExpert
        validArtifactIndex(_artifactIndex)
    {
        HeritageArtifact storage artifact = artifacts[_artifactIndex];
        require(!artifact.isDecryptionPending, "Decryption already pending");

        bytes32[] memory cts = new bytes32[](1);
        cts[0] = FHE.toBytes32(artifact.isAuthentic);

        uint256 requestId = FHE.requestDecryption(cts, this.processAuthenticityResult.selector);

        artifact.decryptionRequestId = requestId;
        artifact.isDecryptionPending = true;
        artifact.decryptionRequestTime = block.timestamp;

        artifactByRequestId[requestId] = _artifactIndex;

        decryptionRequests[requestId] = DecryptionRequest({
            artifactIndex: _artifactIndex,
            requester: msg.sender,
            timestamp: block.timestamp,
            isProcessed: false,
            isRefunded: false
        });

        emit DecryptionRequested(_artifactIndex, requestId, msg.sender);
    }

    /**
     * @notice Gateway callback to process authenticity verification result
     * @dev Implements secure callback pattern with signature verification
     * @param requestId Unique identifier for the decryption request
     * @param cleartexts Decrypted plaintext data from Gateway
     * @param decryptionProof Cryptographic proof of correct decryption
     */
    function processAuthenticityResult(
        uint256 requestId,
        bytes memory cleartexts,
        bytes memory decryptionProof
    ) external {
        // Verify the decryption proof and signatures
        FHE.checkSignatures(requestId, cleartexts, decryptionProof);

        DecryptionRequest storage request = decryptionRequests[requestId];
        require(!request.isProcessed, "Request already processed");

        uint32 artifactIndex = artifactByRequestId[requestId];
        HeritageArtifact storage artifact = artifacts[artifactIndex];

        bool authentic = abi.decode(cleartexts, (bool));

        artifact.isDecryptionPending = false;
        request.isProcessed = true;

        emit AuthenticityVerified(artifactIndex, authentic);
        emit DecryptionCompleted(artifactIndex, requestId);
    }

    /**
     * @notice Request refund if decryption times out
     * @dev Implements timeout protection to prevent permanent fund locking
     * @param requestId Decryption request ID that timed out
     */
    function requestDecryptionRefund(uint256 requestId) external {
        DecryptionRequest storage request = decryptionRequests[requestId];
        require(request.requester != address(0), "Request does not exist");
        require(msg.sender == request.requester, "Not the requester");
        require(!request.isProcessed, "Request already processed");
        require(!request.isRefunded, "Refund already issued");
        require(
            block.timestamp >= request.timestamp + DECRYPTION_TIMEOUT,
            "Timeout period not elapsed"
        );

        uint32 artifactIndex = request.artifactIndex;
        HeritageArtifact storage artifact = artifacts[artifactIndex];

        artifact.isDecryptionPending = false;
        request.isRefunded = true;

        // Issue refund from artifact registration fee
        uint256 refundAmount = artifact.registrationFee / 2; // Partial refund
        artifact.registrationFee -= refundAmount;

        (bool sent, ) = payable(msg.sender).call{value: refundAmount}("");
        require(sent, "Refund transfer failed");

        emit DecryptionFailed(artifactIndex, requestId, "Timeout");
        emit RefundIssued(artifactIndex, msg.sender, refundAmount);
    }

    /**
     * @notice Certify or revoke expert status
     * @param _expert Address of the expert
     * @param _certified True to certify, false to revoke
     */
    function certifyExpert(address _expert, bool _certified)
        external
        onlyCurator
        nonZeroAddress(_expert)
    {
        certifiedExperts[_expert] = _certified;
        emit ExpertCertified(_expert, _certified);
    }

    /**
     * @notice Get public artifact information (non-encrypted fields)
     * @param _artifactIndex Index of the artifact
     */
    function getArtifactInfo(uint32 _artifactIndex)
        external
        view
        onlyAuthorized(_artifactIndex)
        validArtifactIndex(_artifactIndex)
        returns (
            bool isActive,
            address owner,
            uint256 timestamp,
            string memory category
        )
    {
        HeritageArtifact storage artifact = artifacts[_artifactIndex];
        return (
            artifact.isActive,
            artifact.owner,
            artifact.timestamp,
            artifact.category
        );
    }

    /**
     * @notice Get access history for an artifact
     * @dev Implements comprehensive audit trail
     * @param _artifactIndex Index of the artifact
     */
    function getAccessHistory(uint32 _artifactIndex)
        external
        view
        validArtifactIndex(_artifactIndex)
        returns (
            address[] memory accessors,
            uint256[] memory accessTimes,
            string[] memory purposes,
            bool[] memory approvals
        )
    {
        require(
            msg.sender == artifacts[_artifactIndex].owner ||
            msg.sender == curator ||
            certifiedExperts[msg.sender],
            "Not authorized to view access history"
        );

        AccessRecord[] storage records = accessHistory[_artifactIndex];
        uint256 length = records.length;

        accessors = new address[](length);
        accessTimes = new uint256[](length);
        purposes = new string[](length);
        approvals = new bool[](length);

        for (uint256 i = 0; i < length; i++) {
            accessors[i] = records[i].accessor;
            accessTimes[i] = records[i].accessTime;
            purposes[i] = records[i].purpose;
            approvals[i] = records[i].approved;
        }

        return (accessors, accessTimes, purposes, approvals);
    }

    /**
     * @notice Check if an address is authorized to view an artifact
     * @param _artifactIndex Index of the artifact
     * @param _viewer Address to check
     */
    function isAuthorizedViewer(uint32 _artifactIndex, address _viewer)
        external
        view
        validArtifactIndex(_artifactIndex)
        returns (bool)
    {
        return authorizedViewers[_artifactIndex][_viewer] ||
               _viewer == artifacts[_artifactIndex].owner ||
               certifiedExperts[_viewer];
    }

    /**
     * @notice Get total number of registered artifacts
     */
    function getTotalArtifacts() external view returns (uint32) {
        return totalArtifacts;
    }

    /**
     * @notice Transfer artifact ownership to a new owner
     * @dev Maintains encrypted data access for new owner
     * @param _artifactIndex Index of the artifact
     * @param _newOwner Address of the new owner
     */
    function transferOwnership(uint32 _artifactIndex, address _newOwner)
        external
        validArtifactIndex(_artifactIndex)
        nonZeroAddress(_newOwner)
    {
        require(msg.sender == artifacts[_artifactIndex].owner, "Only owner can transfer");

        artifacts[_artifactIndex].owner = _newOwner;

        HeritageArtifact storage artifact = artifacts[_artifactIndex];
        FHE.allow(artifact.encryptedId, _newOwner);
        FHE.allow(artifact.encryptedValue, _newOwner);
        FHE.allow(artifact.encryptedAge, _newOwner);
        FHE.allow(artifact.isAuthentic, _newOwner);
    }

    /**
     * @notice Deactivate an artifact (soft delete)
     * @param _artifactIndex Index of the artifact
     */
    function deactivateArtifact(uint32 _artifactIndex)
        external
        validArtifactIndex(_artifactIndex)
    {
        require(
            msg.sender == artifacts[_artifactIndex].owner ||
            msg.sender == curator,
            "Not authorized to deactivate"
        );

        artifacts[_artifactIndex].isActive = false;
    }

    /**
     * @notice Reactivate a deactivated artifact
     * @param _artifactIndex Index of the artifact
     */
    function reactivateArtifact(uint32 _artifactIndex)
        external
        validArtifactIndex(_artifactIndex)
    {
        require(
            msg.sender == artifacts[_artifactIndex].owner ||
            msg.sender == curator,
            "Not authorized to reactivate"
        );

        artifacts[_artifactIndex].isActive = true;
    }

    /**
     * @notice Get decryption request status
     * @param requestId Decryption request ID
     */
    function getDecryptionStatus(uint256 requestId)
        external
        view
        returns (
            uint32 artifactIndex,
            address requester,
            uint256 timestamp,
            bool isProcessed,
            bool isRefunded,
            bool isTimedOut
        )
    {
        DecryptionRequest storage request = decryptionRequests[requestId];
        bool timedOut = block.timestamp >= request.timestamp + DECRYPTION_TIMEOUT;

        return (
            request.artifactIndex,
            request.requester,
            request.timestamp,
            request.isProcessed,
            request.isRefunded,
            timedOut
        );
    }

    /**
     * @notice Withdraw accumulated platform fees (curator only)
     * @param to Address to receive the fees
     */
    function withdrawPlatformFees(address payable to)
        external
        onlyCurator
        nonZeroAddress(to)
    {
        require(platformFees > 0, "No fees to withdraw");
        uint256 amount = platformFees;
        platformFees = 0;

        (bool sent, ) = to.call{value: amount}("");
        require(sent, "Withdraw failed");

        emit PlatformFeesWithdrawn(to, amount);
    }

    /**
     * @notice Get platform fee balance
     */
    function getPlatformFees() external view returns (uint256) {
        return platformFees;
    }

    receive() external payable {
        platformFees += msg.value;
    }
}
