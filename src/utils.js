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
	`Source address:\n${source.address_line1}\n${source.address_line2}\n${source.address_zip} ${
		source.address_city
	}\n${source.address_country}`
);
