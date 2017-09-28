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
    var timestamp = (new Date()).getTime();
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
        await admin.database().ref(`/tags/${tag}/${articleSlug}`).set({
          createdAt: timestamp,
        });
      }
    }

    // Add to authors reference
    await admin.database().ref(`/authors/${aUser.user.username}/${articleSlug}`).set({
      createdAt: timestamp,
    });

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

  async getAll(aLimit, aEndAt) {
    if (!aLimit) {
      aLimit = 20;
    }
    if (!aEndAt) {
      aEndAt = 1e13; // November 20, 2286
    }
    var firebaseArticles = (await admin.database().ref('/articles')
      .orderByChild('createdAt').limitToLast(aLimit + 1).endAt(aEndAt).once('value')).val();

    if (!firebaseArticles) {
      return { articles: [], articlesCount: 0, nextEndAt: 0, }
    }

    // Transform returned articles to expected format (TODO)
    var slugs = Object.keys(firebaseArticles).sort((a, b) => {
      return (firebaseArticles[b].createdAt - firebaseArticles[a].createdAt);
    });
    var articles = [];
    slugs.forEach(slug => {
      articles.push(firebaseArticles[slug]);
    });
    var nextEndAt = 0;

    // Delete extra retrieved article if any
    if (articles.length && articles.length > aLimit) {
      nextEndAt = articles[articles.length - 1].createdAt;
      articles.splice(-1, 1);
    }
    return {
      articles,
      articlesCount: articles.length,
      nextEndAt
    };
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
    // Remove from authors reference
    await admin.database().ref(`/authors/${article.article.author.username}/${article.article.slug}`).remove();

    await admin.database().ref(`/articles/${aSlug}`).remove();
  },

};
