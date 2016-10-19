const remote = require('electron').remote
const main = remote.require('./main.js')

var db = new PouchDB('experiment9-db');
var remmote_db = new PouchDB('http://localhost:5984/live_replicate');
PouchDB.plugin(require('pouchdb-upsert'));

$('#getval').click(function () {
  var barcode = $('#barcode').val();
  var name = $('#name').val();

  return db.find({selector: {bar_code: barcode}}).then(function (result) {
    console.log(result);
    if(result.docs.length == 0) {
      console.log('barcode ' + barcode + ' is available');
      productInsertion(name, barcode);
    } else {
      console.log('barcode' + barcode + ' is already taken');
    }
  });
});
// live search
$('#searchProduct').keyup(function () {

  var searchkey = $('#searchProduct').val();
  // return db.allDocs({startkey: 'product_' + searchkey, endkey: 'product_' + searchkey+'\uffff', include_docs: true}).then(function (result) {

  //   var output = document.getElementById('search_resutls')
  //   output.innerHTML = result;

  //   console.log(result);
  // }).catch(function (err) {
  //   console.log(err);
  // })
  return db.find({
    selector: {
      _id: {$gte: null},
      product_name: {$regex: ".*" + searchkey + "."}
    },
    fields: ['product_name']
  }).then(function (result) {
    var output = document.getElementById('search_resutls');
    output.innerHTML = result;
    console.log(result);
  }).catch(function (err) {
    console.log(err);
  })
});
//search item by barcode
$('#searchBar').click(function productSearchBarcode(doc) {

  var searchkey = $('#searchProduct').val();

  return db.find({
    selector: {bar_code: searchkey},
    fields: ['_id','product_name', 'bar_code', 'quantity', 'threshold_qty', 'pricing']
  }).then(function (result) {
    var output = document.getElementById('search_resutls')
    // output.innerHTML = JSON.stringify(result.docs[0].product_name)
    console.log(result);
    alert(result);
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

var invoice_total = [];  // to store the total of each item
// localStorage.invoice_number = 1;  // autoincremented invoice_number
var items_array = [];  // to store the items before passing to invoiceDoc
var checked_items = [];  // to store checked items during returning phase
var checked_invoice_no;  //
var graphData = []; // data for graph

function invoiceCounter() {
  if(localStorage.invoice_number) {
    return localStorage.invoice_number = Number(localStorage.invoice_number) + 1;
  } else {
    return localStorage.invoice_number = 1;
  }
}

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
      qty: quantity,
      product_qty: result.rows[0].doc.quantity
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

  invoiceDoc(invoiceCounter() + "", total, cash_paid, balance, items_array);

  Promise.all(items_array.map(function (object) {
    return db.upsert('product_' + object.name + '_' + object.barcode, function (doc) {
      doc.quantity = doc.quantity - Number(object.qty);
      return doc
    }).then(result => {
      console.log(result);
    }).catch(err => {
      console.log(err);
    });
  }));
  items_array.splice(0);
});

$('#returnSail').click(function () {
  var invoice_no = $('#returnInvoice').val();

  return db.find({
    selector: {invoice_number: invoice_no},
    fields: ['_id','invoice_number', 'date', 'invoice_total', 'items']
  }).then(function (result) {
    for (var i = 0; i < result.docs[0].items.length; i++) {
      invoice_no = JSON.stringify(result.docs[0].invoice_number);
      var items = JSON.stringify(result.docs[0].items[i].name +' '+ result.docs[0].items[i].qty +' '+ result.docs[0].items[i].price);

      console.log(result.docs[0].items[i].name +' '+ result.docs[0].items[i].qty +' '+ result.docs[0].items[i].price);
      // console.log(parseInt(result.docs[0].items[i].qty));
      // if (parseInt(result.docs[0].items[i].qty > 1)) {
        for (var j = 0; j < parseInt(result.docs[0].items[i].qty); j++) {
          console.log(items);
          var $ctrl = $('<input/>').attr({ type: 'checkbox', name:'chk', onchange: 'checkReturn('+items+', '+j+', '+invoice_no+')', id: 'chk_' + j, value: items}).addClass("chk");
          $("#holder").append($ctrl);
          $("#holder").append(items);
        }
      // }
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

$('#showReturns').click(function () {
  return db.allDocs({startkey: 'return_', endkey: 'return_\uffff', include_docs: true}).then(function (result) {
    console.log(result);
  }).then(function () {
    return db.allDocs({startkey: 'invoice_', endkey: 'invoice_\uffff', include_docs: true}).then(function (result) {
      console.log(result);
    })
  }).catch(function (err) {
    console.log(err);
  })
});

$('#showAllDocs').click(function () {
  return db.allDocs({startkey: 'product_', endkey: 'product_\uffff', include_docs: true})
  .then(result => {
    console.log(result);
    for (var i = 0; i < result.rows.length; i++) {
      var graph_items = {
        product: result.rows[i].doc.product_name,
        quantity: result.rows[i].doc.quantity
      }
      graphData.push(graph_items);
    }
    AmCharts.makeChart( "container", {
      "type": "serial",
      "dataProvider": graphData,
      "categoryField": "product",
      "categoryAxis": {
        "autoGridCount": false,
        "gridCount": graphData.length,
        "gridPosition": "start",
        "labelRotation": 90
      },
      "graphs": [ {
        "valueField": "quantity",
        "type": "column",
        "fillAlphas": 0.8,
        "angle": 30
      } ]
    } );
    return graphData;
  }).then(result => {
    console.log(result);
    // amCharts(result, result.product, result.quantity);
  }).catch( err => {
    console.log(err);
  });
});


function invoiceDoc(invoice_number, invoice_total, cash_paid, customer_balance, items_array) {

  return db.putIfNotExists({
    _id: 'invoice' +'_'+ invoice_number,
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
  return db.putIfNotExists({
    _id: 'return' +'_'+ checked_invoice_no,
    date: new Date(),
    item: items
  }).then(function (result) {
    console.log(result);
  });
}

function productInsertion(name, barcode) {

  db.putIfNotExists({
    _id: 'product' +'_'+ name +'_'+ barcode,
    product_name: name,
    bar_code: barcode,
    quantity: 150,
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
  }).then(function () {
    db.createIndex({
      index: {
        fields: ['bar_code', 'product_name']
      }
    });
  }).catch(function (err) {
    console.log(err);
  });

}
var chartData = [ {
    "country": "USA",
    "visits": 4252
  }, {
    "country": "China",
    "visits": 1882
  }, {
    "country": "Japan",
    "visits": 1809
  }, {
    "country": "Germany",
    "visits": 1322
  }, {
    "country": "UK",
    "visits": 1122
  }, {
    "country": "France",
    "visits": 1114
  }, {
    "country": "India",
    "visits": 984
  }, {
    "country": "Spain",
    "visits": 711
  }, {
    "country": "Netherlands",
    "visits": 665
  }, {
    "country": "Russia",
    "visits": 580
  }, {
    "country": "South Korea",
    "visits": 443
  }, {
    "country": "Canada",
    "visits": 441
  }, {
    "country": "Brazil",
    "visits": 395
  }, {
    "country": "Italy",
    "visits": 386
  }, {
    "country": "Australia",
    "visits": 384
  }, {
    "country": "Taiwan",
    "visits": 338
  }, {
    "country": "Poland",
    "visits": 328
} ];
console.log(chartData);
// AmCharts.ready( function () {
//   var chart = new AmCharts.AmSerialChart();
//   chart.dataProvider = chartData;
//   chart.categoryField = "country";
//
//   var graph = new AmCharts.AmGraph();
//   graph.valueField = "visits";
//   graph.type = "column";
//   chart.addGraph(graph);
//
//   chart.write("chartdiv")
// });

function amCharts(result, provider, field) {
  AmCharts.makeChart( "container", {
    "type": "serial",
    "dataProvider": result,
    "categoryField": provider,
    "categoryAxis": {
      "autoGridCount": false,
      "gridCount": result.length,
      "gridPosition": "start",
      "labelRotation": 90
    },
    "graphs": [ {
      "valueField": Number(field),
      "type": "column",
      "fillAlphas": 0.8,
      "angle": 30
    } ]
  } );
}

AmCharts.makeChart( "chartdiv", {
  "type": "serial",
  "dataProvider": chartData,
  "categoryField": "country",
  "categoryAxis": {
    "autoGridCount": false,
    "gridCount": chartData.length,
    "gridPosition": "start",
    "labelRotation": 90
  },
  "graphs": [ {
    "valueField": "visits",
    "type": "column",
    "fillAlphas": 0.8,
    "angle": 30
  } ]
} );
// PouchDB.replicate('experiment9-db', 'http://localhost:5984/experiment9-db', {live: true});
// db.replicate.to(remmote_db).on('complete', function () {
//   console.log('relication complete');
// }).on('error', function (err) {
//   console.log('hmm, replication failed');
// });
// db.sync(remmote_db, {
//   live: true,
//   retry: true
// }).on('change', function (change) {
//   console.log('something changed');
// }).on('paused', function (info) {
//   console.log('replication paused');
// }).on('active', function (info) {
//   console.log('replication resumed');
// }).on('error', function (err) {
//   console.log(err);
// })

// remmote_db.info().then(function (info) {
//   console.log(info);
// })
var button = document.createElement('button')
button.textContent = 'Open window'
button.addEventListener('click', () => {
	main.openWindow()
}, false)
document.body.appendChild(button)
