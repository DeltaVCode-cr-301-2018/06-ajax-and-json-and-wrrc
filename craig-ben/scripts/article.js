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

//// COMMENT: Why isn't this method written as an arrow function?
// //Arrow functions treat this differently, Arrow functions do not work with (this)Arrow functions this is different from normal function expressions.
Article.prototype.toHtml = function() {
  let template = Handlebars.compile($('#article-template').text());

  this.daysAgo = parseInt((new Date() - new Date(this.publishedOn))/60/60/24/1000);

  // COMMENT: What is going on in the line below? What do the question mark and colon represent? How have we seen this same logic represented previously?
  // Not sure? Check the docs!
  ////The conditional (ternary) operator is the only JavaScript operator that takes three operands. This operator is frequently used as a shortcut for the if statement.
  this.publishStatus = this.publishedOn ? `published ${this.daysAgo} days ago` : '(draft)';
  this.body = marked(this.body);

  return template(this);
};

// REVIEW: There are some other functions that also relate to all articles across the board, rather than just single instances. Object-oriented programming would call these "class-level" functions, that are relevant to the entire "class" of objects that are Articles.

// REVIEW: This function will take the rawData, how ever it is provided, and use it to instantiate all the articles. This code is moved from elsewhere, and encapsulated in a simply-named function for clarity.

// COMMENT:
//Where is this function called? in the article fetch function.
//What does 'rawData' articleData represent now? data from the json file
//How is this different from previous labs? The data is in a json file, not local file,
Article.loadAll = articleData => {
  articleData.sort((a,b) => (new Date(b.publishedOn)) - (new Date(a.publishedOn)))

  articleData.forEach(articleObject => Article.all.push(new Article(articleObject)))
}

// REVIEW: This function will retrieve the data from either a local or remote source, and process it, then hand off control to the View.
Article.fetchAll = () => {
  if (localStorage.rawData) {
    // REVIEW: When rawData is already in localStorage we can load it with the .loadAll function above and then render the index page (using the proper method on the articleView object).

    //TODO: This function takes in an argument. What do we pass in?
    Article.loadAll();

    //TODO: What method do we call to render the index page?
    ////We call the function Article.fetchAll(); at the bottom of the index page.

    // COMMENT: How is this different from the way we rendered the index page previously? What the benefits of calling the method here?
    ////We called articleView.initIndexPage(); then on the articleview.js we run articles.forEach(article => $('#articles').append(article.toHtml())); to add articles to the index page. Now we are calling the fetchAll to get data and then calling the articleView.initIndexPage(); once we have all our data.

  } else {
    // TODO: When we don't already have the rawData, we need to retrieve the JSON file from the server with AJAX (which jQuery method is best for this?), cache it in localStorage so we can skip the server call next time, then load all the data into Article.all with the .loadAll function above, and then render the index page.
    $.getJSON('./data/hackerIpsum.json').then(function (data) {
      //console.log(data);

      // Do something with the data we received!//this is an array of raw data objects.
      Article.loadAll(data);
      articleView.initIndexPage();
      //put into location storage so we dont have to ask for again.
      localStorage.setItem('rawData', JSON.stringify(Article.all));
      console.log(localStorage);

    })
    // COMMENT: Discuss the sequence of execution in this 'else' conditional. Why are these functions executed in this order?
    // We execute the functions in this order, so that we have the data from the json file before we try and load it.
  }
}
