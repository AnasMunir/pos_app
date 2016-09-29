const remote = require('electron').remote
const main = remote.require('./main.js')

var $ = document.querySelector.bind(document);
var db = new PouchDB('mydb-idb');

var doc = {
	"_id":"smartphone",
	"brand":"",
	"model":"",
	"storage":"",
	"color":"",
	"quantity": 0,
	"pricing": {
		"list": 0,
		"retail": 0
	}
}
new PouchDB('mydb-idb').destroy().then(function () {
	return new PouchDB('mydb-idb');
}).then(function (db) {
	db.put(doc).then(function () {
		return db.get('smartphone')
	}).then(function (doc) {
		// update brand and model
		doc.brand = "motorola";
	    doc.model = "moto-x 1080";
	    doc.storage = "16gb";
	    doc.color = "blue";
	    doc.quantity = 5;
	    doc.pricing.list = 9000;
	    doc.pricing.retail = 11000;
	    return db.put(doc);
	}).then(function () {
		return db.get('smartphone');
	}).then(function (doc) {
		$('#idb').innerHTML = JSON.stringify(doc);
		console.log(doc);
	}).catch(function (err) {
		console.log(err);
	});
});




var button = document.createElement('button')
button.textContent = 'Open window'
button.addEventListener('click', () => {
	main.openWindow()
}, false)
document.body.appendChild(button)
