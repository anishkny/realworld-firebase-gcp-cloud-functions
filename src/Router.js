var User = require('./User');

module.exports = {

  async route(req, res) {
    if (req.path == '/ping') {
      res.status(200).send({ pong: new Date(), });
    } else if (req.path == '/users/login') {
      res.status(200).send(await User.login(req.body.user));
    } else if (req.path == '/users') {
      res.status(200).send(await User.create(req.body.user));
    } else if (req.path == '/user') {
      var token = req.get('Authorization');
      if (!token) {
        throw new Error('Authorization token not specified');
      }
      res.status(200).send(await User.validateToken(token));
    } else {
      res.status(404).send(`Could not match route: [${req.path}]`);
    }
  },

};
