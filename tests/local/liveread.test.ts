import { expect, use } from 'chai'
import {
    MethodCallOptions,
    PubKey,
    SignatureResponse,
    bsv,
    findSig,
    sha256,
    toByteString,
    toHex,
} from 'scrypt-ts'
import { Liveread } from '../../src/contracts/liveread'
import { getDummySigner, getDummyUTXO } from './utils/txHelper'
import chaiAsPromised from 'chai-as-promised'
import { getDefaultSigner } from '../testnet/utils/txHelper'
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
    let host: PubKey
    let sponsor: PubKey

    before(async () => {
        await Liveread.compile()

        const [hostPrivKey, hostPubKey] = randomPrivateKey()
        const [sponsorPrivKey, sponsorPubKey] = randomPrivateKey()

        host = PubKey(toHex(hostPubKey))
        sponsor = PubKey(toHex(sponsorPubKey))

        instance = new Liveread(
            toByteString('hello world', true),
            PubKey(toHex(hostPubKey)),
            PubKey(toHex(sponsorPubKey))
        )
        await instance.connect(getDummySigner([hostPrivKey, sponsorPrivKey]))
    })

    it('The show host should accept the offer and agree to read the message', async () => {
        const { tx: callTx, atInputIndex } = await instance.methods.accept(
            toByteString(
                'I agree to read the `commentary` contained herein live on air.',
                true
            ),
            (sigResponses: SignatureResponse[]) => {
                return findSig(sigResponses, bsv.PublicKey.fromString(host))
            },
            {
                fromUTXO: getDummyUTXO(),
                pubKeyOrAddrToSign: bsv.PublicKey.fromString(host),
            } as MethodCallOptions<Liveread>
        )

        const result = callTx.verifyScript(atInputIndex)
        expect(result.success, result.error).to.eq(true)
    })

    it('The sponsor should be able to cancel', async () => {
        const { tx: callTx, atInputIndex } = await instance.methods.cancel(
            (sigResponses: SignatureResponse[]) => {
                return findSig(sigResponses, bsv.PublicKey.fromString(sponsor))
            },
            {
                fromUTXO: getDummyUTXO(),
                pubKeyOrAddrToSign: bsv.PublicKey.fromString(sponsor),
            } as MethodCallOptions<Liveread>
        )

        const result = callTx.verifyScript(atInputIndex)
        expect(result.success, result.error).to.eq(true)
    })

    it('should throw with wrong message.', async () => {
        return expect(
            instance.methods.accept(
                toByteString('wrong message', true),
                (sigResponses: SignatureResponse[]) => {
                    return findSig(sigResponses, bsv.PublicKey.fromString(host))
                },
                {
                    fromUTXO: getDummyUTXO(),
                    pubKeyOrAddrToSign: bsv.PublicKey.fromString(host),
                } as MethodCallOptions<Liveread>
            )
        ).to.be.rejectedWith(/Please agree to terms of the contract/)
    })
})
