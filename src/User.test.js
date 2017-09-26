var User = require('./User.js');
var { initializeApp, deleteApp } = require('./Firebase.js');
var casual = require('casual');
var expect = require('chai').expect;

var testUser = {
  email: casual.email.toLowerCase(),
  password: casual.password,
  username: casual.username,
};
var loggedInUser = {};
var expectedUserKeys = ['email', 'token', 'username', 'bio', 'image', ];

before(() => {
  initializeApp();
});

after(async() => {
  await deleteApp();
});

describe('Users', () => {

  it('create', async() => {
    var createdUser = await User.create(testUser);
    expect(createdUser.user).to.have.all.keys(['username', 'email', 'password', ]);
    expect(createdUser.user.email).to.equal(testUser.email);
    expect(createdUser.user.password).to.equal(testUser.password);
    expect(createdUser.user.username).to.equal(testUser.username);
  });

  it('login', async() => {
    loggedInUser = await User.login({
      email: testUser.email,
      password: testUser.password,
    });
    expect(loggedInUser.user).to.have.all.keys(expectedUserKeys);
    expect(loggedInUser.user.username).to.equal(testUser.username);
  });

  it('validateToken', async() => {
    var validatedUser = await User.validateToken(loggedInUser.user.token);
    expect(validatedUser.user).to.have.all.keys(expectedUserKeys);
    expect(validatedUser.user.username).to.equal(testUser.username);
  });

  it('update', async() => {
    var bio = casual.sentence;
    var image = casual.url
    var email = casual.email.toLowerCase();
    var updatedUser = await User.update(loggedInUser.user.username,
      loggedInUser.user.token, { bio, image, email });
    expect(updatedUser.user.bio).to.equal(bio);
    expect(updatedUser.user.image).to.equal(image);
    expect(updatedUser.user.email).to.equal(email);

    await User.update(null).catch(e => {
      expect(e.message).to.match(/Username must be specified/);
    });
    await User.update('username', null).catch(e => {
      expect(e.message).to.match(/Token must be specified/);
    });
    expect(await User.update('username', 'token', null)).to.be.null;
    expect(await User.update('username', 'token', {})).to.be.null;
    await User.update('username', 'token', { unknown_mutation_key: 'xyz' }).catch(e => {
      expect(e.message).to.match(/Unexpected mutation/);
    });
  });

  it('delete', async() => {
    await User.delete(testUser.username);
  });

});
