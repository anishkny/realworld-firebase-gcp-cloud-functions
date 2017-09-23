var User = require('./User');

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
      if (!validatedUser) {
        throw new Error('Not authorized');
      }
      res.status(200).send(await User.validateToken(token));
    } else {
      res.status(404).send({
        errors: {
          body: [`404 Not found: [${req.method} ${req.path}]`],
        },
      });
    }
  },

};
