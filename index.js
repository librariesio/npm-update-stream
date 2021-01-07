var ChangesStream = require('changes-stream');
var Redis = require("redis");
var redis = Redis.createClient({host: process.env.REDIS_URL || 'redis'});
var express = require('express');
var cors = require('cors');
var app = express();
var since = redis.get('npm:latest_seq') || 'now'

var changes = new ChangesStream({
  db: 'https://replicate.npmjs.com/registry',
  include_docs: true,
  since: since
});

changes.on('data', function (change) {
  var name = change.doc.name
  var version = change.doc['dist-tags'].latest
  if(name){
    console.log(change.seq, name, version)
    redis.lpush('npm-updated-names', name)
    redis.lpush('npm-updated-names-with-versions', name + ' ' + version)
    redis.set('npm:latest_seq', change.seq)
  }
})

app.get('/', function (req, res) {
  redis.lrange('npm-updated-names', 0, 200, function (err, replies) {
    res.json([...new Set(replies)]);
  });
})

app.get('/recent', function (req, res) {
  redis.lrange('npm-updated-names', 0, 5000, function (err, replies) {
    res.json([...new Set(replies)]);
  });
})

app.get('/recent-with-versions', function (req, res) {
  redis.lrange('npm-updated-names-with-versions', 0, 5000, function (err, replies) {
    res.json([...new Set(replies)]);
  });
})

var port = process.env.PORT || 5001;
app.listen(port, function() {
  console.log('Listening on', port, ' at sequence ', since);
});
