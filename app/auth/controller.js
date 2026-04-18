module.exports = {
    register: async(req, res) => {
        try {
            const { secret } = req.body;
        } catch (error) {
            res.status(500).json({
                status: false, 
                message: "Internal Server Error!" 
            })
        }
    },
    login: async(req, res) => {
        try {
            
        } catch (error) {
            res.status(500).json({
                status: false, 
                message: "Internal Server Error!" 
            })
        }
    }
}