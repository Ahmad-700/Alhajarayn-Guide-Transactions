const express = require('express');
const router = express.Router();
const {
    getRequestsNames,
    getAddresses,
} = require("./functions/arr");
const { wrapper } = require('./functions/error');
//all urls are start with /api/arr${below urls} ex:(/requestsNames) is (/api/arr/requestsNames)
router.route('/requestsNames').get(wrapper(async(req, res) => {
    res.status(200).json({ success: true, data: (await getRequestsNames()).sort().reverse() });
}));

router.route('/addresses').get(wrapper(async(req, res) => {
    res.status(200).json({ success: true, data: await getAddresses() });
}));
module.exports = router;