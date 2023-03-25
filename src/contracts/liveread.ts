import {
    assert,
    ByteString,
    method,
    prop,
    PubKey,
    sha256,
    Sha256,
    SmartContract,
} from 'scrypt-ts'

export class Liveread extends SmartContract {
    @prop()
    hash: Sha256

    @prop()
    host: PubKey

    @prop()
    sponsor: PubKey

    constructor(hash: Sha256, host: PubKey, sponsor: PubKey) {
        super(...arguments)
        this.hash = hash
        this.host = host
        this.sponsor = sponsor
    }

    @method()
    public cancel(message: ByteString) {
        assert(sha256(message) == this.hash, 'Hash does not match')
    }

    @method()
    public accept(message: ByteString) {
        assert(sha256(message) == this.hash, 'Hash does not match')
    }
}
