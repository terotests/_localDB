# _localDB - indexedDB wrapper

Some basic functions to easily add data to `indexedDB` database.

## Initializing the database

During DB creation you can specify which tables are initialized. The example below initializes two tables:

1. `folders` with keyPath as "name" 
2. `files` with autoincrement and indexing over key "folderName"


```javascript
var testDB = _localDB("index.testDb2",
    {
        tables : {
            folders : {
                createOptions : { keyPath : "name" }
            },
            files : {
                createOptions : { autoIncrement : true  },
                indexes : {
                    folderName : { unique: false }
                }
            }
        }
    });
```

## Getting the table and inserting data

To fetch the database table for manipulation

```javascript
   var tbl = testDB.table("folders"); // fetches the table "folders"
```


## Inserting rows to the table

```javascript
   var tbl = testDB.table("folders"); // fetches the table "folders"
   tbl.addRows([ { name : "foobar} ]).then( function() {
        // after the insert
   });
```

## Read all rows from the table

```javascript
   var tbl = testDB.table("folders"); // fetches the table "folders"
   tbl.getAll().then( function(data) {
        // the row data is here... 
        
   });
```

## Read rows with a single key filter

The `getAll()` can be given optional `{keyName : keyValue}` -filter, which works if you have defined the index for the key.

If the index is not defined error or exception is raised.

```javascript
   var tbl = testDB.table("files"); // fetches the table "folders"
   tbl.getAll({folderName : "foobar"}).then( function(data) {
        // the row data is here... 
        
   });
```

## Remove rows on table

Calling `remove()` will remove all rows on the table.

The `remove()` can be given optional `{keyName : keyValue}` -filter, which works if you have defined the index for the key.


```javascript
   var tbl = testDB.table("files"); // fetches the table "folders"
   tbl.remove({folderName : "foobar"}).then( function() {
        // all rows for key folderName == "foobar" should be removed
        
   });
```

## Read rows and remove them 


Calling `readAndDelete()` will read all rows on the table and remove them immediately.

The `readAndDelete()` can be given optional `{keyName : keyValue}` -filter, which works if you have defined the index for the key.


```javascript
   var tbl = testDB.table("files"); // fetches the table "folders"
   tbl.readAndDelete({folderName : "foobar"}).then( function(data) {
        // data is here
        // all rows for key folderName == "foobar" should be removed
        
   });
```

## Do generic cursor operation

If normal operations are not enough, you can initiate cursor action using `table._cursorAction`

You have to specify

