import express from 'express'
import { 
    getAllCars, 
    getCarById, 
    createCar, 
    updateCar, 
    deleteCar 
} from '../controllers/carsController.js'

const router = express.Router()

// Define routes for cars
router.get('/', getAllCars)
router.get('/:id', getCarById)
router.post('/', createCar)
router.put('/:id', updateCar)
router.delete('/:id', deleteCar)

export default router








