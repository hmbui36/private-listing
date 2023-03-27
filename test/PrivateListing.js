const { expect } = require("chai");

// ERC721 holder has a erc721 token. ERC1155 holder has a erc1155 token.

describe("Manifold ERC721 Private Listing", function () {    
  this.beforeAll(async function () {
    nftmarketaddress = "0xcd3b766ccdd6ae721141f452c550ca635964ce71"
    const factory = await hre.ethers.getContractFactory("PrivateListing");
    [owner, erc721Holder, erc1155Holder] = await hre.ethers.getSigners();
    contract = await factory.deploy();
    await contract.deployed();

    erc721Factory = await hre.ethers.getContractFactory("ExampleERC721", owner);
    erc721Contract = await erc721Factory.deploy();
    await erc721Contract.deployed();

    erc1155Factory = await hre.ethers.getContractFactory("ExampleERC1155", owner);
    erc1155Contract = await erc1155Factory.deploy();
    await erc1155Contract.deployed();

    // Mint erc721 to erc721Holder
    let txn
    txn = await erc721Contract["safeMint(address,string)"](erc721Holder.address, "example-uri");
    await txn.wait()

    // Mint erc1155 to erc1155Holder
    txn = await erc1155Contract["safeMint(address,uint256)"](erc1155Holder.address, 10);
    await txn.wait()
  });

  it("happy path, check ownership of erc721 using ownerOf, erc1155 using balanceOf", async function () {
    let txn
    txn = await erc721Contract.ownerOf(0);
    expect(txn).to.equal(erc721Holder.address);

    txn = await erc1155Contract.balanceOf(erc1155Holder.address, 0);
    expect(parseInt(txn)).to.greaterThan(0);
  });

  it("happy path, ERC721 holder creates a private listing, which allows erc1155 holder to buy the erc721 listing.", async function () {
    
    // ERC721Holder creates a private listing, which allows erc1155Holder to buy the erc721 listing.
    txn = await contract.connect(erc721Holder).addPrivateListingAddresses(0, erc721Contract.address, 0, [erc1155Holder.address]);
    await txn.wait();

    // Check eligibility of erc1155Holder should return true
    txn = await contract.connect(erc1155Holder).verify(0, erc1155Holder.address, "0x0000000000000000000000000000000000000000", 0, 0, 0, "0x0000000000000000000000000000000000000000",[]);
    expect(txn).to.equal(true);
  });

});