const { assert } = require('chai');
const MemoryToken = artifacts.require('./MemoryToken.sol')

require('chai')
  .use(require('chai-as-promised'))
  .should()

contract('Memory Token', (accounts) => {
  let token

  before(async () => {
    token = await MemoryToken.deployed()
  })
  
  describe("deploy", async () => {
    it('should deploys successfully', async () => {
      const address = token.address
      assert.notEqual(address, 0x0)
      assert.notEqual(address, '')
      assert.notEqual(address, null)
      assert.notEqual(address, undefined)
    })
  })

  it('should have a name', async () => {
    const name = await token.name()
    assert.equal(name, "Memory Token")
  })

  it('should have a symbol', async () => {
    const symbol = await token.symbol()
    assert.equal(symbol, "MEMORY")
  })

  describe('Token Distribution', async () => {
    let result

    it('should mint tokens', async () => {
      await token.mint(accounts[0], 'https://www.epiccode.dev/nft')
      // It should increase total supply
      result = await token.totalSupply()
      assert.equal(result.toString(), "1", "Total Supply is correct")

      // It increments owner balance
      result = await token.balanceOf(accounts[0])
      assert.equal(result.toString(), "1", "Balance is correct")

      // Token should belong to the owner
      result = await token.ownerOf('1')
      assert.equal(result.toString(), accounts[0].toString(), "OwnerOf is correct")
      result = await token.tokenOfOwnerByIndex(accounts[0], 0)

      // Owner can see all tokens
      let balanceOf = await token.balanceOf(accounts[0])
      let tokenIds = []
      for (let i = 0; i < balanceOf; i++) {
        let id = await token.tokenOfOwnerByIndex(accounts[0], i)
        tokenIds.push(id.toString())
      }
      let expected = ['1']
      assert.equal(tokenIds.toString(), expected.toString(), 'tokenIds are correct')

      // Token URI Correct
      let tokenURI = await token.tokenURI('1')
      assert.equal(tokenURI, 'https://www.epiccode.dev/nft')
    })
  })
})
