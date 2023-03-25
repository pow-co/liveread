import {
    assert,
    ByteString,
    method,
    prop,
    PubKey,
    SmartContract,
    toByteString,
} from 'scrypt-ts'

export class Liveread extends SmartContract {
    @prop()
    commentary: ByteString

    @prop()
    host: PubKey

    @prop()
    sponsor: PubKey

    @prop()
    terms: ByteString

    constructor(commentary: ByteString, host: PubKey, sponsor: PubKey) {
        super(...arguments)
        this.commentary = commentary
        this.host = host
        this.sponsor = sponsor
        this.terms = toByteString(
            'I agree to read the commentary contained herein live on air.',
            true
        )
    }

    @method()
    public cancel(message: ByteString) {
        assert(true)
    }

    @method()
    public accept(message: ByteString) {
        assert(
            message == this.commentary,
            'Please agree to terms of the contract'
        )
    }
}
