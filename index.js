const Connection = require("./lib/connection")
const debug = require("debug")("sails-rethinkdb")

module.exports = (function() {
  var connections = {}

  var adapter = {
    // Which type of primary key is used by default
    pkFormat: 'string',
    // Without it, find("a") -> {where: {id: NaN}}
    // With it: find(1) -> {where: {id: "1"}}

    // to track schema internally
    syncable: true,

    defaults: {
      schema: false
    },

    /**
     * Register A Connection
     *
     * Will open up a new connection using the configuration provided and store the DB
     * object to run commands off of. This creates a new pool for each connection config.
     */
    registerConnection(options, tables, cb) {
      if(!options.identity) return cb(new Error('Connection is missing an identity.'))
      if(connections[options.identity]) return cb(new Error('Connection is already registered.'))

      Connection.connect(options, tables, (err, connection) => {
        if (err) return cb(err)
        connections[options.identity] = connection
        cb()
      })
    },

    /**
     * Fired when a model is unregistered, typically when the server
     * is killed. Useful for tearing-down remaining open connections,
     * etc.
     */
    // Teardown a Connection
    teardown(conn, cb) {
      if (typeof conn === 'function') {
        cb = conn
        conn = null
      }
      if (!conn) {
        connections = {}
        return cb()
      }
      if(!connections[conn]) return cb()
      connections[conn].close(() => {
        delete connections[conn]
      })
      cb()
    },

    /**
     * Native
     *
     * Give access to a native mongo table object for running custom
     * queries.
     */
    native(connectionName, tableName, cb) {
      cb(null, connections[connectionName].tables[tableName].table)
    },

    /**
     * Create
     *
     * Insert a single document into a collection.
     */
    create(connectionName, tableName, data, cb) {
      debug("create", tableName, data)
      connections[connectionName].tables[tableName].insert(data, cb)
    },

    /**
     * Create Each
     *
     * Insert an array of documents into a collection.
     */
    createEach: function(connectionName, tableName, data, cb) {
      debug("createEach", tableName, data)
      connections[connectionName].tables[tableName].insertEach(data, cb)
    },

    /**
     * Find
     *
     * Find all matching documents in a colletion.
     */
    find(connectionName, tableName, query, cb) {
      debug("find", tableName, query)
      connections[connectionName].tables[tableName].find(query, cb)
    },

    /**
     * Update
     *
     * Update all documents matching a criteria object in a collection.
     */
    update(connectionName, tableName, query, data, cb) {
      debug("update", tableName, query)
      connections[connectionName].tables[tableName].update(query, data, cb)
    },

    /**
     * Destroy
     *
     * Destroy all documents matching a criteria object in a collection.
     */
    destroy(connectionName, tableName, query, cb) {
      debug("destroy", tableName, query)
      connections[connectionName].tables[tableName].destroy(query, cb)
    },

    /**
     * Count
     *
     * Return a count of the number of records matching a criteria.
     */
    count(connectionName, tableName, query, cb) {
      debug("count", tableName, query)
      connections[connectionName].tables[tableName].count(query, cb)
    },

    /** TODO
     * Join
     *
     * Peforms a join between 2-3 mongo collections when Waterline core
     * needs to satisfy a `.populate()`.
     */
    join(connectionName, tableName, query, cb) {
      // {where: null, joins: [{ parent: 'users', parentKey: 'id', child: 'posts', childKey: 'user', select: [Object], alias: 'posts', removeParentKey: false, model: false, collection: true, q: [Object] }] }
      debug("join %o %o %o", tableName, query, query.joins[0].select, query.joins[0].criteria)
      connections[connectionName].tables[tableName].join(query, cb)
    },


    /** TODO
     * Stream
     *
     * Stream one or more documents from the collection
     * using where, limit, skip, and order
     * In where: handle `or`, `and`, and `like` queries
     */
    //stream(connectionName, tableName, query, stream) {
    //},
  }

  return adapter
})()
