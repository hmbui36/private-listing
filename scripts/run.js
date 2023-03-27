const hre = require("hardhat");


async function main() {

    const factory = await hre.ethers.getContractFactory("PrivateListing");
    const [owner, erc721Holder, erc1155Holder] = await hre.ethers.getSigners();
    const contract = await factory.deploy();
    await contract.deployed();
    console.log("Contract deployed to: ", contract.address);
    
    console.log("Contract deployed by: ", owner.address, "\n");
    console.log("erc721Holder: ", erc721Holder?.address, "\n");
    console.log("erc1155Holder: ", erc1155Holder?.address, "\n");

    const erc721Factory = await hre.ethers.getContractFactory("ExampleERC721", owner);
    const erc721Contract = await erc721Factory.deploy();
    await erc721Contract.deployed();
    console.log("Contract deployed to: ", erc721Contract.address);

    const erc1155Factory = await hre.ethers.getContractFactory("ExampleERC1155", owner);
    const erc1155Contract = await erc1155Factory.deploy();
    await erc1155Contract.deployed();
    console.log("Contract deployed to: ", erc1155Contract.address);

    // Mint erc721 to erc721Holder
    let txn
    txn = await erc721Contract["safeMint(address,string)"](erc721Holder.address, "example-uri");
    await txn.wait()
    console.log("mint erc721 nft to erc721Holder. \n")

    // Check owner of token 0 is erc721Holder
    txn = await erc721Contract.ownerOf(0);
    console.log("tokenOwner: ", txn, "\n", "erc721Holder: ", erc721Holder.address, "\n")

    // Mint erc1155 to erc1155Holder
    txn = await erc1155Contract["safeMint(address,uint256)"](erc1155Holder.address, 10);
    await txn.wait()
    console.log("mint erc1155 nft to erc1155Holder. \n")
    
    // Check owner of token 0 is erc1155Holder
    txn = await erc1155Contract.balanceOf(erc1155Holder.address, 0);
    console.log("balanceOf: ", txn, "\n", "erc1155Holder: ", erc1155Holder.address, "\n")

    // ERC721Holder creates a private listing, which allows erc1155Holder to buy the erc721 listing.
    txn = await contract.connect(erc721Holder).addPrivateListingAddresses(0, erc721Contract.address, 0, [erc1155Holder.address]);
    await txn.wait()
    console.log("allow erc1155Holder to buy erc721 listing. \n")

    // Check eligibility of erc1155Holder
    txn = await contract.connect(erc1155Holder).verify(0, erc1155Holder.address, "0x0000000000000000000000000000000000000000", 0, 0, 0, "0x0000000000000000000000000000000000000000",[])
    console.log("verify: ", txn, "\n", "erc1155Holder: ", erc1155Holder.address, "\n")


    // Should fail if erc1155Holder tries to create a private listing for erc721 which is not owned by erc1155Holder.
    // txn = await contract.connect(erc1155Holder).addPrivateListingAddresses(0, erc721Contract.address, 0, [erc721Holder.address]);
    // await txn.wait()
    // console.log("txn: ", txn, "\n")


    // ERC1155Holder creates a private listing, which allows erc721Holder to buy the erc1155 listing.
    txn = await contract.connect(erc1155Holder).addPrivateListingAddresses(0, erc1155Contract.address, 0, [erc721Holder.address]);
    await txn.wait()
    console.log("allow erc721Holder to buy erc1155 listing. \n")
    // Check eligibility of erc721Holder
    txn = await contract.connect(erc721Holder).verify(0, erc721Holder.address, "0x0000000000000000000000000000000000000000", 0, 0, 0, "0x0000000000000000000000000000000000000000",[])
    console.log("verify: ", txn, "\n", "erc721Holder: ", erc721Holder.address, "\n")

    // Should fail if erc1155Holder tries to create a private listing for erc721 which is not owned by erc1155Holder.
    // txn = await contract.connect(erc721Holder).addPrivateListingAddresses(0, erc1155Contract.address, 0, [erc721Holder.address]);
    // await txn.wait()
    // console.log("txn: ", txn, "\n")

    txn = await contract.connect(erc721Holder).addPrivateListingAddresses(0, erc721Contract.address, 0, [erc721Holder.address, erc1155Holder.address]);
    await txn.wait()
    console.log("allow erc721Holder and erc1155Holder to buy erc721 listing. \n")
    // Check eligibility of erc721Holder
    txn = await contract.connect(erc721Holder).verify(0, erc721Holder.address, "0x0000000000000000000000000000000000000000", 0, 0, 0, "0x0000000000000000000000000000000000000000",[])
    console.log("verify: ", txn, "\n", "erc721Holder: ", erc721Holder.address, "\n")

    // Check eligibility of erc1155Holder
    txn = await contract.connect(erc1155Holder).verify(0, erc1155Holder.address, "0x0000000000000000000000000000000000000000", 0, 0, 0, "0x0000000000000000000000000000000000000000",[])
    console.log("verify: ", txn, "\n", "erc1155Holder: ", erc1155Holder.address, "\n")
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });