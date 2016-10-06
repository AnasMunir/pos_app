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
var checked_items = []; var checked_invoice_no;
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

  invoiceDoc("5", total, cash_paid, balance, items_array)
  //items_array.splice(0);
});

$('#returnSail').click(function () {
  var invoice_no = $('#returnInvoice').val();

  return db.find({
    selector: {invoice_number: invoice_no},
    fields: ['invoice_number', 'date', 'invoice_total', 'items'],
  }).then(function (result) {
    for (var i = 0; i < result.docs[0].items.length; i++) {
      invoice_no = JSON.stringify(result.docs[0].invoice_number)
      var items = JSON.stringify(result.docs[0].items[i].name +' '+ result.docs[0].items[i].qty +' '+ result.docs[0].items[i].price);
      var $ctrl = $('<input/>').attr({ type: 'checkbox', name:'chk', onchange: 'checkReturn('+items+', '+i+', '+invoice_no+')', id: 'chk_' + i, value: items}).addClass("chk");

      $("#holder").append($ctrl);
      $("#holder").append(items);
      console.log(result.docs[0].items[i].name +' '+ result.docs[0].items[i].qty +' '+ result.docs[0].items[i].price);
    }
    console.log(result);
  }).catch(function (err) {
    console.log(err);
  });
});


function checkReturn(item, i, invoice_no){
  if ($('#chk_'+i).prop('checked')) {
    // console.log(item)
    checked_items.push(item);
    console.log(checked_items);
    checked_invoice_no = invoice_no;
    console.log(checked_invoice_no);
  } else {
    checked_items.pop(item);
    checked_invoice_no = '';
    console.log(checked_items);
    console.log(checked_invoice_no);
  }
}
$('#returnItems').click(function () {

  returnDoc(checked_invoice_no, checked_items);
})


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

function returnDoc(checked_invoice_no, items) {
  return db.put({
    _id: 'return' +'_'+ checked_invoice_no,
    date: new Date(),
    item: items
  }).then(function (result) {
    console.log(result);
  });
}

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
