// Validate feature combinations
export const validateFeatureCombination = (selectedFeatures, featuresData) => {
    const errors = []
    
    // Check if all required features are selected
    const requiredFeatures = ['exterior', 'wheels', 'interior', 'engine']
    const selectedFeatureNames = Object.keys(selectedFeatures)
    
    for (const featureName of requiredFeatures) {
        if (!selectedFeatureNames.includes(featureName) || selectedFeatures[featureName] === null || selectedFeatures[featureName] === undefined) {
            errors.push(`Please select a ${featureName} option`)
        }
    }
    
    // Check for invalid feature combinations
    // Example: Red exterior with white interior might be incompatible
    if (selectedFeatures.exterior && selectedFeatures.interior) {
        const exteriorOption = getSelectedOption('exterior', selectedFeatures.exterior, featuresData)
        const interiorOption = getSelectedOption('interior', selectedFeatures.interior, featuresData)
        
        if (exteriorOption && interiorOption) {
            // Red exterior with white interior is not recommended
            if (exteriorOption.name === 'red' && interiorOption.name === 'white') {
                errors.push('Red exterior with white interior is not recommended. Please choose a different combination.')
            }
            
            // Black exterior with white interior is not recommended
            if (exteriorOption.name === 'black' && interiorOption.name === 'white') {
                errors.push('Black exterior with white interior is not recommended. Please choose a different combination.')
            }
        }
    }
    
    // Check for performance combinations
    if (selectedFeatures.engine && selectedFeatures.wheels) {
        const engineOption = getSelectedOption('engine', selectedFeatures.engine, featuresData)
        const wheelOption = getSelectedOption('wheels', selectedFeatures.wheels, featuresData)
        
        if (engineOption && wheelOption) {
            // Standard engine with performance wheels is not optimal
            if (engineOption.name === 'standard' && wheelOption.name === 'performance') {
                errors.push('Standard engine with performance wheels is not optimal. Consider upgrading to a turbo or electric engine.')
            }
        }
    }
    
    return {
        isValid: errors.length === 0,
        errors
    }
}

// Get the selected option object
const getSelectedOption = (featureName, optionId, featuresData) => {
    const feature = featuresData.find(f => f.name === featureName)
    if (feature && feature.options) {
        return feature.options.find(o => o.id === optionId)
    }
    return null
}

// Validate car name
export const validateCarName = (name) => {
    const errors = []
    
    if (!name || name.trim().length === 0) {
        errors.push('Car name is required')
    } else if (name.trim().length < 2) {
        errors.push('Car name must be at least 2 characters long')
    } else if (name.trim().length > 50) {
        errors.push('Car name must be less than 50 characters')
    }
    
    return {
        isValid: errors.length === 0,
        errors
    }
}

// Get available options for a feature (considering compatibility)
export const getAvailableOptions = (featureName, selectedFeatures, featuresData) => {
    const feature = featuresData.find(f => f.name === featureName)
    if (!feature || !feature.options) {
        return []
    }
    
    let availableOptions = [...feature.options]
    
    // Apply compatibility rules
    if (featureName === 'interior' && selectedFeatures.exterior) {
        const exteriorOption = getSelectedOption('exterior', selectedFeatures.exterior, featuresData)
        if (exteriorOption) {
            // Filter out incompatible interior colors
            if (exteriorOption.name === 'red') {
                availableOptions = availableOptions.filter(option => option.name !== 'white')
            }
            if (exteriorOption.name === 'black') {
                availableOptions = availableOptions.filter(option => option.name !== 'white')
            }
        }
    }
    
    if (featureName === 'wheels' && selectedFeatures.engine) {
        const engineOption = getSelectedOption('engine', selectedFeatures.engine, featuresData)
        if (engineOption && engineOption.name === 'standard') {
            // Don't recommend performance wheels with standard engine
            availableOptions = availableOptions.map(option => ({
                ...option,
                recommended: option.name !== 'performance'
            }))
        }
    }
    
    return availableOptions
}


