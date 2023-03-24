import { expect, use } from 'chai'
import { MethodCallOptions, sha256, toByteString } from 'scrypt-ts'
import { Liveread } from '../../src/contracts/liveread'
import { getDummySigner, getDummyUTXO } from './utils/txHelper'
import chaiAsPromised from 'chai-as-promised'
use(chaiAsPromised)

describe('Test SmartContract `Liveread`', () => {
    let instance: Liveread

    before(async () => {
        await Liveread.compile()
        instance = new Liveread(sha256(toByteString('hello world', true)))
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
