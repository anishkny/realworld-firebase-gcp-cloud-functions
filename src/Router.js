var User = require('./User.js');
var Article = require('./Article.js');
var urlPattern = require('url-pattern');

module.exports = {

  async route(req, res) {

    // Validate Authorization token if present
    var validatedUser = null;
    var token = req.get('Authorization');
    if (token) {
      validatedUser = await User.validateToken(token);
    }

    // Route according to path and method
    if (req.path == '/ping') {
      res.status(200).send({ pong: new Date(), });

    } else if (req.path == '/users/login') {
      res.status(200).send(await User.login(req.body.user));

    } else if (req.path == '/users') {
      res.status(200).send(await User.create(req.body.user));

    } else if (req.path == '/user') {
      if (!validatedUser) { throw new Error('Not authorized'); }
      res.status(200).send(await User.validateToken(token));

    } else if (req.path == '/articles' && req.method == 'POST') {
      if (!validatedUser) { throw new Error('Not authorized'); }
      res.status(200).send(await Article.create(req.body.article, validatedUser));

    } else if (req.path == '/articles' && req.method == 'GET') {
      res.status(200).send(await Article.getAll(parseInt(req.query.limit), parseInt(req.query.endAt), req.query.tag));

    } else if (req.path.startsWith('/articles/') && req.method == 'GET') {
      res.status(200).send(await Article.get(getSlug(req)));

    } else if (req.path.startsWith('/articles/') && req.method == 'DELETE') {
      res.status(200).send(await Article.delete(getSlug(req), validatedUser));

    } else {
      res.status(404).send({ errors: { body: [`404 Not found: [${req.method} ${req.path}]`], }, });
    }
  },

};

function getSlug(req) {
  var match = (new urlPattern('/articles/:slug')).match(req.path);
  if (!match || !match.slug) {
    throw new Error('Article slug must be specified');
  }
  return (match.slug);
}
