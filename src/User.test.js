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

  it('delete', async() => {
    await User.delete(testUser.username);
  });

});
