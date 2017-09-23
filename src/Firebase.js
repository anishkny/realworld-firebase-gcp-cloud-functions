var result = require('dotenv').config();
var admin = require('firebase-admin');
var firebase = require('firebase');

var FIREBASE_CLIENT_KEY = decodeBase64(process.env.FIREBASE_CLIENT_KEY);
var FIREBASE_SERVER_KEY = decodeBase64(process.env.FIREBASE_SERVER_KEY);
var FIREBASE_DATABASE_URL = process.env.FIREBASE_DATABASE_URL;

module.exports = {
  admin,
  firebase,

  initializeApp() {
    if (!firebase.apps.length) {
      firebase.initializeApp(FIREBASE_CLIENT_KEY);
    }
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(FIREBASE_SERVER_KEY),
        databaseURL: FIREBASE_DATABASE_URL,
      });
    }
  },

  async deleteApp() {
    if (firebase.apps.length) {
      await firebase.app().delete();
    }
    if (admin.apps.length) {
      await admin.app().delete();
    }
  },
};


function decodeBase64(aBase64String) {
  return JSON.parse(new Buffer(aBase64String, 'base64').toString('ascii'));
}
