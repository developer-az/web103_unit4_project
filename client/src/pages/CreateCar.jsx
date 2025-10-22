import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAllFeatures } from '../services/FeaturesAPI'
import { createCar } from '../services/CarsAPI'
import { calculateTotalPrice, formatPrice } from '../utilities/priceCalculator'
import { validateFeatureCombination, validateCarName, getAvailableOptions } from '../utilities/validation'
import '../App.css'

const CreateCar = () => {
    const navigate = useNavigate()
    const [features, setFeatures] = useState([])
    const [selectedFeatures, setSelectedFeatures] = useState({
        exterior: null,
        wheels: null,
        interior: null,
        engine: null
    })
    const [carName, setCarName] = useState('')
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [errors, setErrors] = useState([])
    const [currentCarImage, setCurrentCarImage] = useState('/assets/cars/default-car.png')

    useEffect(() => {
        loadFeatures()
    }, [])

    useEffect(() => {
        updateCarImage()
    }, [selectedFeatures])

    const loadFeatures = async () => {
        try {
            const featuresData = await getAllFeatures()
            setFeatures(featuresData)
        } catch (error) {
            console.error('Error loading features:', error)
            setErrors(['Failed to load customization options'])
        } finally {
            setLoading(false)
        }
    }

    const updateCarImage = () => {
        if (selectedFeatures.exterior) {
            const exteriorFeature = features.find(f => f.name === 'exterior')
            if (exteriorFeature) {
                const selectedOption = exteriorFeature.options.find(o => o.id === selectedFeatures.exterior)
                if (selectedOption && selectedOption.image_url) {
                    setCurrentCarImage(selectedOption.image_url)
                }
            }
        } else {
            setCurrentCarImage('/assets/cars/default-car.png')
        }
    }

    const handleFeatureChange = (featureName, optionId) => {
        setSelectedFeatures(prev => ({
            ...prev,
            [featureName]: optionId
        }))
        setErrors([])
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSubmitting(true)
        setErrors([])

        // Validate car name
        const nameValidation = validateCarName(carName)
        if (!nameValidation.isValid) {
            setErrors(nameValidation.errors)
            setSubmitting(false)
            return
        }

        // Validate feature combination
        const featureValidation = validateFeatureCombination(selectedFeatures, features)
        if (!featureValidation.isValid) {
            setErrors(featureValidation.errors)
            setSubmitting(false)
            return
        }

        try {
            // Filter out null values from features
            const filteredFeatures = Object.fromEntries(
                Object.entries(selectedFeatures).filter(([_, value]) => value !== null && value !== undefined)
            )
            
            const carData = {
                name: carName.trim(),
                features: filteredFeatures
            }

            await createCar(carData)
            navigate('/customcars')
        } catch (error) {
            setErrors([error.message])
        } finally {
            setSubmitting(false)
        }
    }

    const totalPrice = calculateTotalPrice(selectedFeatures, features)

    if (loading) {
        return (
            <div className="container">
                <h2>Loading customization options...</h2>
            </div>
        )
    }

    return (
        <div className="container">
            <h2>Customize Your BOLT BUCKET</h2>
            
            {errors.length > 0 && (
                <div className="alert alert-error">
                    <ul>
                        {errors.map((error, index) => (
                            <li key={index}>{error}</li>
                        ))}
                    </ul>
                </div>
            )}

            <div className="grid">
                <div className="car-customization">
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="carName">Car Name</label>
                            <input
                                type="text"
                                id="carName"
                                value={carName}
                                onChange={(e) => setCarName(e.target.value)}
                                placeholder="Enter your car's name"
                                required
                            />
                        </div>

                        {features.map(feature => (
                            <div key={feature.id} className="form-group">
                                <label>{feature.display_name}</label>
                                <div className="feature-options">
                                    {getAvailableOptions(feature.name, selectedFeatures, features).map(option => (
                                        <div key={option.id} className="option-card">
                                            <input
                                                type="radio"
                                                id={`${feature.name}-${option.id}`}
                                                name={feature.name}
                                                value={option.id}
                                                checked={selectedFeatures[feature.name] === option.id}
                                                onChange={() => handleFeatureChange(feature.name, option.id)}
                                                className="option-input"
                                            />
                                            <label 
                                                htmlFor={`${feature.name}-${option.id}`}
                                                className={`option-label ${selectedFeatures[feature.name] === option.id ? 'selected' : ''} ${option.recommended === false ? 'not-recommended' : ''}`}
                                            >
                                                <div className="option-image">
                                                    {option.image_url && (
                                                        <img 
                                                            src={option.image_url} 
                                                            alt={option.display_name}
                                                            onError={(e) => {
                                                                e.target.style.display = 'none'
                                                            }}
                                                        />
                                                    )}
                                                </div>
                                                <div className="option-info">
                                                    <h4>{option.display_name}</h4>
                                                    <p className="option-price">{formatPrice(option.price)}</p>
                                                    {option.recommended === false && (
                                                        <p className="not-recommended-text">Not recommended</p>
                                                    )}
                                                </div>
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}

                        <div className="total-price">
                            <h3>Total Price: {formatPrice(totalPrice)}</h3>
                        </div>

                        <button 
                            type="submit" 
                            className="btn btn-primary"
                            disabled={submitting}
                        >
                            {submitting ? 'Creating Car...' : 'Create Custom Car'}
                        </button>
                    </form>
                </div>

                <div className="car-preview">
                    <h3>Your Custom Car</h3>
                    <div className="car-image-container">
                        <img 
                            src={currentCarImage} 
                            alt="Your custom car"
                            className="car-image"
                            onError={(e) => {
                                e.target.src = '/assets/cars/default-car.png'
                            }}
                        />
                    </div>
                    <div className="selected-features">
                        <h4>Selected Features:</h4>
                        {Object.entries(selectedFeatures).map(([featureName, optionId]) => {
                            if (!optionId) return null
                            const feature = features.find(f => f.name === featureName)
                            const option = feature?.options.find(o => o.id === optionId)
                            return (
                                <div key={featureName} className="selected-feature">
                                    <strong>{feature?.display_name}:</strong> {option?.display_name} ({formatPrice(option?.price || 0)})
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CreateCar