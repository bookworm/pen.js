class Delayed
  id: null 
     
  constructor: ->
    # Empty Constructor
    
  set: (ms, f) ->   
    clearTimeout @id
    @id = setTimeout(f, ms)           

module.exports = Delayed