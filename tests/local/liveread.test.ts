import { expect, use } from 'chai'
import {
    MethodCallOptions,
    PubKey,
    bsv,
    sha256,
    toByteString,
    toHex,
} from 'scrypt-ts'
import { Liveread } from '../../src/contracts/liveread'
import { getDummySigner, getDummyUTXO } from './utils/txHelper'
import chaiAsPromised from 'chai-as-promised'
use(chaiAsPromised)

export function randomPrivateKey() {
    const privateKey = bsv.PrivateKey.fromRandom('testnet')
    const publicKey = bsv.PublicKey.fromPrivateKey(privateKey)
    const publicKeyHash = bsv.crypto.Hash.sha256ripemd160(publicKey.toBuffer())
    const address = publicKey.toAddress()
    return [privateKey, publicKey, publicKeyHash, address] as const
}

describe('Test SmartContract `Liveread`', () => {
    let instance: Liveread

    before(async () => {
        await Liveread.compile()

        const [hostPrivKey, hostPubKey] = randomPrivateKey()
        const [sponsorPrivKey, sponsorPubKey] = randomPrivateKey()

        const host = PubKey(toHex(hostPubKey))

        const sponsor = PubKey(toHex(sponsorPubKey))
        instance = new Liveread(
            sha256(toByteString('hello world', true)),
            PubKey(toHex(hostPubKey)),
            PubKey(toHex(sponsorPubKey))
        )
        await instance.connect(getDummySigner())
    })

    it('The show host should accept the offer and agree to read the message', async () => {
        const { tx: callTx, atInputIndex } = await instance.methods.accept(
            toByteString('hello world', true),
            {
                fromUTXO: getDummyUTXO(),
            } as MethodCallOptions<Liveread>
        )

        const result = callTx.verifyScript(atInputIndex)
        expect(result.success, result.error).to.eq(true)
    })

    it('The sponsor should be able to cancel', async () => {
        const { tx: callTx, atInputIndex } = await instance.methods.cancel(
            toByteString('hello world', true),
            {
                fromUTXO: getDummyUTXO(),
            } as MethodCallOptions<Liveread>
        )

        const result = callTx.verifyScript(atInputIndex)
        expect(result.success, result.error).to.eq(true)
    })

    it('should throw with wrong message.', async () => {
        return expect(
            instance.methods.accept(toByteString('wrong message', true), {
                fromUTXO: getDummyUTXO(),
            } as MethodCallOptions<Liveread>)
        ).to.be.rejectedWith(/Hash does not match/)
    })
})
