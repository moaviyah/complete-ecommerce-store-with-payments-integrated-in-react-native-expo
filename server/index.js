const SECRET_KEY = 'sk_test_51NfqNlHcg1JCt6USIOsNn8DgA328zVjX7V2yAPTrz4Op4lTn9Jpg6ExCG9Rkweu7WNODtLqf5qWq1o9vU0qWsf9B00ga3Vm11y'
const express = require('express');
const cors = require('cors');
const Stripe = require('stripe')
const stripe = Stripe(SECRET_KEY)
const app = express();
const PORT = 8080;

app.use(express.json())
app.use(cors());

app.post('/pay', async(req, res)=>{
    try {
        const { email, amount } = req.body; // Destructure name and amount
        console.log(email, amount);

        const customer = await stripe.customers.create({
            email: email,
            description: "Customer for your app"
        });
        if (!email || !amount) {
            return res.status(400).json({ message: "Please Enter Your Email" });
        } 
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount*100),
            currency: 'usd',
            payment_method_types: ["card"],
            metadata:{email},
            customer:customer.id
        })
        const clientSecret = paymentIntent.client_secret;
        res.json({message: "Payment Initiated", clientSecret})
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message })
    }
})

app.listen(PORT, ()=> console.log(`Servver Running at port ${PORT}`))