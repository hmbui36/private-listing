//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract PrivateListing is Ownable {
    mapping(uint40 => address[]) public privateListings;
    bytes4 public constant IID_IERC1155 = type(IERC1155).interfaceId;
    bytes4 public constant IID_IERC721 = type(IERC721).interfaceId;

    /**
     * @notice Add to privateListings
     * address[] can be listing privately to multiple addresses
     */
    function addPrivateListingAddresses(
        uint40 listingId,
        address nftAddress,
        uint256 tokenId,
        address[] calldata addresses
    ) external {
        if (IERC165(nftAddress).supportsInterface(IID_IERC721) == true) {
            require(
                IERC721(nftAddress).ownerOf(tokenId) == msg.sender,
                "You do not own this ERC721 NFT"
            );
        } else if (
            IERC165(nftAddress).supportsInterface(IID_IERC1155) == true
        ) {
            require(
                IERC1155(nftAddress).balanceOf(msg.sender, tokenId) > 0,
                "You do not own this ERC1155 NFT"
            );
        }

        for (uint i = 0; i < addresses.length; i++) {
            privateListings[listingId].push(addresses[i]);
        }
    }

    /**
     *  @dev Check that a buyer is verified to purchase/bid
     *
     *  @param marketplaceAddress   The address of the marketplace
     *  @param listingId            The listingId associated with this verification
     *  @param identity             The identity to verify
     *  @param tokenAddress         The tokenAddress associated with this verification
     *  @param tokenId              The tokenId associated with this verification
     *  @param requestCount         The number of items being requested to purchase/bid
     *  @param requestAmount        The amount being requested
     *  @param requestERC20         The erc20 token address of the amount (0x0 if ETH)
     *  @param data                 Additional data needed to verify
     *
     */
    function checkVerify(
        address marketplaceAddress,
        uint40 listingId,
        address identity,
        address tokenAddress,
        uint256 tokenId,
        uint24 requestCount,
        uint256 requestAmount,
        address requestERC20,
        bytes calldata data
    ) external view returns (bool) {
        for (uint i = 0; i < privateListings[listingId].length; i++) {
            if (privateListings[listingId][i] == identity) {
                return true;
            }
        }
        return false;
    }
}
