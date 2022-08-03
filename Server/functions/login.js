const crypto = require("crypto");

var users = [
	{
		username: "احمد",
		password: process.env.AHMAD_PASS,
	},
	{
		username: "asdf",
		password: process.env.ASDF_PASS,
	},
	{
		username: "مكتب",
		password: process.env.MKTB_PASS
	}
];

/**
 * @returns string base64 with 44 length. Save in database as the password.
 * @param message is (ClientPassword + dynamicSalt) that will be hashed with static salt by sha256 function
 */
function hash(message) {
	let staticSalt = process.env.STATIC_SALT;
	return crypto
		.createHash(process.env.HASH)
		.update(message + staticSalt)
		.digest("base64")
		.toString();
}



function login(username, password) {
	return new Promise((resolve, reject) => {
		let found;
		for (let a of users) if (a.username == username) found = a.password;

		if (found) {
			if (found === hash(password)) resolve();
			else reject({ msg: "خطأ في كلمة السر" });
		} else reject({ msg: "اسم المستخدم غير صحيح" });
	});
}

async function authentication(req, res, next) {
	console.log('url', req.url)
	console.log({ session: req.session })
	if (req.session.loggedin !== true) {
		if (req.url != '/login') {
			try {
				await login(req.body.username, req.body.password)
				next();
			} catch (e) {
				res.status(402).redirect('/login')
			}
		} else {
			req.session.loggedin = false;
			req.session.username = undefined;
			next(); 
		}
	} else next();
}
module.exports = { authentication, login }