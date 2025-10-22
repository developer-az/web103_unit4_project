import express from 'express'
import { 
    getAllFeatures, 
    getFeatureByName, 
    getAllFeatureOptions, 
    getFeatureOptionsByName 
} from '../controllers/featuresController.js'

const router = express.Router()

// Define routes for features
router.get('/', getAllFeatures)
router.get('/options', getAllFeatureOptions)
router.get('/:name', getFeatureByName)
router.get('/:name/options', getFeatureOptionsByName)

export default router








