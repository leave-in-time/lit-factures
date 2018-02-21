const express = require('express');
const bodyParser = require('body-parser');

const stripe = require('stripe')('sk_test_sbTMVyuXrwNGTef1RmKI3Np3');
const endpointSecret = 'whsec_blSjcGhK1UHRbyGwXa9wSaK9FzLErNIS';

const app = express();
app.use(bodyParser.raw({ type: '*/*' }));

app.get('/', (req, res) => {
	res.status(200).send('UP!!');
});

app.post('/', (req, res) => {
	const sig = req.headers['stripe-signature'];
	const event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
	console.log(event);
	const body = JSON.parse(req.body);
	console.log(body);
	res.send(200);
});
