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
  var email = req.body.user.email;
  var password = req.body.user.password;
  console.log('handleLogin called, email: [' + email + '], password: [' + password + ']');
  res.setHeader('Content-Type', 'application/json');
  firebase.auth().signInWithEmailAndPassword(email, password)
    .then(function (user) {
      // Since Firebase does not support "bio" natively, lets cheat and store it in displayName
      var username = user.displayName ? user.displayName.split('\n')[0] : 'unset';
      var bio = user.displayName ? user.displayName.split('\n')[1] : 'unset';
      firebase.auth().currentUser.getToken(/* forceRefresh */ false)
        .then(function (token) {
          res.status(200).send(JSON.stringify({
            user: {
              id: user.uid,
              email: user.email,
              token: token,
              username: username,
              bio: bio,
              image: user.photoURL,
            }
          }));
        })
        .catch(function (error) {
          res.status(500).send('Error in handleLogin>getToken: ' + JSON.stringify(error));
        });
    })
    .catch(function (error) {
      res.status(500).send('Error in handleLogin>signInWithEmailAndPassword' + JSON.stringify(error));
    });
}

function handleGetUser(req, res, keys) {
  var rawToken = req.get('Authorization');
  var match = rawToken.match(/Token (.*)/);
  if (!match || !match[1]) {
    var error = 'In handleGetUser, could not extract token from: [' + rawToken + ']';
    console.log(error);
    res.status(500).send(error);
    return;
  }
  console.log('handleGetUser called with token');
  res.setHeader('Content-Type', 'application/json');
  var token = match[1];
  admin.auth().verifyIdToken(token)
    .then(function (decodedToken) {
      var uid = decodedToken.uid;
      admin.auth().getUser(uid)
        .then(function (user) {
          var username = user.displayName ? user.displayName.split('\n')[0] : 'unset';
          var bio = user.displayName ? user.displayName.split('\n')[1] : 'unset';
          res.status(200).send(JSON.stringify({
            user: {
              id: uid,
              email: user.email,
              username: username,
              bio: bio,
              image: user.photoURL || 'https://static.productionready.io/images/smiley-cyrus.jpg',
              token: token,
            }
          }));
        })
        .catch(function (error) {
          res.status(500).send('Error in handleGetUser>getUser: ' + JSON.stringify(error));
        });
    })
    .catch(function (error) {
      res.status(500).send('Error in handleGetUser>verifyIdToken: ' + JSON.stringify(error));
    });
}

function pong(req, res, keys) {
  res.status(200).send(JSON.stringify({
    message: 'pong! ' + (new Date())
  }, null, 2) + "\n");
}