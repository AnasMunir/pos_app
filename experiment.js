const remote = require('electron').remote
const main = remote.require('./main.js')

var $ = document.querySelector.bind(document);

// var db = new PouchDB('experiment-db');
//db.plugin(require('pouchdb-upsert');

var type = 'usb';
var brand = 'samsung';
var model = '3x101';
var color = 'black';
var storage = '32gb';


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
  $('#smartphone').innerHTML = JSON.stringify(doc.color);
  console.log(doc);
}).then(function () {
  return db.allDocs({include_once: true});
}).then(function (result) {
  console.log(result);
}).catch(function (err) {
  console.log(err);
});

// db.putIfNotExists({
//   _id: usbBrand +'_'+ usbModel +'_'+ usbStorage,
//   brand: usbBrand,
//   model: usbModel,
//   storage: usbStorage,
//   quantity: 0,
//   pricing: {
//     list: 0,
//     retail: 0
//   }
// }).then(function () {
//   return db.get(usbBrand +'_'+ usbModel +'_'+ usbStorage);
// }).then(function (doc) {
//   $('#usb').innerHTML = JSON.stringify(doc.quantity);
//   console.log(doc);
// }).catch(function (err) {
//   console.log(err);
// });

PouchDB.replicate('experiment-db', 'http://localhost:5984/experiment-db', {live: true});

var button = document.createElement('button')
button.textContent = 'Open window'
button.addEventListener('click', () => {
	main.openWindow()
}, false)
document.body.appendChild(button)
