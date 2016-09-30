const remote = require('electron').remote
const main = remote.require('./main.js')

var $ = document.querySelector.bind(document);

// var db = new PouchDB('experiment-db');
//db.plugin(require('pouchdb-upsert');

var type = 'usb';
var brand = 'sandisk';
var model = '3.0';
var color = '';
var storage = '16gb';

new PouchDB('experiment5-db').destroy().then(function () {
  return new PouchDB('experiment5-db');
}).then(function (db) {

  db.putIfNotExists({
    _id: type +'_'+ brand +'_'+ model +'_'+ color +'_'+ storage,
    type: type,
    brand: brand,
    model: model,
    color: color,
    storage: storage,
    quantity: 0,
    pricing: {
      list: 0,
      retail: 0
    }
  }).then(function () {
    return db.get(type +'_'+ brand +'_'+ model +'_'+ color +'_'+ storage);
  }).then(function (doc) {
    $('#alldoc').innerHTML = JSON.stringify(doc.color);
    console.log(doc);
  }).then(function () {
    return db.allDocs({include_docs: true});
  }).then(function (result) {
    console.log(result);
  }).then(function () {
    return db.allDocs({startkey: 'mobile', endkey: 'mobile\uffff'});
  }).then(function (result) {
    console.log(result);
  }).catch(function (err) {
    console.log(err);
  });

  db.query(function (doc, emit) {
    emit(doc.storage);
  }, {key: '32gb'}).then(function (result) {
    console.log(result);
  }).catch(function (err) {
    console.log(err);
  });

  var name = type +'_'+ brand +'_'+ model +'_'+ color +'_'+ storage;
  // // making design doc for above doc
  var ddoc = {
    _id: '_design/' + name,
    views: {
      by_type: {
        map: function (doc) {
          emit(doc.storage);
        }.toString()
      }
    }
  };
  db.put(ddoc).then(function () {
    return db.query(name + '/by_type', {stale: 'update_after'});
  }).then(function () {
    return db.query(name + '/by_type', {key: '16gb'});
  }).then(function (result) {
    console.log(result);
  }).catch(function (err) {
    console.log(err);
  });

});



// db.viewCleanup();

PouchDB.replicate('experiment5-db', 'http://localhost:5984/experiment5-db', {live: true});

var button = document.createElement('button')
button.textContent = 'Open window'
button.addEventListener('click', () => {
	main.openWindow()
}, false)
document.body.appendChild(button)
