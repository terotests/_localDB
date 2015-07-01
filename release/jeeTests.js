// The code template begins here
'use strict';

(function () {

  var __amdDefs__ = {};

  // The class definition is here...
  var _localDB_prototype = function _localDB_prototype() {
    // Then create the traits and subclasses for this class here...

    // trait comes here...

    (function (_myTrait_) {
      var _eventOn;
      var _commands;

      // Initialize static variables here...

      /**
       * @param float t
       */
      _myTrait_.guid = function (t) {

        return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      };

      /**
       * @param float t
       */
      _myTrait_.isArray = function (t) {
        return Object.prototype.toString.call(t) === '[object Array]';
      };

      /**
       * @param float fn
       */
      _myTrait_.isFunction = function (fn) {
        return Object.prototype.toString.call(fn) == '[object Function]';
      };

      /**
       * @param float t
       */
      _myTrait_.isObject = function (t) {
        return t === Object(t);
      };
    })(this);

    // the subclass definition comes around here then

    // The class definition is here...
    var dbTable_prototype = function dbTable_prototype() {
      // Then create the traits and subclasses for this class here...

      // trait comes here...

      (function (_myTrait_) {
        var _eventOn;
        var _commands;

        // Initialize static variables here...

        /**
         * @param float t
         */
        _myTrait_.guid = function (t) {

          return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        };

        /**
         * @param float t
         */
        _myTrait_.isArray = function (t) {
          return Object.prototype.toString.call(t) === '[object Array]';
        };

        /**
         * @param float fn
         */
        _myTrait_.isFunction = function (fn) {
          return Object.prototype.toString.call(fn) == '[object Function]';
        };

        /**
         * @param float t
         */
        _myTrait_.isObject = function (t) {
          return t === Object(t);
        };
      })(this);

      (function (_myTrait_) {

        // Initialize static variables here...

        /**
         * @param float mode
         * @param float usingIndex
         * @param float actionFn
         */
        _myTrait_._cursorAction = function (mode, usingIndex, actionFn) {

          var prom = _promise();

          var trans = this._db.transaction(this._table, mode);
          var store = trans.objectStore(this._table);
          var cursorRequest;

          if (usingIndex) {

            var singleKeyRange, indexName;

            // BUG or FEATURE: currently accepts only one key like
            // { folderName : "data" };
            for (var n in usingIndex) {
              if (usingIndex.hasOwnProperty(n)) {
                indexName = n;
                singleKeyRange = IDBKeyRange.only(usingIndex[n]);
              }
            }

            if (indexName) {
              var index = store.index(indexName); // open using the index only
              cursorRequest = index.openCursor(singleKeyRange);
            } else {
              prom.reject('invalid index key');
              return;
            }
          } else {
            cursorRequest = store.openCursor();
          }

          trans.oncomplete = function (evt) {
            prom.resolve(true);
          };

          cursorRequest.onerror = function (error) {
            console.log(error);
          };

          cursorRequest.onsuccess = function (evt) {
            var cursor = evt.target.result;
            if (cursor) {
              actionFn(cursor);
              cursor['continue']();
            }
          };

          return prom;
        };

        /**
         * @param float rows
         */
        _myTrait_.addRows = function (rows) {

          var prom = _promise();

          var transaction = this._db.transaction([this._table], 'readwrite');

          var me = this;
          // Do something when all the data is added to the database.
          transaction.oncomplete = function (event) {
            // console.log("Writing into "+me._table+" was successfull");
            prom.resolve(true);
          };

          transaction.onerror = function (event) {
            prom.reject(event);
          };

          var objectStore = transaction.objectStore(this._table);
          for (var i in rows) {
            var request = objectStore.add(rows[i]);
            request.onsuccess = function (event) {};
          }

          return prom;
        };

        /**
         * @param float t
         */
        _myTrait_.clear = function (t) {

          var prom = _promise();
          var transaction = this._db.transaction(this._table, 'readwrite');
          var objectStore = transaction.objectStore(this._table);
          var request = objectStore.clear();
          request.onerror = function (event) {
            prom.fail(event.target.errorCode);
          };
          request.onsuccess = function (event) {
            prom.resolve(true);
          };

          return prom;
        };

        /**
         * @param float t
         */
        _myTrait_.count = function (t) {
          var prom = _promise();
          var transaction = this._db.transaction([this._table], 'readonly');

          transaction.objectStore(this._table).count().onsuccess = function (e) {
            prom.resolve(e.target.result);
          };

          return prom;
        };

        /**
         * @param function fn
         * @param float usingIndex
         */
        _myTrait_.forEach = function (fn, usingIndex) {

          return this._cursorAction('readonly', usingIndex, function (cursor) {
            fn(cursor.value, cursor);
          });
        };

        /**
         * @param float key
         */
        _myTrait_.get = function (key) {

          var prom = _promise();
          var transaction = this._db.transaction(this._table, 'readonly');
          var objectStore = transaction.objectStore(this._table);
          var request = objectStore.get(key);

          request.onerror = function (event) {
            // Handle errors!
            console.log('Could not get ', key);
            prom.fail(event.target.errorCode);
          };
          request.onsuccess = function (event) {
            prom.resolve(request.result);
          };

          return prom;
        };

        /**
         * @param float usingIndex
         */
        _myTrait_.getAll = function (usingIndex) {

          var items = [],
              me = this;

          return _promise(function (result, fail) {
            me._cursorAction('readonly', usingIndex, function (cursor) {
              items.push(cursor.value);
            }).then(function () {
              result(items);
            }).fail(fail);
          });
        };

        if (_myTrait_.__traitInit && !_myTrait_.hasOwnProperty('__traitInit')) _myTrait_.__traitInit = _myTrait_.__traitInit.slice();
        if (!_myTrait_.__traitInit) _myTrait_.__traitInit = [];
        _myTrait_.__traitInit.push(function (db, tableName) {

          this._db = db;
          this._table = tableName;
        });

        /**
         * @param float usingIndex
         */
        _myTrait_.readAndDelete = function (usingIndex) {
          var items = [],
              me = this;

          return _promise(function (result, fail) {
            me._cursorAction('readwrite', usingIndex, function (cursor) {
              items.push(cursor.value);
              cursor['delete'](); // remove the key and continue...
            }).then(function () {
              result(items);
            }).fail(fail);
          });
        };

        /**
         * @param Object usingIndex  - optional : { keyName : valueString}
         */
        _myTrait_.remove = function (usingIndex) {
          var me = this;

          return _promise(function (result, fail) {
            me._cursorAction('readwrite', usingIndex, function (cursor) {
              cursor['delete'](); // remove the key and continue...
            }).then(function () {
              result(true);
            }).fail(fail);
          });
        };

        /**
         * @param float key
         * @param float data
         */
        _myTrait_.update = function (key, data) {
          var prom = _promise();
          var me = this;
          var transaction = this._db.transaction([this._table], 'readwrite');
          var objectStore = transaction.objectStore(this._table);
          try {
            var request = objectStore.get(key);
            request.onerror = function (event) {
              if (!request.result) {
                me.addRows([data]).then(function () {
                  prom.resolve(data);
                });
                return;
              }
              prom.fail(event.target.errorCode);
            };
            request.onsuccess = function (event) {
              if (!request.result) {
                me.addRows([data]).then(function () {
                  prom.resolve(data);
                });
                return;
              }
              var requestUpdate = objectStore.put(data);
              requestUpdate.onerror = function (event) {
                // Do something with the error
                prom.fail('update failed ');
              };
              requestUpdate.onsuccess = function (event) {
                // Success - the data is updated!
                prom.resolve(data);
              };
            };
          } catch (e) {
            return this.addRows([data]);
          }

          return prom;
        };
      })(this);
    };

    var dbTable = function dbTable(a, b, c, d, e, f, g, h) {
      var m = this,
          res;
      if (m instanceof dbTable) {
        var args = [a, b, c, d, e, f, g, h];
        if (m.__factoryClass) {
          m.__factoryClass.forEach(function (initF) {
            res = initF.apply(m, args);
          });
          if (typeof res == 'function') {
            if (res._classInfo.name != dbTable._classInfo.name) return new res(a, b, c, d, e, f, g, h);
          } else {
            if (res) return res;
          }
        }
        if (m.__traitInit) {
          m.__traitInit.forEach(function (initF) {
            initF.apply(m, args);
          });
        } else {
          if (typeof m.init == 'function') m.init.apply(m, args);
        }
      } else return new dbTable(a, b, c, d, e, f, g, h);
    };
    // inheritance is here

    dbTable._classInfo = {
      name: 'dbTable'
    };
    dbTable.prototype = new dbTable_prototype();

    (function (_myTrait_) {
      var _initDone;
      var _dbList;
      var _db;

      // Initialize static variables here...

      /**
       * @param float t
       */
      _myTrait_._initDB = function (t) {

        if (_db) return;
        // if you want experimental support, enable browser based prefixes
        _db = window.indexedDB; //  || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;

        _initDone = true;

        _dbList = _localDB('sys.db', {
          tables: {
            databases: {
              createOptions: {
                keyPath: 'name'
              } }
          }
        });
      };

      /**
       * @param float fn
       */
      _myTrait_.clearDatabases = function (fn) {

        _dbList.then(function () {
          var dbs = _dbList.table('databases');
          dbs.forEach(function (data, cursor) {
            if (fn(data)) {
              _db.deleteDatabase(data.name);
              cursor['delete']();
            }
          });
        });
      };

      /**
       * @param float t
       */
      _myTrait_.getDB = function (t) {
        return this._db;
      };

      if (_myTrait_.__traitInit && !_myTrait_.hasOwnProperty('__traitInit')) _myTrait_.__traitInit = _myTrait_.__traitInit.slice();
      if (!_myTrait_.__traitInit) _myTrait_.__traitInit = [];
      _myTrait_.__traitInit.push(function (dbName, options) {

        if (this._db) return;
        this._initDB();

        if (!dbName) {
          return;
        }

        var me = this;

        var request = _db.open(dbName, 4);

        request.onerror = function (event) {
          // Do something with request.errorCode!
          console.error(event.target.errorCode);
        };
        request.onsuccess = function (event) {
          // Do something with request.result!
          _dbList.then(function () {
            var dbs = _dbList.table('databases');
            dbs.addRows([{
              name: dbName
            }]);
          });
          me._db = event.target.result;
          me.resolve(true);
        };
        request.onupgradeneeded = function (event) {

          var db = event.target.result;
          me._db = db;

          if (options && options.tables) {
            for (var n in options.tables) {
              if (options.tables.hasOwnProperty(n)) {
                var opts = options.tables[n];
                // Create another object store called "names" with the autoIncrement flag set as true.   
                var objStore = db.createObjectStore(n, opts.createOptions);

                if (opts.indexes) {
                  for (var iName in opts.indexes) {
                    if (opts.indexes.hasOwnProperty(iName)) {
                      var iData = opts.indexes[iName];
                      objStore.createIndex(iName, iName, iData);
                    }
                  }
                }
              }
            }
          }
        };
      });

      /**
       * @param float name
       */
      _myTrait_.table = function (name) {
        return dbTable(this._db, name);
      };
    })(this);
  };

  var _localDB = function _localDB(a, b, c, d, e, f, g, h) {
    var m = this,
        res;
    if (m instanceof _localDB) {
      var args = [a, b, c, d, e, f, g, h];
      if (m.__factoryClass) {
        m.__factoryClass.forEach(function (initF) {
          res = initF.apply(m, args);
        });
        if (typeof res == 'function') {
          if (res._classInfo.name != _localDB._classInfo.name) return new res(a, b, c, d, e, f, g, h);
        } else {
          if (res) return res;
        }
      }
      if (m.__traitInit) {
        m.__traitInit.forEach(function (initF) {
          initF.apply(m, args);
        });
      } else {
        if (typeof m.init == 'function') m.init.apply(m, args);
      }
    } else return new _localDB(a, b, c, d, e, f, g, h);
  };
  // inheritance is here

  _localDB._classInfo = {
    name: '_localDB'
  };
  _localDB.prototype = new _localDB_prototype();

  if (typeof define !== 'undefined' && define !== null && define.amd != null) {
    define(__amdDefs__);
  }
}).call(new Function('return this')());

// console.log("Row ",i," written succesfully");