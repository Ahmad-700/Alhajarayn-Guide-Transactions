"use strict";
exports.__esModule = true;
var db = require('./public').db;
var error_js_1 = require("./error.js");
var public_1 = require("./public");
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
    return new Promise(function (resolve, reject) {
        db.query("select * from requestsView;", function (err, res) {
            if (err)
                reject(err);
            else
                resolve(require('./public').joinToArr(res));
        });
    });
}
/**
 *
 * @param {number} id of the request to be deleted
 */
function deleteRequest(id) {
    return new Promise(function (resolve, reject) {
        id = Number(id);
        if (!id)
            reject('id is not a number');
        else
            db.query('DELETE FROM requests WHERE requests.id = ?;', [id], function (err, res) {
                err ? reject(err) : resolve(res);
            });
    });
}
function addRequest(request) {
    return new Promise(function (resolve, reject) {
        require('./public').cleanAll(request);
        var sql = "";
        if (!request.applicantId) // add new applicant(person) if applicantId is undefined
            reject({ error: 'applicantId is required! ' + request.applicantId, request: request });
        if (!request.name)
            reject({ error: "request.name is required! ".concat(request.name), request: request });
        sql += "\n\t\t-- add name of request in requestNames table. if not found will insert it as new\n\t\tset @requestNameId = -1;\n\t\tcall setRequestNameId(".concat(db.escape(request.name), ", @requestNameId);\n\t\t\n\t\tinsert into halfOperations(requestNameId, details, executorId)\t\t\t\t\t\n\t\tvalues (@requestNameId, ").concat(db.escape(request.details), ", ").concat(request.executorId ? db.escape(request.executorId) : 'NULL', ");\n\t\tset @halfOperationId = last_insert_id();\n\t\t\n\t\tset @addressId = -1;\n\t\t").concat(request.address ? 'call setAddressId(' + db.escape(request.address) + ',@addressId);' : '', "\n\t\t\n\t\tinsert into requests(halfOperationId, applicantId, notes, addressId, dateOfExecution, alarm)\n\t\tvalues (@halfOperationId, ").concat(db.escape(request.applicantId), ", ").concat(db.escape(request.notes), "\n\t\t\t\t, ").concat(request.address ? '@addressId' : "NULL", ", ").concat(request.dateOfExecution ? db.escape(request.dateOfExecution) : 'NULL', ", ").concat(request.alarm ? db.escape(request.alarm) : 'NULL', ");\n\t\tselect last_insert_id();");
        db.query(sql, function (err, res) {
            if (err) {
                if (err.sqlMessage && err.sqlMessage.includes("Incorrect datetime value"))
                    if (err.sqlMessage.includes('alarm'))
                        err.msg = "\u062E\u0637\u0623 \u0641\u064A \u062A\u0627\u0631\u064A\u062E \u0627\u0644\u0645\u0646\u0628\u0647!";
                    else if (err.sqlMessage.includes('dateOfExecution'))
                        err.msg = "\u062E\u0637\u0623 \u0641\u064A \u062A\u0627\u0631\u064A\u062E \u0648\u0642\u062A \u0627\u0644\u062A\u0646\u0641\u064A\u0630!";
                    else
                        err.msg = "\u062E\u0637\u0623 \u0641\u064A \u0627\u0644\u062A\u0627\u0631\u064A\u062E!";
                reject(err);
            }
            else
                resolve(require('./public').lastInsertId(res));
        });
    });
}
function getRequestById(id) {
    return new Promise(function (resolve, reject) {
        console.log({ id: id });
        if (!id)
            reject({ error: 'id is undefined = ' + id });
        db.query('select * from requestsView where id = ?;', [id], function (err, res) {
            if (err) {
                reject(err);
            }
            else
                resolve(require('./public').joinToArr(res)[0]);
        });
    });
}
function updateRequest(r) {
    return new Promise(function (resolve, reject) {
        console.log('b dateOfExecution:', r.dateOfExecution);
        console.log('b alarm:', r.alarm);
        (0, public_1.cleanAll)(r);
        console.log('a dateOfExecution:', r.dateOfExecution);
        console.log('a alarm:', r.alarm);
        if (!r.id)
            return reject(new error_js_1.BadRequestError('id is undefined! ' + r.id));
        if (!r.halfOperationId)
            return reject(new error_js_1.BadRequestError('halfOperationId is undefined! ' + r.halfOperationId));
        var sql = "\n\t\tset @addressId = -1;\n\t\t".concat(r.address ? 'call setAddressId(' + db.escape(r.address) + ',@addressId);' : '', "\n\t\t\n\t\tset @requestNameId = -1;\n\t\tcall setRequestNameId(").concat(db.escape(r.name), ", @requestNameId);\n\t\t\n\t\tUPDATE halfOperations \n\t\tSET requestNameId = @requestNameId, executorId = ").concat(db.escape(r.executorId || null), ", details = ").concat(db.escape(r.details || null), "\n\t\tWHERE halfOperations.id = ").concat(db.escape(r.halfOperationId), ";\n\t\t\n\t\tUPDATE requests\n\t\tSET applicantId = ").concat(db.escape(r.applicantId), ",notes = ").concat(db.escape(r.notes || null), ",").concat(r.address ? 'addressId = @addressId,' : '', "dateOfExecution = ").concat(db.escape(r.dateOfExecution || null), ",alarm = ").concat(db.escape(r.alarm || null), "\n\t\tWHERE requests.id = ").concat(db.escape(r.id), ";");
        db.query(sql, function (err, res) {
            err ? reject(err) : resolve(res);
        });
    });
}
module.exports = { getRequests: getRequests, deleteRequest: deleteRequest, addRequest: addRequest, getRequestById: getRequestById, updateRequest: updateRequest };
