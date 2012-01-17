Selection = require('lib/pen/text/Selection')        
class Editor extends Selection          
  pollingFast: false
  prevInput: ""   
  poll: null      
  changed: null
  missed: null   
  overwrite: false
  input: null
  focused: false    
  missed: false 
  leaveInputAlone: false  
  cursor: null
  rect: null    
  scroller: null         
  mover: null     
  targetDocument: null
  gutter: null            
  lineSpace: null
  gutterDirty: null        
  scrolled: false
  
  slowPoll: =>      
    return if @pollingFast          
    
    @poll.set @options.pollInterval, =>  
      @startOperation()   
      @readInput()    
      @slowPoll() if @focused     
      @endOperation()    

  fastPoll: =>       
    missed       = false
    @pollingFast = true         
    
    p = =>
      @startOperation()       
      
      changed = @readInput()
      if not changed and not missed
        missed = true
        @poll.set 60, p
      else
        @pollingFast = false
        @slowPoll()
      @endOperation()    
      
    @poll.set 20, p   

  readInput: =>      
    return false if @leaveInputAlone or not @focused or @hasSelection(@input) or @options.readOnly       
    
    text = @input.value
    return false if text is @prevInput   
    
    @shiftSelecting = null
    same = 0
    l    = Math.min(@prevInput.length, text.length)        
    
    ++same while same < l and @prevInput[same]is text[same]   
    
    if same < @prevInput.length
      @sel.from =
        line: @sel.from.line
        ch: @sel.from.ch - (@prevInput.length - same)
    else if @overwrite and @posEq(@sel.from, @sel.to)
      @sel.to =
        line: @sel.to.line
        ch: Math.min(@getLine(@sel.to.line).text.length, @sel.to.ch + (text.length - same))    
        
    @replaceSelection text.slice(same), "end"
    @prevInput = text
    true     

  resetInput: (user) =>      
    unless @posEq(@sel.from, @sel.to)
      @prevInput   = ""
      @input.value = @getSelection()
      @input.select()
    else @prevInput = @input.value = "" if user     

  focusInput: ->    
    @input.focus(this) unless @options.readOnly

  scrollEditorIntoView: =>      
    return unless @cursor.getBoundingClientRect 
    
    rect = @cursor.getBoundingClientRect()    
    
    return if @ie and rect.top is rect.bottom
    winH = window.innerHeight or Math.max(document.body.offsetHeight, document.documentElement.offsetHeight)
    @cursor.scrollIntoView() if rect.top < 0 or rect.bottom > winH      

  scrollCursorIntoView: =>        
    @cursor = @localCoords((if @sel.inverted then @sel.from else @sel.to))
    x = (if @options.lineWrapping then Math.min(@cursor.x, @lineSpace.offsetWidth) else @cursor.x)          
    
    @scrollIntoView x, @cursor.y, x, @cursor.yBot            

  scrollIntoView: (x1, y1, x2, y2) ->     
    pl = @paddingLeft()
    pt = @paddingTop()
    lh = @textHeight()      
    
    y1 += pt
    y2 += pt
    x1 += pl
    x2 += pl     
    
    screen    = @scroller.clientHeight
    screentop = @scroller.scrollTop
    scrolled  = false
    result    = true  
    
    if y1 < screentop
      @scroller.scrollTop = Math.max(0, y1 - 2 * lh)
      scrolled = true
    else if y2 > screentop + screen
      @scroller.scrollTop = y2 + lh - screen
      scrolled = true   
      
    screenw    = @scroller.clientWidth
    screenleft = @scroller.scrollLeft
    gutterw    = (if @options.fixedGutter then @gutter.clientWidth else 0) 
    
    if x1 < screenleft + gutterw
      x1 = 0  if x1 < 50
      @scroller.scrollLeft = Math.max(0, x1 - 10 - gutterw)
      scrolled = true
    else if x2 > screenw + screenleft - 3
      @scroller.scrollLeft = x2 + 10 - screenw
      scrolled = true
      result = false if x2 > @code.clientWidth   
      
    @options.onScroll this if scrolled and @options.onScroll    
    
    result

  updateGutter: ->  
    return if not @options.gutter and not @options.lineNumbers 
    
    hText   = @mover.offsetHeight
    hEditor = @scroller.clientHeight        
    
    @gutter.style.height = (if hText - hEditor < 2 then hEditor else hText) + "px"
    html = []
    i    = @showingFrom     
        
    @doc.iter @showingFrom, Math.max(@showingTo, @showingFrom + 1), (line) =>   
      if line.hidden
        html.push "<pre></pre>"
      else
        marker = line.gutterMarker
        text   = (if @options.lineNumbers then i + @options.firstLineNumber else null)
        
        if marker and marker.text
          text = marker.text.replace("%N%", (if text? then text else ""))
        else text = " "  unless text?      
        
        html.push (if marker and marker.style then "<pre class=\"" + marker.style + "\">" else "<pre>"), text
        j = 1

        while j < line.height
          html.push "<br/>&#160;"
          ++j    
          
        html.push "</pre>"
      ++i

    @gutter.style.display = "none"
    @gutterText.innerHTML = html.join("")  
    
    minwidth  = String(@doc.size).length
    firstNode = @gutterText.firstChild   
    
    val  = @eltText(firstNode)
    pad  = ""
    pad += " " while val.length + pad.length < minwidth   
    
    firstNode.insertBefore @targetDocument.createTextNode(pad), firstNode.firstChild if pad    
    
    @gutter.style.display       = ""
    @lineSpace.style.marginLeft = @gutter.offsetWidth + "px"
    @gutterDirty                = false     

  updateCursor: ->             
    head = (if @sel.inverted then @sel.from else @sel.to)       
    
    lh      = @textHeight()
    pos     = @localCoords(head, true)       
    console.log 'head'   
    console.log head
    console.log 'end head'
    wrapOff = @eltOffset(@wrapper)
    lineOff = @eltOffset(@lineDiv)   
    
    @inputDiv.style.top = (pos.y + lineOff.top - wrapOff.top) + "px"
    @inputDiv.style.left = (pos.x + lineOff.left - wrapOff.left) + "px"     
    
    if @posEq(@sel.from, @sel.to)
      @cursorDiv.style.top     = pos.y + "px"
      @cursorDiv.style.left    = (if @options.lineWrapping then Math.min(pos.x, @lineSpace.offsetWidth) else pos.x) + "px"
      @cursorDiv.style.display = ""
    else
      @cursorDiv.style.display = "none"
      
module.exports = Editor