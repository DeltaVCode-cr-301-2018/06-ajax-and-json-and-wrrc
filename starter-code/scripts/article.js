'use strict';

function Article (rawDataObj) {
  this.author = rawDataObj.author;
  this.authorUrl = rawDataObj.authorUrl;
  this.title = rawDataObj.title;
  this.category = rawDataObj.category;
  this.body = rawDataObj.body;
  this.publishedOn = rawDataObj.publishedOn;
}

// REVIEW: Instead of a global `articles = []` array, let's attach this list of all articles directly to the constructor function. Note: it is NOT on the prototype. In JavaScript, functions are themselves objects, which means we can add properties/values to them at any time. In this case, the array relates to ALL of the Article objects, so it does not belong on the prototype, as that would only be relevant to a single instantiated Article.
Article.all = [];

// COMMENT: Why isn't this method written as an arrow function?
// PUT YOUR RESPONSE HERE
Article.prototype.toHtml = function() {
  let template = Handlebars.compile($('#article-template').text());

  this.daysAgo = parseInt((new Date() - new Date(this.publishedOn))/60/60/24/1000);

  // COMMENT: What is going on in the line below? What do the question mark and colon represent? How have we seen this same logic represented previously?
  // Not sure? Check the docs!
  // PUT YOUR RESPONSE HERE
  this.publishStatus = this.publishedOn ? `published ${this.daysAgo} days ago` : '(draft)';
  this.body = marked(this.body);

  return template(this);
};

// REVIEW: There are some other functions that also relate to all articles across the board, rather than just single instances. Object-oriented programming would call these "class-level" functions, that are relevant to the entire "class" of objects that are Articles.

// REVIEW: This function will take the articleData, how ever it is provided, and use it to instantiate all the articles. This code is moved from elsewhere, and encapsulated in a simply-named function for clarity.

// COMMENT: Where is this function called? What does 'articleData' represent? How is this different from previous labs?
// PUT YOUR RESPONSE HERE
Article.loadAll = articleData => {
  articleData.sort((a,b) => (new Date(b.publishedOn)) - (new Date(a.publishedOn)))

  articleData.forEach(articleObject => Article.all.push(new Article(articleObject)))
}

// REVIEW: This function will retrieve the data from either a local or remote source, and process it, then hand off control to the View.
Article.fetchAll = () => {
  // Three ways to access localStorage values:
  // 1. localStorage.getItem('rawData')
  // 2. localStorage['rawData']
  // 3. localStorage.rawData

  // Three ways to set localStorage values:
  // 1. localStorage.setItem('rawData', value)
  // 2. localStorage['rawData'] = value
  // 3. localStorage.rawData = value
  if (localStorage.rawData) {
    // REVIEW: When rawData is already in localStorage we can load it with the .loadAll function above and then render the index page (using the proper method on the articleView object).

    try {
      let articles = JSON.parse(localStorage.rawData);
      if (articles.length > 0) {
        Article.loadAll(articles);
        articleView.initIndexPage();
        return;
      }
    }
    catch (error) {
      console.error(error);
    }
  }

  $.getJSON('/data/hackerIpsum.json')
    .then(function(data) {
      Article.loadAll(data);
      articleView.initIndexPage();

      // Cache the json, so we don't need to request it next time.
      localStorage.rawData = JSON.stringify(data);
    }, function(err) {
      console.error(err);
    });
}