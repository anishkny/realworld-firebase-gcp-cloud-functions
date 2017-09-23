var { firebase, initializeApp, deleteApp } = require('./Firebase.js');
var Router = require('./Router');

module.exports = {

  // Top level entry point
  async api(req, res) {
    if (!firebase.apps.length) {
      initializeApp();
    }

    res.setHeader('Content-Type', 'application/json');
    try {
      await Router.route(req, res);
    } catch (e) {
      res.status(422).send({
        errors: {
          body: [e.message],
        }
      });
      console.log(e);
    }

    deleteApp();
  }

};
