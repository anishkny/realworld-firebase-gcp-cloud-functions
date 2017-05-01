var routeParser = require('route-parser');
var firebase = require('firebase');
var admin = require('firebase-admin');

admin.initializeApp({
  credential: admin.credential.cert(require('./.secret/firebase-admin-keys.json')),
  databaseURL: 'https://realworld-firebase-6b55a.firebaseio.com'
});

firebase.initializeApp(require('./.secret/firebase-client-keys.json'));

var loggedInUser = null;

// Entry point function
exports.api = function (req, res) {
  console.log(`entryPoint called, req.method: [${req.method}], req.path: [${req.path}], req.params: [${JSON.stringify(req.params)}], req.body: [${JSON.stringify(req.body)}]`);
  res.setHeader('Content-Type', 'application/json');
  var routeHandlers = {
    '/users/login': handleLogin,
    '/user': handleUserRoute,
    '/articles': handleArticlesRoute,
    '/tags': handleTagsRoute,
    '/ping': pong,      // For debugging purposes
  };

  // Check if auth token is present
  if (!req.get('Authorization')) {
    loggedInUser = null;
    callHandlerForRoute();
  } else {
    getUserFromAuthToken(req, res)
      .then(callHandlerForRoute)
      .catch(function (error) {
        res.status(422).send(JSON.stringify({ errors: { body: ['Could not get user from auth token.'] } }));
      });
  }

  function callHandlerForRoute() {
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
      res.status(422).send(JSON.stringify({ errors: { body: ['Could not match route.'] } }));
      return;
    }
  }

}

function handleLogin(req, res, keys) {
  var email = req.body.user.email;
  var password = req.body.user.password;
  console.log('handleLogin called, email: [' + email + '], password: [' + password + ']');
  firebase.auth().signInWithEmailAndPassword(email, password)
    .then(function (user) {
      // Since Firebase does not support "bio" natively, lets cheat and store it in displayName
      var username = user.displayName ? user.displayName.split('\n')[0] : user.email;
      var bio = user.displayName ? user.displayName.split('\n')[1] : 'Not filled yet...';
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

function handleUserRoute(req, res, keys) {
  if (req.method == 'GET') {
    if (loggedInUser) {
      res.status(200).send(JSON.stringify(loggedInUser));
    } else {
      res.status(422).send(JSON.stringify({ errors: { body: ['Could not get current user.'] } }));
    }
  }
}

function handleArticlesRoute(req, res, keys) {
  if (req.method == 'POST') {
    // Create new article, expect req.body to be like: 
    // {"article":{"title":"How to train your dragon", "body":"Very carefully.", "tagList":["dragons","training"]}}
    var article = req.body.article;
    article.tags = {};
    var tagList = article.tagList;
    delete (article.tagList);

    // Construct an atomic transaction that updates articles, tags and slugs
    var transaction = {};
    var database = admin.database();
    var newArticleKey = database.ref('/articles/').push().key;
    article.slug = slugify(article.title) + newArticleKey;  // Uniqify slug by adding article key
    transaction['/slugs/' + article.slug] = newArticleKey;
    tagList.forEach(function (tag) {
      article.tags[tag] = true;
      transaction['/tags/' + tag + '/' + newArticleKey] = true;
    });

    getUserFromAuthToken(req, res)
      .then(function (user) {
        article.author = user;
        article.createdAt = (new Date()).toISOString();
        article.updatedAt = article.createdAt;
        article.favorited = false;
        article.favoritesCount = 0;
        transaction['/articles/' + newArticleKey] = article;
        return database.ref().update(transaction);
      })
      .then(function () {
        var responseArticle = article;
        responseArticle.tagList = tagList || [];
        res.status(200).send(JSON.stringify({
          article: responseArticle
        }));
      })
      .catch(function (error) {
        res.status(422).send(JSON.stringify({
          errors: {
            body: [
              error
            ]
          }
        }));
      });
    console.log(JSON.stringify(transaction, null, 2));
  }
}

function handleTagsRoute(req, res, keys) {
  if (req.method == 'GET') {
    admin.database().ref('/tags/').once('value', function (snapshot) {
      var tags = {};
      var val = snapshot.val();
      if (val) {
        tags = Object.keys(val);
      }
      res.status(200).send(JSON.stringify({
        tags: tags
      }));
    }, function (error) {
      res.status(422).send(JSON.stringify({ errors: { body: [error] } }));
    });
  }
}

// ----- Helper functions
function getUserFromAuthToken(req, res) {
  var rawToken = req.get('Authorization');
  var match = rawToken.match(/Token (.*)/);
  if (!match || !match[1]) {
    var error = 'In handleGetUser, could not extract token from: [' + rawToken + ']';
    console.log(error);
    res.status(422).send({ errors: { body: [error] } });
    return null;
  }

  var token = match[1];
  return admin.auth().verifyIdToken(token)
    .then(function (decodedToken) {
      var uid = decodedToken.uid;
      return admin.auth().getUser(uid)
        .then(function (user) {
          var username = user.displayName ? user.displayName.split('\n')[0] : user.email;
          var bio = user.displayName ? user.displayName.split('\n')[1] : 'Not filled yet...';
          loggedInUser = {
            id: uid,
            email: user.email,
            username: username,
            bio: bio,
            image: user.photoURL || 'https://static.productionready.io/images/smiley-cyrus.jpg',
            token: token,
          };
          return loggedInUser;
        });
    });
}

function pong(req, res, keys) {
  res.status(200).send(JSON.stringify({
    message: 'pong! ' + (new Date())
  }, null, 2) + "\n");
}

// Source: https://gist.github.com/mathewbyrne/1280286
function slugify(text) {
  return text.toString().toLowerCase().trim()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start of text
    .replace(/-+$/, '');            // Trim - from end of text
}