1. mode of the operation (ie. readwrite, readonly)
2. optinal index (the value must be given
3. callback to receive the cursor

```javascript
   var tbl = testDB.table("files"); // fetches the table "folders"
   tbl._cursorAction("readwrite", {folderName : "foobar"}), function(cursor) {
        
        // Here do something with indexedDB cursor
        
   });
```

## Fetch value for single key

```javascript
   tbl.get("keyvalue").then( function(data) {
        // data is here
   });
```

## Setting key value and create key if not existing

```javascript
   tbl.update(keyName, keyData).then( function(data) {
        // done
   });
```

## Clear table form data

```javascript
   tbl.clear().then( function(data) {
        // done
   });
```


























   

 


   
#### Class _localDB


- [_initDB](README.md#_localDB__initDB)
- [clearDatabases](README.md#_localDB_clearDatabases)
- [getDB](README.md#_localDB_getDB)
- [table](README.md#_localDB_table)



   
    
    
    
##### trait _dataTrait

- [guid](README.md#_dataTrait_guid)
- [isArray](README.md#_dataTrait_isArray)
- [isFunction](README.md#_dataTrait_isFunction)
- [isObject](README.md#_dataTrait_isObject)


    
    


   
      
            
#### Class dbTable


- [_cursorAction](README.md#dbTable__cursorAction)
- [addRows](README.md#dbTable_addRows)
- [clear](README.md#dbTable_clear)
- [count](README.md#dbTable_count)
- [forEach](README.md#dbTable_forEach)
- [get](README.md#dbTable_get)
- [getAll](README.md#dbTable_getAll)
- [readAndDelete](README.md#dbTable_readAndDelete)
- [remove](README.md#dbTable_remove)
- [update](README.md#dbTable_update)



   
    
##### trait _dataTrait

- [guid](README.md#_dataTrait_guid)
- [isArray](README.md#_dataTrait_isArray)
- [isFunction](README.md#_dataTrait_isFunction)
- [isObject](README.md#_dataTrait_isObject)


    
    


   
      
    



      
    
      
    





   
# Class _localDB


The class has following internal singleton variables:
        
* _initDone
        
* _dbList
        
* _db
        
        
### <a name="_localDB__initDB"></a>_localDB::_initDB(t)


```javascript

if(_db) return;
// In the following line, you should include the prefixes of implementations you want to test.
_db = window.indexedDB; //  || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;

_initDone = true;

_dbList = _localDB( "sys.db", {
    tables : {
        databases : {
            createOptions : { keyPath : "name" },
        }
    }
});
```

### <a name="_localDB_clearDatabases"></a>_localDB::clearDatabases(fn)


```javascript
// console.log("Clear databases called ");

_dbList.then( function() {
  var dbs = _dbList.table("databases");
  // console.log(" --- reading --- ");
  dbs.forEach( function(data, cursor) {
     if(fn(data)) {
         // console.log("Trying to delete ", data.name);
         _db.deleteDatabase(data.name);
         cursor.delete();
     }       
  });

})
```

### <a name="_localDB_getDB"></a>_localDB::getDB(t)


```javascript
return this._db;
```

### _localDB::constructor( dbName, options )

```javascript

if(this._db) return;
this._initDB();

if(!dbName) {
    return;
}

var me = this;

var request = _db.open(dbName, 4);

request.onerror = function(event) {
  // Do something with request.errorCode!
  console.error( event.target.errorCode );
};
request.onsuccess = function(event) {
  // Do something with request.result!
  _dbList.then( function() {
      var dbs = _dbList.table("databases");
      dbs.addRows( [{ name : dbName }]);
  })
  me._db = event.target.result;
  me.resolve(true);
  
};
request.onupgradeneeded = function (event) {

    var db = event.target.result;
    me._db = db;

    if(options && options.tables) {
        for(var n in options.tables) {
            if(options.tables.hasOwnProperty(n)) {
                var opts = options.tables[n];
                // Create another object store called "names" with the autoIncrement flag set as true.    
                var objStore = db.createObjectStore(n, opts.createOptions);
                // objectStore.createIndex("name", "name", { unique: false });
                /*
                {
                   indexes {
                       field : { unique: false  }
                   }
                }
                */
                if(opts.indexes) {
                    for(var iName in opts.indexes) {
                        if(opts.indexes.hasOwnProperty(iName)) {
                            var iData = opts.indexes[iName];
                            objStore.createIndex(iName, iName, iData);
                        }
                    }
                }
                
            }
        }
    }

};

```
        
### <a name="_localDB_table"></a>_localDB::table(name)


```javascript
return dbTable(this._db, name);
```



   
    
    
    
## trait _dataTrait

The class has following internal singleton variables:
        
* _eventOn
        
* _commands
        
        
### <a name="_dataTrait_guid"></a>_dataTrait::guid(t)


```javascript

return Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15);

```

### <a name="_dataTrait_isArray"></a>_dataTrait::isArray(t)


```javascript
return Object.prototype.toString.call( t ) === '[object Array]';
```

### <a name="_dataTrait_isFunction"></a>_dataTrait::isFunction(fn)


```javascript
return Object.prototype.toString.call(fn) == '[object Function]';
```

### <a name="_dataTrait_isObject"></a>_dataTrait::isObject(t)


```javascript
return t === Object(t);
```


    
    


   
      
            
# Class dbTable


The class has following internal singleton variables:
        
        
### <a name="dbTable__cursorAction"></a>dbTable::_cursorAction(mode, usingIndex, actionFn)


```javascript

var prom = _promise();

var trans = this._db.transaction(this._table,  mode);
var store = trans.objectStore(this._table);
var cursorRequest;

if(usingIndex) {

    var singleKeyRange, indexName;
    
    // BUG or FEATURE: currently accepts only one key like
    // { folderName : "data" };
    for(var n in usingIndex) {
        if(usingIndex.hasOwnProperty(n)) {
             indexName = n; 
             singleKeyRange = IDBKeyRange.only(usingIndex[n]);
        }
    }
    
    if(indexName) {
        var index = store.index(indexName); // open using the index only
        cursorRequest = index.openCursor(singleKeyRange);
    } else {
        prom.reject("invalid index key");
        return;
    }
} else {
    cursorRequest = store.openCursor();
}

trans.oncomplete = function(evt) {  
    prom.resolve(true);
};

cursorRequest.onerror = function(error) {
    console.log(error);
};

cursorRequest.onsuccess = function(evt) {                    
    var cursor = evt.target.result;
    if (cursor) {
        actionFn(cursor);
        cursor.continue();
    }
};

return prom;
```

### <a name="dbTable_addRows"></a>dbTable::addRows(rows)


```javascript

var prom = _promise();

var transaction = this._db.transaction([this._table], "readwrite");

var me = this;
// Do something when all the data is added to the database.
transaction.oncomplete = function(event) {
  // console.log("Writing into "+me._table+" was successfull");
  prom.resolve(true);
};

transaction.onerror = function(event) {
  prom.reject(event);
};

var objectStore = transaction.objectStore(this._table);
for (var i in rows) {
  var request = objectStore.add(rows[i]);
  request.onsuccess = function(event) {
    // console.log("Row ",i," written succesfully");
  };
}

return prom;
```

### <a name="dbTable_clear"></a>dbTable::clear(t)


```javascript

var prom = _promise();
var transaction = this._db.transaction(this._table, "readwrite");
var objectStore = transaction.objectStore(this._table);
var request = objectStore.clear();
request.onerror = function(event) {
  prom.fail(event.target.errorCode);
};
request.onsuccess = function(event) {
  prom.resolve( true );
};

return prom;

```

### <a name="dbTable_count"></a>dbTable::count(t)


```javascript
var prom = _promise();
var transaction = this._db.transaction([this._table], "readonly");

transaction.objectStore(this._table).count().onsuccess = function(e) {
	prom.resolve(e.target.result);
};

return prom;

```

### <a name="dbTable_forEach"></a>dbTable::forEach(fn, usingIndex)


```javascript

return this._cursorAction("readonly", usingIndex, function(cursor) {
   fn(cursor.value, cursor);
});

```

### <a name="dbTable_get"></a>dbTable::get(key)


```javascript

var prom = _promise();
var transaction = this._db.transaction(this._table, "readonly");
var objectStore = transaction.objectStore(this._table);
var request = objectStore.get(key);

request.onerror = function(event) {
  // Handle errors!
  console.log("Could not get ", key);
  prom.fail(event.target.errorCode);
};
request.onsuccess = function(event) {
  prom.resolve( request.result );
};

return prom;
```

### <a name="dbTable_getAll"></a>dbTable::getAll(usingIndex)


```javascript

var items = [],
    me = this;

return _promise(
        function(result, fail) {
            me._cursorAction("readonly", usingIndex, function(cursor) {
               items.push(cursor.value); 
            }).then( function() {
                result(items);
            }).fail(fail);
        });

```

### dbTable::constructor( db, tableName )

```javascript

this._db = db;
this._table = tableName;

```
        
### <a name="dbTable_readAndDelete"></a>dbTable::readAndDelete(usingIndex)


```javascript
var items = [],
    me = this;

return _promise(
        function(result, fail) {
            me._cursorAction("readwrite", usingIndex, function(cursor) {
               items.push(cursor.value); 
               cursor.delete(); // remove the key and continue... 
            }).then( function() {
                result(items);
            }).fail(fail);
        });

```

### <a name="dbTable_remove"></a>dbTable::remove(usingIndex)
`usingIndex` optional : { keyName : valueString}
 


```javascript
var me = this;

return _promise(
        function(result, fail) {
            me._cursorAction("readwrite", usingIndex, function(cursor) {
               cursor.delete(); // remove the key and continue... 
            }).then( function() {
                result(true);
            }).fail(fail);
        });

```

### <a name="dbTable_update"></a>dbTable::update(key, data)


```javascript
var prom = _promise();
var me = this;
var transaction = this._db.transaction([this._table], "readwrite");
var objectStore = transaction.objectStore(this._table);
try {
    var request = objectStore.get(key);
    request.onerror = function(event) {
      if(!request.result) {
          me.addRows([data]).then( function() {
              prom.resolve(data);
          });
          return;
      }     
      prom.fail(event.target.errorCode);
    };
    request.onsuccess = function(event) {
      if(!request.result) {
          me.addRows([data]).then( function() {
              prom.resolve(data);
          });
          return;
      }
      var requestUpdate = objectStore.put(data);
      requestUpdate.onerror = function(event) {
         // Do something with the error
         prom.fail( "update failed " );
      };
      requestUpdate.onsuccess = function(event) {
         // Success - the data is updated!
         prom.resolve(data);
      };
      
    };
} catch(e) {
    return this.addRows( [data] );
}

return prom;
```



   
    
## trait _dataTrait

The class has following internal singleton variables:
        
* _eventOn
        
* _commands
        
        
### <a name="_dataTrait_guid"></a>_dataTrait::guid(t)


```javascript

return Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15);

```

### <a name="_dataTrait_isArray"></a>_dataTrait::isArray(t)


```javascript
return Object.prototype.toString.call( t ) === '[object Array]';
```

### <a name="_dataTrait_isFunction"></a>_dataTrait::isFunction(fn)


```javascript
return Object.prototype.toString.call(fn) == '[object Function]';
```

### <a name="_dataTrait_isObject"></a>_dataTrait::isObject(t)


```javascript
return t === Object(t);
```


    
    


   
      
    



      
    
      
    




