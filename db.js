let db;
let dbReq = indexedDB.open('myDatabase', 1);

dbReq.onupgradeneeded = function(event) {
  db = event.target.result;
  var objectStore;
  var cofdaily = {id: 1, name: 'cofdaily', fields: [{1: 'reg'}, {2: 'shipton'}], links: [{2:2}]};
  var cmf = {id: 2, name: 'cmf', fields: [{2: 'cmfacctn'}, {3: 'mktgacctn'}], links: [{1:2}]};
  var mktg = {id: 3, name: 'mktg', fields: [{3: 'mktgacctn'}, {4:'sourcedate'}], links: [{2:3}]};
  var tableObjects = [cofdaily, cmf, mktg];

  if (!db.objectStoreNames.contains('tables')) {
  objectStore = db.createObjectStore('tables',  {keyPath: 'id'});
  for(var key in tableObjects) {
    objectStore.put(tableObjects[key]);
    }
  //adds initial data (only once)
  objectStore.put(cofdaily)
  objectStore.put(cmf)
  }
}

dbReq.onsuccess = function(event) {
  db = event.target.result;
  //for loop to loop through array of objects. object.field passed into addtable?
  
  //id - keyPath
  //nm - tableName
  //flds - fieldID, fieldName (local name of field)
  //lnks - tableID, fieldID (of linkage)

  //testing put
  /*
  var cofdaily = {id: 1, nm: 'cofdaily', flds: [{1: 'reg'}, {2: 'shipton'}], lnks: [{2:2}]};
  var cmf = {id: 2, nm: 'cmf', flds: [{2: 'cmfacctn'}, {3: 'mktgacctn'}], lnks: [{1:2}]};
  
  //store tables as array of objects
  var tableObjects = [cofdaily, cmf];
  //loop through each table object to add to database
  for(var key in tableObjects) {
  addTable(db, tableObjects[key]);
  }
  */
  readTable(db);
  readAll(db);
}

dbReq.onerror = function(event) {
  alert('error opening database ' + event.target.errorCode);
}

//to add transactions to tables objectStore
function addTable (db, object) {
  let tx = db.transaction(['tables'], 'readwrite');
  let tableName = tx.objectStore('tables');

  let table = {id: object.id, name: object.nm, fields: object.flds, links: object.lnks};
  tableName.add(table);

  tx.oncomplete = function() { console.log('stored table!') }
  tx.onerror = function(event) {
      alert('error storing table ' + event.target.errorCode);
  }
}

function readTable(db) {
  var transaction = db.transaction(['tables']);
  var objectStore = transaction.objectStore('tables');
  var request = objectStore.get(1);

  request.onerror = function(event) {
    console.log('Transaction failed');
  };
  request.onsuccess = function( event) {
    if (request.result) {
      console.log('Table: ' + JSON.stringify(request.result));
      //console.log('Fields: ' + request.result.fields);
      //console.log('Links: ' + request.result.links);
    } else {
      console.log('No data record');
    }
 };
}

function readAll(db) {
  var objectStore = db.transaction('tables').objectStore('tables');

   objectStore.openCursor().onsuccess = function (event) {
     var cursor = event.target.result;

     if (cursor) {
       console.log('Id: ' + cursor.key);
       console.log('Name: ' + cursor.value.name);
       console.log('fields: ' + cursor.value.fields);
       console.log('Links: ' + cursor.value.links);
       cursor.continue();
    } else {
      console.log('No more data');
    }
  };
}

//look at 3.8 index on tutorialdocs link
/*
function addPart (db, pn, cp, lp) {
    let tx = db.transaction(['parts'], 'readwrite');
    let store = tx.objectStore('parts');

    //put part into object store
    let part = {partNumber: pn, currentPrice:cp, lastPrice:lp};
    store.add(part)

    //Wait for database transaction to complete
    tx.oncomplete = function() { console.log('stored part!') }
    tx.onerror = function(event) {
        alert('error storing part ' + event.target.errorCode);
    }
}
*/
/*
var schema = {
  cofdaily : {
    fields: [id, reg, shipton, billton, partno, qty],
    relationships: {
      cmf: {objectStore: 'cmf'}
    }
  },
  cmf: {
    fields: [id, cmfacctn, branch, mktgacct],
    relationships: {
      cofdaily: {objectStore: 'cofdaily' }
    }
  }
};

var cof = {
  id:'CF1',
  cmf:['CM1']
};

var cmf = {
  id:'CM1',
  cof:['CF1']
}
*/