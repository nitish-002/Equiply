require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const userRouter = require('./routes/user.route.js');
const productRouter = require('./routes/allproducts.route.js');
const reviewRouter = require('./routes/review.route.js');
const checkoutRouter = require('./routes/checkout.route.js');
const paymentRouter = require('./routes/payment.route.js');
const uploadRouter = require('./routes/upload.route.js');
const notificationRoutes = require('./routes/notification.route');
const adminRouter = require('./routes/admin.route.js');
const wishlistRouter = require('./routes/wishlist.js');

const connectDB=require('./db/models/connection.js');
connectDB();
const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use('/user', userRouter);
app.use('/product', productRouter);
app.use('/review', reviewRouter);
app.use('/checkout', checkoutRouter);
app.use('/payment', paymentRouter);
app.use('/upload', uploadRouter);
app.use('/api/notifications', notificationRoutes);
app.use('/admin', adminRouter);
app.use('/wishlist', wishlistRouter);

app.use((req, res) => {
    res.status(404).json({ success: false, message: "Page not found" });
});

app.listen(3000, (err) => {
    if (err) {
        console.log(err);
    }
    console.log(' Server is running on port 3000');
});