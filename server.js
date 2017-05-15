const {PORT, DATABASE_URL} = require('./config');

const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const app = express();

// load routers
const postsRouter = require('./postsRouter');

// log all http reqs
app.use(morgan('common'));

// Send all posts reqs to posts model
app.use('/posts', postsRouter);

// Catch all other HTTP requests
app.get('*', (req, res) => 
	 res.status(404).json({message: 'Looks like you went the wrong way!'})
);

// Start / stop server
let server;

function runServer(databaseUrl=DATABASE_URL, port=PORT) {
	return new Promise((resolve, reject) => {
		mongoose.connect(databaseUrl, err => {
			if (err) {
				return reject(err);
			}
			server = app.listen(port, () => {
				console.log(`Listening on port:${port}`);
				resolve();
			}).on('error', err => {
				mongoose.disconnect();
				reject(err);
			})
		})
	})
}

function closeServer() {
  return mongoose.disconnect().then(() => {
    return new Promise((resolve, reject) => {
      console.log('Closing Server');
      server.close(err => {
        if (err) {
          return reject(err);
        }
        resolve();
      })
    })
  })
}

if(require.main === module) {
  runServer().catch(err => console.error(err));
}

module.exports = {app, runServer, closeServer}