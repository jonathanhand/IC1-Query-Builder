let db;
let dbReq = indexedDB.open('myDatabase', 1);

dbReq.onupgradeneeded = function(event) {
  db = event.target.result;
  var objectStore;

  //define initial table values
  var cofdaily = [
    {
      tableName: "cofdaily",
      fieldNum: 1,
      fieldName: 'reg'
    },
    {
      tableName: "cofdaily",
      fieldNum: 2,
      fieldName: 'shipton'
    }
  ];

  var cmf = [{tableName: "cmf",fieldNum: 2,fieldName: 'cmfacctn'},{tableName: "cmf",fieldNum: 3,fieldName: 'mktgacct'}];
  var mktg = [{tableName: "mktg",fieldNum: 3,fieldName: 'mktgacct'},{tableName: "mktg",fieldNum: 4,fieldName: 'sourcedate'}];

  var tableObjects = [cofdaily, cmf, mktg];

  if (!db.objectStoreNames.contains('fields')) {
  objectStore = db.createObjectStore('fields',  {keyPath: "id", autoIncrement:true });
  
  //define index
  objectStore.createIndex('tableName_idx', 'tableName');
  objectStore.createIndex('fieldNum_idx', 'fieldNum');
  objectStore.createIndex('fieldName_idx', 'fieldName');

  //doesn't look like indexing array is possible right now in indexeddb
  //objectStore.createIndex('fields', 'fields', { unique: false});

  for(var key in tableObjects) {
    for (let i = 0; i < tableObjects[key].length; i++) {
      objectStore.put(tableObjects[key][i]);
      }
    }
  }
}

dbReq.onsuccess = function(event) {
  var db1 = dbReq.result;
  const table1 = document.getElementById("table1");
  const table2 = document.getElementById("table2");
  table1.addEventListener("change", function () {
    getTableFields(db1,table1.value, "table1ul");
    table2.disabled = false;
  });
  table2.addEventListener("change", function () {
    getTableFields(db1,table2.value, "table2ul");
    getTableLinks(db1, table1.value, table2.value)
  });
  fillDropdowns(db1,table1.value,table2.value);
  //getTableFields(db1);
  getField();
}

dbReq.onerror = function(event) {
  alert('error opening database ' + event.target.errorCode);
}
//TODO stopped on joing matching indexes

function getTableLinks(db1, table1, table2) {
  console.log(table1);
  console.log(table2);
  let transaction = db1.transaction("fields");
  let fields = transaction.objectStore("fields");
  //field name
  //let fieldIndex = fields.index("fieldName_idx") ;
  let tableIndex = fields.index("tableName_idx");
  //range of indexes
  var request = tableIndex.openCursor(IDBKeyRange.only(tn));
  request.onsuccess = function (event) {

    var cursor = event.target.result;
      if(cursor) {
        //console.log(cursor.value.fieldName)
        cursor.continue();
    } else {
      //console.log('Entries all displayed.');
    }
  }
}

function fillDropdowns(db1){
  const table1 = document.getElementById("table1");
  const table2 = document.getElementById("table2");
  let transaction = db1.transaction("fields");
  let fields = transaction.objectStore("fields");
  let tableNameIndex = fields.index("tableName_idx") ;

  var request = tableNameIndex.openCursor(IDBKeyRange.lowerBound(0), "nextunique");
  
  request.onsuccess = function (event) {
    var cursor = event.target.result;
      if(cursor) {
        //unique table names
        var opt1 = document.createElement("option");
        var opt2 = document.createElement("option");
        opt1.value = cursor.value.tableName
        opt1.innerHTML = cursor.value.tableName
        opt2.value = cursor.value.tableName
        opt2.innerHTML = cursor.value.tableName

        table1.appendChild(opt1)
        table2.appendChild(opt2)
        cursor.continue();
    } else {
      //console.log('Entries all displayed.');
    }
  }

}
function getTableFields(db1, tn, target) {
  var fieldArray = new Array()
  let transaction = db1.transaction("fields");
  let fields = transaction.objectStore("fields");
  //field name
  //let fieldIndex = fields.index("fieldName_idx") ;
  let tableIndex = fields.index("tableName_idx");
  //range of indexes
  var request = tableIndex.openCursor(IDBKeyRange.only(tn));

  request.onsuccess = function (event) {
    var ul = document.getElementById(target);
    ul.innerHTML = "";
    var cursor = event.target.result;
      if(cursor) {
        //console.log(cursor.value.fieldName)
        fieldArray.push(cursor.value.fieldName)
        cursor.continue();
    } else {
      //console.log('Entries all displayed.');
    }
    for(let i = 0; i < fieldArray.length; i++) {
      var list = document.createElement("li");
      list.innerHTML = fieldArray[i];
      ul.appendChild(list);
    }
  }

}
function getField () {
  db = event.target.result;
  let transaction = db.transaction("fields");
  let fields = transaction.objectStore("fields");
  //field name
  //let fieldIndex = fields.index("fieldName_idx") ;
  let fieldIndex = fields.index("fieldNum_idx") ;
  //range of indexes
  let request = fieldIndex.getAll(IDBKeyRange.lowerBound(3));

  var keyRangeValue = IDBKeyRange.bound(1, 3);

  fields.openCursor(keyRangeValue).onsuccess = function (event) {
    var cursor = event.target.result;
      if(cursor) {
        //console.log(cursor.value)
        cursor.continue();
    } else {
      //console.log('Entries all displayed.');
    }
  }

  request.onsuccess = function() {
    if (request.result !== undefined) {
      //console.log("fields", request.result); // array of books with price=10
    } else {
      console.log("No such fields");
    }
  }
}
//to add transactions to tables objectStore
function addTable () {
  
  let tx = db.transaction(['fields'], 'readwrite')
  .objectStore('fields')
  .add({fieldNum: 1, fieldName: 'reg', tableName: 'cofdaily'})
  

  //let table = {id: object.id, name: object.nm, fields: object.flds, links: object.lnks};
  //tableName.add(table);

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

function readAll() {
  var objectStore = db.transaction('fields').objectStore('fields');

   objectStore.openCursor().onsuccess = function (event) {
     var cursor = event.target.result;

     if (cursor) {
       console.log('Id: ' + cursor.key);
       console.log('Name: ' + cursor.value.tableName);
       console.log('fields: ' + cursor.value.fieldName);
       //for(var key in cursor.value.fields) {
       //console.log('Links: ' + JSON.stringify(cursor.value.fields[key]));
       //}
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
}

