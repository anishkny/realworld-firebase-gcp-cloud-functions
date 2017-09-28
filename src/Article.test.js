var Article = require('./Article.js');
var User = require('./User.js');
var { initializeApp, deleteApp } = require('./Firebase.js');
var casual = require('casual');
var expect = require('chai').expect;

var testUser = {
  email: casual.email.toLowerCase(),
  password: casual.password,
  username: casual.username.replace(/[\.#$\[\]]/g, ''),
};
var loggedInUser = {};

var testArticle = createTestArticleData('aricle with tags', true);
var testArticleNoTags = createTestArticleData('article without tags', false);
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

  it('getAll', async() => {
    // Create few articles with pauses in between
    var createdArticles = [];
    var promises = [];
    process.stdout.write('      ');
    for (var i = 1; i <= 10; ++i) {
      await Promise.all([
        Article.create({ title: i, description: 'd', body: 'b', tagList: [`tag${i}`, 'sometag'] }, loggedInUser)
        .then(_article => {
          createdArticles.push(_article);
        }),
        timeout(200),
      ]);
      process.stdout.write('.');
    }
    console.log('');

    // Get few newest articles and ensure they are newest first
    var retrievedArticles = await Article.getAll(3);
    for (var i = 0; i < 3; ++i) {
      expect(retrievedArticles.articles[i].title).to.equal(10 - i);
    }

    // Paginate through articles 2 at a time,
    // and expect them in batches: [10, 9], [8, 7], ...
    var endAt = 0;
    for (var i = 1; i <= 5; ++i) {
      retrievedArticles = await Article.getAll(2, endAt);
      expect(retrievedArticles.articles[0].title).to.equal(10 - 2 * i + 2);
      expect(retrievedArticles.articles[1].title).to.equal(10 - 2 * i + 1);
      // console.log(retrievedArticles);
      endAt = retrievedArticles.nextEndAt;
    }

    // Paginate through articles 3 at a time
    var endAt = 0;
    for (var i = 1; i <= 5; ++i) {
      retrievedArticles = await Article.getAll(3, endAt);

      // Ensure articles are sorted in reverse
      for (j = 0; j < retrievedArticles.length - 1; ++j) {
        expect(retrievedArticles[j].createdAt).to.be.at.least(retrievedArticles[j + 1].createdAt);
      }
      endAt = retrievedArticles.nextEndAt;
    }

    // Get all created articles and verify
    retrievedArticles = await Article.getAll();
    for (var i = 0; i < 10; ++i) {
      expect(retrievedArticles.articles[i].title).to.equal(10 - i);
    }

    // Get all by tag
    retrievedArticles = await Article.getAll(0, 0, 'sometag');
    expect(retrievedArticles.articles).to.have.lengthOf(10);

    // Get one by specific tag
    retrievedArticles = await Article.getAll(0, 0, 'tag3');
    expect(retrievedArticles.articles).to.have.lengthOf(1);

    // Get few by tag
    retrievedArticles = await Article.getAll(3, 1e13, 'sometag');
    expect(retrievedArticles.articles).to.have.lengthOf(3);

    // Get by unknown tag
    retrievedArticles = await Article.getAll(0, 0, 'non-existent-tag');
    expect(retrievedArticles.articles).to.have.lengthOf(0);

    await Article.getAll().catch(e => {
      expect(e.message).to.match(/Tag must be specified/);
    });


    // Cleanup
    await Promise.all(createdArticles.map(_article => {
      return Article.delete(_article.article.slug, loggedInUser);
    }));

    // Get articles when there are none
    retrievedArticles = await Article.getAll();
    expect(retrievedArticles.articles).to.be.an('array').that.is.empty;
    expect(retrievedArticles.articlesCount).to.equal(0);
    expect(retrievedArticles.nextEndAt).to.equal(0);

  });

});

function createTestArticleData(aTitle, aWithTags) {
  return {
    title: aTitle ? aTitle : casual.title,
    description: casual.description,
    body: casual.text,
    tagList: aWithTags ? casual.array_of_words(Math.ceil(10 * Math.random())) : [],
  }
}

function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
