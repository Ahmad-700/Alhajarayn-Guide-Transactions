"use strict";
const fs = require('fs');
const { MyError } = require('./error');
const vcard = require('vcardparser');
const { cleanAll, db } = require('./public');
//********************************UPLOAD TO DATABASE***********************************/

function insertVCardContacts(p) {
	return new Promise(async (resolve, reject) => {
		if (typeof p !== "string") reject(new MyError('path is invalid "' + p + '"'));
		try {
			console.log('path', p)
			var fd = fs.readFileSync(p, 'utf8');
			var card = await myVCardParser(fd);
			console.log("there are", card.length, "contacts will added...");
			var statics = { contacts: card.length, addedContacts: 0,totalPhone:0, addedPhones: 0, addedPhonesExistedPersons: 0, error: [], msg: [], phoneMsg: [], personMsg: [] };

			for (let c of card) {
				if (c.phone && c.phone.length)
					statics.totalPhone += c.phone.length; 
				await insertCard(c, statics).catch(() => {/* ignore error and continue adding the rest of cards*/});
			}
			statics.phoneMsg = statics.phoneMsg.filter(v => typeof v == 'string')
			resolve(statics);
		} catch (e) {
			reject(e);
		}
	});
}


function insertCard(c, statics) {
	return new Promise(async (resolve, reject) => {
		fixArabic(c.name);
		c.familyName = (c.name.last != '' ? (c.name.last) : '') + (c.name.suffix != '' ? (' ' + c.name.suffix) : '');
		c.name = (c.name.prefix != '' ? (c.name.prefix) : '')
			+ (c.name.first != '' ? (c.name.first + " ") : '')
			+ (c.name.middle != '' ? (c.name.middle) : '');

		c.name = c.name.trim();
		c.familyName = c.familyName.trim()
		// var counter = 0;
		try {
			cleanAll(c);
			// console.log('adding:', JSON.stringify(c))
			var { ap, apep, phoneMsg } = await insertPerson(c);//apep is total added phone numbers for existing persons. ap is total added phone.
			statics.addedContacts++;
			statics.addedPhones += ap;
			statics.addedPhonesExistedPersons += apep;
			statics.msg.push(phoneMsg)
			statics.phoneMsg = [...statics.phoneMsg, ...phoneMsg];
			return resolve()
		} catch (e) {
			statics.error.push(e);
			if (e.personMsg) statics.personMsg = [...statics.personMsg, e.personMsg];
			return reject()
		}
	})
}


// insertPerson({ name: 'testInsertion-6', familyName: 'forError', phone: ['34564356','3456346','546354'] })
// 	.then(r => console.log(' r:', r))
// 	.catch(e => console.log(' e:', e))

function insertPerson(person) {
	return new Promise((resolve, reject) => {
		if (!person) return reject("person is undefined!!");
		var s = { apep: 0, ap: 0, phoneMsg: [] };//apep is total added phone numbers for existing persons. ap is total added phone.
		db.query(
			`insert into persons(name,familyName) values (?,?);set @personId = last_insert_id();`,
			[person.name || null, person.familyName || null],
			async (err, res) => {
				if (err) {
					if (err.sqlMessage)
						if (err.sqlMessage.indexOf("persons.UN_persons_UniqueFullNames") != -1) {
							s.personMsg = (`يوجد شخص بنفس الاسم "${(person.name + " " + person.familyName).trim()}"`);
							if (person.phone && person.phone.length && person.phone.length > 0) {
								db.query(`select id from persons where name = ? and familyName = ?;`,
									[person.name, person.familyName],
									async (erro, reso) => {
										if (erro) { erro.msg = "error when searching for person;(to add phone numbers) that couldn't inserted"; return reject(erro); }
										else if (reso && reso[0] && reso[0].id) {
											// var counter = 0;
											for (let p of person.phone) {
												try {
													await insertPhone(reso[0].id, p)
													// console.log('inserting phone number=' + p + ' for existing person with id=' + reso[0].id + ' that could not inserted')
													// .then((r) => {
													s.apep++;
													s.ap++;
													// if (++counter == person.phone.length) resolve(s);
													// }) //adding phone numbers for existing persons
												} catch (e) {
													// .catch((e) => {
													// console.log('insert phone e', e)
													e.msg ? s.phoneMsg.push(e.msg) : '';
													// if (++counter == person.phone.length) resolve(s);
													// });
												}

											}
											return resolve(s);
										}
									});
							}
						}
					return reject(s);
				} else {
					if (person.phone.length > 0) {
						// var counter = 0;
						for (let p of person.phone) {
							try {
								await insertPhone('@personId', p);
								// .then(() => {
								s.ap++;
								// if (++counter == person.phone.length) resolve(s);
								// })
							} catch (e) {
								// .catch((e) => {
								e.msg ? s.phoneMsg.push(e.msg) : '';
								// if (++counter == person.phone.length) resolve(s);
								// });
							}
						}
						return resolve(s);
					} else return resolve(s);
				}
			}
		);
	});
}




