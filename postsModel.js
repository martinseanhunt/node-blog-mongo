const mongoose = require('mongoose');

const postSchema = mongoose.Schema({
  "title": {type: String, required: true},
  "content": {type: String, required: true},
  "author": {
      "firstName": {type: String, required: true},
      "lastName": {type: String, required: true}
  },
  "created": {type: Date}, 
});

//Virtuals
postSchema.virtual('authorString').get(function() {	
	return `${this.author.firstName} ${this.author.lastName}`;
});

// Instace method
postSchema.methods.apiRepr = function() {
	return{
		id: this._id,
		title: this.title,
		content: this.content, 
		author: this.authorString,
		created: this.created
	}
}

const Post = mongoose.model('blogPost', postSchema);

module.exports = {Post};