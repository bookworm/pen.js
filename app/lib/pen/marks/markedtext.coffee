class MarkedText 
  from: null
  to: null
  style: null
  set: null  
  pen: null
  
  constructor: (pen, from, to, className, set) ->  
    @pen   = pen
    @from  = from
    @to    = to
    @style = className
    @set   = set  
  
  attach: (line) ->        
    @set.push line

  detach: (line) -> 
    ix = @pen.indexOf(@set, line)
    @set.splice ix, 1  if ix > -1

  split: (pos, lenBefore) -> 
    return null if @to <= pos and @to?
    from = (if @from < pos or not @from? then null else @from - pos + lenBefore)
    to   = (if not @to? then null else @to - pos + lenBefore)   
    
    new MarkedText(@pen, from, to, @style, @set)

  dup: -> 
    new MarkedText(@pen, null, null, @style, @set)

  clipTo: (fromOpen, from, toOpen, to, diff) ->  
    @from = Math.max(to, @from) + diff if @from? and @from >= from
    @to   = (if to < @to then @to + diff else from) if @to? and @to > from
    @from = null if fromOpen and to > @from and (to < @to or not @to?)
    @to   = null if toOpen and (from < @to or not @to?) and (from > @from or not @from?)

  isDead: ->
    @from? and @to? and @from >= @to

  sameSet: (x) ->
    @set is x.set     

module.exports = MarkedText