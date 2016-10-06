const remote = require('electron').remote
const main = remote.require('./main.js')

var db = new PouchDB('experiment7-db');
PouchDB.plugin(require('pouchdb-upsert'));

$('#getval').click(function () {
  var barcode = $('#barcode').val();
  var name = $('#name').val();

  productInsertion(name, barcode);
});
// live search
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
//search item by barcode
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
// show items with quantity less than threshold quantity
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
var invoice_total = [];
//var invoice_number = 0;
var items_array = [];
//to enter invoive products through barcode
$('#enter').click(function () {
  var barcode = $('#invoiceProduct').val();
  var quantity = $('#quantity').val();
  var total = 0;
  return db.search({
    query: barcode,
    fields: ['bar_code'],
    include_docs: true
  }).then(function (result) {

    var item_for_array = {
      barcode: barcode,
      name: result.rows[0].doc.product_name,
      price: result.rows[0].doc.pricing.retail,
      qty: quantity
    };

    console.log('item: ' + result.rows[0].doc.product_name + ' price: ' + result.rows[0].doc.pricing.retail + ' qty: ' + quantity);
    total = result.rows[0].doc.pricing.retail * quantity
    console.log(total);

    invoice_total.push(total);
    items_array.push(item_for_array);
  }).catch(function (err) {
    console.log(err);
  });
});

//to checkout and generate a new invoice doc file
$('#checkout').click(function () {
  var cash_paid = parseInt($('#cashPaid').val());
  var total = invoice_total.reduce( (acc, cur) => acc + cur, 0);

  console.log('Invoice Total: ' + total);
  console.log('Cash paid: ' + cash_paid);
  var balance = cash_paid - total
  console.log('customer balance ' + balance);

  //invoice_number++;

  invoiceDoc("4", total, cash_paid, balance, items_array)
  //items_array.splice(0);
});

$('#returnSail').click(function () {
  var invoice_no = $('#returnInvoice').val();

  return db.find({
    selector: {invoice_number: invoice_no},
    fields: ['invoice_number', 'date', 'invoice_total', 'items'],
  }).then(function (result) {
    // var output = document.getElementById('holder');
    for (var i = 0; i < result.docs[0].items.length; i++) {
      var items = JSON.stringify(result.docs[0].items[i].name +' '+ result.docs[0].items[i].qty +' '+ result.docs[0].items[i].price);
      var $ctrl = $('<input/>').attr({ type: 'checkbox', name:'chk', onchange: 'checkReturn('+items+')'}).addClass("chk");

      $("#holder").append($ctrl);
      $("#holder").append(items);
      console.log(result.docs[0].items[i].name +' '+ result.docs[0].items[i].qty +' '+ result.docs[0].items[i].price);
    }
    console.log(result);
  }).catch(function (err) {
    console.log(err);
  });
});
// $('.chk').change(function () {
//   var c = this.checked ? '#0ff' : '#09f';
//   $("#holder").css('color', c);
// });

function checkReturn(i){
  console.log(i);
}
// $('input[type = checkbox]').click(function () {
//   // alert('checked');
//   console.log('checked');
//   // var c = this.prop('checked') ? 'true' : 'false';
//   // alert(c);
// });
//invoice doc file
function invoiceDoc(invoice_number, invoice_total, cash_paid, customer_balance, items_array) {

  return db.putIfNotExists({
    _id: invoice_number,
    invoice_number: invoice_number,
    date: new Date(),
    invoice_total: invoice_total,
    cash_paid: cash_paid,
    customer_balance : customer_balance,
    items: items_array
  }).then(function (result) {
    console.log(result);
  }).then(function () {
    db.createIndex({
      index: {
        fields: ['invoice_number']
      }
    });
  }).catch(function (err) {
    console.log(err);
  })
};


function productInsertion(name, barcode) {

  db.putIfNotExists({
    _id: name +'_'+ barcode,
    product_name: name,
    bar_code: barcode,
    quantity: 15,
    threshold_qty: 10,
    pricing: {
      list: 130,
      retail: 180
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
