#!/usr/bin/env node

var r = require("rethinkdb")
var Query = require("./lib/query")
var pd = console.log.bind(console)


//var q = {where: {id: 1}}
//var q = {where: {id: {">": 1}}}
//var q = {where: null}
//var q = {limit: 1}
//var q = {where: {id: 1}, limit: 1}

r.connect((err, conn) => {
  Query.build(r.table("users"), q).run(conn, (err, result) => {
    result.toArray((err, result) => {
      pd(result)
    })
  })
})
