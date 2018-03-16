const Sellsy = require('node-sellsy');
const dotenv = require('dotenv');
dotenv.config();

const sellsy = new Sellsy({
	creds: {
		consumerKey: process.env.SELLSY_CONSUMER_TOKEN,
		consumerSecret: process.env.SELLSY_CONSUMER_SECRET,
		userToken: process.env.SELLSY_USER_TOKEN,
		userSecret: process.env.SELLSY_USER_SECRET,
	},
});

// sellsy
// 	.api({
// 		method: 'CustomFields.getList',
// 		params: {},
// 	})
// 	.then(data => {
// 		for (let f in data.response.result) {
// 			console.log(data.response.result[f].id);
// 			console.log(data.response.result[f].name);
// 			console.log(data.response.result[f].description);
// 			console.log('======');
// 		}
// 	})
// 	.catch(e => {
// 		console.log(e);
// 	});
sellsy
	.api({
		method: 'Accountdatas.createPayMedium',
		params: {
			paymedium: {
				isEnabled: true,
				value: 'Stripe',
			},
		},
	})
	.then(data => {
		console.log(data);
	})
	.catch(e => {
		console.log(e);
	});
