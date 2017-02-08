var ChangesStream = require('changes-stream');
var Redis = require("redis");
var redis = Redis.createClient();
var express = require('express');
var cors = require('cors');
var app = express();

var changes = new ChangesStream({
  db: 'https://skimdb.npmjs.com/registry',
  include_docs: true,
  since: 'now'
});

changes.on('data', function (change) {
  var name = change.doc.name
  console.log(name)
  redis.lpush('npm-updated-names', name)
})

app.get('/', function (req, res) {
  redis.lrange('npm-updated-names', 0, 100, function (err, replies) {
    res.json([...new Set(replies)]);
  });
})

var port = process.env.PORT || 5001;
app.listen(port, function() {
  console.log('Listening on', port);
});
