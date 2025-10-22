import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { getCarById, updateCar } from '../services/CarsAPI'
import { getAllFeatures } from '../services/FeaturesAPI'
import { calculateTotalPrice, formatPrice } from '../utilities/priceCalculator'
import { validateFeatureCombination, validateCarName, getAvailableOptions } from '../utilities/validation'
import '../App.css'

const EditCar = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const [car, setCar] = useState(null)
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
        loadData()
    }, [id])

    useEffect(() => {
        updateCarImage()
    }, [selectedFeatures])

    const loadData = async () => {
        try {
            const [carData, featuresData] = await Promise.all([
                getCarById(id),
                getAllFeatures()
            ])
            
            setCar(carData)
            setFeatures(featuresData)
            setCarName(carData.name)
            
            // Set selected features from existing car
            const initialFeatures = {}
            if (carData.features) {
                carData.features.forEach(feature => {
                    initialFeatures[feature.feature_name] = feature.option_id
                })
            }
            setSelectedFeatures(initialFeatures)
            
        } catch (error) {
            console.error('Error loading data:', error)
            setErrors(['Failed to load car data'])
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
            const carData = {
                name: carName.trim(),
                features: selectedFeatures
            }

            await updateCar(id, carData)
            navigate(`/customcars/${id}`)
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
                <h2>Loading car data...</h2>
            </div>
        )
    }

    if (!car) {
        return (
            <div className="container">
                <h2>Car not found</h2>
                <Link to="/customcars" className="btn btn-primary">
                    Back to Cars
                </Link>
            </div>
        )
    }

    return (
        <div className="container">
            <div className="header-section">
                <Link to={`/customcars/${id}`} className="btn btn-outline">
                    ← Back to Car Details
                </Link>
                <h2>Edit {car.name}</h2>
            </div>
            
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

                        <div className="form-actions">
                            <button 
                                type="submit" 
                                className="btn btn-primary"
                                disabled={submitting}
                            >
                                {submitting ? 'Updating Car...' : 'Update Car'}
                            </button>
                            <Link to={`/customcars/${id}`} className="btn btn-outline">
                                Cancel
                            </Link>
                        </div>
                    </form>
                </div>

                <div className="car-preview">
                    <h3>Your Updated Car</h3>
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

export default EditCar