var User = require('./User');
var { initializeApp, deleteApp } = require('./Firebase.js');
var casual = require('casual');
var expect = require('chai').expect;

var userToCreate = {
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
    var createdUser = await User.create(userToCreate);
    expect(createdUser.status).to.equal(200);
    expect(createdUser.body.user.email).to.equal(userToCreate.email);
    expect(createdUser.body.user.password).to.equal(userToCreate.password);
    expect(createdUser.body.user.username).to.equal(userToCreate.username);
  });

  it('Login user', async() => {
    var loginResponse = await User.login({
      email: userToCreate.email,
      password: userToCreate.password,
    });
    loggedInUser = loginResponse.body;
    expect(loginResponse.status).to.equal(200);
    expect(loggedInUser.username).to.equal(userToCreate.username);
  });

  it('Validate token for logged in user', async() => {
    var validationResponse = await User.validateToken(loggedInUser.token);
    expect(validationResponse.status).to.equal(200);
    expect(validationResponse.body.user.username).to.equal(userToCreate.username);
  });

  it('Delete user', async() => {
    var deleteResponse = await User.delete(userToCreate.username);
    expect(deleteResponse.status).to.equal(200);
  });

});
