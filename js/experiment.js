const remote = require('electron').remote
const main = remote.require('./main.js')

// var $ = document.querySelector.bind(document);

var db = new PouchDB('experiment6-db');
// var PouchDB = require('pouchdb');
PouchDB.plugin(require('pouchdb-upsert'));

$('#getval').click(function () {
  var barcode = $('#barcode').val();
  var type = $('#type').val();
  var brand = $('#brand').val();
  var model = $('#model').val();
  var color = $('#color').val();
  var storage = $('#storage').val();

  productInsertion(barcode, type, brand, model, color, storage);
});


function productInsertion(barcode, type, brand, model, color, storage) {

  db.putIfNotExists({
    _id: barcode +'_'+ type +'_'+ brand +'_'+ model +'_'+ color +'_'+ storage,
    barcode: barcode,
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
    return db.get(barcode +'_'+ type +'_'+ brand +'_'+ model +'_'+ color +'_'+ storage);
  }).then(function (doc) {
    // $('#alldoc').innerHTML = JSON.stringify(doc);
    console.log(doc);
  }).then(function () {
    return db.allDocs({include_docs: true});
  }).then(function (result) {
    console.log(result);
  }).then(function () {
    return db.allDocs({startkey: 'usb', endkey: 'usb\uffff'});
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

PouchDB.replicate('experiment6-db', 'http://localhost:5984/experiment6-db', {live: true});

var button = document.createElement('button')
button.textContent = 'Open window'
button.addEventListener('click', () => {
	main.openWindow()
}, false)
document.body.appendChild(button)
