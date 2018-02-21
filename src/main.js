const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
dotenv.config();

const stripe = require('stripe')(process.env.STRIPE_KEY);
const endpointSecret = process.env.STRIPE_ENDPOINT_SECRET;

const app = express();
app.use(bodyParser.raw({ type: '*/*' }));

app.get('/', (req, res) => {
	res.status(200).send('UP!!');
});

app.post('/', (req, res) => {
	// const sig = req.headers['stripe-signature'];
	// const event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
	// console.log(event);
	const body = JSON.parse(req.body);
	if (
		body.type === 'charge.succeeded' &&
		body.data.object.application === process.env.BOOKEO_APP
	) {
		console.log(body.data.object);
		console.log(body.data.object.source);
		console.log('===============');
	}
	res.sendStatus(200);
});

app.listen(3300, () => console.log('Running on port 3300 ...'));
