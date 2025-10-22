// Calculate the total price of a car based on selected features
export const calculateTotalPrice = (selectedFeatures, featuresData) => {
    let totalPrice = 0
    
    for (const [featureName, optionId] of Object.entries(selectedFeatures)) {
        const feature = featuresData.find(f => f.name === featureName)
        if (feature && feature.options) {
            const option = feature.options.find(o => o.id === optionId)
            if (option) {
                totalPrice += parseFloat(option.price) || 0
            }
        }
    }
    
    return totalPrice
}

// Get the price of a specific option
export const getOptionPrice = (featureName, optionId, featuresData) => {
    const feature = featuresData.find(f => f.name === featureName)
    if (feature && feature.options) {
        const option = feature.options.find(o => o.id === optionId)
        return option ? parseFloat(option.price) || 0 : 0
    }
    return 0
}

// Format price for display
export const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(price)
}








