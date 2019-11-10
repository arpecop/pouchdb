const cluster = require("cluster");

const port = process.env.PORT || 3000;



if (cluster.isMaster) {
  cluster.fork();
  cluster.on("exit", worker => {
    console.log("Worker %d died :(", worker.id);
    cluster.fork();
  });
} else {
  const compression = require('compression')
  const PouchDB = require('pouchdb');
  const SocketServer = require('ws').Server;
  const uuid = require('uuid')
  const TempPouchDB = PouchDB.defaults({ prefix: './db/' });
  const md5 = require('md5');
  const server = require("express")().use(compression()).use("/", require("express-pouchdb")(TempPouchDB)).listen(port, () => console.log(`Listening `));
  const db = new TempPouchDB('db')
  const wss = new SocketServer({ server });
  wss.on('connection', function connection(ws, req) {

    ws.id = req.headers['sec-websocket-protocol'];
    // eslint-disable-next-line no-console

    console.log(ws.id, 'connected');
    ws.on('message', function (id) {
      db.get(md5(id), async function (e, data) {
        const sendx = id.length >= 20 ? id : JSON.stringify(e ? { _id: id, _rev: '0-' } : data);

        wss.clients.forEach(async (client) => {
          if (client.id !== ws.id) {
            client.send(sendx);
          }

        });

      })
    });
  });
}

// dsds
