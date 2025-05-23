const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Wishlist = require('../db/models/wishlist.model');
const Product = require('../db/models/seedproduct');

// Add to wishlist
router.post('/add', auth, async (req, res) => {
    try {
        const { productId } = req.body;
        const userId = req.userId;
        console.log('Adding to wishlist:', { productId, userId });

        // Check if product exists
        const product = await Product.findById(productId);
        if (!product) {
            console.log('Product not found:', productId);
            return res.status(404).json({ message: 'Product not found' });
        }

        // Check if already in wishlist
        const existingWishlist = await Wishlist.findOne({ userId, productId });
        if (existingWishlist) {
            console.log('Product already in wishlist');
            return res.status(400).json({ message: 'Product already in wishlist' });
        }

        // Add to wishlist
        const wishlistItem = new Wishlist({
            userId,
            productId
        });
        await wishlistItem.save();
        console.log('Added to wishlist successfully');

        res.status(200).json({ message: 'Product added to wishlist' });
    } catch (error) {
        console.error('Error adding to wishlist:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Remove from wishlist
router.delete('/remove/:productId', auth, async (req, res) => {
    try {
        const { productId } = req.params;
        const userId = req.userId;
        console.log('Removing from wishlist:', { productId, userId });

        const result = await Wishlist.findOneAndDelete({ userId, productId });
        if (!result) {
            console.log('Wishlist item not found');
            return res.status(404).json({ message: 'Wishlist item not found' });
        }

        console.log('Removed from wishlist successfully');
        res.status(200).json({ message: 'Product removed from wishlist' });
    } catch (error) {
        console.error('Error removing from wishlist:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get wishlist items
router.get('/', auth, async (req, res) => {
    try {
        const userId = req.userId;
        console.log('Getting wishlist for user:', userId);

        const wishlistItems = await Wishlist.find({ userId })
            .populate('productId')
            .exec();

        console.log('Found wishlist items:', wishlistItems.length);

        // Transform the data to match the frontend expectations
        const formattedItems = wishlistItems.map(item => ({
            id: item.productId._id,
            name: item.productId.name,
            price: item.productId.price,
            image_url: item.productId.images[0], // Assuming images is an array
            category: item.productId.category,
            description: item.productId.description
        }));

        console.log('Formatted items:', formattedItems);
        res.status(200).json(formattedItems);
    } catch (error) {
        console.error('Error getting wishlist:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router; 