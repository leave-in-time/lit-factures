const moment = require('moment-timezone');
moment.locale('fr');
const dotenv = require('dotenv');
dotenv.config();

const { getBookeoDetails, getBookeoType } = require('./bookeo');

const generateSellsyData = (stripeCustomer, charge, source, cb) => {
	// customer data
	const customer = {
		third: {
			name: stripeCustomer.description,
			email: charge.receipt_email,
			type: 'person',
		},
		contact: {
			name: stripeCustomer.description,
			forename: '',
			civil: '',
		},
		address: {
			name: stripeCustomer.description,
			part1: source.address_line1,
			zip: source.address_zip,
			town: source.address_city,
			countrycode: source.address_country,
		},
	};
	if (source.address_line2) stripeCustomer.address.part2 = source.address_line2;

	// custom fields data
	const customFields = {
		stripe: charge.id,
	};

	const bookeoType = getBookeoType(charge.description);
	if (bookeoType.bookingId) customFields.bookeo = bookeoType.bookingId;
	const ttcAmount = charge.amount / 100;
	const htAmount = ttcAmount / (1 + process.env.LIT_TVA / 100);

	// payment data
	const payment = {
		date: Math.floor(Date.now() / 1000),
		amount: ttcAmount,
		stripe: charge.id,
	};

	let row_name;
	let row_notes = '';
	switch (bookeoType.type) {
		case 'voucher':
			row_name = 'Chèque cadeau';
			row_notes = `Chèque cadeau d'une valeur de ${ttcAmount} €`;
			break;
		case 'multiple':
			row_name = 'Réservations';
			row_notes = 'Multiples réservations de salles';
			break;
		case 'single':
			row_name = 'Réservation';
			break;
		default:
			row_name = 'Divers';
			row_notes = `Votre achat d'une valeur de ${ttcAmount} €`;
			break;
	}

	// invoice data
	const invoice = {
		document: {
			doctype: 'invoice',
			subject: 'Facture de votre achat Leave in time.',
			tags: 'auto',
		},
		row: {
			'1': {
				row_type: 'once',
				row_name,
				row_notes,
				row_unitAmount: htAmount,
				row_qt: 1,
				row_tax: process.env.LIT_TVA,
			},
		},
	};
	if (bookeoType.bookingId) {
		getBookeoDetails(bookeoType.bookingId, (err, data) => {
			if (err)
				invoice.row['1'].row_notes = `Votre réservation.\nCode Bookeo : ${
					bookeoType.bookingId
				}`;
			else {
				const horaire = moment(data.startTime)
					.tz('Europe/Paris')
					.format('dddd D MMMM YYYY à HH:mm');
				invoice.row['1'].row_notes = `${data.room} le ${horaire} pour ${
					data.persons
				} joueurs.\nCode Bookeo : ${bookeoType.bookingId}`;
			}
			cb(null, { customer, invoice, customFields, payment });
		});
	} else cb(null, { customer, invoice, customFields, payment });
};

module.exports = generateSellsyData;
