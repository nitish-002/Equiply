import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Header from '../header';
import Footer from '../Footer';
import './wishlist.css';

const Wishlist = () => {
    const [wishlistItems, setWishlistItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchWishlistItems();
    }, []);

    const fetchWishlistItems = async () => {
        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                navigate('/login');
                return;
            }

            const response = await axios.get('http://localhost:3000/wishlist', {
                headers: { 'x-access-token': token }
            });
            console.log('Wishlist response:', response.data);
            setWishlistItems(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching wishlist:', error);
            setLoading(false);
        }
    };

    const removeFromWishlist = async (productId) => {
        const token = localStorage.getItem("authToken");
        if (!token) {
            navigate("/login");
            return;
        }

        try {
            await axios.delete(`http://localhost:3000/wishlist/remove/${productId}`, {
                headers: { 'x-access-token': token }
            });
            setWishlistItems(wishlistItems.filter(item => item.id !== productId));
        } catch (error) {
            console.error('Error removing from wishlist:', error);
            if (error.response?.status === 401) {
                localStorage.removeItem('authToken');
                navigate('/login');
            }
        }
    };

    const handleProductClick = (productId) => {
        navigate(`/product/${productId}`);
    };

    const handleRentNow = (item) => {
        const rentalProduct = {
            id: item.id,
            name: item.name,
            price: parseFloat(item.price),
            image: item.image_url,
            rentalDuration: 'days',
            rentalPeriod: 1,
            category: item.category
        };
        
        localStorage.setItem('selectedProducts', JSON.stringify([rentalProduct]));
        navigate('/Checkout');
    };

    if (loading) {
        return (
            <div className="flex flex-col min-h-screen">
                <Header />
                <div className="flex-grow flex justify-center items-center">
                    <p className="text-lg font-medium">Loading wishlist...</p>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <div className="flex-grow container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-8">My Wishlist</h1>
                {wishlistItems.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-600 text-lg">Your wishlist is empty</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {wishlistItems.map((item) => (
                            <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                                <img 
                                    src={item.image_url} 
                                    alt={item.name} 
                                    onClick={() => handleProductClick(item.id)}
                                    className="w-full h-48 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                                />
                                <div className="p-4">
                                    <h3 
                                        onClick={() => handleProductClick(item.id)}
                                        className="text-lg font-semibold mb-2 cursor-pointer hover:text-blue-600"
                                    >
                                        {item.name}
                                    </h3>
                                    <p className="text-xl font-bold text-gray-900 mb-4">₹{item.price}</p>
                                    <div className="flex gap-2">
                                        <button 
                                            className="flex-1 bg-black text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
                                            onClick={() => handleRentNow(item)}
                                        >
                                            Rent Now
                                        </button>
                                        <button 
                                            className="flex-1 border border-red-500 text-red-500 px-4 py-2 rounded-lg hover:bg-red-50 transition-colors"
                                            onClick={() => removeFromWishlist(item.id)}
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <Footer />
        </div>
    );
};

export default Wishlist;