const remote = require('electron').remote
const main = remote.require('./main.js')

var db = new PouchDB('experiment7-db');
PouchDB.plugin(require('pouchdb-upsert'));

$('#getval').click(function () {
  var barcode = $('#barcode').val();
  var name = $('#name').val();

  productInsertion(name, barcode);
});

// $('#searchName').click(function productSearch() {
//   var searchkey = $('#searchProduct').val();
//   return db.allDocs({startkey: searchkey, endkey: searchkey+'\uffff', include_docs: true}).then(function (result) {
//     console.log(result);
//   })
// });
$('#searchProduct').keyup(function () {
  // alert("JZ is a foo!");
  var searchkey = $('#searchProduct').val();
  return db.allDocs({startkey: searchkey, endkey: searchkey+'\uffff', include_docs: true}).then(function (result) {
    // var obj = jQuery.parseJSON(result);
    // alert(obj.bar_code);
    var output = document.getElementById('search_resutls')
    output.innerHTML = result;

    console.log(result);
  }).catch(function (err) {
    console.log(err);
  })
});

$('#searchBar').click(function productSearchBarcode(doc) {

  var searchkey = $('#searchProduct').val();

  return db.search({
    query: searchkey,
    fields: ['bar_code'],
    highlighting: true,
    include_docs: true
  }).then(function (result) {
    var output = document.getElementById('search_resutls')
    output.innerHTML = JSON.stringify(result.rows[0].doc.product_name)
    console.log(result);
  }).catch(function (err) {
    console.log(err);
  })
});

$('#showDocs').click(function showDocs() {
  return db.allDocs({include_docs: true}).then(function (result) {
    for (var i = 0; i < result.total_rows; i++) {
      if (result.rows[i].doc.quantity < result.rows[i].doc.threshold_qty) {
        console.log(result.rows[i].doc.product_name + 'is less than threshold_qty');
      }
    }
    // console.log(result);
  }).catch(function (err) {
    console.log(err);
  })
})
//   return db.find({
//     selector: {barcode: searchkey}
//   }).then(function (result) {
//     console.log(result);
//   }).catch(function (err) {
//     console.log(err);
//   });
// });

function productInsertion(name, barcode) {

  db.putIfNotExists({
    _id: name +'_'+ barcode,
    product_name: name,
    bar_code: barcode,
    quantity: 8,
    threshold_qty: 10,
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

  var name = name +'_'+ barcode;
  // // making design doc for above doc
  return db.createIndex({
    index: {
      fields: ['bar_code'],
      ddoc: name
    }
  }).then(function (result) {
    console.log(result);
  }).catch(function (err) {
    console.log(err);
  });

  db.viewCleanup();

}

PouchDB.replicate('experiment7-db', 'http://localhost:5984/experiment7-db', {live: true});

var button = document.createElement('button')
button.textContent = 'Open window'
button.addEventListener('click', () => {
	main.openWindow()
}, false)
document.body.appendChild(button)
