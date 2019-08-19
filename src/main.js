const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
dotenv.config();

const generateSellsyData = require('./utils');
const sellsyProcess = require('./sellsy');

const stripe = require('stripe')(process.env.STRIPE_KEY);
const endpointSecret = process.env.STRIPE_ENDPOINT_SECRET;

const app = express();
app.use(bodyParser.raw({ type: '*/*' }));

app.get('/', (req, res) => {
	res.status(200).send('UP!!');
});

app.post('/', (req, res) => {
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
				console.log(body.data.object)
				generateSellsyData(customer, charge, (err, data) => {
					sellsyProcess(data, (err, result) => {
						if (err) {
							console.log(err);
							res.sendStatus(500);
						} else {
							console.log(result);
							res.sendStatus(200);
						}
					});
				});
			}
		});
	}
});

app.listen(process.env.PORT, () => console.log('Running on port 8080 ...'));
