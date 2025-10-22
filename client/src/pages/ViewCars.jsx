import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getAllCars, deleteCar } from '../services/CarsAPI'
import { formatPrice } from '../utilities/priceCalculator'
import '../App.css'

const ViewCars = () => {
    const [cars, setCars] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [deletingId, setDeletingId] = useState(null)

    useEffect(() => {
        loadCars()
    }, [])

    const loadCars = async () => {
        try {
            const carsData = await getAllCars()
            setCars(carsData)
        } catch (error) {
            console.error('Error loading cars:', error)
            setError('Failed to load cars')
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (id, carName) => {
        if (!window.confirm(`Are you sure you want to delete "${carName}"? This action cannot be undone.`)) {
            return
        }

        setDeletingId(id)
        try {
            await deleteCar(id)
            setCars(cars.filter(car => car.id !== id))
        } catch (error) {
            console.error('Error deleting car:', error)
            setError('Failed to delete car')
        } finally {
            setDeletingId(null)
        }
    }

    const getCarImage = (car) => {
        if (car.features && car.features.length > 0) {
            const exteriorFeature = car.features.find(f => f.feature_name === 'exterior')
            if (exteriorFeature && exteriorFeature.option_image_url) {
                return exteriorFeature.option_image_url
            }
        }
        return '/assets/cars/default-car.png'
    }

    if (loading) {
        return (
            <div className="container">
                <h2>Loading your custom cars...</h2>
            </div>
        )
    }

    if (error) {
        return (
            <div className="container">
                <div className="alert alert-error">
                    {error}
                </div>
                <button onClick={loadCars} className="btn btn-primary">
                    Try Again
                </button>
            </div>
        )
    }

    return (
        <div className="container">
            <div className="header-section">
                <h2>Your Custom Cars</h2>
                <Link to="/" className="btn btn-primary">
                    Create New Car
                </Link>
            </div>

            {cars.length === 0 ? (
                <div className="empty-state">
                    <h3>No custom cars yet</h3>
                    <p>Create your first custom car to get started!</p>
                    <Link to="/" className="btn btn-primary">
                        Create Your First Car
                    </Link>
                </div>
            ) : (
                <div className="cars-grid">
                    {cars.map(car => (
                        <div key={car.id} className="car-card">
                            <div className="car-image-container">
                                <img 
                                    src={getCarImage(car)} 
                                    alt={car.name}
                                    className="car-image"
                                    onError={(e) => {
                                        e.target.src = '/assets/cars/default-car.png'
                                    }}
                                />
                            </div>
                            
                            <div className="car-info">
                                <h3>{car.name}</h3>
                                <p className="car-price">{formatPrice(car.total_price)}</p>
                                
                                <div className="car-features">
                                    {car.features && car.features.map((feature, index) => (
                                        <div key={index} className="feature-item">
                                            <span className="feature-name">{feature.feature_display_name}:</span>
                                            <span className="feature-value">{feature.option_display_name}</span>
                                        </div>
                                    ))}
                                </div>
                                
                                <div className="car-actions">
                                    <Link to={`/customcars/${car.id}`} className="btn btn-secondary">
                                        View Details
                                    </Link>
                                    <Link to={`/edit/${car.id}`} className="btn btn-outline">
                                        Edit
                                    </Link>
                                    <button 
                                        onClick={() => handleDelete(car.id, car.name)}
                                        className="btn btn-danger"
                                        disabled={deletingId === car.id}
                                    >
                                        {deletingId === car.id ? 'Deleting...' : 'Delete'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default ViewCars