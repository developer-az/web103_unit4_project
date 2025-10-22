import { pool } from '../config/database.js'

// Get all cars with their features
export const getAllCars = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                c.id,
                c.name,
                c.total_price,
                c.created_at,
                c.updated_at,
                json_agg(
                    json_build_object(
                        'feature_id', f.id,
                        'feature_name', f.name,
                        'feature_display_name', f.display_name,
                        'option_id', fo.id,
                        'option_name', fo.name,
                        'option_display_name', fo.display_name,
                        'option_price', fo.price,
                        'option_image_url', fo.image_url
                    )
                ) as features
            FROM cars c
            LEFT JOIN car_features cf ON c.id = cf.car_id
            LEFT JOIN features f ON cf.feature_id = f.id
            LEFT JOIN feature_options fo ON cf.option_id = fo.id
            GROUP BY c.id, c.name, c.total_price, c.created_at, c.updated_at
            ORDER BY c.created_at DESC
        `)
        
        res.json(result.rows)
    } catch (error) {
        console.error('Error getting all cars:', error)
        res.status(500).json({ error: 'Failed to get cars' })
    }
}

// Get a single car by ID
export const getCarById = async (req, res) => {
    try {
        const { id } = req.params
        
        const result = await pool.query(`
            SELECT 
                c.id,
                c.name,
                c.total_price,
                c.created_at,
                c.updated_at,
                json_agg(
                    json_build_object(
                        'feature_id', f.id,
                        'feature_name', f.name,
                        'feature_display_name', f.display_name,
                        'option_id', fo.id,
                        'option_name', fo.name,
                        'option_display_name', fo.display_name,
                        'option_price', fo.price,
                        'option_image_url', fo.image_url
                    )
                ) as features
            FROM cars c
            LEFT JOIN car_features cf ON c.id = cf.car_id
            LEFT JOIN features f ON cf.feature_id = f.id
            LEFT JOIN feature_options fo ON cf.option_id = fo.id
            WHERE c.id = $1
            GROUP BY c.id, c.name, c.total_price, c.created_at, c.updated_at
        `, [id])
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Car not found' })
        }
        
        res.json(result.rows[0])
    } catch (error) {
        console.error('Error getting car by ID:', error)
        res.status(500).json({ error: 'Failed to get car' })
    }
}

// Create a new car
export const createCar = async (req, res) => {
    const client = await pool.connect()
    
    try {
        await client.query('BEGIN')
        
        const { name, features } = req.body
        
        // Validate that all required features are provided and not null
        const requiredFeatures = ['exterior', 'wheels', 'interior', 'engine']
        const providedFeatures = Object.keys(features)
        
        for (const feature of requiredFeatures) {
            if (!providedFeatures.includes(feature)) {
                throw new Error(`Missing required feature: ${feature}`)
            }
            if (features[feature] === null || features[feature] === undefined) {
                throw new Error(`Please select a ${feature} option`)
            }
        }
        
        // Calculate total price
        let totalPrice = 0
        const featureOptions = []
        
        for (const [featureName, optionId] of Object.entries(features)) {
            const optionResult = await client.query(
                'SELECT fo.*, f.name as feature_name FROM feature_options fo JOIN features f ON fo.feature_id = f.id WHERE fo.id = $1 AND f.name = $2',
                [optionId, featureName]
            )
            
            if (optionResult.rows.length === 0) {
                throw new Error(`Invalid option ${optionId} for feature ${featureName}`)
            }
            
            const option = optionResult.rows[0]
            totalPrice += parseFloat(option.price)
            featureOptions.push({
                featureId: option.feature_id,
                optionId: option.id,
                featureName: option.feature_name
            })
        }
        
        // Create the car
        const carResult = await client.query(
            'INSERT INTO cars (name, total_price) VALUES ($1, $2) RETURNING id',
            [name, totalPrice]
        )
        
        const carId = carResult.rows[0].id
        
        // Insert car features
        for (const featureOption of featureOptions) {
            await client.query(
                'INSERT INTO car_features (car_id, feature_id, option_id) VALUES ($1, $2, $3)',
                [carId, featureOption.featureId, featureOption.optionId]
            )
        }
        
        await client.query('COMMIT')
        
        // Return the created car with features
        const createdCar = await getCarById({ params: { id: carId } }, res)
        
    } catch (error) {
        await client.query('ROLLBACK')
        console.error('Error creating car:', error)
        res.status(400).json({ error: error.message })
    } finally {
        client.release()
    }
}

// Update a car
export const updateCar = async (req, res) => {
    const client = await pool.connect()
    
    try {
        await client.query('BEGIN')
        
        const { id } = req.params
        const { name, features } = req.body
        
        // Check if car exists
        const carCheck = await client.query('SELECT id FROM cars WHERE id = $1', [id])
        if (carCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Car not found' })
        }
        
        // Validate that all required features are provided and not null
        const requiredFeatures = ['exterior', 'wheels', 'interior', 'engine']
        const providedFeatures = Object.keys(features)
        
        for (const feature of requiredFeatures) {
            if (!providedFeatures.includes(feature)) {
                throw new Error(`Missing required feature: ${feature}`)
            }
            if (features[feature] === null || features[feature] === undefined) {
                throw new Error(`Please select a ${feature} option`)
            }
        }
        
        // Calculate total price
        let totalPrice = 0
        const featureOptions = []
        
        for (const [featureName, optionId] of Object.entries(features)) {
            const optionResult = await client.query(
                'SELECT fo.*, f.name as feature_name FROM feature_options fo JOIN features f ON fo.feature_id = f.id WHERE fo.id = $1 AND f.name = $2',
                [optionId, featureName]
            )
            
            if (optionResult.rows.length === 0) {
                throw new Error(`Invalid option ${optionId} for feature ${featureName}`)
            }
            
            const option = optionResult.rows[0]
            totalPrice += parseFloat(option.price)
            featureOptions.push({
                featureId: option.feature_id,
                optionId: option.id,
                featureName: option.feature_name
            })
        }
        
        // Update the car
        await client.query(
            'UPDATE cars SET name = $1, total_price = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3',
            [name, totalPrice, id]
        )
        
        // Delete existing car features
        await client.query('DELETE FROM car_features WHERE car_id = $1', [id])
        
        // Insert new car features
        for (const featureOption of featureOptions) {
            await client.query(
                'INSERT INTO car_features (car_id, feature_id, option_id) VALUES ($1, $2, $3)',
                [id, featureOption.featureId, featureOption.optionId]
            )
        }
        
        await client.query('COMMIT')
        
        // Return the updated car
        const updatedCar = await getCarById({ params: { id } }, res)
        
    } catch (error) {
        await client.query('ROLLBACK')
        console.error('Error updating car:', error)
        res.status(400).json({ error: error.message })
    } finally {
        client.release()
    }
}

// Delete a car
export const deleteCar = async (req, res) => {
    try {
        const { id } = req.params
        
        const result = await pool.query('DELETE FROM cars WHERE id = $1 RETURNING id', [id])
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Car not found' })
        }
        
        res.json({ message: 'Car deleted successfully' })
    } catch (error) {
        console.error('Error deleting car:', error)
        res.status(500).json({ error: 'Failed to delete car' })
    }
}


