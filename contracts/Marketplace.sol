// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

contract Marketplace is Ownable, ReentrancyGuard {
    struct Listing {
        address nftContract;
        uint256 tokenId;
        uint256 price;
        address seller;
    }

    uint256 public marketplaceFeeBps = 100; // 1% (basis points)

    mapping(uint256 => Listing) private _listings;

    event NFTListed(address indexed seller, uint256 indexed tokenId, address nftContract, uint256 price);
    event NFTBought(address indexed buyer, address indexed seller, uint256 indexed tokenId, address nftContract, uint256 price);
    event NFTListingCancelled(address indexed seller, uint256 indexed tokenId, address nftContract);
    event MarketplaceFeeUpdated(uint256 newFeeBps);

    constructor() Ownable(msg.sender) {}

    modifier onlyListedSeller(address nftContract, uint256 tokenId) {
        require(_isListed(nftContract, tokenId), "Marketplace: token is not listed");
        require(msg.sender == _listings[tokenId].seller, "Marketplace: not the seller");
        _;
    }

    function listItem(address nftContract, uint256 tokenId, uint256 price) external nonReentrant {
        require(price > 0, "Marketplace: price must be greater than zero");
        require(!_isListed(nftContract, tokenId), "Marketplace: already listed");

        IERC721 nft = IERC721(nftContract);
        require(nft.ownerOf(tokenId) == msg.sender, "Marketplace: caller is not the owner");
        require(nft.getApproved(tokenId) == address(this), "Marketplace: contract is not approved");

        _listings[tokenId] = Listing({
            nftContract: nftContract,
            tokenId: tokenId,
            price: price,
            seller: msg.sender
        });

        nft.transferFrom(msg.sender, address(this), tokenId);

        emit NFTListed(msg.sender, tokenId, nftContract, price);
    }

    function buyItem(address nftContract, uint256 tokenId) external payable nonReentrant {
        require(_isListed(nftContract, tokenId), "Marketplace: token is not listed");

        Listing memory listing = _listings[tokenId];
        require(msg.sender != listing.seller, "Marketplace: buyer cannot be the seller");
        require(msg.value >= listing.price, "Marketplace: insufficient funds");

        address seller = listing.seller;
        address buyer = msg.sender;
        uint256 price = listing.price;
        uint256 feeAmount = (price * marketplaceFeeBps) / 10000;
        uint256 sellerAmount = price - feeAmount;

        delete _listings[tokenId];

        IERC721(nftContract).transferFrom(address(this), buyer, tokenId);

        (bool feeOk, ) = payable(owner()).call{ value: feeAmount }("");
        require(feeOk, "Marketplace: fee transfer failed");

        if (sellerAmount > 0) {
            (bool sellerOk, ) = payable(seller).call{ value: sellerAmount }("");
            require(sellerOk, "Marketplace: seller transfer failed");
        }

        emit NFTBought(buyer, seller, tokenId, nftContract, price);
    }

    function cancelListing(address nftContract, uint256 tokenId)
        external
        nonReentrant
        onlyListedSeller(nftContract, tokenId)
    {
        address seller = _listings[tokenId].seller;

        delete _listings[tokenId];

        IERC721(nftContract).transferFrom(address(this), seller, tokenId);

        emit NFTListingCancelled(seller, tokenId, nftContract);
    }

    function setMarketplaceFeeBps(uint256 newFeeBps) external onlyOwner {
        require(newFeeBps <= 10000, "Marketplace: fee too high");
        marketplaceFeeBps = newFeeBps;
        emit MarketplaceFeeUpdated(newFeeBps);
    }

    function getListing(address nftContract, uint256 tokenId) external view returns (Listing memory) {
        if (!_isListed(nftContract, tokenId)) {
            return Listing(address(0), 0, 0, address(0));
        }
        return _listings[tokenId];
    }

    function getListingPrice(address nftContract, uint256 tokenId) external view returns (uint256) {
        require(_isListed(nftContract, tokenId), "Marketplace: token is not listed");
        return _listings[tokenId].price;
    }

    function isListed(address nftContract, uint256 tokenId) external view returns (bool) {
        return _isListed(nftContract, tokenId);
    }

    function _isListed(address nftContract, uint256 tokenId) private view returns (bool) {
        return _listings[tokenId].nftContract == nftContract && _listings[tokenId].seller != address(0);
    }
}