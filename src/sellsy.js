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

/**
 * Gets a customer by its Id
 */
const getCustomer = (clientid, cb) => {
	sellsy
		.api({
			method: 'Client.getOne',
			params: { clientid },
		})
		.then(data => {
			cb(data);
		})
		.catch(e => {
			console.log('error:', e);
		});
};

/**
 * Creates a customer
 */
const createCustomer = (customer, cb) => {
	sellsy.customers
		.create(customer)
		.then(data => {
			if (data.id) cb(null, data.id);
			else cb(new Error('Failed to create user'));
		})
		.catch(e => {
			cb(e);
		});
};

/**
 * Creates the invoice
 */
const createInvoice = (data, cb) => {
	sellsy.documents
		.create(data)
		.then(data => {
			if (data.id) cb(null, data.id);
			else cb(new Error('Failed to create invoice'));
		})
		.catch(e => {
			cb(e);
		});
};

/**
 * Add bookeo and stripe custom fields
 */
const addCustomFields = (docid, data, cb) => {
	if (!data.stripe && !data.bookeo) cb(new Error('No stripe and bookeo data!'));
	else {
		const params = {
			linkedtype: 'document',
			linkedid: docid,
			values: {
				'0': {
					cfid: process.env.SELLSY_STRIPE_FIELD,
					value: data.stripe,
				},
			},
		};
		if (data.bookeo) {
			params.values['1'] = {
				cfid: process.env.SELLSY_BOOKEO_FIELD,
				value: data.bookeo,
			};
		}
		sellsy
			.api({
				method: 'CustomFields.recordValues',
				params,
			})
			.then(data => {
				if (data.status === 'success') cb(null, data);
				else cb(data.error);
			})
			.catch(e => {
				cb(e);
			});
	}
};

const createPayment = (docid, data, cb) => {
	const params = {
		payment: {
			date: data.date,
			amount: data.amount,
			medium: process.env.SELLSY_STRIPE_MEDIUM,
			ident: data.stripe,
			doctype: 'invoice',
			docid,
		},
	};
	if (data.bookeo) params.payment.notes = data.bookeo;
	sellsy
		.api({
			method: 'Document.createPayment',
			params,
		})
		.then(data => {
			if (data.status === 'success') cb(null, data);
			else cb(data.error);
		})
		.catch(e => {
			cb(e);
		});
};

/**
 * Sets the invoice as paid
 */
const setInvoicePaid = (docid, cb) => {
	const params = {
		docid,
		document: {
			doctype: 'invoice',
			step: 'paid',
		},
	};
	sellsy
		.api({
			method: 'Document.updateStep',
			params,
		})
		.then(data => {
			if (data.status === 'success') cb(null, data);
			else cb(data.error);
		})
		.catch(e => {
			cb(e);
		});
};

/**
 * Sends the given invoice by email
 */
const sendInvoice = (docid, email, cb) => {
	const params = {
		docid,
		email: {
			doctype: 'invoice',
			emails: [email],
		},
	};
	sellsy
		.api({
			method: 'Document.sendDocByMail',
			params,
		})
		.then(data => {
			if (data.status === 'success') cb(null, data);
			else cb(data.error);
		})
		.catch(e => {
			cb(e);
		});
};

/**
 * The whole process:
 * - create a customer
 * - create an invoice attached to the customer
 * - add stripe and bookeo ids
 * - add a payment
 * - send the invoice to the customer
 */
const sellsyProcess = (data, cb) => {
	createCustomer(data.customer, (err, customerid) => {
		if (err) cb(err);
		else {
			data.invoice.document.thirdid = customerid;
			createInvoice(data.invoice, (err, docid) => {
				if (err) cb(err);
				else {
					addCustomFields(docid, data.customFields, (err, result) => {
						if (err) cb(err);
						else {
							createPayment(docid, data.payment, (err, result) => {
								if (err) cb(err);
								else {
									sendInvoice(docid, data.customer.third.email, (err, result) => {
										if (err) cb(err);
										else {
											cb(null, result);
										}
									});
								}
							});
						}
					});
				}
			});
		}
	});
};

module.exports = sellsyProcess;
