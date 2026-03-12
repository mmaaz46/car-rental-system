import express from 'express'
import { carController } from '../controllers/carController.js'
import { authenticate } from '../middleware/auth.js'
import { requireAdmin } from '../middleware/admin.js'
import { upload } from '../config/multer.js'

const router = express.Router()

// Public routes
router.get('/', carController.getAllCars)
router.get('/:id', carController.getCarById)

// Protected admin routes
router.post('/', 
  authenticate, 
  requireAdmin,
  upload.array('images', 5),
  carController.createCar
)

router.put('/:id', 
  authenticate, 
  requireAdmin,
  upload.array('images', 5),
  carController.updateCar
)

router.delete('/:id', 
  authenticate, 
  requireAdmin,
  carController.deleteCar
)

export default router