import { pool } from './database.js'

const resetDatabase = async () => {
    try {
        // Drop tables if they exist (in reverse order of dependencies)
        await pool.query('DROP TABLE IF EXISTS car_features CASCADE;')
        await pool.query('DROP TABLE IF EXISTS cars CASCADE;')
        await pool.query('DROP TABLE IF EXISTS feature_options CASCADE;')
        await pool.query('DROP TABLE IF EXISTS features CASCADE;')

        // Create features table
        await pool.query(`
            CREATE TABLE features (
                id SERIAL PRIMARY KEY,
                name VARCHAR(50) NOT NULL,
                display_name VARCHAR(100) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `)

        // Create feature_options table
        await pool.query(`
            CREATE TABLE feature_options (
                id SERIAL PRIMARY KEY,
                feature_id INTEGER REFERENCES features(id) ON DELETE CASCADE,
                name VARCHAR(50) NOT NULL,
                display_name VARCHAR(100) NOT NULL,
                price DECIMAL(10,2) DEFAULT 0.00,
                image_url VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `)

        // Create cars table
        await pool.query(`
            CREATE TABLE cars (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                total_price DECIMAL(10,2) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `)

        // Create car_features junction table
        await pool.query(`
            CREATE TABLE car_features (
                id SERIAL PRIMARY KEY,
                car_id INTEGER REFERENCES cars(id) ON DELETE CASCADE,
                feature_id INTEGER REFERENCES features(id) ON DELETE CASCADE,
                option_id INTEGER REFERENCES feature_options(id) ON DELETE CASCADE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(car_id, feature_id)
            )
        `)

        // Insert default features
        const features = [
            { name: 'exterior', display_name: 'Exterior Color' },
            { name: 'wheels', display_name: 'Wheel Style' },
            { name: 'interior', display_name: 'Interior Color' },
            { name: 'engine', display_name: 'Engine Type' }
        ]

        for (const feature of features) {
            await pool.query(
                'INSERT INTO features (name, display_name) VALUES ($1, $2)',
                [feature.name, feature.display_name]
            )
        }

        // Insert feature options
        const featureOptions = [
            // Exterior colors
            { feature_name: 'exterior', name: 'red', display_name: 'Racing Red', price: 0, image_url: '/assets/cars/red-car.png' },
            { feature_name: 'exterior', name: 'blue', display_name: 'Electric Blue', price: 500, image_url: '/assets/cars/blue-car.png' },
            { feature_name: 'exterior', name: 'black', display_name: 'Midnight Black', price: 1000, image_url: '/assets/cars/black-car.png' },
            { feature_name: 'exterior', name: 'white', display_name: 'Pearl White', price: 800, image_url: '/assets/cars/white-car.png' },
            { feature_name: 'exterior', name: 'silver', display_name: 'Metallic Silver', price: 300, image_url: '/assets/cars/silver-car.png' },
            
            // Wheel styles
            { feature_name: 'wheels', name: 'standard', display_name: 'Standard Wheels', price: 0, image_url: '/assets/wheels/standard.png' },
            { feature_name: 'wheels', name: 'sport', display_name: 'Sport Wheels', price: 1200, image_url: '/assets/wheels/sport.png' },
            { feature_name: 'wheels', name: 'luxury', display_name: 'Luxury Wheels', price: 2000, image_url: '/assets/wheels/luxury.png' },
            { feature_name: 'wheels', name: 'performance', display_name: 'Performance Wheels', price: 2500, image_url: '/assets/wheels/performance.png' },
            
            // Interior colors
            { feature_name: 'interior', name: 'black', display_name: 'Black Leather', price: 0, image_url: '/assets/interior/black.png' },
            { feature_name: 'interior', name: 'brown', display_name: 'Brown Leather', price: 500, image_url: '/assets/interior/brown.png' },
            { feature_name: 'interior', name: 'white', display_name: 'White Leather', price: 800, image_url: '/assets/interior/white.png' },
            { feature_name: 'interior', name: 'red', display_name: 'Red Leather', price: 1000, image_url: '/assets/interior/red.png' },
            
            // Engine types
            { feature_name: 'engine', name: 'standard', display_name: 'Standard Engine', price: 0, image_url: '/assets/engines/standard.png' },
            { feature_name: 'engine', name: 'turbo', display_name: 'Turbo Engine', price: 5000, image_url: '/assets/engines/turbo.png' },
            { feature_name: 'engine', name: 'electric', display_name: 'Electric Motor', price: 8000, image_url: '/assets/engines/electric.png' },
            { feature_name: 'engine', name: 'hybrid', display_name: 'Hybrid Engine', price: 3000, image_url: '/assets/engines/hybrid.png' }
        ]

        for (const option of featureOptions) {
            // Get feature_id
            const featureResult = await pool.query('SELECT id FROM features WHERE name = $1', [option.feature_name])
            const featureId = featureResult.rows[0].id

            await pool.query(
                'INSERT INTO feature_options (feature_id, name, display_name, price, image_url) VALUES ($1, $2, $3, $4, $5)',
                [featureId, option.name, option.display_name, option.price, option.image_url]
            )
        }

        console.log('Database reset completed successfully!')
    } catch (error) {
        console.error('Error resetting database:', error)
    } finally {
        await pool.end()
    }
}

// Run the reset if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    resetDatabase()
}

export default resetDatabase








