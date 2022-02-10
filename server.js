require("dotenv").config()
const express = require("express")
const app = express()
const cors = require("cors")
const paypal = require("@paypal/checkout-server-sdk")

require('dotenv').config()

const Environment =
  process.env.NODE_ENV === "production"
    ? paypal.core.LiveEnvironment
    : paypal.core.SandboxEnvironment
const paypalClient = new paypal.core.PayPalHttpClient(
  new Environment(
    process.env.PAYPAL_CLIENT_ID,
    process.env.PAYPAL_CLIENT_SECRET
  )
)

var port = process.env.PORT || 3000;
app.use(express.json())
app.use(
  cors({
    origin: process.env.DANCERO_HOST,
  })
)

app.set('view engine', 'ejs');

const stripe = require("stripe")(process.env.STRIPE_PRIVATE_KEY)

app.get('/', async(req, res)=> {

    res.send("OK");
});

app.get('/success', async(req, res) => 
{
    res.render('succesfullcard');
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
              id : item.id
            },  
            unit_amount: item.priceInCents,
          },
          quantity: item.quantity,
        }
      }),
      success_url: process.env.DANCERO_API_SUCCESS,
      cancel_url:  process.env.DANCERO_API_FAILED

    })
    res.json({ url: session.url })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

app.listen(port, () => {
    console.log(`listening on port ${port}`)
});