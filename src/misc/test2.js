const dotenv = require('dotenv');
dotenv.config();
const sellsyProcess = require('../sellsy');
const data = require('./sellsyData');

sellsyProcess(data, (err, result) => {
	if (err) console.log(err);
	else console.log(result);
});
