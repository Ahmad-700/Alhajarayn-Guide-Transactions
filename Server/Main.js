const express = require("express");
const app = express();
const session = require("express-session");
require('dotenv').config();//to load environment variables from (.env) file. it called by global object process.env."variable name"
const {
     redirect,
     displayUrl,
} = require("./functions/middleware");
const { wrapper } = require("./functions/error");
const { HTML } = require("./functions/public");
const { authentication } = require("./functions/login");
app.use(express.json()); // for json
app.use(require('connect-busboy')()); //middleware for form/file upload
app.use(express.urlencoded({ extended: true, })); // for form data
app.use(session({
     secret: process.env.SESSION_SECRET,
     resave: true,
     saveUninitialized: true,
}));
// app.use(bodyParser({defer:true}))
app.use(displayUrl); //display any url of a request.
app.use(redirect) //redirect any url that could be redirected.
app.use("/public", express.static("public"));
app.use(authentication);
app.use("/api/arr", require("./apiArr")) // response for any url with /api/arr...
app.use("/api", require("./api")) // response for any url with /api...
app.use(require('./functions/error').errorHandler);

//==============================================================================

app.get("/", wrapper(async (req, res) =>
     res.end(await HTML("/HTML/Main.html", res))
));

app.get("/login", wrapper(async (req, res) => {
     return res.end(await HTML("/HTML/Login.html",res));
}));

app.get("/addRequest", wrapper(async (req, res) =>
     res.end(await HTML("/HTML/Add Request.html",res))
))

app.get("/test", wrapper(async (req, res) =>
     res.end(await HTML("/HTML/test.html",res))
))

app.get("/edit", wrapper(async(req, res) =>
     res.end(await HTML("/HTML/Edit.html",res))
))

app.get("/operations", wrapper(async(req, res) => 
     res.end(await HTML("/HTML/operations.html",res))
))

app.get('/addOperation', wrapper(async (req, res) =>
     res.end(await HTML("/HTML/Add Operation.html",res))
))

app.get('/editOperation', wrapper(async (req, res) =>
     res.end(await HTML("/HTML/Edit Operation.html",res))
))

app.get("/executors", wrapper(async (req, res) =>
     res.end(await HTML("/HTML/users.html",res))
));

app.get("/requests", wrapper(async(req, res) =>
     res.end(await HTML("/HTML/requests.html",res))
))


app.get("/persons",wrapper(async (req, res) =>
     res.end(await HTML("/HTML/persons.html",res))
))


app.get("/editRequest", wrapper(async(req, res) =>
     res.end(await HTML("/HTML/Edit Request.html",res))
))

//=====================================================================
app.all("*", (req, res) =>
     res.status(404).send(`No such "${req.url}" Page or Resource!`)
)
app.listen(
     process.env.PORT,
     "localhost",
     () => console.log("Listening...")
)
