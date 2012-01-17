LeafChunk = require('lib/pen/text/leaf')
class BranchChunk    
  children: undefined
  size: undefined
  height: undefined
  parent: null     
  collaspe: null
  
  constructor: (children) ->     
    @children = children      
    
    size   = 0
    height = 0
    i      = 0
    e      = children.length

    while i < e
      ch        = children[i]
      size     += ch.chunkSize()
      height   += ch.height
      ch.parent = this
      ++i   
      
    @size   = size
    @height = height
    @parent = null 
                    
  chunkSize: ->  
    @size

  remove: (at, n, callbacks) ->    
    @size -= n
    i      = 0
    while i < @children.length
      child = @children[i]
      sz    = child.chunkSize() 
      
      if at < sz
        rm        = Math.min(n, sz - at)
        oldHeight = child.height
        child.remove at, rm, callbacks
        @height -= oldHeight - child.height
        if sz is rm
          @children.splice i--, 1
          child.parent = null
        break if (n -= rm) is 0
        at = 0
      else
        at -= sz
      ++i    
      
    if @size - n < 25
      lines = []
      @collapse lines
      @children = [new LeafChunk(lines)]

  collapse: (lines) ->       
    i = 0   
    e = @children.length

    while i < e
      @children[i].collapse lines
      ++i

  insert: (at, lines) ->   
    height = 0
    i      = 0
    e      = lines.length
    while i < e
      height += lines[i].height
      ++i   
      
    @insertHeight at, lines, height

  insertHeight: (at, lines, height) ->    
    @size     += lines.length
    @height   += height
    i          = 0
    e          = @children.length

    while i < e
      child = @children[i]
      sz    = child.chunkSize() 
      
      if at <= sz
        child.insertHeight at, lines, height
        if child.lines and child.lines.length > 50
          while child.lines.length > 50
            spilled       = child.lines.splice(child.lines.length - 25, 25)
            newleaf       = new LeafChunk(spilled)
            child.height -= newleaf.height   
            
            @children.splice i + 1, 0, newleaf
            newleaf.parent = this
          @maybeSpill()
        break
      at -= sz
      ++i

  maybeSpill: ->   
    return if @children.length <= 10    
    
    me = this      
    
    loop
      spilled = me.children.splice(me.children.length - 5, 5)
      sibling = new BranchChunk(spilled)
      unless me.parent
        copy        = new BranchChunk(me.children)
        copy.parent = me
        me.children = [ copy, sibling ]
        me = copy
      else
        me.size   -= sibling.size
        me.height -= sibling.height
        myIndex    = @pen.indexOf(me.parent.children, me)
        me.parent.children.splice myIndex + 1, 0, sibling    
        
      sibling.parent = me.parent
      break unless me.children.length > 10 
      
    me.parent.maybeSpill()

  iter: (from, to, op) -> 
    @iterN from, to - from, op

  iterN: (at, n, op) ->    
    i = 0        
    e = @children.length    
    while i < e   
      child = @children[i]
      sz    = child.chunkSize()  
      
      if at < sz
        used = Math.min(n, sz - at)
        return true if child.iterN(at, used, op)
        break if (n -= used) is 0
        at = 0
      else
        at -= sz
      ++i  
      
module.exports = BranchChunk  