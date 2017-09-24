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

before(() => {
  initializeApp();
});

after(async() => {
  await deleteApp();
});

describe('Users', () => {

  it('Create user', async() => {
    var createdUser = await User.create(testUser);
    expect(createdUser.user.email).to.equal(testUser.email);
    expect(createdUser.user.password).to.equal(testUser.password);
    expect(createdUser.user.username).to.equal(testUser.username);
  });

  it('Login user', async() => {
    loggedInUser = await User.login({
      email: testUser.email,
      password: testUser.password,
    });
    expect(loggedInUser.user.username).to.equal(testUser.username);
  });

  it('Validate token for logged in user', async() => {
    var validatedUser = await User.validateToken(loggedInUser.user.token);
    expect(validatedUser.user.username).to.equal(testUser.username);
  });

  it('Delete user', async() => {
    await User.delete(testUser.username);
  });

});
