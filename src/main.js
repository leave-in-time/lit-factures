const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
dotenv.config();

const { getBookeoDetails, getBookeoType } = require('./bookeo');

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
		const customerId = body.data.object.customer;
		stripe.customers.retrieve(customerId, (err, customer) => {
			if (err) {
				console.log(err);
				res.sendStatus(500);
			} else {
				const charge = body.data.object;
				const source = body.data.object.source;
				const bookeoType = getBookeoType(charge.description);
				console.log('======================');
				console.log(`Customer decription: ${customer.description}`);
				console.log(`Customer email: ${customer.email}`);
				console.log(`Charge description: ${charge.description}`);
				console.log(`Bookeo booking id: ${bookeoType.bookingId}`);
				console.log(`Stripe charge id: ${charge.id}`);
				console.log(`Receipt email: ${charge.receipt_email}`);
				console.log(`Amount: ${charge.amount / 100} ${charge.currency}`);
				console.log(`Source name: ${source.name}`);
				console.log(
					`Source address:\n${source.address_line1}\n${source.address_line2}\n${
						source.address_zip
					} ${source.address_city}\n${source.address_country}`
				);
				if (bookeoType.bookingId) {
					getBookeoDetails(bookeoType.bookingId, (err, data) => {
						if (err) {
							console.log(err);
							res.sendStatus(500);
						} else {
							console.log(data);
							res.sendStatus(200);
						}
					});
				} else {
					res.sendStatus(200);
				}
			}
		});
	}
});

app.listen(3300, () => console.log('Running on port 3300 ...'));
