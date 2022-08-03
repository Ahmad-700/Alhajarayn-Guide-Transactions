

function redirect(req, res, next) {//redirect any url that may want existing url
    //redirect wrong url to the right url page
    switch (req.url.toString().toLowerCase()) {
      case "/operations.html":
        res.redirect("/operations");
        break;
      case "/requests.html":
        res.redirect("/");
        break;
      case "/logout":
        res.redirect("/api/logout");
        break;
      case "/users.html":
        res.redirect("/executors");
        break;
      case "/users":
        res.redirect("/executors");
        break;
      default:
        next();
    }
}
  
function displayUrl(req, res, next){//show request's url
    console.log(req.method,":", req.url);
    next();
}


  
module.exports = {
    redirect,
    displayUrl
}