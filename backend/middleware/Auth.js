import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const authenticateToken = (req, res, next) => {
  try {
    // Get token from cookies
    const token = req.cookies.token;
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: "Access denied. No token provided." 
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Ensure _id property exists for consistency
    // Your JWT contains 'id' but your code expects '_id'
    req.user = {
      ...decoded,
      _id: decoded.id || decoded._id // Use id from token or fallback to _id
    };
    
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        message: "Token expired" 
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false, 
        message: "Invalid token" 
      });
    }
    
    return res.status(500).json({ 
      success: false, 
      message: "Server error during authentication" 
    });
  }
};

export default authenticateToken;