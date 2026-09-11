// SPDX-License-Identifier: MIT
pragma solidity ^0.8.34;

contract RentalEscrow {
    address public operator;

    struct Agreement {
        address landlord;
        address tenant;
        uint256 depositAmount;
        bool isActive;
    }

    mapping(string => Agreement) public agreements;
    mapping(string => string) public evidenceHashes;

    modifier onlyOperator() {
        require(msg.sender == operator, "Only operator can call this");
        _;
    }

    constructor() {
        operator = msg.sender;
    }

    function depositFunds(
        string memory agreementId,
        address landlord,
        address tenant
    ) external payable {
        require(msg.value > 0, "Deposit must be greater than 0");
        require(!agreements[agreementId].isActive, "Agreement already has a deposit");

        agreements[agreementId] = Agreement({
            landlord: landlord,
            tenant: tenant,
            depositAmount: msg.value,
            isActive: true
        });
    }

    function recordEvidenceHash(
        string memory agreementId,
        string memory hash
    ) external onlyOperator {
        evidenceHashes[agreementId] = hash;
    }

    function releaseFunds(
        string memory agreementId,
        uint256 landlordAmount,
        uint256 tenantAmount
    ) external onlyOperator {
        Agreement storage agreement = agreements[agreementId];
        require(agreement.isActive, "No active deposit for this agreement");
        require(landlordAmount + tenantAmount == agreement.depositAmount, "Amounts must sum to deposit");

        agreement.isActive = false;

               if (landlordAmount > 0) {
            (bool sentToLandlord, ) = payable(agreement.landlord).call{value: landlordAmount}("");
            require(sentToLandlord, "Transfer to landlord failed");
        }
        if (tenantAmount > 0) {
            (bool sentToTenant, ) = payable(agreement.tenant).call{value: tenantAmount}("");
            require(sentToTenant, "Transfer to tenant failed");
        }
    }
}