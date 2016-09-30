const remote = require('electron').remote
const main = remote.require('./main.js')

var $ = document.querySelector.bind(document);

// var db = new PouchDB('experiment-db');
//db.plugin(require('pouchdb-upsert');

var type = 'usb';
var brand = 'kingston';
var model = 'moto-x';
var color = '';
var storage = '16gb';


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
  return db.allDocs({startkey: 'usb', endkey: 'usb\uffff'});
}).then(function (result) {
  console.log(result);
}).catch(function (err) {
  console.log(err);
});

var name = type +'_'+ brand +'_'+ model +'_'+ color +'_'+ storage;

db.viewCleanup();

PouchDB.replicate('experiment4-db', 'http://localhost:5984/experiment4-db', {live: true});

var button = document.createElement('button')
button.textContent = 'Open window'
button.addEventListener('click', () => {
	main.openWindow()
}, false)
document.body.appendChild(button)
