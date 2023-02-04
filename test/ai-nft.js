const { expect } = require("chai");
const { ethers } = require("hardhat");

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), "ether");
};

describe("AINFT", () => {
  let aiNft;
  let deployer, minter;

  const NAME = "AI Generated NFT";
  const SYMBOL = "AINFT";
  const COST = tokens(1); // 1 ETH
  const URL =
    "https://ipfs.io/ipfs/bafyreid4an6ng6e6hok56l565eivozra3373bo6funw3p5mhq5oonew6u4/metadata.json";

  beforeEach(async () => {
    [deployer, minter] = await ethers.getSigners();

    const AINFT = await ethers.getContractFactory("AINFT");
    aiNft = await AINFT.deploy(NAME, SYMBOL, COST);
    await aiNft.deployed();

    // Mint
    const transaction = await aiNft.connect(minter).mint(URL, { value: COST });
    await transaction.wait();
  });

  describe("Deployment", async () => {
    it("Should Returns the owner", async () => {
      const result = await aiNft.owner();
      expect(result).to.be.equal(deployer.address);
    });

    it("Should return the cost", async () => {
      const result = await aiNft.cost();
      expect(result).to.be.equal(COST);
    });
  });

  describe("Minting", async () => {
    it("Should return the owner of the NFT", async () => {
      const result = await aiNft.ownerOf("1");
      expect(result).to.be.equal(minter.address);
    });

    it("Should return URI", async () => {
      const result = await aiNft.tokenURI("1");
      expect(result).to.be.equal(URL);
    });

    it("Updates total supply", async () => {
      const result = await aiNft.totalSupply();
      expect(result).to.be.equal("1");
    });
  });

  describe("Withdrawing", async () => {
    let balanceBefoe;

    beforeEach(async () => {
      balanceBefoe = await ethers.provider.getBalance(deployer.address);

      const transaction = await aiNft.connect(deployer).withdraw();
      await transaction.wait();
    });

    it("Update the owner balance", async () => {
      const result = await ethers.provider.getBalance(deployer.address);
      expect(result).to.be.greaterThan(balanceBefoe);
    });

    it("Update the contract balance", async () => {
      const result = await ethers.provider.getBalance(aiNft.address);
      expect(result).to.equal(0);
    });
  });
});
