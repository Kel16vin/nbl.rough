const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// This is the "End Point" your frontend will talk to
app.post('/api/orders', (req, res) => {
    const orderData = req.body;

    console.log("New NBL Order Received!");
    console.log("Location:", orderData.delivery.address);
    console.log("Crates:", orderData.crates);

    // Logic for NBL: In a real app, we would save to a database here
    // and trigger a Mobile Money prompt.

    res.status(201).json({
        success: true,
        message: "Order received at NBL Distribution Hub",
        orderId: Math.floor(Math.random() * 100000)
    });
});

app.listen(PORT, () => {
    console.log(`NBL Backend running on http://localhost:${PORT}`);
});