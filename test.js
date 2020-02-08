const crypto = require('crypto')
const MerkleTree = require('./merkle-tree')

// get hash of string data
function sha256(data) {
    return crypto.createHash('sha256').update(data).digest('hex')
}

// generate raw data to build merkle tree
function genRawData(len) {
    const leaves = []
    for (let i = 0; i < len; i++) {
        leaves.push(sha256(i.toString()))
    }
    return leaves
}

// 1. generate random data
const rawDatas = genRawData(10)
// 2. build merkle tree
const merkleTree = new MerkleTree(rawDatas)
console.log("merkle tree:")
merkleTree.display()
// 3. get merkle root
const root = merkleTree.getRoot()
console.log("merket root:\n", root)
// 4. get proof of element 3
const proof = merkleTree.getProof(rawDatas[3])
console.log(`proof for data ${rawDatas[3]}`)
console.log(proof)
// 5. check proof of element 3
console.log("verify proof:", MerkleTree.verify(rawDatas[3], proof, root))