
var data = JSON.parse(data)
console.log(data)


function importIDB(dname, sname, arr) {
  return new Promise(function(resolve) {
    var r = window.indexedDB.open(dname)
    r.onupgradeneeded = function() {
      var idb = r.result
      var store = idb.createObjectStore(sname, {keyPath: "name"})
    }
    r.onsuccess = function() {
      var idb = r.result
        let tactn = idb.transaction(sname, "readwrite")
    	  var store = tactn.objectStore(sname)
        for(var obj of arr) {
          store.put(obj)
        }
        resolve(idb)
    }
    r.onerror = function (e) {
     alert("Enable to access IndexedDB, " + e.target.errorCode)
    }    
  })
}

loadJSON("tables.json")
let db;
let dbReq = indexedDB.open('myDatabase', 1);

dbReq.onupgradeneeded = function(event) {
  db = event.target.result;
  var objectStore;

  //define initial table values
  var cofdaily = {id: 1, name: 'cofdaily', fields: [{1: 'reg'}, {2: 'shipton'}], links: [{2:2}]};
  var cmf = {id: 2, name: 'cmf', fields: [{2: 'cmfacctn'}, {3: 'mktgacctn'}], links: [{1:2}]};
  var mktg = {id: 3, name: 'mktg', fields: [{3: 'mktgacctn'}, {4:'sourcedate'}], links: [{2:3}]};
  //var tableObjects = [cofdaily, cmf, mktg];
  
  var cofJ = [
    {
      name: "cof",
      fieldNum: 1,
      fieldName: 'reg'
    },
    {
      name: "cof",
      fieldNum: 2,
      fieldName: 'shipton'
    }
  ];
  var cmfJ = [
    {
      name: "cmf",
      fieldNum: 2,
      fieldName: 'cmfacctn'
    },
    {
      name: "cmf",
      fieldNum: 3,
      fieldName: 'mktgacctn'
    }
  ]

  var tableObjects = [cofJ, cmfJ];
  if (!db.objectStoreNames.contains('tables')) {
  objectStore = db.createObjectStore('tables',  {keyPath: 'id'});
  
  //define index
  objectStore.createIndex('name', 'name', { unique: true});//, multiEntry: true 

  //doesn't look like indexing array is possible right now in indexeddb
  //objectStore.createIndex('fields', 'fields', { unique: false});

  for(var key in tableObjects) {
    //objectStore.put(tableObjects[key]);
    }
  //adds initial data (only once)
  //objectStore.put(cofJ)
  //objectStore.put(cmf)
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
  //readTable(db);
  //readAll(db);
  //readFields();
  //readAllFields(db);
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
       for(var key in cursor.value.fields) {
       console.log('Links: ' + JSON.stringify(cursor.value.fields[key]));
       }
       cursor.continue();
    } else {
      console.log('No more data');
    }
  };
}
function readAllFields(db) {
  var objectStore = db.transaction('tables').objectStore('tables');
   objectStore.openCursor().onsuccess = function (event) {
     var cursor = event.target.result;
     if (cursor) {
       for(var key in cursor.value.fields) {
       console.log(JSON.stringify(cursor.value.fields[key]));
       }
       cursor.continue();
    } else {
      console.log('No more data');
    }
  };
}

//using indexes (name) to read all (faster?)
function readFields () {
  var transaction = db.transaction(['tables'], 'readonly');
  var store = transaction.objectStore('tables');
  var index = store.index('name');
  //var request = index.get('cofdaily');
  var htmlOut = "";
  var htmlDiv = document.getElementById("tables");
  var getAllRequest = index.getAll();

  getAllRequest.onsuccess = function() {

    //loop through all the tables
    for(var i = 0; i < getAllRequest.result.length; i++) {
      //print the table name
      htmlOut += '</br></br>' + getAllRequest.result[i].name + '</br>';
      console.log("Table: " + getAllRequest.result[i].name)
      //loop through each fields array in table
      for(var j = 0; j < getAllRequest.result[i].fields.length; j++) { 
        //loop through each field in the array
        for(var key in getAllRequest.result[i].fields[j]) {
          //print the individual field
          htmlOut += getAllRequest.result[i].fields[j][key] + '</br>';
          console.log(getAllRequest.result[i].fields[j][key]);
        }
      }
    }
    htmlDiv.innerHTML = htmlOut;
  }

  /*
  request.onsuccess = function (e) {
    var result = e.target.result;
    if (result) {
      console.log(result)
    } else {
      console.log("no fields")
    }
  }
  */
}

