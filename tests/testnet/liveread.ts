import { Liveread } from '../../src/contracts/liveread'
import { getDefaultSigner, inputSatoshis } from './utils/txHelper'
import { toByteString, sha256 } from 'scrypt-ts'

const message = 'hello world, sCrypt!'

async function main() {
    await Liveread.compile()
    const instance = new Liveread(sha256(toByteString(message, true)))

    // connect to a signer
    await instance.connect(getDefaultSigner())

    // contract deployment
    const deployTx = await instance.deploy(inputSatoshis)
    console.log('Liveread contract deployed: ', deployTx.id)

    // contract call
    const { tx: callTx } = await instance.methods.unlock(
        toByteString(message, true)
    )
    console.log('Liveread contract `unlock` called: ', callTx.id)
}

describe('Test SmartContract `Liveread` on testnet', () => {
    it('should succeed', async () => {
        await main()
    })
})
