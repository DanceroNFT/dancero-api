require("dotenv").config()
const express = require("express")
const app = express()
const cors = require("cors")

require('dotenv').config()

var port = process.env.PORT || 3000;
app.use(express.json())
app.use(
  cors({
    origin: "http://localhost:3001",
  })
)

const stripe = require("stripe")(process.env.STRIPE_PRIVATE_KEY)

app.get('/', async(req, res)=> {

    res.send("OK");
});

app.get('/success', async(req, res) => 
{
    res.send("success");
});

app.get('/failedpayment', async(req, res) => 
{
    res.send("Failed payment");
});

app.post("/create-checkout-session", async (req, res) => {

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: req.body.items.map(item => {
        return {
          price_data: {
            currency: "usd",
            product_data: {
              name: item.name,
              description: item.metadata,
            },  
            unit_amount: item.priceInCents,
          },
          quantity: item.quantity,
        }
      }),
      success_url: 'http://localhost:3000/success',
      cancel_url: 'http://localhost:3000/failedpayment',
    })
    res.json({ url: session.url })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

app.listen(port, () => {
    console.log(`listening on port ${port}`)
});