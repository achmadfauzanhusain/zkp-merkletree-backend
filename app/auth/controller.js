const { buildPoseidon } = require("circomlibjs")
const snarkjs = require("snarkjs")
const { MerkleTree } = require("fixed-merkle-tree")
const fs = require("fs")
const path = require("path")

const vKey = JSON.parse(fs.readFileSync(path.join(__dirname, "../../zk/verification-key.json")))

let leaves = []
let poseidon = null
let tree = null

async function initTree() {
  if (!poseidon) {
    poseidon = await buildPoseidon()
  }
  if (!tree) {
    tree = new MerkleTree(2, leaves, {
      hashFunction: (left, right) => {
        const hash = poseidon([BigInt(left), BigInt(right)])
        return poseidon.F.toString(hash)
      },
      zeroElement: "0"
    })
  }
}

module.exports = {
  register: async (req, res) => {
    try {
      await initTree()
      const { secret } = req.body

      const hash = poseidon([BigInt(secret)])
      const leaf = poseidon.F.toString(hash)

      leaves.push(leaf)

      // rebuild merkle tree
      tree = new MerkleTree(2, leaves, {
        hashFunction: (left, right) => {
          const h = poseidon([BigInt(left), BigInt(right)])
          return poseidon.F.toString(h)
        },
        zeroElement: "0"
      })

      res.json({
        success: true,
        leaf,
        index: leaves.length - 1,
        root: tree.root
      })
    } catch (error) {
      console.error(error)
      res.status(500).json({ status: false, message: "Internal Server Error!" })
    }
  },
  root: async (req, res) => {
    try {
      await initTree()
      res.status(200).json({ status: true, root: tree.root })
    } catch (error) {
      res.status(500).json({ status: false, message: "Internal Server Error!" })
    }
  },
  getMerkleProof: async (req, res) => {
    try {
      await initTree()
      const index = parseInt(req.params.index)

      if (index >= leaves.length) {
        return res.status(400).json({ error: "Invalid index" })
      }

      const proof = tree.path(index)

      res.status(200).json({
        pathElements: proof.pathElements,
        pathIndices: proof.pathIndices,
        root: tree.root
      })
    } catch (error) {
      res.status(500).json({ status: false, message: "Internal Server Error!" })
    }
  },
  login: async (req, res) => {
    try {
      const { proof, publicSignals } = req.body

      const verified = await snarkjs.groth16.verify(vKey, publicSignals, proof)
      if (!verified) return res.json({ success: false })

      res.json({ success: true, message: "ZK proof valid, user is in Merkle Tree" })
    } catch (err) {
      res.status(500).json({ success: false, message: "Internal Server Error!" })
    }
  }
}