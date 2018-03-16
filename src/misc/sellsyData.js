const invoice = {
	document: {
		doctype: 'invoice',
		thirdid: 13265855,
		subject: 'Facture de votre réservation Leave in time.',
		tags: 'auto',
	},
	row: {
		'1': {
			row_type: 'once',
			row_name: 'Réservation',
			row_notes: 'SOS le 10 février à 10h pour 3 joueurs\nCode Bookeo: 2550802238557664',
			row_unitAmount: 90,
			row_qt: 1,
			row_tax: 20,
		},
	},
};

const customer = {
	third: {
		name: 'Xavier Seignard',
		email: 'xavier.seignard@gmail.com',
		type: 'person',
	},
	contact: {
		name: 'Xavier Seignard',
		forename: '',
		civil: '',
	},
};

const payment = {
	date: Math.floor(Date.now() / 1000),
	amount: '90',
	stripe: 'ch_1ByfqWCXs31J92vHJpL8sIVY',
};

const customFields = {
	stripe: 'XXXXXXX',
	bookeo: 'YYYYYYY',
	gameDate: Math.floor(Date.now() / 1000),
};

const data = {
	customer,
	invoice,
	customFields,
	payment,
};

module.exports = data;
