class Bookmark  
  line: null
  from: null
  to: null 
  pen: null
  
  consructor: (pen, pos) -> 
    @pen   = pen
    @from  = pos
    @to    = pos
    @line  = null  
                          
  attach: (line) ->     
    @line = line

  detach: (line) ->  
    @line = null if @line is line

  split: (pos, lenBefore) ->   
    if pos < @from
      @from = @to = (@from - pos) + lenBefore
      this

  isDead: ->     
    @from > @to

  clipTo: (fromOpen, from, toOpen, to, diff) ->    
    if (fromOpen or from < @from) and (toOpen or to > @to)
      @from = 0
      @to   = -1
    else @from = @to = Math.max(to, @from) + diff if @from > from

  sameSet: (x) ->       
    false

  find: ->      
    return null if not @line or not @line.parent
    line: @pen.lineNo(@line)
    ch: @from

  clear: -> 
    if @line
      found = @pen.indexOf(@line.marked, this)
      @line.marked.splice found, 1  unless found is -1
      @line = null 
    
module.exports = Bookmark    