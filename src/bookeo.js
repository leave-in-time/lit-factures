const request = require('request');
const dotenv = require('dotenv');
dotenv.config();

const baseUrl = 'https://api.bookeo.com/v2/bookings/';
const keysParams = `?apiKey=${process.env.BOOKEO_API_KEY}&secretKey=${
	process.env.BOOKEO_SECRET_KEY
}`;

const getBookeoDetails = (bookingId, cb) => {
	const url = `${baseUrl}${bookingId}${keysParams}`;
	console.log(url);
	request({ url, json: true }, (err, res, body) => {
		console.log(err);
		console.log(res);
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
		} else cb({ err: 'Failed to get bookeo details' });
	});
};

module.exports = getBookeoDetails;
