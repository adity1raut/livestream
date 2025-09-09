import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "araut@12";

const authenticateToken = (req, res, next) => {
    try {
        // Get token from cookies
        const token = req.cookies?.token;

        if (!token) {
            return res.status(401).json({ error: true, message: 'Access denied. No token provided.' });
        }

        // Verify token
        jwt.verify(token, JWT_SECRET, (err, decoded) => {
            if (err) {
                return res.status(403).json({ error: true, message: 'Invalid or expired token.' });
            }

            // Attach user info to request
            req.user = decoded.user;
            next();
        });
    } catch (error) {
        console.error('Token authentication error:', error);
        res.status(500).json({ error: true, message: 'Server error' });
    }
};

export default authenticateToken;
