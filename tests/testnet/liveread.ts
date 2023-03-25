import { Liveread } from '../../src/contracts/liveread'
import {
    getDefaultSigner,
    inputSatoshis,
    randomPrivateKey,
} from './utils/txHelper'
import { toByteString, sha256, toHex, PubKey } from 'scrypt-ts'

const message = 'hello world, sCrypt!'

async function main() {
    await Liveread.compile()

    const [hostPrivKey, hostPubKey] = randomPrivateKey()
    const [sponsorPrivKey, sponsorPubKey] = randomPrivateKey()

    const host = PubKey(toHex(hostPubKey))

    const sponsor = PubKey(toHex(sponsorPubKey))
    const instance = new Liveread(
        toByteString('hello world', true),
        PubKey(toHex(hostPubKey)),
        PubKey(toHex(sponsorPubKey))
    )

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
