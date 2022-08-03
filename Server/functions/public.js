var mysql = require("mysql2");
var fs = require('fs');
var path = require('path')
const { MyError } = require("./error");

var db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: process.env.DB_PASSWORD,
    port: 2048,
    database: "Guide",
    multipleStatements: true
});

/**
 * get header html file and assign it to the global var header to be used in every page request.
 */
var header = fs.readFileSync(path.resolve(__dirname, '../../HTML/public/Header.html'), 'utf8') + '\n';


/**
 * This function is made to convert a sql query that have join, from duplicated object because an attribute have another value, to one object with array in that attribute.
 * Ex: let r = [{id:1,phone:'71434343'},{id:1,phone:'7777777'}...];
 * Then joinToArr(r) = [{id:1,phone:['71434343','77777777']}]
 * @param {object[]} r is the result from database query.
 * @returns {object[]} the combined objects attributes
 */
var joinToArr = function (r) {
    for (var i = 0; i < r.length - 1; i++)
        if (r[i].id == r[i + 1].id) {
            r[i + 1] = combine(r[i], r[i + 1]);
            r[i] = null;
        }
    r = r.filter(function (v) {
        if (v)
            return v;
    });
    return r;
};
var combine = function (o1, o2) {
    var attributes = Object.entries(o1).map(function (v) { return v[0]; }); //get object attributes in array. ex:from {id:,name:,age:...} to ['id', 'name', 'age'...]
    var ret = {};
    for (var _i = 0, attributes_1 = attributes; _i < attributes_1.length; _i++) {
        var att = attributes_1[_i];
        ret[att] = maybeArr(o1[att], att);
        if (Array.isArray(ret[att])) {
            if (ret[att].join(' ').indexOf(o2[att]) == -1 && o2[att])
                ret[att].push(o2[att]);
        } //else console.log(att, 'is not an array')
        // }else
        // if (o1[att].toString() != o2[att].toString())//.toString() because date object from database consider not equal even though they are at same millisecond but they two objects
        // 	o1[att] = [o1[att], o2[att]];			
    }
    return ret; //o1 is the return object so we change it then return it.
};
var maybeArr = function (value, attName) {
    if (!value)
        return null;
    else
        if (Array.isArray(value))
            return value;
        else 
            switch (attName) {
                case 'phone': return new Array(value);
                case 'careerOrProduct': return new Array(value);
                case 'accountNumber': return new Array(value);
                case 'applicantPhone': return new Array(value);
                case 'executorPhone': return new Array(value);
                case 'executorAccountNumber': return new Array(value);
                case 'executorCareerOrProduct': return new Array(value);
                default: return value;
            }
};
/**
 * loop through each attribute do the following:
 * 1-trim.
 * 2-make empty string null.
 * 3-loop through any array attribute and do previous steps.
 * 4-if specified attributes had 'pm'||'am' then converted to 24 hour time; insertion in DB.
 * @param {object} object 
 */
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

/**
 *
 * @param result is the res of a callback of query that have multi queries AND has query 'select last_insert_id()'
 * @returns id of last_insert_id();
 */
function lastInsertId(result) {
    for (var _i = 0, result_1 = result; _i < result_1.length; _i++) {
        var res = result_1[_i];
        if (Array.isArray(res))
            if (res[0]['last_insert_id()'])
                return res[0]['last_insert_id()'];
            else
                console.log('error it is array but do not have last_insert_id() attribute!');
    }
    console.error('lastInsertId was invoked but could not return anything');
}

/**
 * Used: to response for client with html file by editing:
 * 1- <title>: append 'دليل الهجرين | '.
 * 2- <body>: append '<nav>...</nav>' i.e header.
 * @param {path} url 
 * @param {express} res 
 * @returns 
 */
function HTML(url, res, active) {
    return new Promise(async (resolve, reject) => {
        try {
            var data = await fs.promises.readFile(path.resolve(__dirname, "../../" + url), 'utf8');
            res.writeHead(200, { 'Content-Type': 'text/html' });
            let len = data.length;
            data = data.toString().replace('</title>', ' | دليل الهجرين' + '</title>');
            if (data.length == len)
                reject(new MyError("couldn't append title; not found tag <title>"))

            len = data.length;
            data = data.replace('<body>', '<body>\n' + header);
            if (data.length == len) {
                data = data.replace('<body dir="rtl">', '<body dir="rtl">\n' + header);
                if (data.length == len) {
                    data = data.replace("<body dir='rtl'>", '<body dir="rtl">\n' + header);
                    if (data.length == len) {
                        data = data.replace('<body >', '<body>\n' + header);
                        if (data.length == len)
                            reject(new MyError("couldn't append header; not found tag <body>"));
                    }
                }
            }
            return resolve(data);

        } catch (err) {
            return reject(err)
        }
    })
}

module.exports = {
    db: db,
    joinToArr: joinToArr,
    cleanAll: cleanAll,
    lastInsertId: lastInsertId,
    HTML: HTML
};
