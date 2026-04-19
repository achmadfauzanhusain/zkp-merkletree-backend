const { buildPoseidon } = require("circomlibjs")
const snarkjs = require("snarkjs")
const { MerkleTree } = require("fixed-merkle-tree")
const fs = require("fs")
const path = require("path")

const { colUser } = require("../../db/firebase")

let leaves = []
let tree = new MerkleTree(2, leaves) // depth = 2 (sesuai circuit kamu)

const vKey = JSON.parse(fs.readFileSync(path.join(__dirname, "../../zk/verification-key.json")))

async function hashSecret(secret) {
  const poseidon = await circomlib.buildPoseidon()
  const hash = poseidon([BigInt(secret)])
  return poseidon.F.toString(hash)
}

module.exports = {
    register: async(req, res) => {
        try {
            const { secret } = req.body

            // hash jadi leaf
            const leaf = await hashSecret(secret)

            leaves.push(leaf)
            tree = new MerkleTree(2, leaves)

            res.json({
            success: true,
            leaf,
            index: leaves.length - 1,
            root: tree.root
            })
        } catch (error) {
            res.status(500).json({
                status: false, 
                message: "Internal Server Error!" 
            })
        }
    },
    root: async(req, res) => {
        try {
            res.status(200).json({
                status: true,
                root: tree.root
            })
        } catch (error) {
            res.status(500).json({
                status: false, 
                message: "Internal Server Error!" 
            })
        }
    },
    getMerkleProof: async(req, res) => {
        try {
            const index = parseInt(req.params.index)

            if (index >= leaves.length) {
            return res.status(400).json({ error: "invalid index" })
            }

            const proof = tree.path(index)

            res.status(200).json({
                proofs: proof.pathElements,
                pathIndexes: proof.pathIndices,
                root: tree.root
            })
        } catch (error) {
            res.status(500).json({
                status: false, 
                message: "Internal Server Error!" 
            })
        }
    },
    login: async(req, res) => {
        try {
            const { proof, publicSignals } = req.body

            const verified = await snarkjs.groth16.verify(
                vKey,
                publicSignals,
                proof
            )

            if (!verified) {
                return res.json({ success: false })
            }

            res.json({
                success: true,
                message: "ZK proof valid, user is in Merkle Tree"
            })

        } catch (err) {
            res.status(500).json({ success: false, message: "Internal Server Error!" })
        }
    }
}