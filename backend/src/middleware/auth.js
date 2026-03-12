import jwt from 'jsonwebtoken';

export const authenticate = (req, res, next) => {
  try {
    // Expect header: Authorization: Bearer <token>
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1];

    if (!token || token === 'undefined' || token === 'null') {
      return res.status(401).json({ status: 'error', message: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    req.user = decoded;
    next();
  } catch (error) {
    // Log to help debugging invalid/expired token issues
    console.warn('Auth middleware token verification failed:', error.message, { authorization: req.headers.authorization });
    res.status(401).json({ status: 'error', message: 'Invalid or expired token. Please login again.' });
  }
};