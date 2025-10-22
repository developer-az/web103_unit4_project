import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { getCarById, deleteCar } from '../services/CarsAPI'
import { formatPrice } from '../utilities/priceCalculator'
import '../App.css'

const CarDetails = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const [car, setCar] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [deleting, setDeleting] = useState(false)
    const [imageError, setImageError] = useState(false)

    useEffect(() => {
        loadCar()
    }, [id])

    const loadCar = async () => {
        try {
            const carData = await getCarById(id)
            setCar(carData)
            setImageError(false)
        } catch (error) {
            console.error('Error loading car:', error)
            setError('Failed to load car details')
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async () => {
        if (!window.confirm(`Are you sure you want to delete "${car.name}"? This action cannot be undone.`)) {
            return
        }

        setDeleting(true)
        try {
            await deleteCar(id)
            navigate('/customcars')
        } catch (error) {
            console.error('Error deleting car:', error)
            setError('Failed to delete car')
        } finally {
            setDeleting(false)
        }
    }

    // The new image logic:
    const getCarImage = () => {
        // If car has a custom image_url property use it as main car image
        if (car && car.image_url && !imageError) {
            return car.image_url
        }
        // If car doesn't have a direct image_url, fallback to 'exterior' option image, if any
        if (
            car &&
            car.features &&
            car.features.length > 0 &&
            !imageError
        ) {
            const exteriorFeature = car.features.find(
                (f) => f.feature_name === 'exterior' && !!f.option_image_url
            )
            if (exteriorFeature && exteriorFeature.option_image_url) {
                return exteriorFeature.option_image_url
            }
        }
        // fallback to default asset if image failed or is missing
        return '/assets/cars/default-car.png'
    }

    if (loading) {
        return (
            <div className="container">
                <h2>Loading car details...</h2>
            </div>
        )
    }

    if (error) {
        return (
            <div className="container">
                <div className="alert alert-error">
                    {error}
                </div>
                <Link to="/customcars" className="btn btn-primary">
                    Back to Cars
                </Link>
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
                <Link to="/customcars" className="btn btn-outline">
                    ← Back to Cars
                </Link>
                <div className="car-actions">
                    <Link to={`/edit/${car.id}`} className="btn btn-primary">
                        Edit Car
                    </Link>
                    <button 
                        onClick={handleDelete}
                        className="btn btn-danger"
                        disabled={deleting}
                    >
                        {deleting ? 'Deleting...' : 'Delete Car'}
                    </button>
                </div>
            </div>

            <div className="car-details">
                <div className="car-image-section">
                    <div className="car-image-container">
                        <img 
                            src={getCarImage()}
                            alt={car.name}
                            className="car-image-large"
                            onError={(e) => {
                                // Don't keep looping between images
                                if (!imageError) {
                                    setImageError(true)
                                }
                                e.target.src = '/assets/cars/default-car.png'
                            }}
                            style={{
                                objectFit: "cover",
                                maxHeight: "360px",
                                maxWidth: "640px",
                                margin: "0 auto",
                                borderRadius: "1.5rem",
                                background: "#e7e7e7"
                            }}
                        />
                    </div>
                </div>

                <div className="car-info-section">
                    <h1>{car.name}</h1>
                    <p className="car-price-large">{formatPrice(car.total_price)}</p>
                    
                    <div className="car-specifications">
                        <h3>Specifications</h3>
                        <div className="specs-grid">
                            {car.features && car.features.map((feature, index) => (
                                <div key={index} className="spec-item">
                                    <div className="spec-label">{feature.feature_display_name}</div>
                                    <div className="spec-value">
                                        {feature.option_display_name}
                                        <span className="spec-price">({formatPrice(feature.option_price)})</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="car-summary">
                        <h3>Summary</h3>
                        <div className="summary-stats">
                            <div className="stat-item">
                                <span className="stat-label">Total Features:</span>
                                <span className="stat-value">{car.features ? car.features.length : 0}</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-label">Base Price:</span>
                                <span className="stat-value">$0</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-label">Upgrades:</span>
                                <span className="stat-value">{formatPrice(car.total_price)}</span>
                            </div>
                            <div className="stat-item total">
                                <span className="stat-label">Total Price:</span>
                                <span className="stat-value">{formatPrice(car.total_price)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="car-meta">
                        <p><strong>Created:</strong> {new Date(car.created_at).toLocaleDateString()}</p>
                        {car.updated_at && car.updated_at !== car.created_at && (
                            <p><strong>Last Updated:</strong> {new Date(car.updated_at).toLocaleDateString()}</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CarDetails