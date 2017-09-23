var Article = require('./Article');
var User = require('./User');
var { initializeApp, deleteApp } = require('./Firebase.js');
var casual = require('casual');
var expect = require('chai').expect;

var testUser = {
  email: casual.email.toLowerCase(),
  password: casual.password,
  username: casual.username,
};
var loggedInUser = {};

var testArticle = {
  title: casual.title,
  description: casual.description,
  body: casual.text,
  tagList: casual.array_of_words(Math.ceil(10*Math.random())),
};
var createdArticle = {};

before(async() => {
  initializeApp();

  // Create test user and login
  await User.create(testUser);
  loggedInUser = await User.login({
    email: testUser.email,
    password: testUser.password,
  });
});

after(async() => {
  // Delete test user and cleanup
  await User.delete(testUser.username);
  await deleteApp();
});

describe('Article', () => {

  it('Create article', async() => {
    createdArticle = await Article.create(testArticle, loggedInUser);
  });

  it('Get article', async() => {
    var retrievedArticle = await Article.get(createdArticle.article.slug);
  });

  it('Delete article', async() => {
    await Article.delete(createdArticle.article.slug, loggedInUser);
  });


});
