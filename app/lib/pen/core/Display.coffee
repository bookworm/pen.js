Editor = require('lib/pen/core/Editor')        
class Display extends Editor          
  mover: null 
  code: null
  gutterDirty: null        
  displayOffset: null      
  lineDiv: null  
  gutterDisplay: null        
  lineSpace: null 
  targetDocument: null   
  showTo: 1
  showingFrom: 1
  
  updateDisplay: (changes, suppressCallback) ->
    unless @scroller.clientWidth
      @showingFrom = @showingTo = @displayOffset = 0
      return     
      
    visible = @visibleLines()        
    
    return if changes isnt true and changes.length is 0 and visible.from >= @showingFrom and visible.to <= @showingTo    
    
    from  = Math.max(visible.from - 100, 0)
    to    = Math.min(@doc.size, visible.to + 100)
    from  = @showingFrom if @showingFrom < from and from - @showingFrom < 20
    to    = Math.min(@doc.size, @showingTo) if @showingTo > to and @showingTo - to < 20        
     
    if changes is true 
      intact = []
    else  
      intact = 
        @computeIntact([
          from: @showingFrom
          to: @showingTo
          domStart: 0  
        ], changes)  
     
    intactLines = 0
    i           = 0
    while i += 1 < intact.length
      range = intact[i]     
      
      if range.from < from
        range.domStart += (from - range.from)
        range.from      = from       
        
      range.to = to if range.to > to    
      
      if range.from >= range.to
        intact.splice i--, 1
      else
        intactLines += range.to - range.from                              
            
    return if intactLines is to - from         
          
    intact.sort (a, b) ->
      a.domStart - b.domStart
    
    th = @textHeight()           
    
    gutterDisplay          = @gutter.style.display
    @lineDiv.style.display = @gutter.style.display = "none"     
    
    @patchDisplay from, to, intact
    @lineDiv.style.display = ""  
    
    different  = from isnt @showingFrom or to isnt @showingTo or @lastSizeC isnt @scroller.clientHeight + th
    @lastSizeC = @scroller.clientHeight + th if different   
    
    @showingFrom      = from
    @showingTo        = to
    @displayOffset    = @heightAtLine(@doc, from)                 
    
    @mover.style.top   = (@displayOffset * th) + "px"
    @code.style.height = (@doc.height * th + 2 * @paddingTop()) + "px" 
    
    # unless @lineDiv.childNodes.length is @showingTo - @showingFrom 
    #   throw new Error("BAD PATCH! " + JSON.stringify(intact) + " size=" + (@showingTo - @showingFrom) + " nodes=" + @lineDiv.childNodes.length)   
    
    if @options.lineWrapping  
      @maxWidth     = @scroller.clientWidth
      curNode       = @lineDiv.firstChild    
      heightChanged = false
      
      @doc.iter @showingFrom, @showingTo, (line) =>
        unless line.hidden
          height = Math.round(curNode.offsetHeight / th) or 1
          unless line.height is height
            @updateLineHeight line, height
            @gutterDirty = heightChanged = true
        curNode = curNode.nextSibling   
        
      if heightChanged
        @code.style.height = (@doc.height * th + 2 * @paddingTop()) + "px"   
    else
      @maxWidth = @stringWidth(@maxLine) unless @maxWidth?                  
      
      if @maxWidth > @scroller.clientWidth
        @lineSpace.style.width = @maxWidth + "px"        
        
        @code.style.width = ""
        @code.style.width = @scroller.scrollWidth + "px"
      else
        @lineSpace.style.width = @code.style.width = ""    
        
    @gutter.style.display = gutterDisplay     
    
    @updateGutter() if different or @gutterDirty
    @updateCursor()   
     
    @options.onUpdate this if not @suppressCallback and @options.onUpdate
    true      
    
  computeIntact: (intact, changes) ->       
    i = 0
    l = changes.length or 0
    while i < l
      change  = changes[i]
      intact2 = []
      diff    = change.diff or 0
      j       = 0
      l2      = intact.length

      while j < l2
        range = intact[j]
        if change.to <= range.from and change.diff
          intact2.push
            from: range.from + diff
            to: range.to + diff
            domStart: range.domStart
        else unless change.to <= range.from or change.from >= range.to
          if change.from > range.from
            intact2.push
              from: range.from
              to: change.from
              domStart: range.domStart
          if change.to < range.to
            intact2.push
              from: change.to + diff
              to: range.to + diff
              domStart: range.domStart + (change.to - range.from)
        ++j
      intact = intact2
      ++i
    intact     
    
  patchDisplay: (from, to, intact) =>    
    if !intact.length 
      @lineDiv.innerHTML = ""
    else
      killNode = (node) =>            
        tmp = node.nextSibling
        node.parentNode.removeChild node
        return tmp    
        
      domPos  = 0
      curNode = @lineDiv.firstChild     
      
      n = undefined
      i = 0

      while i < intact.length
        cur = intact[i]
        while cur.domStart > domPos
          curNode = killNode(curNode)
          domPos++       
          
        j = 0
        e = cur.to - cur.from

        while j < e
          curNode = curNode.nextSibling
          domPos++
          ++j
        ++i        
        
      curNode = killNode(curNode) while curNode   
      
    nextIntact = intact.shift()
    curNode    = @lineDiv.firstChild
    j          = from
    sfrom      = @sel.from.line
    sto        = @sel.to.line
    inSel      = sfrom < from and sto >= from
    scratch    = @targetDocument.createElement("div")
    newElt     = undefined        
           
    @doc.iter from, to, (line) =>      
      ch1 = null
      ch2 = null    
             
      if inSel
        ch1 = 0
        if sto is j
          inSel = false
          ch2   = @sel.to.ch
      else if sfrom is j
        if sto is j
          ch1 = @sel.from.ch
          ch2 = @sel.to.ch
        else
          inSel = true
          ch1   = @sel.from.ch                  
          
      nextIntact = intact.shift() if nextIntact and nextIntact.to is j   
      
      if not nextIntact or nextIntact.from > j
        if line.hidden
          scratch.innerHTML = "<pre></pre>"
        else
          scratch.innerHTML = line.getHTML(ch1, ch2, true, @tabText)         
        @lineDiv.insertBefore scratch.firstChild, curNode
      else
        curNode = curNode.nextSibling
      ++j 
      
module.exports = Display