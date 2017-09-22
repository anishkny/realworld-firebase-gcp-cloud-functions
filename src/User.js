var { admin, firebase } = require('./Firebase.js');

module.exports = {

  async create(aUser) {
    var createdFirebaseUser = await admin.auth().createUser({
      uid: aUser.username,
      email: aUser.email,
      password: aUser.password,
    }).catch(err => {
      return { status: 422, body: { 'errors': { 'body': err.message } }, }
    });
    return { status: 200, body: { user: { username: createdFirebaseUser.uid, email: createdFirebaseUser.email, password: aUser.password, }, }, };
  },

  async login(aUser) {
    var signedInFirebaseUser = await firebase.auth().signInWithEmailAndPassword(aUser.email, aUser.password)
      .catch(err => {
        return { status: 422, body: { 'errors': { 'body': err.message } }, }
      });
    var token = await signedInFirebaseUser.getIdToken();
    return { status: 200, body: transformFirebaseUser(signedInFirebaseUser, token), };
  },

  async validateToken(aToken) {
    var decodedToken = await admin.auth().verifyIdToken(aToken)
      .catch(err => {
        return { status: 422, body: { 'errors': { 'body': err.message } }, }
      });
    var userId = decodedToken.uid;
    if (!userId) {
      return { status: 422, body: { 'errors': { 'body': `Could not decode token` } }, }
    }
    var firebaseUser = await admin.auth().getUser(userId)
      .catch(err => {
        return { status: 422, body: { 'errors': { 'body': err.message } }, }
      });
    return { status: 200, body: { user: transformFirebaseUser(firebaseUser, aToken), }, };
  },

  async delete(aUserId) {
    await admin.auth().deleteUser(aUserId)
      .catch(err => {
        return { status: 422, body: { 'errors': { 'body': err.message } }, }
      });
    return { status: 200, body: `User ${aUserId} deleted successfully.`, };
  },

};


function transformFirebaseUser(aFirebaseUser, aToken) {
  return {
    email: aFirebaseUser.email,
    token: aToken,
    username: aFirebaseUser.uid,
    bio: aFirebaseUser.displayName,
    image: aFirebaseUser.photoURL,
  };
}
