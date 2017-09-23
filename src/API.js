var { firebase, initializeApp, deleteApp } = require('./Firebase.js');
var Router = require('./Router');

module.exports = {

  // Top level entry point
  async api(req, res) {
    if (!firebase.apps.length) {
      initializeApp();
    }

    res.setHeader('Content-Type', 'application/json');
    await Router.route(req, res);

    deleteApp();
  }

};
