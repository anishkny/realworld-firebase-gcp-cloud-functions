var Article = require('./Article.js');
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

var testArticle = createTestArticleData();
var testArticleNoTags = createTestArticleData();
delete testArticleNoTags.tagList

var createdArticle = {};
var createdArticleNoTags = {};

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

  it('create', async() => {
    createdArticle = await Article.create(testArticle, loggedInUser);
    // TODO: Assert on createdArticle

    createdArticleNoTags = await Article.create(testArticleNoTags, loggedInUser);
    // TODO: Assert on createdArticleNoTags

    await Article.create(null, loggedInUser).catch(e => {
      expect(e.message).to.match(/Article title, description and body are required/);
    });

    await Article.create(testArticle, null).catch(e => {
      expect(e.message).to.match(/Must be logged in to create article/);
    });

  });

  it('get', async() => {
    var retrievedArticle = await Article.get(createdArticle.article.slug);
    // TODO: Assert on retrievedArticle

    await Article.get(createdArticle.article.slug + '__foobar').catch(e => {
      expect(e.message).to.match(/Article not found/);
    });
  });

  it('delete', async() => {
    await Article.delete(null, loggedInUser).catch(e => {
      expect(e.message).to.match(/Slug must be specified/);
    });
    await Article.delete(createdArticle.article.slug, null).catch(e => {
      expect(e.message).to.match(/Must be logged in to delete article/);
    });

    // Verify only author can delete article
    var nonAuthorUser = { user: { username: loggedInUser.user.username + '_not_author', } };
    await Article.delete(createdArticle.article.slug, nonAuthorUser).catch(e => {
      expect(e.message).to.match(/can delete this article./);
    });

    await Article.delete(createdArticle.article.slug, loggedInUser);
    await Article.delete(createdArticleNoTags.article.slug, loggedInUser);
  });

});

function createTestArticleData() {
  return {
    title: casual.title,
    description: casual.description,
    body: casual.text,
    tagList: casual.array_of_words(Math.ceil(10 * Math.random())),
  }
}
