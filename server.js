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
// mongoose.connect('mongodb+srv://dancero:y5WSi0awpJVWenlI@cluster0.vquxk.mongodb.net/myFirstDatabase?retryWrites=true&w=majority');
mongoose.connect('mongodb+srv://ivan:1wSXkCsXPuJfRKz6@testdb.mvzn5.mongodb.net/test');

const Data = mongoose.model('data', {
   user: String,
   city: String,
   service: String,
   level : String,
   venue: String,
   gender: String,
   hours : String,
   musical_gender :String, 
   initialDate: String,
   finalDate : String,
   costUsd : String,
   priceSendHour: String,
   costHour: String,
   costTeacher: String,
   totalDollar: String,
   exchangeRate: String, 
   comission : String, 
   paymentMethod : String, 
   Paymentfee: String, 
   total: String, 
   paymentStatus : String,   
  });

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
  var dataJSON = req.body;
  console.log("soy este de aca abajito")
  console.log(dataJSON)
  const data = new Data(
    { 
    user : dataJSON.data["user"],  
    city: dataJSON.data["City"],
    service: dataJSON.data['Service'],
    level : dataJSON.data['Level'],
    venue: dataJSON.data['Venue'],
    gender: dataJSON.data['Gender'],
    hours : dataJSON.data['Hours'],
    musical_gender : dataJSON.data['Musical_gender'],
    initialDate: dataJSON.data.dates['dateFrom'],
    finalDate : dataJSON.data.dates['dateTo'],
    costUsd : dataJSON["costUsd"],
    priceSendHour: dataJSON["priceSendHour"],
    costHour: dataJSON["costHour"],
    costTeacher: dataJSON["costTeacher"],
    totalDollar: dataJSON["totalDollar"],
    exchangeRate: dataJSON["exchangeRatio"],
    comission : dataJSON["comission"],
    paymentMethod : dataJSON["paymentMethod"],
    Paymentfee: dataJSON["paymentFee"],
    total: dataJSON["total"],
    paymentStatus : dataJSON["paymentStatus"],   
  }
  );
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
  var data = req.body;
  var message = `
  Student : ${data.data.user} <br>
  City : ${data.data.City}    <br>
  Instructor : ${data.data.Gender} <br>
  Level : ${data.data.Level} <br>
  Dance : ${data.data.Musical_gender} <br>
  Service : ${data.data.Service} <br>
  Number of hours : ${data.data.Hours} <br>
  From : ${data.data.dates.dateFrom} <br>
  To : ${data.data.dates.dateTo} <br>
  <br>
  <br>
  Price per hour : ${data.priceSendHour}COP <br>
  Total price : ${data.total}COP <br>
  Cost per hour: ${data.costHour}COP <br>
  Total cost : ${data.costTeacher}COP <br>
  Comission: ${data.comission}COP <br>
  <br>
  <br>
  Exchange rate : ${data.exchangeRatio}  <br>
  Comission : ${data.costUsd}USD  <br>
  Payment method : ${data.paymentMethod} <br>
  Payment fee : ${data.paymentFee} <br>
  Total : ${data.total} <br>
  Payment status : ${data.paymentStatus} <br>

  `

  message = message.replace(/(\r\n|\n|\r)/gm, "");
  sendMail(message );
  res.sendStatus(200);
})


function sendMail(data)
{  
  console.log(data)
  const msg = {
    to: process.env.NOTIFICATION_MAIL,
    from: 'ivan9711@outlook.com',
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