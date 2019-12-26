const cluster = require('cluster');

const port = process.env.PORT || 3001;
if (cluster.isMaster) {
  cluster.fork();
  cluster.on('exit', worker => {
    console.log('Worker %d died :(', worker.id);
    cluster.fork();
  });
} else {
  const compression = require('compression');
  const cors = require('cors');
  const express = require('express');
  const app = express();
  const PouchDB = require('pouchdb');
  const TempPouchDB = PouchDB.defaults({ prefix: './db/' });
  app.use(compression());
  app.use(cors());
  app.use('/', require('express-pouchdb')(TempPouchDB));
  app.listen(port, () => {
    console.log('🔛');
  });
}

// dsds
