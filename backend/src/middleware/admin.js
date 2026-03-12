export const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin' && req.user.role !== 'manager') {
    return res.status(403).json({ 
      status: 'error', 
      message: 'Admin access required' 
    })
  }
  next()
}