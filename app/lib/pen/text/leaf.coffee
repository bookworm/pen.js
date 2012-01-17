class LeafChunk    
  lines: null
  parent: null
  height: 0
  
  constructor: (lines) ->     
    @lines  = lines
    @parent = null
    i       = 0
    e       = lines.length
    height  = 0

    while i < e
      lines[i].parent = this
      height += lines[i].height
      ++i  
      
    @height = height     

  chunkSize: ->  
    @lines.length

  remove: (at, n, callbacks) -> 
    i = at
    e = at + n

    while i < e
      line     = @lines[i]
      @height -= line.height
      line.cleanUp()
      if line.handlers
        j = 0

        while j < line.handlers.length
          callbacks.push line.handlers[j]
          ++j
      ++i
    @lines.splice at, n

  collapse: (lines) ->
    lines.splice.apply lines, [lines.length, 0].concat(@lines)

  insertHeight: (at, lines, height) ->
    @height += height
    @lines.splice.apply @lines, [at, 0].concat(lines)           
    
    i = 0
    e = lines.length
    while i < e
      lines[i].parent = this
      ++i

  iterN: (at, n, op) ->   
    e = at + n
    while at < e
      return false if op(@lines[at]) is false 
      ++at    
      
    return true   
      
module.exports = LeafChunk  