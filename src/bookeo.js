const request = require('request');
const dotenv = require('dotenv');
dotenv.config();

const baseUrl = 'https://api.bookeo.com/v2/bookings/';
const keysParams = `?apiKey=${process.env.BOOKEO_API_KEY}&secretKey=${
	process.env.BOOKEO_SECRET_KEY
}`;

const getBookeoDetails = (bookingId, cb) => {
	const url = `${baseUrl}${bookingId}${keysParams}`;
	request({ url, json: true }, (err, res, body) => {
		if (!err && res.statusCode === 200) {
			const data = {
				persons: body.participants.numbers[0].number,
				room: body.productName,
				startTime: body.startTime,
				endTime: body.endTime,
				creationTime: body.creationTime,
				title: body.title,
			};
			cb(null, data);
		} else cb(new Error('Failed to get bookeo data'));
	});
};

const getBookeoType = description => {
	const voucherDescription = 'leave-in-time - Chèque-cadeau';
	const multipleDescription = 'réservations';
	const singleDescription = 'Leave in Time Nantes - Réservation ';
	if (description === voucherDescription) return { type: 'voucher' };
	else if (description.includes(multipleDescription)) return { type: 'multiple' };
	else {
		const bookingId = description.replace(singleDescription, '');
		if (isNaN(bookingId)) return { type: 'unknown' };
		else return { type: 'single', bookingId };
	}
};

module.exports = {
	getBookeoDetails,
	getBookeoType,
};
