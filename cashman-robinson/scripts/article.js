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
// It uses this to refer to the object instance.
Article.prototype.toHtml = function() {
  let template = Handlebars.compile($('#article-template').text());

  this.daysAgo = parseInt((new Date() - new Date(this.publishedOn))/60/60/24/1000);

  // COMMENT: What is going on in the line below? What do the question mark and colon represent? How have we seen this same logic represented previously?
  // Not sure? Check the docs!
  // It's a ternary operation to decide on the published status and text used when writing to the document. Below is a highlighter function.
  this.publishStatus = this.publishedOn ? `published ${this.daysAgo} days ago` : '(draft)';
  this.body = marked(this.body);

  return template(this);
};

// REVIEW: There are some other functions that also relate to all articles across the board, rather than just single instances. Object-oriented programming would call these "class-level" functions, that are relevant to the entire "class" of objects that are Articles.

// REVIEW: This function will take the rawData, how ever it is provided, and use it to instantiate all the articles. This code is moved from elsewhere, and encapsulated in a simply-named function for clarity.

// COMMENT: Where is this function called? What does 'rawData' represent now? How is this different from previous labs?
// It's called in the Article.fetchAll function. rawData is stored locally and is used by this function to represent the data displayed with each article. Before now, we were pulling in rawData from a separate file on our computer.
Article.loadAll = articleData => {
  articleData.sort((a,b) => (new Date(b.publishedOn)) - (new Date(a.publishedOn)))

  articleData.forEach(articleObject => Article.all.push(new Article(articleObject)))
}

// REVIEW: This function will retrieve the data from either a local or remote source, and process it, then hand off control to the View.
Article.fetchAll = () => {
  if (localStorage.rawData) {
    // REVIEW: When rawData is already in localStorage we can load it with the .loadAll function above and then render the index page (using the proper method on the articleView object).

    //TO/DO: This function takes in an argument. What do we pass in?
    Article.loadAll(localStorage.rawData);

    //TO/DO: What method do we call to render the index page?
    Article.all.toHtml();
    // COMMENT: How is this different from the way we rendered the index page previously? What the benefits of calling the method here?
    // Before we called a function on the index.html page that was a function that contained all of the functions for rendering the page. It a faster and more fluid way of loading all of the content of the page.

  } else {
    // TO/DO: When we don't already have the rawData, we need to retrieve the JSON file from the server with AJAX (which jQuery method is best for this?), cache it in localStorage so we can skip the server call next time, then load all the data into Article.all with the .loadAll function above, and then render the index page.
    $.getJSON('./data/hackerIpsum.json')
      .then(function(data, status, xhr){
        Article.loadAll(data);
        articleView.initIndexPage();
      })

      
    // COMMENT: Discuss the sequence of execution in this 'else' conditional. Why are these functions executed in this order?
    // The reason you would execute them in this order is because you want the data to be available before you attempt to initialize it.
  }
}
