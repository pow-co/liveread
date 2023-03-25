import {
    Provider,
    PubKey,
    SignTransactionOptions,
    SignatureRequest,
    SignatureResponse,
    Signer,
    WhatsonchainProvider,
    bsv,
    findSig,
    toByteString,
    toHex,
} from 'scrypt-ts'
import { Liveread } from './src/contracts/liveread'

import { Address, PrivateKey, PublicKey, Transaction } from 'bsv'

export async function main() {
    const hostPrivateKey = new PrivateKey(process.env.host_privatekey)

    const sponsorPrivateKey = new PrivateKey(process.env.sponsor_privatekey)

    const host = PubKey(toHex(hostPrivateKey.publicKey))

    const sponsor = PubKey(toHex(sponsorPrivateKey.publicKey))

    await Liveread.compile()

    const instance = new Liveread(
        toByteString('Buy my eBook!', true),
        host,
        sponsor
    )

    const wallet = new Wallet(new WhatsonchainProvider(bsv.Networks.mainnet), {
        privateKey: sponsorPrivateKey,
    })

    console.log('ADDRESS', (await wallet.getDefaultAddress()).toString())

    await instance.connect(wallet)

    console.log({ lockingScript: instance.lockingScript.toHex() })

    const deployment = await instance.deploy(5000)

    console.log('deploy.result', deployment.serialize())

    const contract = Liveread.fromTx(deployment, 0)

    console.log('contract', contract)

    console.log(
        'commentary:',
        Buffer.from(contract.commentary, 'hex').toString('utf8')
    )

    await contract.connect(wallet)

    const cancellation = await contract.methods.cancel(
        (sigResponses: SignatureResponse[]) => {
            return findSig(sigResponses, bsv.PublicKey.fromString(sponsor))
        },
        {
            pubKeyOrAddrToSign: bsv.PublicKey.fromString(sponsor),
        }
    )

    console.log('cancellation', cancellation.tx.hash)
}

class Wallet extends Signer {
    async requestAuth(): Promise<{ isAuthenticated: boolean; error: string }> {
        throw new Error('Method not implemented.')
    }
    async signMessage(
        message: string,
        address?: Address | undefined
    ): Promise<string> {
        console.log({ message, address })
        throw new Error('Method not implemented.')
    }
    async getSignatures(
        rawTxHex: string,
        sigRequests: SignatureRequest[]
    ): Promise<SignatureResponse[]> {
        console.log({ rawTxHex, sigRequests })
        //throw new Error('Method not implemented.');
        return []
    }

    privateKey: PrivateKey

    constructor(
        provider: Provider,
        { privateKey }: { privateKey: PrivateKey }
    ) {
        super(provider)

        this.privateKey = privateKey
    }

    async signTransaction(
        tx: Transaction,
        options?: SignTransactionOptions | undefined
    ): Promise<Transaction> {
        console.log('signTransaction', { options })
        return tx.sign(this.privateKey)
    }

    async signRawTransaction(
        rawTxHex: string,
        options: SignTransactionOptions
    ): Promise<string> {
        console.log({ options })
        const tx = new Transaction(rawTxHex)

        tx.sign(this.privateKey)

        return tx.serialize()
    }

    async getDefaultAddress(): Promise<Address> {
        return this.privateKey.toAddress()
    }

    async getDefaultPubKey(): Promise<PublicKey> {
        return this.privateKey.publicKey
    }

    async getPubKey(address?: Address | undefined): Promise<PublicKey> {
        console.debug({ address })
        return this.privateKey.publicKey
    }

    async connect(provider: Provider): Promise<this> {
        console.debug({ provider })
        return this
    }

    async isAuthenticated(): Promise<boolean> {
        return true
    }
}

main()
