var { db } = require('./public');
import { BadRequestError } from './error.js';
import { cleanAll } from './public';
// import joinToArr = require('./public');
type Rate = 'ممتاز' | 'جيد جدا' | 'جيد' | 'مقبول' | 'ضعيف';
type Age = 'شاب' | 'عجوز' | 'طفل';

interface Request {
	id: number,
	halfOperationId: number,
	name: string,
	details: string,
	notes: string,
	address: string,
	dateOfExecution: Date,
	applicantId: number,
	applicantName: string,
	applicantFamilyName: string,
	applicantNickname: string,
	applicantPhone: string[],
	applicantInit: Date,
	executorId: number,
	executorName: string,
	executorFamilyName: string,
	executorNickname: string,
	executorPhone: string[],
	executorAge: Age,
	executorRate: Rate,
	executorAddress: string,
	executorAcademy: string,
	executorAccountNumber: string[],
	executorCareerOrProduct: string[],
	executorInit: Date,
	alarm: string,
	init: Date
}

/**
 * request = {
 *  id:1, 
	name:'كهرباء',					<- requestNames will updated before adding a request
	details:'this is details of a request',
	notes:'nothing in note',
	address:'الحنجور',
	dateOfExecution:2022-02-17T07:51:41.804Z,
	applicantId:4,				
	applicantName:'هدار حسين',
	applicantFamilyName:'بن شعيب',
	applicantNickname:'هدوور',
	applicantPhone:['771122335','789456123'],
	executorId:3,				
	executorName:'علي حسين',
	executorFamilyName:'بن شعيب',
	executorNickname:'علووش',
	executorPhone:['71341324','73434234'],
	executorAccountNumber:['3928492334234','238498896873'],
	alarm:2022-02-17T07:51:41.804Z}
 * @returns array of requests
 */
function getRequests() {
	return new Promise((resolve, reject) => {
		db.query(
			`select * from requestsView;`,
			(err, res) => {
				if (err) reject(err);
				else resolve(require('./public').joinToArr(res));
			}
		);
	});
}


/**
 * 
 * @param {number} id of the request to be deleted
 */
function deleteRequest(id: number): Promise<any> {
	return new Promise((resolve, reject) => {
		id = Number(id);
		if (!id)
			reject('id is not a number');
		else
			db.query('DELETE FROM requests WHERE requests.id = ?;', [id], (err, res) => {
				err ? reject(err) : resolve(res);
			})
	})
}

function addRequest(request: Request) {
	return new Promise((resolve, reject) => {
		require('./public').cleanAll(request);
		let sql = ``;
		if (!request.applicantId) // add new applicant(person) if applicantId is undefined
			reject({ error: 'applicantId is required! ' + request.applicantId, request });
		if (!request.name)
			reject({ error: `request.name is required! ${request.name}`, request })

		sql += `
		-- add name of request in requestNames table. if not found will insert it as new
		set @requestNameId = -1;
		call setRequestNameId(${db.escape(request.name)}, @requestNameId);
		
		insert into halfOperations(requestNameId, details, executorId)					
		values (@requestNameId, ${db.escape(request.details)}, ${request.executorId ? db.escape(request.executorId) : 'NULL'});
		set @halfOperationId = last_insert_id();
		
		set @addressId = -1;
		${request.address ? 'call setAddressId(' + db.escape(request.address) + ',@addressId);' : ''}
		
		insert into requests(halfOperationId, applicantId, notes, addressId, dateOfExecution, alarm)
		values (@halfOperationId, ${db.escape(request.applicantId)}, ${db.escape(request.notes)}
				, ${request.address ? '@addressId' : "NULL"}, ${request.dateOfExecution ? db.escape(request.dateOfExecution) : 'NULL'}, ${request.alarm ? db.escape(request.alarm) : 'NULL'});
		select last_insert_id();`

		db.query(sql, (err, res) => {
			if (err) {
				if (err.sqlMessage && err.sqlMessage.includes(`Incorrect datetime value`))
					if (err.sqlMessage.includes('alarm'))
						err.msg = `خطأ في تاريخ المنبه!`;
					else if (err.sqlMessage.includes('dateOfExecution'))
						err.msg = `خطأ في تاريخ وقت التنفيذ!`;
					else err.msg = `خطأ في التاريخ!`;
				reject(err);
			} else resolve(require('./public').lastInsertId(res));
		})
	})
}

function getRequestById(id:number) {
	return new Promise((resolve, reject) => {
		console.log({id})
		if (!id)
			reject({error:'id is undefined = '+id})
		db.query('select * from requestsView where id = ?;', [id], (err, res) => {
			if (err) {
				reject(err);
			} else resolve(require('./public').joinToArr(res)[0]);
		});
	})
}

function updateRequest(r:Request):Promise<Error>|Promise<object> {
	return new Promise((resolve, reject) => {
		console.log('b dateOfExecution:',r.dateOfExecution)
		console.log('b alarm:', r.alarm);
		cleanAll(r)
		console.log('a dateOfExecution:', r.dateOfExecution)
		console.log('a alarm:', r.alarm);
		if (!r.id)
			return reject(new BadRequestError('id is undefined! '+r.id));
		if (!r.halfOperationId)
			return reject(new BadRequestError('halfOperationId is undefined! '+r.halfOperationId))
		let sql = `
		set @addressId = -1;
		${r.address ? 'call setAddressId(' + db.escape(r.address) + ',@addressId);' : ''}
		
		set @requestNameId = -1;
		call setRequestNameId(${db.escape(r.name)}, @requestNameId);
		
		UPDATE halfOperations 
		SET requestNameId = @requestNameId, executorId = ${db.escape(r.executorId||null)}, details = ${db.escape(r.details||null)}
		WHERE halfOperations.id = ${db.escape(r.halfOperationId)};
		
		UPDATE requests
		SET applicantId = ${db.escape(r.applicantId)},notes = ${db.escape(r.notes||null)},${r.address?'addressId = @addressId,':''}dateOfExecution = ${db.escape(r.dateOfExecution||null)},alarm = ${db.escape(r.alarm||null)}
		WHERE requests.id = ${db.escape(r.id)};`
		db.query(sql, (err:Error, res:object) => {
			err ? reject(err) : resolve(res);
		})
	})
}

module.exports = { getRequests, deleteRequest, addRequest,getRequestById, updateRequest}