const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();

const {Post} = require('./postsModel');

router.get('/', (req, res) => {
	Post
		.find()
		.exec()
		.then(posts => {
			res.json({
				posts: posts.map( post => post.apiRepr() )
			});
		}).catch(err => {
			console.error(err);
			res.status(500).json({message: 'uh oh! something went wrong!'});
		})
});

router.get('/:id', (req,res) => {
	Post
		.findById(req.params.id)
		.exec()
		.then(post => res.json(post.apiRepr()))
		.catch(err => {
			console.error(err);
			res.status(500).json({message: 'uh oh! something went wrong!'});
		})
});

router.post('/', jsonParser, (req, res) => {
	const requiredFields = ['title', 'content', 'author'];
	requiredFields.forEach(field => {
		if (!(field in req.body)) {
			const message = `Missing ${field} in request body`;
			return res.status(400).send(message);
		}
	});

	Post
		.create({
			title: req.body.title,
			content: req.body.content,
			author: {
				firstName: req.body.author.firstName,
				lastName: req.body.author.firstName
			},
			created: Date.now()
		})
		.then(post => res.status(201).json(post.apiRepr()))
		.catch(err => {
			console.error(err);
			res.status(500).json({message: 'uh oh! something went wrong!'});
		})
});

router.put('/:id', jsonParser, (req, res) => {
	if (!(req.params.id) && (req.body.id) && (req.params.id === req.body.id)) {
		const message = `Request path id (${req.params.id}) and request body id (${req.body.id}) must match`;
		console.error(message);
		return res.status(400).json({message: message})
	}

	const toUpdate = {}
	const updatableFields = ['title', 'content', 'author'];

	updatableFields.forEach(field => {
		if (field in req.body) {
			toUpdate[field] = req.body[field];
		}
	})

	Post
		.findByIdAndUpdate(req.params.id, {$set: toUpdate})
		.exec()
		.then( post => {
			Post
				.findById(req.params.id)
				.exec()
				.then(post => res.json(post.apiRepr()))
				.catch(err => {
					console.error(err);
					res.status(500).json({message: 'uh oh! something went wrong!'});
				})
		})
		.catch(err => {
		console.error(err);
			res.status(500).json({message: 'uh oh! something went wrong!'});
		})
});

router.delete('/:id', (req, res) => {
	Post
		.findByIdAndRemove(req.params.id)
		.then(post => res.status(204).end())
		.catch(err => res.status(500).json({message: 'uh oh! something went wrong!'}));
})

module.exports = router;