function myVCardParser(str) {
	return new Promise((resolve, reject) => {
		vcard.parseString(str, (err, arr) => {
			if (err) return reject(err);
			var cards = [];
			var card, phone;
			for (let i = 0; i < arr.length; i++) {
				if (arr[i].name == "begin") {
					i++;
					card = {};
					phone = [];
					while (arr[i].name != "end" && i < arr.length) {
						if (arr[i].name == "n") card["name"] = arr[i].value;
						if (arr[i].name == "tel") phone.push(arr[i].value.value);
						i++;
					}
					card["phone"] = phone;
					if (!card["name"] && card["phone"].length == 0) continue;
					if (!card["name"] && card["phone"].length != 0)
						card["name"] = { first: "", last: "", prefix: "", suffix: "" };
					cards.push(card);
				}
			}
			return resolve(cards);
		});
	});
}




/**
 * @param {number} id of the person
 * @param {string} phone number
 * @returns
 */
function insertPhone(id, phone) {
	return new Promise((resolve, reject) => {
		if (!id || !phone)
			return reject('insert phone require id and phone, but found id=' + id + ' and phone=' + phone);
		phone = phone.trim().replace(/ /g, '');
		phone = phone.replace(/-/g, '');
		db.query(`insert into phones(personId,phoneNumber) values (${typeof id == 'string' && id.charAt(0) == '@' ? id : db.escape(id)},?);`, [phone], (err, res) => {
			if (err) {
				if (err.sqlMessage)
					if (err.sqlMessage.indexOf("phones.UN_phones_PersonHaveDupSameNumber") != -1)
						err.msg = `رقم الجوال "${phone}" متكرر لنفس الشخص رقم "${id}"`;
					else if (err.eqlMessage.indexOf("Data too long") != -1)
						err.msg = `الرقم المدخل اطول من المتوقع من رقم جوال`
				return reject(err);
			}
			return resolve(res);
		});
	});
}




/**
 * This function is made to convert names in vCard that in hexadecimal and convert it to regular text in utf-8
 * @param {String} data is string represent hexadecimal in form:=D8=B9=D8=A8=D8=AF=D8
 * @returns string in form of text.
 */
function myConverter(data) {
	let my = [];
	for (let i = 0; i < data.length; i++) {
		//make array of individual number. ex: '=D8=B9=D8=A8' to ['D8', 'B9', 'D8', 'A8']
		let b = "";
		while (data.charAt(i) != "=" && i < data.length) {
			b += data.charAt(i);
			i++;
		}
		my.push(b);
	}
	//convert hexadecimal to decimal. ex: ['D8', 'B9', 'D8'] to [216, 185, 216]
	my = my.map((a) => {
		if (Number("0x" + a)) return Number("0x" + a);
	});
	// get rid of empty elements. ex:['', NaN, null, undefined, 'hi'] to ['hi']
	my = my.filter((a) => {
		if (a) return a;
	});
	//convert it to Buffer object
	my = { type: "Buffer", data: my };

	return Buffer.from(my, "utf-8").toString(); //convert buffer i.e bytes to utf-8 text
}




/**
 * convert binary string to utf-8
 * @param {Object} objectName contains: {last: "=52=61=6A=65=6B",first: "",middle: "",prefix: "",suffix: ""}
 */
function fixArabic(o) {
	o.last = o.last.indexOf("=") != -1 ? myConverter(o.last) : o.last;
	o.first = o.first.indexOf("=") != -1 ? myConverter(o.first) : o.first;
	o.middle = o.middle.indexOf("=") != -1 ? myConverter(o.middle) : o.middle;
	o.prefix = o.prefix.indexOf("=") != -1 ? myConverter(o.prefix) : o.prefix;
	o.suffix = o.suffix.indexOf("=") != -1 ? myConverter(o.suffix) : o.suffix;
}


//********************************UPLOAD TO SERVER***********************************/

/**
 * used in server post to upload user file
 * @param {req} busboy req.busboy
 * @returns Promise with {filedName, file, filename}
 */
function uploadFile(busboy) {
	return new Promise((resolve, reject) => {
		if (!busboy) reject('busboy object is undefined!' + busboy);
		busboy.on('file', (fieldName, file, filename) => {
			resolve({ fieldName, file, filename });
		})
	})
}

function closing(stream) {
	return new Promise((resolve, reject) => {
		if (!stream) reject('stream para is required! = ' + stream)
		stream.on('close', async () => {
			resolve();
		});
	});
}

//********************************DOWNLOAD TO SERVER***********************************/

module.exports = { insertVCardContacts, uploadFile, closing }