require("dotenv").config()
const express = require("express")
const app = express()
const cors = require("cors")
const sendgrid = require('@sendgrid/mail');
const mongoose = require('mongoose');

require('dotenv').config()

sendgrid.setApiKey(process.env.SENDGRID_APIKEY);

var port = process.env.PORT || 3000;
app.use(express.json())
app.use(
  cors()
)

app.set('view engine', 'ejs');

const stripe = require("stripe")(process.env.STRIPE_PRIVATE_KEY);
mongoose.connect('mongodb+srv://dancero:y5WSi0awpJVWenlI@cluster0.vquxk.mongodb.net/myFirstDatabase?retryWrites=true&w=majority');
const Data = mongoose.model('data', { city: String });

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

app.post('/savedata', (req, res) => {

  var dataJSON = req.body.data;
  const data = new Data({ city: dataJSON['City'] });
  data.save().then(() => console.log('data inserted'));
  res.sendStatus(200);
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
      success_url: process.env.DANCERO_API_SUCCESS,
      cancel_url:  process.env.DANCERO_API_FAILED

    })

    sendMail(req.body.data);
    res.json({ url: session.url })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

app.post('/sendmail', async (req , res) => 
{
  var data = req.body.data;
  sendMail(data);
  res.sendStatus(200);
})


function sendMail(data)
{  
  const msg = {
    to: process.env.NOTIFICATION_MAIL,
    from: 'santiago@testiando.co',
    subject: 'Buy notification',
    text:  JSON.stringify(data),
    html: '<strong>' +  JSON.stringify(data) + '</strong>',
 }
 sendgrid
    .send(msg)
    .then((resp) => {
      console.log('Email sent\n', resp)
    })
    .catch((error) => {
      console.error(error)
  })
}

app.listen(port, () => {
    console.log(`listening on port ${port}`)
});