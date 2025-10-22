import { pool } from '../config/database.js'

// Get all features with their options
export const getAllFeatures = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                f.id,
                f.name,
                f.display_name,
                json_agg(
                    json_build_object(
                        'id', fo.id,
                        'name', fo.name,
                        'display_name', fo.display_name,
                        'price', fo.price,
                        'image_url', fo.image_url
                    ) ORDER BY fo.price
                ) as options
            FROM features f
            LEFT JOIN feature_options fo ON f.id = fo.feature_id
            GROUP BY f.id, f.name, f.display_name
            ORDER BY f.id
        `)
        
        res.json(result.rows)
    } catch (error) {
        console.error('Error getting all features:', error)
        res.status(500).json({ error: 'Failed to get features' })
    }
}

// Get a single feature by name with its options
export const getFeatureByName = async (req, res) => {
    try {
        const { name } = req.params
        
        const result = await pool.query(`
            SELECT 
                f.id,
                f.name,
                f.display_name,
                json_agg(
                    json_build_object(
                        'id', fo.id,
                        'name', fo.name,
                        'display_name', fo.display_name,
                        'price', fo.price,
                        'image_url', fo.image_url
                    ) ORDER BY fo.price
                ) as options
            FROM features f
            LEFT JOIN feature_options fo ON f.id = fo.feature_id
            WHERE f.name = $1
            GROUP BY f.id, f.name, f.display_name
        `, [name])
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Feature not found' })
        }
        
        res.json(result.rows[0])
    } catch (error) {
        console.error('Error getting feature by name:', error)
        res.status(500).json({ error: 'Failed to get feature' })
    }
}

// Get all feature options
export const getAllFeatureOptions = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                fo.id,
                fo.name,
                fo.display_name,
                fo.price,
                fo.image_url,
                f.name as feature_name,
                f.display_name as feature_display_name
            FROM feature_options fo
            JOIN features f ON fo.feature_id = f.id
            ORDER BY f.id, fo.price
        `)
        
        res.json(result.rows)
    } catch (error) {
        console.error('Error getting all feature options:', error)
        res.status(500).json({ error: 'Failed to get feature options' })
    }
}

// Get feature options by feature name
export const getFeatureOptionsByName = async (req, res) => {
    try {
        const { name } = req.params
        
        const result = await pool.query(`
            SELECT 
                fo.id,
                fo.name,
                fo.display_name,
                fo.price,
                fo.image_url
            FROM feature_options fo
            JOIN features f ON fo.feature_id = f.id
            WHERE f.name = $1
            ORDER BY fo.price
        `, [name])
        
        res.json(result.rows)
    } catch (error) {
        console.error('Error getting feature options by name:', error)
        res.status(500).json({ error: 'Failed to get feature options' })
    }
}








