const TokenMock = artifacts.require("TokenMock");
const LpStaking = artifacts.require("LpStaking");
const LPMock = artifacts.require("LPMock");
const BigNumber = require('bignumber.js');

contract("", async (accounts) => {
  const deployer = accounts[0];
  let instanceToken;
  let instanceLpStaking;
  let instanceLP;

  before(async () => {
    instanceToken = await TokenMock.new({ from: deployer });
    instanceLpStaking = await LpStaking.new({ from: deployer });
    instanceLP = await LPMock.new({ from: deployer });
  });

  describe("V3 Staking", () => {
    it("mint token", async () => {
      await instanceLpStaking.setTokenAddress(instanceToken.address);
      await instanceLpStaking.setPairAddress(instanceLP.address);

      await instanceToken.transfer(instanceLpStaking.address, "10000000000000000000");

      const balance0 = new BigNumber(await instanceToken.balanceOf(deployer));
      const balance1 = new BigNumber(await instanceToken.balanceOf(instanceLpStaking.address));

      assert.equal(balance0.toString(10), "90000000000000000000");
      assert.equal(balance1.toString(10), "10000000000000000000");
    });

    it("mint LP", async () => {
      instanceLP.transfer(accounts[2], "100000000000000000000");
      instanceLP.transfer(accounts[3], "100000000000000000000");

      const balance1 = new BigNumber(await instanceLP.balanceOf(accounts[2]));
      const balance2 = new BigNumber(await instanceLP.balanceOf(accounts[3]));

      assert.equal(balance1.toString(10), "100000000000000000000");
      assert.equal(balance2.toString(10), "100000000000000000000");
    });

    it("staking LP", async () => {
      await instanceLP.approve(instanceLpStaking.address, "100000000000000000000", { from: accounts[2] });
      await instanceLP.approve(instanceLpStaking.address, "100000000000000000000", { from: accounts[3] });

      await instanceLpStaking.setMultipliers([
        100, 104, 108, 112, 115, 119, 122, 125, 128, 131,
        134, 136, 139, 142, 144, 147, 149, 152, 154, 157,
        159, 161, 164, 166, 168, 170, 173, 175, 177, 179,
        181, 183, 185, 187, 189, 191, 193, 195, 197, 199,
        201, 203, 205, 207, 209, 211, 213, 214, 216, 218,
        220, 222, 223, 225, 227, 229, 230, 232, 234, 236,
        237, 239, 241, 242, 244, 246, 247, 249, 251, 252,
        254, 255, 257, 259, 260, 262, 263, 265, 267, 268,
        270, 271, 273, 274, 276, 277, 279, 280, 282, 283,
        285, 286, 288, 289, 291, 292, 294, 295, 297, 298
      ]);
      await instanceLpStaking.stake("50000000000000000000", 103, { from: accounts[2] });
      await instanceLpStaking.stake("100000000000000000000", 4, { from: accounts[3] });

      function timeout(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
      }

      await timeout(20000);
      await instanceLP.transfer(accounts[4], "1");

      const reward1 = await instanceLpStaking.getReward(accounts[2]);
      const reward2 = await instanceLpStaking.getReward(accounts[3]);
      console.log(reward1.pending.toString(), reward2.pending.toString())
      expect(new BigNumber(reward1.pending).gt(4000000000000)).to.equal(true);
      expect(new BigNumber(reward2.pending).gt(2500000000000)).to.equal(true);
    });

    it("unStake LP", async () => {
      await instanceLpStaking.withdraw(0, "50000000000000000000", { from: accounts[2] });
      await instanceLpStaking.withdraw(0, "50000000000000000000", { from: accounts[3] });

      const balance1 = await instanceLP.balanceOf(accounts[2]);
      const balance2 = await instanceLP.balanceOf(accounts[3]);
      assert.equal(balance1.toString(), "100000000000000000000");
      assert.equal(balance2.toString(), "50000000000000000000");

      const reward1 = new BigNumber(await instanceToken.balanceOf(accounts[2]));
      const reward2 = new BigNumber(await instanceToken.balanceOf(accounts[3]));

      expect(reward1.gt(1200000000000)).to.equal(true);
      expect(reward2.gt(1500000000000)).to.equal(true);
    });
  });
});