Events = require('lib/pen/core/Events')
class Lines extends Events 
  gutterDirty: false 
  n: null
  history: null  
  old: []         
  scroller: null
  doc: null
  code: null
  sel: null     
  tabText: "" 
  textChanged: null    
  recomputeMaxLength: false       
  work: null   
  tempId: Math.floor(Math.random() * 0xffffff).toString(16)         
  
  lineSep: "\n"
  (->     
    te       = document.createElement("textarea")
    te.value = "foo\nbar"
    @lineSep  = "\r\n" if te.value.indexOf("\r") > -1
  )()

  updateLineHeight: (line, height) -> 
    @gutterDirty = true 
    
    diff = height - line.height
    @n   = line

    while @n
      @n.height += diff
      @n         = n.parent    

  updateLines: (from, to, newText, selFrom, selTo) =>    
    return if @suppressEdits       
    
    if @history
      old = []
      @doc.iter from.line, to.line + 1, (line) ->
        old.push line.text
      
      @history.addChange from.line, newText.length, old  
      @history.done.shift() while @history.done.length > @options.undoDepth 
      
    @updateLinesNoUndo from, to, newText, selFrom, selTo       

  updateLinesNoUndo: (from, to, newText, selFrom, selTo) =>
    Line = require('lib/pen/text/line')      
    
    return if @suppressEdits
                                   
    recomputeMaxLength = false    
    maxLineLength      = @maxLine.length   
        
    unless @options.lineWrapping
      @doc.iter from.line, to.line, (line) =>   
        if line.text.length is maxLineLength
          recomputeMaxLength = true
          true            
          
    @gutterDirty = true if from.line isnt to.line or newText.length > 1
    nlines       = to.line - from.line
    firstLine    = @getLine(from.line)
    lastLine     = @getLine(to.line)        
                                   
    if from.ch is 0 and to.ch is 0 and newText[newText.length - 1] is ""
      added    = []
      prevLine = null   
      
      if from.line
        prevLine = @getLine(from.line - 1)
        prevLine.fixMarkEnds lastLine
      else
        lastLine.fixMarkStarts()     
        
      i = 0
      e = newText.length - 1
    
      while i < e
        added.push Line.inheritMarks(this, newText[i], prevLine)
        ++i        
        
      @doc.remove from.line, nlines, @callbacks if nlines
      @doc.insert from.line, added if added.length      
    else if firstLine is lastLine
      if newText.length is 1
        firstLine.replace from.ch, to.ch, newText[0]
      else
        lastLine = firstLine.split(to.ch, newText[newText.length - 1])       
        
        firstLine.replace from.ch, null, newText[0]
        firstLine.fixMarkEnds lastLine    
        
        added = []   
        
        i = 1
        e = newText.length - 1
        while i < e
          added.push Line.inheritMarks(this, newText[i], firstLine)
          ++i           
          
        added.push lastLine   
        @doc.insert from.line + 1, added
    else if newText.length is 1
      firstLine.replace from.ch, null, newText[0]
      lastLine.replace null, to.ch, ""
      firstLine.append lastLine
      @doc.remove from.line + 1, nlines, @callbacks
    else
      added = []
      firstLine.replace from.ch, null, newText[0]
      lastLine.replace null, to.ch, newText[newText.length - 1]
      firstLine.fixMarkEnds lastLine  
      
      i = 1
      e = newText.length - 1
      while i < e
        added.push Line.inheritMarks(this, newText[i], firstLine)
        ++i          
        
      @doc.remove from.line + 1, nlines - 1, @callbacks if nlines > 1
      @doc.insert from.line + 1, added     
          
    if @options.lineWrapping           
      perLine = @scroller.clientWidth / @charWidth() - 3       
      
      @doc.iter from.line, from.line + newText.length, (line) =>            
        return if line.hidden
        guess = Math.ceil(line.text.length / perLine) or 1
        @updateLineHeight line, guess unless guess is line.height
    else
      @doc.iter from.line, i + newText.length, (line) =>           
        return unless line
        l = line.text                
        if l.length > maxLineLength
          @maxLine            = l
          maxLineLength       = l.length
          @maxWidth           = null
          recomputeMaxLength  = false
    
      if recomputeMaxLength
        maxLineLength  = 0
        @maxLine       = ""
        @maxWidth      = null
        
        @doc.iter 0, @doc.size, (line) =>    
          l = line.text       
          if l.length > maxLineLength
            maxLineLength = l.length
            @maxLine      = l     
     
    newWork = []
    lendiff = newText.length - nlines - 1       
    
    if @work
      i       = 0
      l       = @work.length    
    
      while i < l
        task = @work[i]
        if task < from.line
          newWork.push task
        else newWork.push task + lendiff if task > to.line
        ++i         
      
    hlEnd = from.line + Math.min(newText.length, 500)    
    @highlightLines from.line, hlEnd   
    
    newWork.push hlEnd  
    
    @work = newWork   
                   
    @startWorker 100     
    
    @changes.push
      from: from.line
      to: to.line + 1
      diff: lendiff
    
    changeObj =
      from: from
      to: to
      text: newText
    
    if @textChanged
      cur = @textChanged
    
      while cur.next
        cur = cur.next
      cur.next = changeObj
    else
      @textChanged = changeObj 
    
    updateLine = (n) =>                 
      (if n <= Math.min(to.line, to.line + lendiff) then n else n + lendiff) 
                                                
    @setSelectionF selFrom, selTo, updateLine(@sel.from.line), updateLine(@sel.to.line)        
    @code.style.height = (@doc.height * @textHeight() + 2 * @paddingTop()) + "px"    

  unredoHelper: (from, to) ->      
    change = from.pop()  
    
    if change
      replaced = []
      end      = change.start + change.added    
      
      @doc.iter change.start, end, (line) ->
        replaced.push line.text

      to.push
        start: change.start
        added: change.old.length
        old: replaced

      pos = @clipPos(
        line: change.start + change.old.length - 1
        ch: @editEnd(replaced[replaced.length - 1], change.old[change.old.length - 1])
      )  
      
      @updateLinesNoUndo
        line: change.start
        ch: 0
      ,
        line: end - 1
        ch: @getLine(end - 1).text.length
      , change.old, pos, pos 
      
      @updateInput = true

  undoF: ->    
    @unredoHelper @history.done, @history.undone  

  redoF: ->  
    @unredoHelper @history.undone, @history.done  

  visibleLines: -> 
    lh          = @textHeight()
    top         = @scroller.scrollTop - @paddingTop()
    from_height = Math.max(0, Math.floor(top / lh))
    to_height   = Math.ceil((top + @scroller.clientHeight) / lh)  
    
    from: @lineAtHeight(@doc, from_height)
    to: @lineAtHeight(@doc, to_height)      

  changeLine: (handle, op) -> 
    no_   = handle
    line  = handle   
    
    if typeof handle is "number"
      line = @getLine(@clipLine(handle))
    else
      no_ = @lineNo(handle)    
      
    return null unless no_?   
    
    if op(line, no_)
      @changes.push
        from: no_
        to: no_ + 1
    else
      return null    
      
    line     

  setLineClassF: (handle, className) ->         
    @changeLine handle, (line) =>      
      unless line.className is className
        line.className = className
        true          

  setLineHidden: (handle, hidden) ->  
    @changeLine handle, (line, no_) =>       
      unless line.hidden is hidden
        line.hidden = hidden
        @updateLineHeight line, (if hidden then 0 else 1)
        @setSelectionF @skipHidden(@sel.from, @sel.from.line, @sel.from.ch), @skipHidden(@sel.to, @sel.to.line, @sel.to.ch)  if hidden and (@sel.from.line is no_ or @sel.to.line is no_)
        @gutterDirty = true   

  lineInfo: (line) =>       
    if typeof line is "number"
      return null unless @isLine(line)     
      
      n    = line
      line = @getLine(line)      
      
      return null unless line
    else
      n = @lineNo(line)
      return null unless n?   
      
    marker = line.gutterMarker
    
    line: n
    handle: line
    text: line.text
    markerText: marker and marker.text
    markerClass: marker and marker.style
    lineClass: line.className   

  measureLine: (line, ch) ->   
    extra = ""                 
    
    if @options.lineWrapping
      end   = line.text.indexOf(" ", ch + 2)
      extra = @htmlEscape(line.text.slice(ch + 1, (if end < 0 then line.text.length else end + (if @ie then 5 else 0))))     
      
    @measure.innerHTML = "<pre>" + line.getHTML(null, null, false, @tabText, ch) + "<span id=\"Pen-temp-" + @tempId + "\">" + @htmlEscape(line.text.charAt(ch) or " ") + "</span>" + extra + "</pre>"
    
    elt  = document.getElementById("Pen-temp-" + @tempId)
    top  = elt.offsetTop
    left = elt.offsetLeft
    
    if @ie and ch and top is 0 and left is 0
      backup           = document.createElement("span")
      backup.innerHTML = "x"
      elt.parentNode.insertBefore backup, elt.nextSibling
      top = backup.offsetTop  
      
    top: top
    left: left             
    
  findStartLine: (n) -> 
    minindent = undefined
    minline   = undefined    
    
    search    = n
    lim       = n - 40
    while search > lim
      return 0 if search is 0   
      
      line = @getLine(search - 1)   
      
      return search if line.stateAfter    
      
      indented = line.indentation(@options.tabSize) 
      
      if not minline? or minindent > indented
        minline   = search - 1
        minindent = indented
      --search 
      
    minline            

  getStateBefore: (n) ->       
    start = @findStartLine(n)
    state = start and @getLine(start - 1).stateAfter    
    
    unless state
      state = @startState(@mode)
    else
      state = @copyState(@mode, state) 
    
    @doc.iter start, n, (line) =>
      line.highlight @mode, state, @options.tabSize
      line.stateAfter = @copyState(@mode, state)

    if start < n
      @changes.push
        from: start
        to: n  
        
    @work.push n if n < @doc.size and not @getLine(n).stateAfter  
    
    state           

  highlightLines: (start, end) =>    
    state = @getStateBefore(start) 
        
    @doc.iter start, end, (line) =>           
      line.highlight @mode, state, @options.tabSize 
      line.stateAfter = @copyState(@mode, state)       

  highlightWorker: ->      
    end          = +new Date + @options.workTime
    foundWork    = @work.length      
    @showingFrom = 0 unless @showingFrom    
    
    while @work.length     
      
      unless @getLine(@showingFrom).stateAfter
        task = @showingFrom
      else
        task = @work.pop()       
        
      continue if task >= @doc.size     
                
      start = @findStartLine(task)
      state = start and @getLine(start - 1).stateAfter     
      
      if state       
        state = @copyState(@mode, state)
      else   
        state = @startState(@mode)      
      
      unchanged  = 0
      compare    = @mode.compareStates
      realChange = false    
      
      i    = start
      bail = false     
      @doc.iter i, @doc.size, (line) =>
        hadState = line.stateAfter 
        
        if +new Date > end
          @work.push i
          @startWorker @options.workDelay
          if realChange
            @changes.push
              from: task
              to: i + 1
          return (bail = true)
          
        changed         = line.highlight(@mode, state, @options.tabSize)
        realChange      = true if changed
        line.stateAfter = @copyState(@mode, state)     
        
        if compare
          return true if hadState and compare(hadState, state)
        else
          if changed isnt false or not hadState
            unchanged = 0
          else return true if ++unchanged > 3 and (not @mode.indent or @mode.indent(hadState, "") is @mode.indent(state, ""))
        ++i
      
      return if bail   
      
      if realChange
        @changes.push
          from: task
          to: i + 1   
                                
    @options.onHighlightComplete this if foundWork and @options.onHighlightComplete  

  startWorker: (time) ->    
    return unless @work.length       
    @highlight.set time, @operation(@highlightWorker)     

  getLineAt: (chunk, n) ->  
    until chunk.lines    
      i = 0
      loop
        child = chunk.children[i]
        sz    = child.chunkSize()
        if n < sz
          chunk = child
          break
        n -= sz
        ++i    
        
    chunk.lines[n]   

  splitLines: (string) => 
    
    if string.length == 0 or not string
      return [""]
    else if "\n\nb".split(/\n/).length isnt 3
      pos    = 0
      nl     = undefined
      result = []      
    
      while (nl = string.indexOf("\n", pos)) > -1
        result.push string.slice(pos, (if string.charAt(nl - 1) is "\r" then nl - 1 else nl))
        pos = nl + 1        
      
      result.push string.slice(pos)
      result           
              
    else
      result = string.split /\r?\n/ 
    
    return result  

  getLineText: (line) ->      
    @getLineAt(@doc, line).text if @isLine(line)    
    
  getLine: (line) ->        
    @getLineAt(@doc, line) if @isLine(line)

  getLineHandle: (line) ->    
    @getLine line if @isLine(line)

  onDeleteLine: (line, f) =>  
    if typeof line is "number"
      return null unless @isLine(line)
      line = @getLine(line)     
      
    (line.handlers or (line.handlers = [])).push f
    line

  lineCount: ->  
    @doc.size

  lineNo: (line) -> 
    return null unless line.parent?  
    
    cur   = line.parent
    no_   = @indexOf(cur.lines, line)     
    
    chunk = cur.parent
    while chunk
      i = 0
      e = chunk.children.length

      loop
        break if chunk.children[i] is cur
        no_ += chunk.children[i].chunkSize()
        ++i   
        
      cur   = chunk
      chunk = chunk.parent  
      
    no_        

  lineAtHeight: (chunk, h) ->     
    n = 0
    loop  
      breakloop1 = false
      i = 0
      e = chunk.children.length

      while i < e
        child = chunk.children[i]
        ch    = child.height
        if h < ch
          chunk = child
          breakloop1 = true; break
        h -= ch
        n += child.chunkSize()
        ++i    
      return n    
      continue unless breakLoop1  
      break unless not chunk.lines   
      
    i = 0
    e = chunk.lines.length

    while i < e
      line = chunk.lines[i]
      lh   = line.height
      break if h < lh
      h -= lh
      ++i
    n + i       

  heightAtLine: (chunk, n) ->        

    h = 0
    loop      
      breakloop1 = false
      i = 0
      e = chunk.children.length

      while i < e
        child = chunk.children[i]
        sz    = child.chunkSize()
        if n < sz
          chunk = child
          breakloop1 = true; break
        n -= sz
        h += child.height
        ++i   
      continue unless breakloop1
      break unless not chunk.lines   
      
    i = 0  
    
    while i < n  
      h += chunk.lines[i].height
      ++i  
      
    return h   
    
module.exports = Lines