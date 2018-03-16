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
 * Gets an invoice by the stripe id
 */
const findInvoice = (stripeid, cb) => {
	const params = {
		doctype: 'invoice',
		search: {
			customfields: [
				{
					cfid: process.env.SELLSY_STRIPE_FIELD,
					linkedtype: 'document',
					value: stripeid,
				},
			],
		},
	};
	sellsy
		.api({
			method: 'Document.getList',
			params,
		})
		.then(data => {
			if (data.status === 'success') {
				const found = !Array.isArray(data.response.result);
				cb(null, found);
			} else cb(data.error);
		})
		.catch(e => {
			cb(e);
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
		if (data.gameDate) {
			params.values['2'] = {
				cfid: process.env.SELLSY_GAME_DATE_FIELD,
				value: data.gameDate,
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
	findInvoice(data.payment.stripe, (err, found) => {
		if (err) cb(err);
		else if (found) cb(new Error('There is already an invoice for this stripe payment'));
		else {
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
											if (
												data.customer.third.email ===
													'escape@leave-in-time.com' ||
												data.customer.third.email ===
													'xavier.seignard@gmail.com' ||
												data.customer.third.email ===
													'paris@leave-in-time.com'
											) {
												sendInvoice(
													docid,
													data.customer.third.email,
													(err, result) => {
														if (err) cb(err);
														else {
															cb(null, result);
														}
													}
												);
											} else {
												cb(null, result);
											}
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
