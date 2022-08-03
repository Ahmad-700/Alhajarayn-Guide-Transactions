const { db, cleanAll, joinToArr,lastInsertId } = require('./public');

/**
 *  executor = {
	id: 2,
	name: 'علي حسين',
	familyName: 'بن شعيب',
	nickname: 'علووش',
	phone: [ '38782734', '35634452' ]
	age: 'شاب',
	rate: 'ممتاز',
	address: 'الحوطة',
	academy: 'جامعة',
	careerOrProduct: ['كهربائي', 'مهندس'],
	accountNumber: ['23409834324','23423489875'],
	init: 2022-02-08T17:03:02.000Z,
  }
 * @returns array of executors
 */
function getExecutors() {
	return new Promise((resolve, reject) => {
		db.query(
			`select * from executorsView`,
			(err, result) => {
				err
					? reject(err)
					: resolve(joinToArr(result));
			}
		);
	});
}



function addExecutor(ex) {
	return new Promise((resolve, reject) => {
		cleanAll(ex);
		if ((!ex.name) || (!ex.familyName))
			reject({ msg: 'الرجاء ادخال الاسم كامل' });
		var sql = `set @addressId = -1;set @personId = -1;
			${!ex.address ? '' : 'call setAddressId(' + db.escape(ex.address) + ',@addressId);'}
			call setPersonId(${db.escape(ex.name)}, ${db.escape(ex.familyName)}, ${db.escape(ex.nickname)}, @personId);
			insert into executors(personId, addressId, age, rate, academy)
			values(@personId, ${!ex.address ? 'NULL' : '@addressId'}, ${db.escape(ex.age)}, ${db.escape(ex.rate)}, ${db.escape(ex.academy)}); select last_insert_id();`

		if (ex.phone) {
			for (let p of ex.phone)
				sql += `insert into phones(personId,phoneNumber) 
					values((select id from persons where name = ${db.escape(ex.name)} and familyName = ${db.escape(ex.familyName)}),${db.escape(p)});`
		}
		if (ex.careerOrProduct) {
			for (let c of ex.careerOrProduct)
				sql += `insert into careerOrProducts(executorId,careerOrProduct)
					values ((select id from executors where personId = (select id from persons where persons.name = ${db.escape(ex.name)} and persons.familyName = ${db.escape(ex.familyName)})), ${db.escape(c)});`
		}
		if (ex.accountNumber) {
			for (let a of ex.accountNumber)
				sql += `insert into accountNumbers(executorId, accountNumber)
				values ((select id from executors where personId = (select id from persons where persons.name = ${db.escape(ex.name)} and persons.familyName = ${db.escape(ex.familyName)})), ${db.escape(a)});`
		}


		// console.log(sql);
		
		db.query(sql, (err, res) => {
			if (err) reject(err);
			else resolve(lastInsertId(res));
		});
	});
}



function deleteExecutor(id) {
	return new Promise((resolve, reject) => {
		if (!id) reject({ error: 'deleteExecutor need an id' });
		db.query(`delete from executors where id = ?;`, [id], (err, res) => {
			err ? reject(err) : resolve(res);
		})
	})
}

function updateExecutor(n, o) {
	return new Promise((resolve, reject) => {
		console.log(n, o)
		if (!n.id || !o.id)
			reject({ error: 'update executor should have an id. newEx.id=' + n.id + '. oldEx.id=' + o.id });
		else if (n.id != o.id)
			reject({ error: 'newExecutor.id is not equal to oldExecutor.id that mean they different people!' })
		else {
			// console.log('start sqling')
			var sql = ``;
			if (n.name != o.name || n.familyName != o.familyName || n.nickname != o.nickname) {
				let arr = ['name = ' + db.escape(n.name), 'familyName = ' + db.escape(n.familyName), 'nickname = ' + db.escape(n.nickname)]
				sql += `update persons set ${arr.join(', ')} where persons.id = (select personId from executors where executors.id = ${db.escape(n.id)});`
			}
			// console.log('sql 1:',sql)
			var phoneDiff = false;
			if (!n.phone && !o.phone)
				phoneDiff = false;
			else
				if (n.phone.length != o.phone.length) {
					phoneDiff = true;
					// console.log('phoneDiff1',phoneDiff)

				}
				else {
					console.log('phoneDiff2', phoneDiff)

					for (let i = 0; i < n.phone.length; i++) {
						if (n.phone[i] != o.phone[i]) {
							phoneDiff = true;
							break;
						}
					}
					// console.log('phoneDiff3',phoneDiff)

				}
			// console.log('phoneDiff',phoneDiff)
			if (phoneDiff) {
				sql += `delete from phones where personId = (select personId from executors where id = ${db.escape(n.id)});`
				for (let p of n.phone) {
					sql += `insert into phones(personId,phoneNumber)values((select personId from executors where id = ${db.escape(n.id)}),${db.escape(p)});`
				}
			}
			// console.log('sql 2:',sql)

			var careerDiff = false;
			if (!n.careerOrProduct && !o.careerOrProduct)
				careerDiff = false;
			else
				if (n.careerOrProduct.length != o.careerOrProduct.length)
					careerDiff = true;
				else for (let i = 0; i < n.careerOrProduct.length; i++) {
					if (n.careerOrProduct[i] != o.careerOrProduct[i]) {
						careerDiff = true;
						break;
					}
				}
			if (careerDiff) {
				sql += `delete from careerOrProducts where executorId = ${db.escape(n.id)};`
				for (let p of n.careerOrProduct) {
					sql += `insert into careerOrProducts(executorId,careerOrProduct) 
				values(${db.escape(n.id)},${db.escape(p)});`
				}
			}
			var accountNumberDiff = false;
			if (!n.accountNumber && !o.accountNumber)
				accountNumberDiff = false;
			else
				if (n.accountNumber.length != o.accountNumber.length)
					accountNumberDiff = true;
				else for (let i = 0; i < n.accountNumber.length; i++) {
					if (n.accountNumber[i] != o.accountNumber[i]) {
						accountNumberDiff = true;
						break;
					}
				}
			if (accountNumberDiff) {
				sql += `delete from accountNumbers where executorId = ${db.escape(n.id)};`
				for (let p of n.accountNumber) {
					sql += `insert into accountNumbers(executorId,accountNumber) 
				values(${db.escape(n.id)},${db.escape(p)});`
				}
			}
			if (n.age != o.age || n.rate != o.rate || n.academy != o.academy) {
				let arr = ['age = ' + db.escape(n.age), 'rate = ' + db.escape(n.rate), 'academy = ' + db.escape(n.academy)]
				sql += `update executors set ${arr.join(', ')} where id = ${db.escape(n.id)};`
			}
			if (n.address != o.address && n.address)
				sql += `set @addressId = -1;
				call setAddressId(${db.escape(n.address)},@addressId);
				update executors set addressId = @addressId where id = ${db.escape(n.id)};`
			console.log('sql= ', sql);
			if (sql != ``)
				db.query(sql, (err, res) => {
					err ? reject(err) : resolve(res);
				});
			else resolve('Nothing Changed!')
		}
	})
};

module.exports = {
	getExecutors,
	addExecutor,
	deleteExecutor,
	updateExecutor
}