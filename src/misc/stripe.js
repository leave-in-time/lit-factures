const dotenv = require('dotenv');
dotenv.config();
const stripe = require('stripe')(process.env.STRIPE_KEY);
const endpointSecret = process.env.STRIPE_ENDPOINT_SECRET;


stripe.customers.retrieve(
  'cus_FIoAQRflwTF7fV',
  (err, customer) => {
    console.log(customer.name);
  }
);
