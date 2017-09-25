var { admin } = require('./Firebase.js');
var User = require('./User.js');
var slug = require('slug');

module.exports = {

  async create(aArticleData, aUser) {
    if (!aUser) {
      throw new Error('Must be logged in to create article');
    }
    if (!aArticleData || !aArticleData.title || !aArticleData.description || !aArticleData.body) {
      throw new Error('Article title, description and body are required');
    }

    var articleSlug = slug(aArticleData.title) + '-' + (Math.random() * Math.pow(36, 6) | 0).toString(36);
    var timestamp = (new Date()).toISOString();
    var newArticle = {
      title: aArticleData.title,
      description: aArticleData.description,
      body: aArticleData.body,
      tagList: aArticleData.tagList ? aArticleData.tagList : [],
      createdAt: timestamp,
      updatedAt: timestamp,
      author: {
        username: aUser.user.username,
      },
    };
    await admin.database().ref(`/articles/${articleSlug}`).set(newArticle);

    // Update tags if any
    if (aArticleData.tagList) {
      for (var i = 0; i < aArticleData.tagList.length; ++i) {
        var tag = aArticleData.tagList[i];
        await admin.database().ref(`/tags/${tag}/${articleSlug}`).set(true);
      }
    }

    // Decorate return value with computed information
    newArticle.slug = articleSlug;
    newArticle.favorited = false;
    newArticle.favoritesCount = 0;
    newArticle.author.bio = aUser.bio;
    newArticle.author.image = aUser.image;
    newArticle.author.following = false;

    return ({
      article: newArticle,
    });
  },

  async get(aSlug) {
    var article = (await admin.database().ref(`/articles/${aSlug}`).once('value')).val();
    if (!article) {
      throw new Error(`Article not found: ${aSlug}`);
    }
    article.slug = aSlug;

    // Get author info
    var authorUser = await User.getByUsername(article.author.username);
    article.author.bio = authorUser.user.bio;
    article.author.image = authorUser.user.image;
    article.author.following = false;
    return { article };
  },

  async delete(aSlug, aUser) {
    if (!aSlug) {
      throw new Error('Slug must be specified');
    }
    if (!aUser) {
      throw new Error('Must be logged in to delete article');
    }

    // Verify the user who is deleting is the author, else error
    var article = await this.get(aSlug);
    if (article.article.author.username != aUser.user.username) {
      throw new Error(`Only author [${article.article.author.username}] can delete this article.`);
    }

    // Remove this article from any tag references
    if (article.article.tagList) {
      for (var i = 0; i < article.article.tagList.length; ++i) {
        var tag = article.article.tagList[i];
        await admin.database().ref(`/tags/${tag}/${aSlug}`).remove();
      }
    }
    await admin.database().ref(`/articles/${aSlug}`).remove();
  },

};
