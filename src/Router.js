var User = require('./User');

module.exports = {

  async route(req, res) {
    if (req.path == '/ping') {
      pong(req, res);
    } else if (req.path == '/users/login') {
      var loginResponse = await User.login(req.body.user);
      res.status(loginResponse.status).send(loginResponse.body);
    } else {
      res.status(422).send({ errors: { body: [`Could not match route: [${req.path}]`] }, });
    }
    return;
  },

};

function pong(req, res) {
  res.status(200).send({ pong: new Date(), });
}
