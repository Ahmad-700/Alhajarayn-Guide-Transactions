const { db, cleanAll, joinToArr, lastInsertId } = require('./public.js');

/**
 * 
 * @returns ex:{
 * 		name:'Ahmad Hashim',
 * 		familyName:'Alkaf',
 * 		phone:['733423423','772343293']
 * }
 */
function getPersons() {
    return new Promise((resolve, reject) => {
        db.query(`select * from personsView;`, (err, res) => {
            if (err) reject(err);
            else resolve(joinToArr(res));
        })
    })
}

function deletePerson(id) {
    return new Promise((resolve, reject) => {
        if (!id) reject({ error: 'deletePerson need an id' });
        else db.query(`delete from persons where id = ?;`, [id], (err, res) => {
            if (err) {
                if (err.sqlMessage.includes('FK_executors_personId'))
                    err.msg = 'لا يمكن حذف منفذ من جهات الاتصال'
                reject(err)
            } else resolve(res);
        });
    });
}

function updatePerson(n, o) {
    return new Promise((resolve, reject) => {
        // console.log(n, o)
        if (!n.id || !o.id)
            reject({ error: 'update person should have an id. newPerson.id=' + n.id + '. oldPerson.id=' + o.id });
        else if (n.id != o.id)
            reject({ error: 'newPerson.id is not equal to oldPerson.id that mean they different people!' })
        else {
            var sql = ``;
            if (n.name != o.name || n.familyName != o.familyName || n.nickname != o.nickname) {
                let arr = ['name = ' + db.escape(n.name), 'familyName = ' + db.escape(n.familyName), 'nickname = ' + db.escape(n.nickname)]
                sql += `update persons set ${arr.join(', ')} where persons.id = ${db.escape(n.id)};`
            }
            var phoneDiff = false;
            if (!n.phone && !o.phone)
                phoneDiff = false;
            else
                if (n.phone.length != o.phone.length)
                    phoneDiff = true;
                else {
                    for (let i = 0; i < n.phone.length; i++) {
                        if (n.phone[i] != o.phone[i]) {
                            phoneDiff = true;
                            break;
                        }
                    }
                }
            if (phoneDiff) {
                sql += `delete from phones where personId = ${db.escape(n.id)};`
                for (let p of n.phone)
                    sql += `insert into phones(personId,phoneNumber)values(${db.escape(n.id)},${db.escape(p)});`;
            }
            if (sql != ``)
                db.query(sql, (err, res) => {
                    err ? reject(err) : resolve(res);
                });
            else resolve('Nothing Changed!')
        }
    });
}

function addPerson(p) {
    return new Promise((resolve, reject) => {
        cleanAll(p);
        var sql = `insert into persons(name,familyName,nickname)
		values(${db.escape(p.name || null)}, ${db.escape(p.familyName || null)}, ${db.escape(p.nickname || null)});set @personId = last_insert_id();select last_insert_id();`

        if (p.phone) {
            for (let phone of p.phone)
                sql += `insert into phones(personId,phoneNumber) 
					values(@personId, ${db.escape(phone)});`
        }
        db.query(sql, (err, res) => {
            if (err) {
                if (err.sqlMessage && err.sqlMessage.includes('UN_persons_UniqueFullNames'))
                    err.msg = 'حدث خطأ: يوجد شخص بنفس الاسم!'
                reject(err);
            }
            else {
                resolve(lastInsertId(res));
            }
        });
    });
}

function personToExecutor(person) {
    return new Promise((resolve, reject) => {
        if (!person.id)
            reject('id not exists!')
        else db.query('insert into executors(personId) values(?)', [person.id], (err, res) => {
            err ? reject(err) : resolve(res);
        })
    })
}

module.exports = {
    getPersons,
    addPerson,
    deletePerson,
    updatePerson,
    personToExecutor
}