require('lib/setup')

Spine    = require('spine')
jQuery   = require("jqueryify"); 
$ = jQuery  

class App
  go: ->
    Pen = require("lib/pen/main") 
    pen = new Pen($('#editor'), worktime: 100)      
    return 'joe'
        
module.exports = App