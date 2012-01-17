Frontend = require('lib/pen/core/Frontend')  
class Events extends Frontend     
  wrapper: null 
  updateInput: null
  focused: null 
  code: null
  mover: null    
  gutterText: null      
  dragAndDrop: false     
  lineSpace: null   
  targetDocument: null 
  draggingText: false  
  updateInput: false
  
  onMouseDown: (e) =>              
    @setShift @e_prop(e, "shiftKey")
    n = @e_target(e)

    while n isnt @wrapper
      return if n.parentNode is @code and n isnt @mover
      n = n.parentNode     
      
    n = @e_target(e)
    
    while n isnt @wrapper
      if n.parentNode is @gutterText
        @options.onGutterClick this, @indexOf(@gutterText.childNodes, n) + @showingFrom, e if @options.onGutterClick
        return @e_preventDefault(e)
      n = n.parentNode   
       
    start = @posFromMouse(e) 
    
    switch @e_button(e)
      when 3
        @onContextMenu e if @gecko and not @mac
        return
      when 2
        @setCursor start.line, start.ch, true if start
        return
        
    unless start
      @e_preventDefault e if @e_target(e) is @scroller
      return          
                        
    @onFocus() unless @focused  
    
    now = +new Date      
    
    if @lastDoubleClick and @lastDoubleClick.time > now - 400 and @posEq(@lastDoubleClick.pos, start)
      @e_preventDefault e
      setTimeout @focusInput, 20
      return @selectLine(start.line)
    else if @lastClick and @lastClick.time > now - 400 and @posEq(@lastClick.pos, start)
      @lastDoubleClick =
        time: now
        pos: start

      @e_preventDefault e
      return @selectWordAt(start)
    else
      @lastClick =
        time: now
        pos: start
        
    last  = start
    going = undefined         
    
    if @dragAndDrop and not @options.readOnly and not @posEq(@sel.from, @sel.to) and not @posLess(start, @sel.from) and not @posLess(@sel.to, start)
      @lineSpace.draggable = true if @webkit 
      
      up = @connect(@targetDocument, "mouseup", @operation((e2) =>
        @lineSpace.draggable = false if @webkit
        @draggingText        = false       
        
        up()   
        
        if Math.abs(e.clientX - e2.clientX) + Math.abs(e.clientY - e2.clientY) < 10
          @e_preventDefault e2
          @setCursor start.line, start.ch, true
          @focusInput()
      ), true)  
      
      @draggingText = true     
      
      return      
      
    @e_preventDefault e
    @setCursor start.line, start.ch, true     
    
    extend = (e) =>
      cur = @posFromMouse(e, true)
      if cur and not @posEq(cur, last)
        @onFocus() unless @focused 
        
        last = cur
        @setSelectionUser start, cur  
        
        @updateInput = false
        visible      = @visibleLines()  
        
        if cur.line >= visible.to or cur.line < visible.from
          going = setTimeout(@operation(->
            extend e
          ), 150)    
          ss
    
    move = @connect(@targetDocument, "mousemove", @operation((e) =>
      clearTimeout going
      @e_preventDefault e
      extend e
    ), true)    
    
    up = @connect(@targetDocument, "mouseup", @operation((e) =>      
      clearTimeout going
      cur = @posFromMouse(e)        
      
      @setSelectionUser start, cur  if cur
      @e_preventDefault e  
      
      @focusInput()      
      
      @updateInput = true 
      
      move()
      up()
    ), true) 

  onDoubleClick: (e) =>       
    n = @e_target(e)

    while n isnt @wrapper
      return @e_preventDefault(e) if n.parentNode is @gutterText
      n = n.parentNode    
      
    start = @posFromMouse(e) 
    
    return unless start   
    
    @lastDoubleClick =
      time: +new Date
      pos: start

    @e_preventDefault e
    @selectWordAt start  

  onDrop: (e) =>   
    e.preventDefault()        
    
    pos   = @posFromMouse(e, true)
    files = e.dataTransfer.files 
    
    return if not pos or @options.readOnly           
    
    if files and files.length and window.FileReader and window.File
      loadFile = (file, i) =>
        reader = new FileReader
        reader.onload = =>
          text[i] = reader.result
          if ++read is n
            pos = @clipPos(pos)
            @operation(->
              end = @replaceRange(text.join(""), pos, pos)
              @setSelectionUser pos, end
            )()

        reader.readAsText file   
        
      n    = files.length
      text = Array(n)
      read = 0
      i    = 0

      while i < n
        loadFile files[i], i
        ++i
    else
      try
        @text = e.dataTransfer.getData("Text")
        if @text
          end     = @replaceRange(@text, pos, pos)
          curFrom = @sel.from
          curTo   = @sel.to  
          
          @setSelectionUser pos, end
          @replaceRange "", curFrom, curTo  if @draggingText
          @focusInput()     

  onDragStart: (e) =>  
    txt = @getSelection()
    @htmlEscape txt        
    
    e.dataTransfer.setDragImage @escapeElement, 0, 0
    e.dataTransfer.setData "Text", txt         

  onFocus: (e) =>
    return if @options.readOnly 
    
    unless @focused
      @options.onFocus this if @options.onFocus
      @focused = true
      @wrapper.className += " Pen-focused" if @wrapper.className.search(/\Pen-focused\b/) is -1
      @resetInput true unless @leaveInputAlone   
      
    @slowPoll()
    @restartBlink()   

  onBlur: (e) => 
    if @focused
      @options.onBlur this if @options.onBlur
      @focused = false   
      
      if @bracketHighlighted
        @operation(->
          if @bracketHighlighted
            @bracketHighlighted()
            @bracketHighlighted = null
        )()  
        
      @wrapper.className = @wrapper.className.replace(" Pen-focused", "")    
        
    clearInterval @blinker
    
    setTimeout (->
      @shiftSelecting = null unless @focused
    ), 150         

  stopMethod: =>
    @e_stop this  

  addStop: (event) =>
    event.stop = @stopMethod unless event.stop
    event           

  e_preventDefault: (e) =>
    if e.preventDefault
      e.preventDefault()
    else
      e.returnValue = false   

  e_stopPropagation: (e) =>
    if e.stopPropagation
      e.stopPropagation()
    else
      e.cancelBubble = true  

  e_stop: (e) =>
    @e_preventDefault e
    @e_stopPropagation e 

  e_target: (e) =>
    e.target or e.srcElement  

  e_button: (e) =>
    if e.which
      e.which
    else if e.button & 1
      1
    else if e.button & 2
      3
    else 2 if e.button & 4  
  
  e_prop: (e, prop) ->
    (if e.override then e.override[prop] else e[prop])   
      
  dragAndDrop: =>
    return false if /MSIE [1-8]\b/.test(navigator.userAgent)
    div = document.createElement("div")
    "draggable" of div
  
module.exports = Events