"use strict";
exports.__esModule = true;
exports.updateOperation = exports.getOperationById = exports.deleteOperation = exports.addOperation = exports.getOperations = void 0;
var db = require('./public').db;
var public_1 = require("./public");
var error_1 = require("./error");
function getOperations() {
    return new Promise(function (resolve, reject) {
        db.query("select * from operationsView;", function (err, res) {
            err ? reject(err) : resolve((0, public_1.joinToArr)(res));
        });
    });
}
exports.getOperations = getOperations;
function addOperation(o) {
    return new Promise(function (resolve, reject) {
        (0, public_1.cleanAll)(o);
        if (!o.executorId)
            return reject(new error_1.BadRequestError('executorId is required! ' + o.executorId + JSON.stringify(o)));
        if (!o.name)
            return reject(new error_1.BadRequestError("operation name is required! ".concat(o.name) + JSON.stringify(o)));
        var sql = "";
        //if halfOperationId is exists we don't have to set executor and operation name and operation details.
        if (o.halfOperationId) {
            sql += "\n            set @halfOperationId = ".concat(db.escape(o.halfOperationId), ";\n            ");
        }
        else {
            sql += "\n            set @operationNameId = -1;\n         call setRequestNameId(".concat(db.escape(o.name), ", @operationNameId);\n         insert into halfOperations(requestNameId, executorId, details)\t\t\t\t\t\n         values (@operationNameId, ").concat(db.escape(o.executorId), ", ").concat(db.escape(o.details), ");\n         set @halfOperationId = last_insert_id();\n            ");
        }
        sql += "\n         insert into operations(halfOperationId, notes, deliveryPrice, totalPrice, profit, totalPaid, currency)\nvalues (@halfOperationId,".concat(db.escape(o.notes), ",").concat(db.escape(o.deliveryPrice), ",").concat(db.escape(o.totalPrice), ",").concat(db.escape(o.profit), ",").concat(db.escape(o.totalPaid), ",").concat(db.escape(o.currency), ");\n");
        db.query(sql, function (err, res) {
            if (err) {
                if (err.sqlMessage && err.sqlMessage.includes("Incorrect datetime value"))
                    err.msg = "\u062E\u0637\u0623 \u0641\u064A \u0627\u0644\u062A\u0627\u0631\u064A\u062E!";
                reject(err);
            }
            else
                resolve((0, public_1.lastInsertId)(res));
        });
    });
}
exports.addOperation = addOperation;
function deleteOperation(id) {
    return new Promise(function (resolve, reject) {
        id = Number(id);
        if (!id || id == 0)
            return reject(new error_1.BadRequestError('Invalid ID = ' + id));
        db.query('DELETE FROM operations WHERE operations.id = ?;', [id], function (err, res) {
            err ? reject(err) : resolve(res);
        });
    });
}
exports.deleteOperation = deleteOperation;
function getOperationById(id) {
    return new Promise(function (resolve, reject) {
        id = Number(id);
        if (!id)
            reject(new error_1.BadRequestError('id is undefined = ' + id));
        db.query('select * from operationsView where id = ?;', [id], function (err, res) {
            if (err) {
                reject(err);
            }
            else
                resolve((0, public_1.joinToArr)(res)[0]);
        });
    });
}
exports.getOperationById = getOperationById;
function updateOperation(o) {
    return new Promise(function (resolve, reject) {
        (0, public_1.cleanAll)(o);
        if (!o.executorId)
            return reject(new error_1.BadRequestError('executorId is required! found' + o.executorId + JSON.stringify(o)));
        if (!o.name)
            return reject(new error_1.BadRequestError("operation name is required! found ".concat(o.name) + JSON.stringify(o)));
        if (!o.halfOperationId)
            return reject(new error_1.BadRequestError('halfOperationId is required! found ' + o.halfOperationId));
        var sql = "\n         set @halfOperationId = ".concat(db.escape(o.halfOperationId), ";\n         set @operationNameId = -1;\n         call setRequestNameId(").concat(db.escape(o.name), ", @operationNameId);\n         \n         UPDATE halfOperations \n         SET requestNameId = @operationNameId, executorId = ").concat(db.escape(o.executorId), ", details = ").concat(db.escape(o.details), "\t\t\t\t\n         WHERE halfOperations.id = ").concat(db.escape(o.halfOperationId), ";\n          \n         UPDATE operations \n         SET notes = ").concat(db.escape(o.notes), ", deliveryPrice = ").concat(db.escape(o.deliveryPrice), ", totalPrice = ").concat(db.escape(o.totalPrice), ", profit = ").concat(db.escape(o.profit), ", totalPaid = ").concat(db.escape(o.totalPaid), ", currency = ").concat(db.escape(o.currency), "\n         WHERE operations.id = ").concat(db.escape(o.id), ";\n         ");
        db.query(sql, function (err, res) {
            if (err) {
                // if (err.sqlMessage && err.sqlMessage.includes(`Incorrect datetime value`))
                //    err.msg = `خطأ في التاريخ!`;
                reject(err);
            }
            else
                resolve((0, public_1.lastInsertId)(res));
        });
    });
}
exports.updateOperation = updateOperation;
