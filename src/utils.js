const moment = require('moment');
moment.locale('fr');
const dotenv = require('dotenv');
dotenv.config();

const { getBookeoDetails, getBookeoType } = require('./bookeo');

const generateSellsyData = (customer, charge, source, cb) => {
	// customer data
	const customer = {
		third: {
			name: customer.description,
			email: charge.receipt_email,
			type: 'person',
		},
		contact: {
			name: customer.description,
			forename: '',
			civil: '',
		},
		address: {
			name: customer.description,
			part1: source.address_line1,
			zip: source.address_zip,
			town: source.address_city,
			countrycode: source.address_country,
		},
	};
	if (source.address_line2) customer.address.part2 = source.address_line2;

	// custom fields data
	const customFields = {
		stripe: charge.id,
	};

	const bookeoType = getBookeoType(charge.description);
	if (bookeoType.bookingId) customFields.bookeo = bookeoType.bookingId;
	const ttcAmount = charge.amount / 100;
	const htAmount = ttcAmount - ttcAmount * process.env.LIT_TVA / 100;

	// payment data
	const payment = {
		date: Date.now(),
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
			row_notes = 'Multiples réservations';
			break;
		case 'single':
			row_name = 'Réservation';
			break;
		default:
			row_name = 'Inconnu';
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
		getBookeoDetails(bookeo, (err, data) => {
			if (err)
				invoice.row['1'].row_notes = `Votre réservation.\nCode Bookeo : ${
					bookeoType.bookingId
				}`;
			else {
				const horaire = moment('2018-03-03T12:00:00+01:00').format(
					'dddd D MMMM YYYY à HH:mm'
				);
				invoice.row['1'].row_notes = `${data.room} le ${horaire} pour ${
					data.persons
				} joueurs.\nCode Bookeo : ${bookeoType.bookingId}`;
			}
			cb(null, { customer, invoice, customFields, payment });
		});
	} else cb(null, { customer, invoice, customFields, payment });
};

module.exports = generateSellsyData;