const ERC721Token = artifacts.require('ERC721Token');
const Blank = artifacts.require('Blank');

contract('ERC721Token', accounts => {
    let ERC721TokenInstance;
    const [admin, trader1, trader2] = [accounts[0], accounts[1], accounts[2]];

    beforeEach(async () => {
        ERC721TokenInstance = await ERC721Token.new();
        for(let i = 0; i < 4; i++) {
            await ERC721TokenInstance.mint({from: admin});
        }
    });

    it('should deploy smart contract', async () => {
        ERC721TokenInstance = await ERC721Token.deployed();
        assert(ERC721TokenInstance.address != '');
    });

    it('should not mint if not admin', async () => {
        try {
            await ERC721TokenInstance.mint(trader1);
        } catch(e) {
            assert(e.message, 'error message must contain revert');
        }
    });

    it('should mint if admin', async () => {
        const adminBalanceBefore = await ERC721TokenInstance.balanceOf(admin);
        assert.equal(adminBalanceBefore.toNumber(), 4, 'minted tokens');
        const receipt = await ERC721TokenInstance.mint({from: admin});
        assert.equal(receipt.logs.length, 1, 'triggers one event');
		assert.equal(receipt.logs[0].event, 'Transfer', 'should be the Transfer event');
        assert.equal(receipt.logs[0].address, ERC721TokenInstance.address, 'minted tokens are transferred from');
        const adminBalanceAfter = await ERC721TokenInstance.balanceOf(admin);
        assert.equal(adminBalanceAfter.toNumber(), 5, 'minted tokens');
        assert(adminBalanceAfter.sub(adminBalanceBefore).toNumber() === 1);
        const owner = await ERC721TokenInstance.ownerOf(4);
        assert.equal(owner, admin, 'admin has to be an owner of minted token');
    });

    it('should not transfer if balance 0', async () => {
        try {
            await ERC721TokenInstance.transferFrom(trader2, trader2, 0, {from : trader2});
        } catch(e) {
            assert(e.message, 'error message must contain revert Transfer not authorized');
        }
        try {
            await ERC721TokenInstance.safeTransferFrom(trader2, trader2, 0, {from : trader2});
        } catch(e) {
            assert(e.message, 'error message must contain revert Transfer not authorized');
        }
    });

    it('should not transfer if not owner', async () => {
        try {
            await ERC721TokenInstance.transferFrom(admin, trader2, 0, {from : trader2});
        } catch(e) {
            assert(e.message, 'error message must contain revert Transfer not authorized');
        }
        try {
            await ERC721TokenInstance.safeTransferFrom(admin, trader2, 0, {from : trader2});
        } catch(e) {
            assert(e.message, 'error message must contain revert Transfer not authorized');
        }
    });

    it('safeTransferFrom should not transfer if recipient does not implement erc721recipient interface', async () => {
        const blank = await Blank.new();
        try {
            await ERC721TokenInstance.safeTransferFrom(admin, blank.address, 0, {from : admin});
        } catch(e) {
            assert(e.message, 'error message must contain revert recipient SC cannot handle ERC721 tokens');
        }
    });

    it('safeTransferFrom() should transfer', async () => {
        const tokenId = 0;
        const receipt = await ERC721TokenInstance.safeTransferFrom(admin, trader1, tokenId, { from: admin});
        assert.equal(receipt.logs.length, 1, 'triggers one event');
		assert.equal(receipt.logs[0].event, 'Transfer', 'should be the Transfer event');
        assert.equal(receipt.logs[0].address, ERC721TokenInstance.address, 'tokens are transfered from');
        const adminBalance = await ERC721TokenInstance.balanceOf(admin);
        const traderOneBalance = await ERC721TokenInstance.balanceOf(trader1);
        assert.equal(adminBalance, 3, 'admins balance after token transfer');
        assert.equal(traderOneBalance, 1, 'recipient balance after token transfer');
        const owner = await ERC721TokenInstance.ownerOf(tokenId);
        assert.equal(owner, trader1, 'owner of transfered token');
    });

    it('transferFrom() should transfer', async () => {
        const tokenId = 0;
        const receipt = await ERC721TokenInstance.transferFrom(admin, trader1, tokenId, { from: admin});
        assert.equal(receipt.logs.length, 1, 'triggers one event');
		assert.equal(receipt.logs[0].event, 'Transfer', 'should be the Transfer event');
        assert.equal(receipt.logs[0].address, ERC721TokenInstance.address, 'tokens are transferred from');
        const adminBalance = await ERC721TokenInstance.balanceOf(admin);
        const traderOneBalance = await ERC721TokenInstance.balanceOf(trader1);
        assert.equal(adminBalance, 3, 'admins balance after token transfer');
        assert.equal(traderOneBalance, 1, 'recipient balance after token transfer');
        const owner = await ERC721TokenInstance.ownerOf(tokenId);
        assert.equal(owner, trader1, 'owner of transfered token');
    });

    it('should transfer token when approved', async () => {
        const tokenId = 0;
        const approveReceipt = await ERC721TokenInstance.approve(trader1, tokenId);
        assert.equal(approveReceipt.logs.length, 1, 'triggers one event');
		assert.equal(approveReceipt.logs[0].event, 'Approval', 'should be the Approval event');
        const approved = await ERC721TokenInstance.getApproved(tokenId);
        assert.equal(approved, trader1, 'approved adress for token transfer');
        const transferReceipt = await ERC721TokenInstance.transferFrom(admin, trader1, tokenId, { from: admin});
        assert.equal(transferReceipt.logs.length, 1, 'triggers one event');
		assert.equal(transferReceipt.logs[0].event, 'Transfer', 'should be the Transfer event');
        assert.equal(transferReceipt.logs[0].address, ERC721TokenInstance.address, 'tokens are transferred from');
        const adminBalance = await ERC721TokenInstance.balanceOf(admin);
        const traderOneBalance = await ERC721TokenInstance.balanceOf(trader1);
        assert.equal(adminBalance, 3, 'admins balance after token transfer');
        assert.equal(traderOneBalance, 1, 'recipient balance after token transfer');
        const owner = await ERC721TokenInstance.ownerOf(tokenId);
        assert.equal(owner, trader1, 'owner of transfered token');
    });
});