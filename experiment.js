const remote = require('electron').remote
const main = remote.require('./main.js')

var $ = document.querySelector.bind(document);

// var db = new PouchDB('experiment-db');
//db.plugin(require('pouchdb-upsert');

var type = 'usb';
var brand = 'sandisk';
var model = '2.0';
var color = '';
var storage = '16gb';


productInsertion(db);

// var name = type +'_'+ brand +'_'+ model +'_'+ color +'_'+ storage;
// // // making design doc for above doc
// var ddoc = {
//   _id: '_design/' + name,
//   views: {
//     by_storage: {
//       map: function (doc) {
//         emit(doc.storage);
//       }.toString()
//     },
//     by_type: {
//       map: function (doc) {
//         emit(doc.type)
//       }.toString()
//     },
//     reduce: '_sum'
//   }
// };
// db.putIfNotExists(ddoc).then(function () {
//   return db.query(name + '/by_storage', {stale: 'update_after'});
//   return db.query(name + '/by_type', {stale: 'update_after'});
// }).then(function () {
//   return db.query(name + '/by_storage', {key: '16gb', reduce: true, group: true});
// }).then(function (result) {
//   console.log(result);
// }).then(function () {
//   return db.query(name + '/by_type', {key: 'usb'});
// }).then(function (result) {
//   console.log(result);
// }).catch(function (err) {
//   console.log(err);
// });
//
// db.viewCleanup();

function productInsertion(db) {
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
  var name = type +'_'+ brand +'_'+ model +'_'+ color +'_'+ storage;
  // // making design doc for above doc
  var ddoc = {
    _id: '_design/' + name,
    views: {
      by_storage: {
        map: function (doc) {
          emit(doc.storage);
        }.toString()
      },
      by_type: {
        map: function (doc) {
          emit(doc.type)
        }.toString()
      },
      reduce: '_sum'
    }
  };
  db.putIfNotExists(ddoc).then(function () {
    return db.query(name + '/by_storage', {stale: 'update_after'});
    return db.query(name + '/by_type', {stale: 'update_after'});
  }).then(function () {
    return db.query(name + '/by_storage', {key: '16gb', reduce: true, group: true});
  }).then(function (result) {
    console.log(result);
  }).then(function () {
    return db.query(name + '/by_type', {key: 'usb'});
  }).then(function (result) {
    console.log(result);
  }).catch(function (err) {
    console.log(err);
  });

  db.viewCleanup();

}

PouchDB.replicate('experiment5-db', 'http://localhost:5984/experiment5-db', {live: true});

var button = document.createElement('button')
button.textContent = 'Open window'
button.addEventListener('click', () => {
	main.openWindow()
}, false)
document.body.appendChild(button)
