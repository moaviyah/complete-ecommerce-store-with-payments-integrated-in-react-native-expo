import express from "express";

const app  = express();
const port = 3000;
const PUBLISHABLE_KEY = 'pk_test_51NfqNlHcg1JCt6USlFkhcazNvherp8bcTK5rPnGEQh4UZESynEpTGOLhqnHqroymjdR4vbd3Ej1BBnNKQHfkz7x100pJDyBzfu'
const SECRET_KEY = 'sk_test_51NfqNlHcg1JCt6USIOsNn8DgA328zVjX7V2yAPTrz4Op4lTn9Jpg6ExCG9Rkweu7WNODtLqf5qWq1o9vU0qWsf9B00ga3Vm11y'
import Stripe from "stripe";
const stripe = Stripe(SECRET_KEY, {apiVersion:'2023-08-16'})

app.listen(port, ()=>{
    console.log(`Example app listening at http://localhost:${port}`);
});

app.post("/create-payment-intent", async (req, res)=>{
    console.log("Yahan tak ata ha")
    try {
        const paymentIntent = await stripe.paymentIntents.create(
            {
                amount:1099,
                currency: 'usd',
                payment_method_types: ['card'],
            }
        )
        const clientSecret = paymentIntent.client_secret;
        res.json({
            clientSecret: clientSecret
        })
    } catch (e) {
        console.log('index.js',e.message);
        res.join({error: e.message})
    }
})