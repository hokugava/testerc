let CatCoin = artifacts.require("CatCoin");

contract('CatCoin', accounts => {
	let tokenInstance;
	const revertError = 'Returned error: VM Exception while processing transaction: revert';

	before(async () =>{
		tokenInstance = await CatCoin.deployed();
	});

	it('initialize the contract with the correct values', async () => {
		const name = await tokenInstance.name();
		const symbol = await tokenInstance.symbol();
		const decimals = await tokenInstance.decimals();
		assert.equal(name,'Cat Coin','has the correct name');
		assert.equal(symbol,'CAT', 'has a correct symbol');
		assert.equal(decimals.toNumber(), 18, 'has a correct decimals');
	});

	it('overflow behavior', async () => {
		const addition = await tokenInstance.addition.call(255, 1);
		assert.equal(addition.toNumber(), 0, 'overflow is done');
	});

	it('allocate the initial supply upon deployment', async () => {
		const totalSupply = await tokenInstance.totalSupply();
		assert.equal(totalSupply.toNumber(), 1000000, 'sets the total supply to 1,000,000');
		const adminBalance = await tokenInstance.balanceOf(accounts[0]);
		assert.equal(adminBalance.toNumber(),1000000,'it allocates the initial supply to admin account');
	});

	it('transfer token ownership', async () => {
		try {
			await tokenInstance.transfer.call(accounts[1],666666666);
		} catch (e) {
			assert.equal(e.message, revertError, 'error message must contain revert');
		}
		const success = await tokenInstance.transfer.call(accounts[1], 100000, { from: accounts[0] });
		assert.equal(success, true, 'it returns true');
		const receipt = await tokenInstance.transfer(accounts[1], 100000, { from: accounts[0] });
		assert.equal(receipt.logs.length, 1, 'triggers one event');
		assert.equal(receipt.logs[0].event, 'Transfer', 'should be the "Transfer" event');
		assert.equal(receipt.logs[0].args._from, accounts[0], 'logs the account tokens are transferred from');
		assert.equal(receipt.logs[0].args._to, accounts[1], 'logs the account tokens are transferred to');
		assert.equal(receipt.logs[0].args._value, 100000, 'logs the transfer amount');
		const balance = await tokenInstance.balanceOf(accounts[1]);
		assert.equal(balance.toNumber(), 100000, 'add the amount to the recieving account');
		const adminBalance = await tokenInstance.balanceOf(accounts[0]);
		assert.equal(adminBalance.toNumber(),900000,'deduct the amount from the sending account');
	});

	it('approve tokens for delegated transfer', async () => {
		const success = await tokenInstance.approve.call(accounts[1],100000, { from: accounts[0] });
		assert.equal(success, true, 'it returns true');
		const receipt = await tokenInstance.approve(accounts[1], 100000, { from: accounts[0] });
		assert.equal(receipt.logs.length, 1, 'triggers one event');
		assert.equal(receipt.logs[0].event, 'Approval', 'should be the "Approval" event');
		assert.equal(receipt.logs[0].args._owner, accounts[0], 'logs the account tokens are authorized by');
		assert.equal(receipt.logs[0].args._spender, accounts[1], 'logs the account tokens are authorized to');
		assert.equal(receipt.logs[0].args._value, 100000, 'logs the transfer amount');
		const allowance = await tokenInstance.allowance(accounts[0],accounts[1]);
		assert.equal(allowance.toNumber(),100000,'stores the allowance for delegated transfer');
	});


 	it('handle delegated token transfers', async () => {
		const fromAccount = accounts[5];
		const toAccount = accounts[6];
		const spendingAccount = accounts[7];
		await tokenInstance.transfer(fromAccount, 100, { from: accounts[0] });
		await tokenInstance.approve(spendingAccount, 10, { from: fromAccount });

		try {
			await tokenInstance.transferFrom(fromAccount, toAccount, 9999, { from: spendingAccount });
		} catch (e) {
			assert.equal(e.message, revertError, 'cannot transfer value larger than balance');
		}

		try {
			await tokenInstance.transferFrom(fromAccount, toAccount, 20, { from: spendingAccount});
		} catch (e) {
			assert.equal(e.message, revertError, 'cannot transfer value larger than approved amount');
		}

		const success = await tokenInstance.transferFrom.call(fromAccount, toAccount, 10, { from: spendingAccount });
		assert.equal(success, true, 'it returns true');
		const receipt = await tokenInstance.transferFrom(fromAccount, toAccount, 10, { from: spendingAccount });
		assert.equal(receipt.logs.length, 1, 'triggers one event');
		assert.equal(receipt.logs[0].event, 'Transfer', 'should be the "Transfer" event');
		assert.equal(receipt.logs[0].args._from, fromAccount, 'logs the account the tokens are transferred from');
		assert.equal(receipt.logs[0].args._to, toAccount, 'logs the account the tokens are transferred to');
		assert.equal(receipt.logs[0].args._value, 10, 'logs the transfer amount');
		const fromAccountBalance = await  tokenInstance.balanceOf(fromAccount);
		assert.equal(fromAccountBalance.toNumber(), 90, 'deducts the amount from the sending account');
		const toAccountBalance = await tokenInstance.balanceOf(toAccount);
		assert.equal(toAccountBalance.toNumber(), 10, 'adds the amount from the receiving account');
		const allowance = await tokenInstance.allowance(fromAccount, spendingAccount);
		assert.equal(allowance.toNumber(), 0, 'deducts the amount from the allowance');
	});
	
	it('handle minted tokens and it\'s transfer to owner', async () => {
		const owner = accounts[0];
		const thief = accounts[1];
		const totalSupply = await tokenInstance.totalSupply();
		assert.equal(totalSupply.toNumber(), 1000000, 'sets the total supply to 1,000,000');
		const ownerBalance = await tokenInstance.balanceOf(owner);
		assert.equal(ownerBalance.toNumber(), 899900, 'it allocates the initial supply to owner account');

		try {
			await tokenInstance.mintCats.call(owner, 150000, { from: owner });
		} catch(e) {
			assert.equal(e.message, revertError, 'cannot mint amount larger than total supply');
		}

		try {
			await tokenInstance.mintCats.call(thief, 100000, { from: thief });
		} catch(e) {
			assert.equal(e.message, revertError, 'cannot mint amount larger than total supply');
		}
		
		const success = await tokenInstance.mintCats.call(owner, 100000, { from: owner });
		assert.equal(success, true, 'it returns true');
	    const receipt = await tokenInstance.mintCats(owner, 100000, { from: owner });
		assert.equal(receipt.logs[0].event, 'MintCats', 'should be the "MintCats" event');
		assert.equal(receipt.logs[1].event, 'Transfer', 'should be the "Transfer" event');
		assert.equal(receipt.logs[0].args._to, owner, 'logs the account the tokens are transferred from');
		assert.equal(receipt.logs[0].args._amount, 100000, 'logs the account the tokens are transferred to');
		const currentOwnerBalance = await tokenInstance.balanceOf(owner);
		assert.equal(currentOwnerBalance.toNumber(), 999900, 'deducts the amount from the owner account');
	});

	it('handle burns token process', async () => {
		const burner = accounts[0];
		const burnerAccounBalance = await tokenInstance.balanceOf(burner);
		assert.equal(burnerAccounBalance.toNumber(), 999900, 'it allocates the initial supply to burner account');
		
		try {
			await tokenInstance.burnCats.call(999999, { from: burner });
		} catch(e) {
			assert.equal(e.message, revertError, 'cannot burn value larger than burner balance');
		}

		const success = await tokenInstance.burnCats.call(899900, { from: burner });
		assert.equal(success, true, 'it returns true');
		const receipt = await tokenInstance.burnCats(899900, { from: burner });
		assert.equal(receipt.logs.length, 1, 'triggers one event');
		assert.equal(receipt.logs[0].event, 'BurnCats', 'should be the "BurnCats" event');
		assert.equal(receipt.logs[0].args._value, 899900, 'logs the account the tokens are burned off');
		const currentBurnerBalance = await tokenInstance.balanceOf(burner);
		assert.equal(currentBurnerBalance.toNumber(), 100000, 'deducts the amount from the burner account after burn');
	});
});