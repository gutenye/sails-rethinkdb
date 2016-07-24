const r = require("rethinkdb")
const utils = require("./utils")

/*
  Sails Query Language:     http://sailsjs.org/documentation/concepts/models-and-orm/query-language
  RethinkDB Query Language: http://rethinkdb.com/api/javascript
*/
module.exports = class Query {

  /* Build a RethinkDB query
   *
   * return a query like r.db("test").table("users").filter(v => v("name").eq("hello"))
   */
  static build(table, query) {
    return new Query(table).build(query)
  }

  constructor(table) {
    this.table = table
  }

  /**
   * Build
   *
   *  {
   *    where: x,
   *    limit: x,
   *    skip: x,
   *    sort: x,
   *    joins: x,
   *  }
   */
  build(query) {
    var t = this.table
    utils.forOwn(query, (value, key) => {
      switch (key) {
      case "where": t = this.buildWhere(t, value); break
      case "sort": t = this.buildSort(t, value); break
      case "skip": t = t.skip(parseInt(value)); break
      case "joins": t = this.buildJoins(t, value); break
      }
    })
    // limit must after sort
    if (query.hasOwnProperty("limit")) {
      t = this.buildLimit(t, query.limit)
    }
    return t
  }

  /**
   * Build Where
   *
   * null
   * {id: 1}
   */
  buildWhere(t, segment) {
    if (segment === null)
      return t
    // Improve Performance
    // {where: {id: x}}  -> use getAll(id) instead of filter({id})
    if (segment.id && Object.keys(segment).length === 1)
      return t.getAll(segment.id)
    pd(segment.id, Object.keys(segment).length)
    return t.filter(row => this.buildClause(row, segment))
  }

  /**
   * Build Clause
   *
   * <clause> ::= { <clause-pair>, ... }
   *
   * <clause-pair> ::= <field> : <expression>
   *                 | or|$or: [<clause>, ...]
   *                 | $and  : [<clause>, ...]
   *                 | $nor  : [<clause>, ...]
   *                 | like  : { <field>: <expression>, ... }
   *
   * {
   *   id : 1,
   *   or : [{id: "or"}, ...]
   * }
   */
  buildClause(row, segment) {
    var conditions = []
    utils.forOwn(segment, (value, key) => {
      switch (key) {
        case "or": conditions.push(this.buildOr(row, value)); break
        default: conditions.push(this.buildExpression(row, key, value))
        // TODO: and nor like
      }
    })
    return r.and(...conditions)
  }

  /**
   * Build or
   *
   * [{id: "or"}, ...]
   */
  buildOr(row, segment) {
    var conditions = segment.map(v => this.buildClause(row, v))
    return r.or(...conditions)
  }

  /**
   * Build Expression
   *
   * <expression> ::= { <modifier>: <value>, ... }
   *                | [<value>, ...] | {"!": [<value>, ...]}
   *                | <value>
   *
   *  "foo"
   *  {">": 25}         <, <=, >, >=, !, lessThan, lessThanOrEqual, greaterThan, greaterThanOrEqual, not, like, startsWith, endsWith
   *  ["a", "b"]
   */
  buildExpression(row, field, segment) {
    if (utils.isPlainObject(segment)) {
      var key = Object.keys(segment)[0]
      var value = segment[key]
      switch (key) {
        case "<": case "lessThan": return row(field).lt(value)
        case "<=": case "lessThanOrEqual": return row(field).le(value)
        case ">": case "greaterThan": return row(field).gt(value)
        case ">=": case "greaterThanOrEqual": return row(field).ge(value)
        case "!": case "not": return row(field).ne(value)
        case "contains": return row(field).contains(...value)
        // TODO: like, startsWith, endsWidth
      }

    } else if (utils.isArray(segment)) {
      // TODO: in operator

    } else {
      return row(field).eq(segment)
    }
  }


  /**
   * Build Sort
   *
   * {age: 1, name: -1}    default is 1, -1 is DESC
   */
  buildSort(t, value) {
    var orders = []
    utils.forOwn(value, (v, k) => {
      orders.push(v === 1 ? r.asc(k) : r.desc(k))
    })
    return t.orderBy(...orders)
  }

  /**
   * Build Limit
   *
   * 10 "10" 0
   *
   */
  buildLimit(t, value) {
    value = parseInt(value)
    if (value === 0)
      return t
    return t.limit(value)
  }


  /*
   *
   *  users = {
   *    posts: {
   *       collection: "posts",
   *       via: "userId"
   *    }
   *  }
   *
   *  posts = {
   *    userId: {
   *      model: "users"
   *    }
   *  }
   *
   * user hasMany posts
   *
   *  [{ collection: true, model: false, alias: "posts", child: "posts", childKey: "userId"
   *     parent: 'users', parentKey: 'id', select: [ 'id', 'createdAt', 'updatedAt', 'user' ], removeParentKey: false, criteria: {where: {}} }] }
   *
   * post belongsTo user
   *
   *  [{ model: true, collection: false, alias: "user", child: "users", childKey: "id"
   *     parent: 'posts', parentKey: 'userId', alias: 'user', removeParentKey: true}]
   *
   * users many-to-many tags
   *
   *  [{ collection: true, model: false, alias: "tags", child: 'tags_users__users_tags', childKey: 'users_tags'
   *     parent: 'users', parentKey: 'id', select: false, removeParentKey: false}
   *   { junctionTable: true, collection: true, model: false, alias: "tags", child: 'tags', childKey: 'id'
   *     parent: 'tags_users__users_tags', parentKey: 'tags_users', select: ['id', 'users', 'createdAt', 'updatedAt'], removeParentKey: false, criteria: {where: {}}} ] }
   *
   * populate("users").populate("tags")
   *
   *  [ hasMany,
   *    many-to-many
   *
   */
  buildJoins(t, value) {
    return t.merge(row => {
      var query = {}
      value.forEach(v => {
        // belongsTo
        if (v.model) {
          query[v.alias] = r.table(v.child).get(row(v.parentKey))
        }

        // hasMany
        else if (v.collection && !v.junctionTable) {
          query[v.alias] = r.table(v.child).getAll(row("id"), {index: v.childKey}).coerceTo("array")
        }

        // many-to-many
        else if (v.junctionTable) {
          query[v.alias] = query[v.alias].map(a => r.table(v.child).get(a(v.parentKey)))
        }
      })

      return query
    })
  }
}
