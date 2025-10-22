const API_BASE_URL = '/api'

// Get all features with their options
export const getAllFeatures = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/features`)
        if (!response.ok) {
            throw new Error('Failed to fetch features')
        }
        return await response.json()
    } catch (error) {
        console.error('Error fetching features:', error)
        throw error
    }
}

// Get a single feature by name
export const getFeatureByName = async (name) => {
    try {
        const response = await fetch(`${API_BASE_URL}/features/${name}`)
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('Feature not found')
            }
            throw new Error('Failed to fetch feature')
        }
        return await response.json()
    } catch (error) {
        console.error('Error fetching feature:', error)
        throw error
    }
}

// Get all feature options
export const getAllFeatureOptions = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/features/options`)
        if (!response.ok) {
            throw new Error('Failed to fetch feature options')
        }
        return await response.json()
    } catch (error) {
        console.error('Error fetching feature options:', error)
        throw error
    }
}

// Get feature options by feature name
export const getFeatureOptionsByName = async (name) => {
    try {
        const response = await fetch(`${API_BASE_URL}/features/${name}/options`)
        if (!response.ok) {
            throw new Error('Failed to fetch feature options')
        }
        return await response.json()
    } catch (error) {
        console.error('Error fetching feature options:', error)
        throw error
    }
}




