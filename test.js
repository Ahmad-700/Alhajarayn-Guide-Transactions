"use strict";
let o = {
   name: ' fasdf ',
   age: 23,
   details:'              ',
   phone: ['34243343    ', '34232234', ''],
   family: '',
   init:'   2002/5/23 8:00 pm    ثلثاء     '
}
console.log('after', o)
cleanAll(o);
console.log('before', o)
function cleanAll(object) {
   for (var att in object) {//iterate object attributes name
      if (Array.isArray(object[att])) {
         for (var i = 0; i < object[att].length; i++) {
            if (typeof object[att][i] == 'string')
               object[att][i] = object[att][i].trim();
            if (object[att][i] == '')
               object[att][i] = null;
         }
      }
      else if (typeof object[att] == 'string') {
         object[att] = object[att].trim();
         if (object[att] == '')
            object[att] = null;
         if (att == 'init' || att == 'alarm' || att == 'dateOfExecution' || att == 'applicantInit' || att == 'executorInit')
            if (object[att] && object[att].toLowerCase().includes('pm')) {
               // console.log('before', object[att]);
               var arr = object[att].split(' ');
               var date = arr[0].trim();
               var time = arr[1].trim().split(':');

               var hours = time[0];
               var minutes = time[1].trim();
               hours = Number(hours) + 12;
               object[att] = date + ' ' + hours + ':' + minutes;
               // console.log('after', object[att]);
            }
            else if (object[att] && object[att].toLowerCase().includes('am')) {
               var arr = object[att].split(' ');
               var date = arr[0];
               var time = arr[1]
               object[att] = date.trim() + ' ' +time.trim()
            }
      }
   }
}

// const speedy = require("speedy");
// speedy.run({
// 	sameCon: function () {
// 		exam1(324.23)
// 	},
// 	reCon: function () {
// 		exam1(324.64)
// 	}
// });
// function exam1(n) {
// 	n = n.toString();
// 	n = n.split('.');
// 	n = n.join('.');
// 	n = Number(n);
// 	return n;
// }

// function exam2(n) {
// 	let s = n.toString();
// 	let arr = s.split('.');
// 	let s2 = arr.join('.');
// 	let n2 = Number(s2);
// 	return n2;
// }

// async function getUserQuotes(username) {
// 	return new Promise((resolve, reject) => {
// 		let myQuery = `SELECT * FROM QuoteView WHERE WrittenByUsername = ?`;
// 		connection.query(myQuery, [username], (err, result) => {
// 			if (err) reject(err);
// 			else resolve(result);
//         });
//         connection.end();
// 	});
// }
// async function getUserQuotes(username) { //work but unhandled by express because it is promise
//     let myQuery = `SELECT * FROM QuoteView WHERE WrittenByUsername = ?`;
//     let [rows] = await connection.promise().query(myQuery, [username]);
//     connection.end();
//     return rows;
// }

// app.get("/:username", (req, res) => {//working 100%
// 	const username = req.params.username;
//     console.log(username);
// 	let myQuery = `SELECT * FROM QuoteView WHERE WrittenByUsername = ?`;
// 	connection.query(myQuery, [username], (err, result) => {
// 		if (err) res.end(err);
//         else res.json(result);
//         console.log(result);
// 	});
// 	connection.end();

// });
// getUserQuotes(username)
// .then((r) => res.pipe(r))
// .catch((e) => res.end(e));

// app.get("/:username", (req, res) => {
//     const username = req.params.username;
//     start(res, username);
// });
// const express = require("express");
// const mysql = require("mysql2");
// const app = express();

// var db = mysql.createConnection({
// 	host: "localhost",
// 	user: "root",
// 	password: "32185279",
// 	port: 2048,
// 	database: "PopularQuotes",
// });
// let d = new Date();
// let id = Math.floor(Math.random()*2147483640)
// let sql = `INSERT INTO Quote(ID,WrittenBy,Text,Author,Date)
// VALUES (
// (FLOOR(RAND()*2147483640)),
// (SELECT (Account.ID) FROM Account WHERE Account.Username = 'a'),
// 'this is test4',
// 'Mr. AaA',
// ${db.escape(d.getFullYear()+'-'+(1+Number(d.getMonth())) + '-'+ d.getDate())}
// );`
// db.query(sql, (err, result) => {
// 	if (err) throw err;
// 	console.log('result:', result);
// 	console.log('id: ', result.insertId);
// 	console.log('resultSetHeader: ', result.ResultSetHeader);
// });

// const { hash } = require("./serverFunctions2.js");
// console.log(hash('123'))
