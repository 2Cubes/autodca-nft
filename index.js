import { ethers } from "ethers";
import fs from 'fs';
import _ from "lodash"

let provider = new ethers.JsonRpcProvider("https://mainnet.era.zksync.io", 324);

const timeout = ms => new Promise(res => setTimeout(res, ms * 1000))

let wallets = shuffle(fs.readFileSync('wallets.txt', 'utf8').split('\n'));
let feeData = await provider.getFeeData();
console.log(feeData);

for (let seed of wallets) {

    const wallet = ethers.Wallet.fromPhrase(seed, provider);
    const mintInterface = new ethers.Interface(['function mint(address account) view returns ()']);

    const tx = {
        to: '0x111f5DAB17D942ae5C0BA829cA913B806e6d3040',
        from: wallet.address,
        data: mintInterface.encodeFunctionData('mint', [wallet.address]),
        value: 0
    };

    const estimatedGas = await wallet.estimateGas(tx);
    await wallet.sendTransaction({
        ...tx,
        value: 0,
        gasLimit: BigInt(parseInt(Number(estimatedGas) / 3)),
        gasPrice: feeData['gasPrice']
    }).then(async (transaction) => {
        console.log(`Tx sent: https://explorer.zksync.io/tx/${transaction.hash}`);
    }).catch((err) => {
        console.log('Failed send transaction')
        console.log(err)
    });

    await timeout(_.random(60,300))
}

function shuffle(array) {
    let currentIndex = array.length,  randomIndex;
    while (currentIndex != 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
    }
    return array;
}