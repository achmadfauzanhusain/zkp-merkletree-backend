module.exports = {
    test: async(req, res) => {
        try {
            res.status(200).json({ 
                status: true,
                message: "Test Successful!" 
            })
        } catch (error) {
            res.status(500).json({
                status: false,
                message: "Internal Server Error!" 
            })
        }
    }
}