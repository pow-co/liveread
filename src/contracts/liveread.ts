import {
    assert,
    ByteString,
    method,
    prop,
    sha256,
    Sha256,
    SmartContract,
} from 'scrypt-ts'

export class Liveread extends SmartContract {
    @prop()
    hash: Sha256

    constructor(hash: Sha256) {
        super(...arguments)
        this.hash = hash
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
