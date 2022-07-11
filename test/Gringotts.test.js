let BN = web3.utils.BN;
const Gringotts = artifacts.require("Gringotts");
const Galleon = artifacts.require("Galleon");

contract("Gringotts Bank", accounts => {
  const [_owner, albus, bathilda] = accounts;
  
  let amount = 1E18;
  let instance;
  let tokenInstance; 

  beforeEach(async () => {
    tokenInstance = await Galleon.new();
    instance = await Gringotts.new(tokenInstance.address);
    const amount = new BN('100000000000000000000000000');

    await tokenInstance.increaseAllowance(instance.address,amount);
    await instance.transferGalleonsToContract(amount);
  });

  /*************************************************************************************************************/

  describe("Deployments", async () => {

    /**************************************************************************/

    it("should deploy Galleon contract", async () => {
      let tokenName = await tokenInstance.name();
      assert.equal(tokenName, "Galleon", "Galleon token contract not deployed");
    });

    /**************************************************************************/

    it("should deploy Gringotts contract and allocate Galleons to the contract", async () => {
      const galleonBalance = await tokenInstance.balanceOf(instance.address).then((result) => Number(result));
      assert.equal(galleonBalance, 100000000000000000000000000, "Bank does not have galleons to spend");
    });

  });

  /*************************************************************************************************************/

  describe("Use cases", async () => {
    
    /**************************************************************************/
    it("should get a user's Wei balance in the bank", async () => {
      const balance = await instance.getWeiBalance( { from: albus } );
      assert.equal(Number(balance), 0, "incorrect balance");
    });

    /**************************************************************************/
    it("should let a user deposit Wei and update their bank account balance", async () => {
      const balanceBefore = await instance.getWeiBalance( { from: bathilda } );  
      
      await instance.deposit( { from: bathilda, value: amount} );
      const balanceAfter = await instance.getWeiBalance( { from: bathilda } );  
  
      assert.equal(Number(balanceAfter), Number(balanceBefore) + amount, "incorrect Eth balance after deposit");
    });

    /**************************************************************************/
   
    it("should emit a LogWeiDeposit event after a deposit is made", async () => {
      const deposit = await instance.deposit( { from: bathilda, value: amount} );
      let eventEmitted = (deposit.logs[0].event == "LogWeiDeposit") ? true : false;
  
      assert.equal(eventEmitted,true,"should log a LogWeiDeposit event");
    });

    /**************************************************************************/
    it("should let a user withdraw Eth from their bank account and update their balance", async () => {
      const depositAmount = web3.utils.toWei('2','ether');
      const withdrawAmount = web3.utils.toWei('1','ether');
  
      const initialBalance = await instance.getWeiBalance( { from: albus } );
      
      await instance.deposit( { from: albus, value: depositAmount } );
      const balanceAfterDeposit = await instance.getWeiBalance( { from: albus } );
  
      await instance.withdraw( withdrawAmount, { from: albus });
      const balanceAfterWithdrawal = await instance.getWeiBalance( { from: albus } );
  
      assert.equal(Number(initialBalance), 0, "incorrect Eth balance");
      assert.equal(Number(balanceAfterDeposit), Number(initialBalance) + depositAmount, "incorrect Eth balance after deposit");
      assert.equal(Number(balanceAfterWithdrawal), Number(balanceAfterDeposit) - withdrawAmount, "incorrect Eth balance after withdrawal")
    });
  
    /**************************************************************************/
    it("should emit a LogWeiWithdrawal event after a withdrawal is made", async () => {
      amount = web3.utils.toWei('1','ether');
      await instance.deposit( { from: bathilda, value: amount} );
      const withdrawal = await instance.withdraw(amount, { from: bathilda})
      
      let eventEmitted = (withdrawal.logs[0].event == "LogWeiWithdrawal") ? true : false;
      assert.equal(eventEmitted,true,"should log withdrawWeiEvent");
    });
  
    /**************************************************************************/

    it("should mint galleons to a user from the bank contract if the user holds Wei in their bank account", async () => {
      const depositAmount = web3.utils.toWei('2','ether');
      await instance.deposit({ from: albus, value: depositAmount } );
  
      const galleonBalanceBefore = await tokenInstance.balanceOf(albus).then((result) => Number(result));
      
      await instance.mintGalleonsToUser(albus);
      const galleonBalanceAfter = await tokenInstance.balanceOf(albus).then((result) => Number(result));
  
      assert.equal(galleonBalanceBefore, 0, "User's Galleon balance is incorrect");
      assert.equal(galleonBalanceAfter, 1000000000000000000000, "User did not receive 1000 Galleons");
    });

    /**************************************************************************/
  });
  
});
