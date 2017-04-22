var routeParser = require('route-parser');
var firebase = require('firebase');
var admin = require('firebase-admin');

admin.initializeApp({
  credential: admin.credential.cert(require('./.secret/firebase-admin-keys.json')),
  databaseURL: 'https://realworld-firebase-6b55a.firebaseio.com'
});

firebase.initializeApp(require('./.secret/firebase-client-keys.json'));

// Entry point function
exports.api = function (req, res) {
  console.log(`entryPoint called, req.method: [${req.method}], req.path: [${req.path}], req.params: [${JSON.stringify(req.params)}], req.body: [${JSON.stringify(req.body)}]`);

  var routeHandlers = {
    '/users/login': handleLogin,
    '/user': handleGetUser,
    '/ping': pong,      // For debugging purposes
  };

  var wasAbleToMatchRoute = false;
  Object.keys(routeHandlers).sort().forEach(function (thisRoute) {
    // Break early if a previous route matched
    if (wasAbleToMatchRoute) {
      return;
    }
    var matchedPathKeys = (new routeParser(thisRoute)).match(req.path);
    if (matchedPathKeys) {
      console.log('Matched path: [' + thisRoute + '], keys: [' + JSON.stringify(matchedPathKeys) + ']');
      wasAbleToMatchRoute = true;
      routeHandlers[thisRoute](req, res, matchedPathKeys);
    }
  });

  if (!wasAbleToMatchRoute) {
    console.log('Could not match path!');
    res.status(500).send();
    return;
  }
}

function handleLogin(req, res, keys) {
  // TODO
  console.log('handleLogin called');
  res.status(200).send();
}

function handleGetUser(req, res, keys) {
  // TODO
  console.log('handleGetUser called');
  res.status(200).send();
}

function pong(req, res, keys) {
  res.status(200).send(JSON.stringify({
    message: 'pong! ' + (new Date())
  }, null, 2) + "\n");
}