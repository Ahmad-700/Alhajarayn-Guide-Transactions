const router = require('express').Router();
const fs = require('fs-extra')
const { login } = require('./functions/login');
const { wrapper } = require('./functions/error');
//all urls start with /api/...

router.route('/logout').get((req, res) => {
    req.session.loggedin = false;
    req.session.username = undefined;
    res.redirect("/login");
});


const {
    getExecutors,
    addExecutor,
    deleteExecutor,
    updateExecutor,
} = require('./functions/executors');
router.route('/executor').get(wrapper(async (req, res) => {
    return res.status(200).json({ success: true, data: await getExecutors() })
})).post(wrapper(async (req, res) => {
    return res.status(200).json({ success: true, data: await addExecutor(req.body) });
})).delete(wrapper(async (req, res) => {
    return res.status(200).json({ success: true, data: await deleteExecutor(req.body.id) });
})).patch(wrapper(async (req, res) => {
    return res.status(200).json({ success: true, data: await updateExecutor(req.body.newExecutor, req.body.oldExecutor) });
}));


const {
    getPersons,
    deletePerson,
    updatePerson,
    addPerson,
    personToExecutor
} = require("./functions/persons");
router.route('/person').get(wrapper(async (req, res) => {
    return res.status(200).json({ success: true, data: await getPersons() })
})).post(wrapper(async (req, res) => {
    return res.status(200).json({ success: true, data: await addPerson(req.body) })
})).delete(wrapper(async (req, res) => {
    return res.status(200).json({ success: true, data: await deletePerson(req.body.id) });
})).patch(wrapper(async (req, res) => {
    return res.status(200).json({ success: true, data: await updatePerson(req.body.newPerson, req.body.oldPerson) });
}));

router.route('/personToExecutor').patch(wrapper(async (req, res) => {
    res.status(200).json({ success: true, data: await personToExecutor(req.body.person) });
}))



const {
    getRequests,
    deleteRequest,
    addRequest,
    getRequestById,
    updateRequest } = require('./functions/requests');
router.route('/request').get(wrapper(async (req, res) => {
    return res.status(200).json({ success: true, data: await getRequests() });
})).delete(wrapper(async (req, res) => {
    return res.status(200).json({ success: true, data: await deleteRequest(req.body.id) });
})).post(wrapper(async (req, res) => {
    return res.status(200).json({ success: true, data: await addRequest(req.body) });
})).put(wrapper(async (req, res) => {
    return res.status(200).json({ success: true, data: await getRequestById(req.body.id) })
})).patch(wrapper(async (req, res) => {
    return res.status(200).json({ success: true, data: await updateRequest(req.body) })
}))

router.route('/login').post(wrapper(async (req, res) => {
    let username = req.body.username.trim();
    req.session.loggedin = true;
    req.session.username = username;
    return res.status(200).json({ success: true, data: await login(username, req.body.password) });
}));


const { insertVCardContacts,
    uploadFile,
    closing } = require('./functions/loadContacts');
router.route('/upload/contacts').post((async (req, res) => {
    console.time('Uploaded In');
    req.pipe(req.busboy);
    const { file, filename } = await uploadFile(req.busboy);
    console.log('filename', filename.filename);
    var fullPath = __dirname + '\\uploaded\\' + filename.filename;
    var stream = fs.createWriteStream(fullPath);
    console.timeEnd('Uploaded In');
    file.pipe(stream);
    await closing(stream);
    console.log("Upload Finished of " + filename.filename);
    console.time('Inserted Into Server In')
    var statics = await insertVCardContacts(fullPath);
    console.timeEnd('Inserted Into Server In')
    res.status(200).json({ success: true, data: statics });
}));



const {
    getOperations,
    addOperation,
    deleteOperation,
    getOperationById,
    updateOperation
} = require('./functions/operation')
router.route('/operation').get(wrapper(async (req, res) => {
    return res.status(200).json({ success: true, data: await getOperations() })
})).post(wrapper(async (req, res) => {
    return res.status(200).json({ success: true, data: await addOperation(req.body) })
})).delete(wrapper(async (req, res) => {
    return res.status(200).json({success:true, data:await deleteOperation(req.body.id)})
})).put(wrapper(async (req, res) => {
    return res.status(200).json({success:true,data:await getOperationById(req.body.id)})
})).patch(wrapper(async (req, res) => {
    return res.status(200).json({success:true,data:await updateOperation(req.body)})
}))



module.exports = router;