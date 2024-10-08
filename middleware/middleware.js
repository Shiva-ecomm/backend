const jwt = require('jsonwebtoken');

module.exports = async (req, res, next) => {
    try {
        // Check if the authorization header is present
        const authHeader = req.headers['authorization'];
        if (!authHeader) {
            return res.status(401).send({ message: 'Authorization header missing', success: false });
        }

        // Split the authorization header to get the token
        const token = authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).send({ message: 'Token missing from authorization header', success: false });
        }

        // Verify the token
        jwt.verify(token, process.env.JWT_SECRET, (err, decode) => {
            if (err) {
                return res.status(401).send({ message: 'Auth failed', success: false });
            } else {
                // console.log(decode);
                req.body.userId = decode.id;
                next();
            }
        });

    } catch (error) {
        // console.error(error);
        res.status(500).send({ message: 'Server error', success: false });
    }
};
