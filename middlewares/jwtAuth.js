const jwt = require('jsonwebtoken');

const authorise = (req, res, next) => {
  try {
    // Get token from Authorization header
    const authorization = req.get('Authorization');

    // Check if token exists
    if (!authorization) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }
    const token =  authorization.split(" ")[1]

    // // Verify token
    const secret = process.env.JWT_SECRET_KEY ; 
    const decoded = jwt.verify(token, secret);

    // // Attach user data to request object
    req.user = decoded;
    next(); 
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

module.exports = authorise;
