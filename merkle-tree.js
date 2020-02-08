const crypto = require('crypto')

// get hash of string data
function sha256(data) {
    return crypto.createHash('sha256').update(data).digest('hex')
}

function printTree(data, level, position) {
    if (level >= 0) {
        let blank = ""
        for (let i = 0; i < data.length - 1 - level; i++) {
            blank = blank.concat("  ")
        }
        if (data[level][position]) {
            console.log(blank.concat(data[level][position]))
        }
        printTree(data, level - 1, position * 2)
        printTree(data, level - 1, position * 2 + 1)
    }
}

class MerkleTree {
    constructor(rawDatas) {
        // hash the raw data
        const checkSet = new Set()
        let nodes = rawDatas.map(x => {
            const h = sha256(x)
            // check if raw data list has duplicated element
            checkSet.add(h)
            return h
        })
        if (nodes.length != checkSet.size) {
            throw new Error('duplicated element')
        }
        this.data = []
        this.data.push(nodes)
        while (nodes.length > 1) {
            // let level = this.data.length
            let layer = []
            let left, right
            for (let i = 0; i < nodes.length; i++) {
                if (i % 2 == 0) {
                    left = nodes[i]
                } else {
                    right = nodes[i]
                    layer.push(sha256(left.concat(right)))
                    left = null
                    right = null
                }
            }
            // odd element
            if (left) {
                // duplicate odd element
                right = left
                layer.push(sha256(left.concat(right)))
                left = null
                right = null
            }
            this.data.push(layer)
            nodes = [].concat(layer)
        }
    }

    getRoot() {
        return this.data[this.data.length - 1][0]
    }

    getProof(element, position) {
        const proof = []
        let hash = sha256(element)

        // do not put in position param
        if (!position) {
            for (let i = 0; i < this.data[0].length; i++) {
                if (hash == this.data[0][i]) {
                    position = i
                    break
                }
            }
        }
        if (!position || this.data[0][position] != hash) {
            throw new Error('element not in merkle tree')
        }

        // -1 means do not push root
        for (let level = 0; level < this.data.length - 1; level++) {
            if (position % 2 == 0) {
                proof.push({
                    isLeft: true,
                    data: position == this.data[level].length - 1 ? this.data[level][position] : this.data[level][position + 1]
                })
            } else {
                proof.push({
                    isLeft: false,
                    data: this.data[level][position - 1]
                })
            }
            position = Math.floor(position / 2)
        }

        return proof

    }

    display() {
        printTree(this.data, this.data.length - 1, 0)
    }

    static verify(element, proof, root) {
        let hash = sha256(element)
        for (let i = 0; i < proof.length; i++) {
            hash = proof[i].isLeft ? sha256(hash.concat(proof[i].data)) : sha256(proof[i].data.concat(hash))
        }
        return hash == root
    }

}

module.exports = MerkleTree