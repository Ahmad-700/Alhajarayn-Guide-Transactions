var { db } = require('./public');
import { joinToArr, cleanAll, lastInsertId } from './public';
import { BadRequestError } from './error'


type currency = 'يمني' | 'سعودي' | 'دولار';
type rate = 'ممتاز' | 'جيد جدا' | 'جيد' | 'مقبول' | 'ضعيف';
type age = 'شاب' | 'عجوز' | 'طفل';
interface Operation {
   id: number,
   name: string,
   notes: string,
   deliveryPrice: number,
   totalPrice: number
   profit: number,
   totalPaid: number,
   currency: currency,
   halfOperationId: number,
   details: string
   init: Date,
   executorId: number,
   executorName: string,
   executorFamilyName: string,
   executorPhone: string[],
   executorAge: age,
   executorRate: rate,
   executorAddress: string
   executorAcademy: string
   executorCareerOrProduct: string[]
   executorAccountNumber: string[]
   executorInit: Date
   requestId: number
   requestDetails: string
   requestAddress: string
   requestNotes: string
   requestDateOfExecution: Date
   requestInit: Date
   applicantId: number
   applicantName: string
   applicantFamilyName: string
   applicantNickname: string
   applicantPhone: string[]
   applicantInit: Date
}

export function getOperations() {
   return new Promise((resolve, reject) => {
      db.query(`select * from operationsView;`, (err: Error, res: object) => {
         err ? reject(err) : resolve(joinToArr(res));
      })
   })
}

export function addOperation(o: Operation) {
   return new Promise((resolve, reject) => {
      cleanAll(o);
      if (!o.executorId)
         return reject(new BadRequestError('executorId is required! ' + o.executorId + JSON.stringify(o)));
      if (!o.name)
         return reject(new BadRequestError(`operation name is required! ${o.name}` + JSON.stringify(o)));

      let sql = ``;
      //if halfOperationId is exists we don't have to set executor and operation name and operation details.
      if (o.halfOperationId) {
         sql += `
            set @halfOperationId = ${db.escape(o.halfOperationId)};
            `
      } else {
         sql += `
            set @operationNameId = -1;
         call setRequestNameId(${db.escape(o.name)}, @operationNameId);
         insert into halfOperations(requestNameId, executorId, details)					
         values (@operationNameId, ${db.escape(o.executorId)}, ${db.escape(o.details)});
         set @halfOperationId = last_insert_id();
            `
      }
      sql += `
         insert into operations(halfOperationId, notes, deliveryPrice, totalPrice, profit, totalPaid, currency)
values (@halfOperationId,${db.escape(o.notes)},${db.escape(o.deliveryPrice)},${db.escape(o.totalPrice)},${db.escape(o.profit)},${db.escape(o.totalPaid)},${db.escape(o.currency)});
`

      db.query(sql, (err, res: object) => {
         if (err) {
            if (err.sqlMessage && err.sqlMessage.includes(`Incorrect datetime value`))
               err.msg = `خطأ في التاريخ!`;
            reject(err);
         } else resolve(lastInsertId(res));
      })
   })
}


export function deleteOperation(id: number) {
   return new Promise((resolve, reject) => {
      id = Number(id);
      if (!id || id == 0)
         return reject(new BadRequestError('Invalid ID = ' + id));
      db.query('DELETE FROM operations WHERE operations.id = ?;', [id], function (err, res) {
         err ? reject(err) : resolve(res);
      });
   })
}

export function getOperationById(id: number) {
   return new Promise((resolve, reject) => {
      id = Number(id);
      if (!id)
         reject(new BadRequestError('id is undefined = ' + id))
      db.query('select * from operationsView where id = ?;', [id], (err, res) => {
         if (err) {
            reject(err);
         } else resolve(joinToArr(res)[0]);
      });
   })
}

export function updateOperation(o: Operation) {
   return new Promise((resolve, reject) => {
      cleanAll(o);
      if (!o.executorId)
         return reject(new BadRequestError('executorId is required! found' + o.executorId + JSON.stringify(o)));
      if (!o.name)
         return reject(new BadRequestError(`operation name is required! found ${o.name}` + JSON.stringify(o)));
      if (!o.halfOperationId)
         return reject(new BadRequestError('halfOperationId is required! found '+o.halfOperationId))

      let sql = `
         set @halfOperationId = ${db.escape(o.halfOperationId)};
         set @operationNameId = -1;
         call setRequestNameId(${db.escape(o.name)}, @operationNameId);
         
         UPDATE halfOperations 
         SET requestNameId = @operationNameId, executorId = ${db.escape(o.executorId)}, details = ${db.escape(o.details)}				
         WHERE halfOperations.id = ${db.escape(o.halfOperationId)};
          
         UPDATE operations 
         SET notes = ${db.escape(o.notes)}, deliveryPrice = ${db.escape(o.deliveryPrice)}, totalPrice = ${db.escape(o.totalPrice)}, profit = ${db.escape(o.profit)}, totalPaid = ${db.escape(o.totalPaid)}, currency = ${db.escape(o.currency)}
         WHERE operations.id = ${db.escape(o.id)};
         `

      db.query(sql, (err, res: object) => {
         if (err) {
            // if (err.sqlMessage && err.sqlMessage.includes(`Incorrect datetime value`))
            //    err.msg = `خطأ في التاريخ!`;
            reject(err);
         } else resolve(lastInsertId(res));
      })

   })
}