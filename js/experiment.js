const remote = require('electron').remote
const main = remote.require('./main.js')

var db = new PouchDB('experiment6-db');
PouchDB.plugin(require('pouchdb-upsert'));

$('#getval').click(function () {
  var barcode = $('#barcode').val();
  var name = $('#name').val();

  productInsertion(barcode, name);
});

$('#search').click(function productSearch() {
  var searchkey = $('#searchProduct').val();
  return db.allDocs({startkey: searchkey, endkey: searchkey+'\uffff', include_docs: true}).then(function (result) {
    console.log(result);
  })
});

$('#searchName').click(function productSearchName(doc) {
  // var name = '254501410169_cookies 50g'
  var searchkey = $('#searchProduct').val();
  return db.search({
    query: searchkey,
    fields: ['product_name'],
    highlighting: true,
    include_docs: true
  }).then(function (result) {
    console.log(result);
  }).catch(function (err) {
    console.log(err);
  });
});
//   return db.query(doc + '/by_name', {startkey: searchkey, endkey: searchkey+'\uffff', include_docs: true}).then(function (result) {
//     console.log(result);
//   }).catch(function (err) {
//     console.log(err);
//   })
// });

function productInsertion(barcode, name) {

  db.putIfNotExists({
    _id: barcode +'_'+ name,
    barcode: barcode,
    product_name: name,
    quantity: 0,
    pricing: {
      list: 0,
      retail: 0
    }
  }).then(function () {
    return db.allDocs({include_docs: true});
  }).then(function (result) {
    console.log(result);
  }).catch(function (err) {
    console.log(err);
  });

  var name = barcode +'_'+ name;
  // // making design doc for above doc
  var ddoc = {
    _id: '_design/' + name,
    views: {
      by_name: {
        map: function (doc) {
          emit(doc.product_name);
        }.toString()
      },
      reduce: '_sum'
    }
  };
  db.putIfNotExists(ddoc).then(function () {
    return db.query(name + '/by_name', {stale: 'update_after'});
  }).then(function () {
    return db.query(name + '/by_name', {startkey: 'liption', endkey: 'liption\uffff'});
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
