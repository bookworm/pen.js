Display = require('lib/pen/core/Display')        
class Cursor extends Display        
  goalColumn: null     
  displayOffset: 0   
  inputDiv: null
  input: null  
  leaveInputAlone: null         
  scroller: null  
  cursor: null
  
  setCursorF: (line, ch, user) ->      
    pos = @clipPos(
      line: line
      ch: ch or 0
    )
    if user 
      @setSelectionUser(pos, pos) 
    else 
      @setSelectionF(pos, pos)        

  clipLine: (n) ->          
    Math.max 0, Math.min(n, @doc.size - 1)    

  clipPos: (pos) ->  
    if pos.line < 0
      return (
        line: 0
        ch: 0
      )       
      
    if pos.line >= @doc.size
      return (
        line: @doc.size - 1
        ch: @getLine(@doc.size - 1).text.length
      )       
      
    ch      = pos.ch
    linelen = @getLine(pos.line).text.length       
    
    if not ch? or ch > linelen
      line: pos.line
      ch: linelen
    else if ch < 0
      line: pos.line
      ch: 0
    else
      pos            

  findPosH: (dir, unit) ->     
    end     = (if @sel.inverted then @sel.from else @sel.to)
    line    = end.line
    ch      = end.ch
    lineObj = @getLine(line)
    
    findNextLine = =>  
      l = line + dir
      e = (if dir < 0 then -1 else @doc.size)

      while l isnt e
        lo = @getLine(l)
        unless lo.hidden
          line    = l
          lineObj = lo
          return true
        l += dir      
        
    moveOnce = (boundToLine) =>
      if ch is (if dir < 0 then 0 else lineObj.text.length)
        if not boundToLine and findNextLine()
          ch = (if dir < 0 then lineObj.text.length else 0)
        else
          return false
      else
        ch += dir
      true       
    
    if unit is "char"
      moveOnce()
    else if unit is "column"
      moveOnce(true)
    else if unit is "word"
      sawWord = false
      loop
        break unless moveOnce() if dir < 0
        if @isWordChar(lineObj.text.charAt(ch))
          sawWord = true
        else if sawWord
          if dir < 0
            dir = 1
            moveOnce()
          break
        break unless moveOnce() if dir > 0    
        
    line: line
    ch: ch        

  moveHF: (dir, unit) ->      
    pos = (if dir < 0 then @sel.from else @sel.to)
    pos = @findPosH(dir, unit) if @shiftSelecting or @posEq(@sel.from, @sel.to)
    @setCursor pos.line, pos.ch, true   

  deleteHF: (dir, unit) ->   
    unless @posEq(@sel.from, @sel.to)
      @replaceRange "", @sel.from, @sel.to
    else if dir < 0
      @replaceRange "", @findPosH(dir, unit), @sel.to
    else
      @replaceRange "", @sel.from, @findPosH(dir, unit)               
      
    @userSelChange = true  

  moveVF: (dir, unit) ->    
    dist = 0            
    
    pos   = @localCoords((if @sel.inverted then @sel.from else @sel.to), true)
    pos.x = @goalColumn if @goalColumn?  
          
    
    if unit is "page"
      dist = @scroller.clientHeight
    else 
      dist = @textHeight() if unit is "line"     
    
    target = @coordsCharF(pos.x, pos.y + dist * dir + 2)           
    @setCursor target.line, target.ch, true     
    
    @goalColumn = pos.x
  
  localCoords: (pos, inLineWrap) ->  
    console.trace()
      
    x   = undefined
    lh  = @textHeight()   
    
    y   = @heightAtLine(@doc, pos.line)        
    
    if pos.ch is 0
      x = 0
    else
      sp = @measureLine(@getLine(pos.line), pos.ch)
      x  = sp.left
      y += Math.max(0, sp.top) if @options.lineWrapping
      
    x: x
    y: y
    yBot: y + lh         

  coordsCharF: (x, y) =>       
    
    y  = 0 if y < 0
    th = @textHeight()
    cw = @charWidth()    
    
    heightPos = @displayOffset + Math.floor(y / th)
    lineNo    = @lineAtHeight(@doc, heightPos)    
    
    if lineNo >= @doc.size
      return (
        line: @doc.size - 1
        ch: @getLine(@doc.size - 1).text.length
      )          
      
    lineObj  = @getLine(lineNo)
    text     = lineObj.text
    tw       = @options.lineWrapping  
    
    innerOff = (if tw then heightPos - @heightAtLine(@doc, lineNo) else 0)      
    
    if x <= 0 and innerOff is 0
      return (
        line: lineNo
        ch: 0
      )
    
    getX = (len) =>  
      sp = @measureLine(lineObj, len)
      if tw
        off_ = Math.round(sp.top / th)
        return Math.max(0, sp.left + (off_ - innerOff) * @scroller.clientWidth)
      sp.left     
  
      
    from  = 0
    fromX = 0
    to    = text.length
    toX   = undefined  
    
    estimated = Math.min(to, Math.ceil((x + innerOff * @scroller.clientWidth * .9) / cw))   
    
    loop
      estX = getX(estimated)
      unless estX <= x and estimated < to
        toX = estX
        to  = estimated
        break 
        
    if x > toX
      return (
        line: lineNo
        ch: to
      )                              
      
    estimated = Math.floor(to * 0.8)
    estX      = getX(estimated)  
    
    if estX < x
      from  = estimated
      fromX = estX     
            
    loop
      if to - from <= 1
        return (
          line: lineNo
          ch: (if (toX - x > x - fromX) then from else to)
        )             
        
      middle  = Math.ceil((from + to) / 2)
      middleX = getX(middle)    
      
      if middleX > x
        to  = middle
        toX = middleX
      else
        from  = middle
        fromX = middleX        
        
  pageCoords: (pos) ->     
    local = @localCoords(pos, true)
    off_  = @eltOffset(@lineSpace)  
    
    x: off_.left   + local.x
    y: off_.top    + local.y
    yBot: off_.top + local.yBot        

  posFromMouse: (e, liberal) ->
    offW = @eltOffset(@scroller, true)
    x    = undefined
    y    = undefined    
    
    try
      x = e.clientX
      y = e.clientY
    catch e
      return null
      
    return null if not liberal and (x - offW.left > @scroller.clientWidth or y - offW.top > @scroller.clientHeight)
    
    offL = @eltOffset(@lineSpace, true)
    @coordsCharF x - offL.left, y - offL.top   

  onContextMenu: (e) =>      
    pos = @posFromMouse(e)        

    return if not pos or window.opera  

    @operate(setCursor) pos.line, pos.ch if @posEq(@sel.from, @sel.to) or @posLess(pos, @sel.from) or not @posLess(pos, @sel.to)

    oldCSS                   = @input.style.cssText
    @inputDiv.style.position = "absolute"
    @input.style.cssText     = "position: fixed; width: 30px; height: 30px; top: " + (e.clientY - 5) + "px; left: " + (e.clientX - 5) + "px; z-index: 1000; background: white; " + "border-width: 0; outline: none; overflow: hidden; opacity: .05; filter: alpha(opacity=5);"

    @leaveInputAlone = true   

    val = @input.value = @getSelection()       

    @focusInput()
    @input.select()   
    
    rehide = =>  
      newVal = @splitLines(@input.value).join("\n")
      @operation(@replaceSelection) newVal, "end" unless newVal is val     
      
      @inputDiv.style.position = "relative"
      @input.style.cssText     = oldCSS
      @leaveInputAlone         = false                         
      
      @resetInput true
      @slowPoll()  
    
    if @gecko
      @e_stop e
      mouseup = @connect(window, "mouseup", =>
        mouseup()
        setTimeout rehide, 20
      , true)
    else
      setTimeout rehide, 50    

  restartBlink: =>       
    clearInterval @blinker    
    
    on_ = true
    @cursorDiv.style.visibility = "" 
    
    @blinker = setInterval(=>
      @cursorDiv.style.visibility = (if (on_ = not on_) then "" else "hidden")
    , 650)    

  editEnd: (from, to) ->     
    return (if from then from.length else 0) unless to
    return to.length unless from    
    
    i = from.length
    j = to.length

    while i >= 0 and j >= 0
      break  unless from.charAt(i) is to.charAt(j)
      --i
      --j
    j + 1    

  indexOf: (collection, elt) ->  
    return collection.indexOf(elt) if collection.indexOf  
    
    i = 0
    e = collection.length

    while i < e
      return i if collection[i] is elt
      ++i
    -1  

  isWordChar: (ch) ->  
    /\w/.test(ch) or ch.toUpperCase() isnt ch.toLowerCase()  

  getCursor: (start) ->    
    start = @sel.inverted unless start?
    @copyPos (if start then @sel.from else @sel.to)    

module.exports = Cursor