const { db } = require('./public');

/**
 * 
 * @returns ex:['مكلا','مكة','هجرين','حنجور']
 */
 function getAddresses() {
	return new Promise((resolve, reject) => {
		db.query(`select address from addresses`, (err, res) => {
			err? reject(err): resolve(res.map(v=>v.address));
		})
	})
}

/**
 * ex: [سباك,كهربائي]
 * @returns array of requestsNames
 */
 function getRequestsNames() {
	return new Promise((resolve, reject) => {
		db.query(`select requestName AS name from requestNames`, (err, res) => {
			err ? reject(err) : resolve(res.map(o => o.name));
		});
	})
}

module.exports = {
    getAddresses,
    getRequestsNames
};