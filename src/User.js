var { admin, firebase } = require('./Firebase.js');

module.exports = {

  async create(aUser) {
    var createdFirebaseUser = await admin.auth().createUser({
      uid: aUser.username,
      email: aUser.email,
      password: aUser.password,
    });
    return {
      user: {
        username: createdFirebaseUser.uid,
        email: createdFirebaseUser.email,
        password: aUser.password,
      },
    };
  },

  async login(aUser) {
    var signedInFirebaseUser = await firebase.auth().signInWithEmailAndPassword(aUser.email, aUser.password);
    var token = await signedInFirebaseUser.getIdToken();
    return transformFirebaseUser(signedInFirebaseUser, token)
  },

  async validateToken(aToken) {
    var decodedToken = await admin.auth().verifyIdToken(aToken);
    var userId = decodedToken.uid;
    var firebaseUser = await admin.auth().getUser(userId);
    return transformFirebaseUser(firebaseUser, aToken);
  },

  async update(aUserId, aToken, aUserMutation) {
    if (!aUserId) {
      throw new Error('Username must be specified');
    }
    if (!aToken) {
      throw new Error('Token must be specified');
    }
    if (!aUserMutation) {
      return null;
    }
    var firebaseUserMutation = {};
    var allowedMutationKeys = ['email', 'password', 'image', 'bio'];
    var mutationKeys = Object.keys(aUserMutation);
    if (mutationKeys.length == 0) {
      return null;
    }
    mutationKeys.forEach(key => {
      if (!allowedMutationKeys.includes(key)) {
        throw new Error(`Unexpected mutation: [${key}]`);
      }
      switch (key) {
        case 'image':
          firebaseUserMutation.photoURL = aUserMutation.image;
          break;
        case 'bio':
          firebaseUserMutation.displayName = aUserMutation.bio;
          break;
        default:
          firebaseUserMutation[key] = aUserMutation[key];
      }
    });
    var updatedUser = await admin.auth().updateUser(aUserId, firebaseUserMutation);
    return transformFirebaseUser(updatedUser, aToken);
  },

  async delete(aUserId) {
    await admin.auth().deleteUser(aUserId);
  },

  async getByUsername(aUsername) {
    var firebaseUser = await admin.auth().getUser(aUsername);
    return transformFirebaseUser(firebaseUser, null);
  },

};


function transformFirebaseUser(aFirebaseUser, aToken) {
  return {
    user: {
      email: aFirebaseUser.email,
      token: aToken,
      username: aFirebaseUser.uid,
      bio: aFirebaseUser.displayName ? aFirebaseUser.displayName : '',
      image: aFirebaseUser.photoURL ? aFirebaseUser.photoURL : '',
    },
  };
}
