class TextMarker 
  pen: null    
  set: []
  
  constructor: (pen, set) ->   
    @pen = pen
    @set = set   

  clear: @pen.operation(->  
    min = Infinity
    max = -Infinity
    i   = 0
    e   = @set.length

    while i < e
      line = @set[i]
      mk   = line.marked 
      
      if not mk or not line.parent  
        i++
        continue  
      
      lineN = @pen.lineNo(line)
      min   = Math.min(min, lineN)
      max   = Math.max(max, lineN)
      j     = 0
            
      while j < mk.length
        mk.splice j--, 1  if mk[j].set is @set
        ++j
      ++i      
      
    unless min is Infinity
      @pen.changes.push
        from: min
        to: max + 1
  )       
  
  find: -> 
    from = undefined
    to   = undefined
    i    = 0
    e    = @set.length

    while i < e
      line = @set[i]
      mk   = line.marked
      j    = 0

      while j < mk.length
        mark = mk[j]
        if mark.set is @set
          if mark.from? or mark.to?
            found = @pen.lineNo(line)
            if found?
              if mark.from?
                from =
                  line: found
                  ch: mark.from
              if mark.to?
                to =
                  line: found
                  ch: mark.to
        ++j
      ++i   
      
    from: from
    to: to  
    
module.exports = TextMarker