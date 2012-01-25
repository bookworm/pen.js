Lines = require('lib/pen/text/Lines')        
class Text extends Lines        
  cachedHeight: undefined
  cachedHeightFor: undefined
  measureText: undefined
  cachedWidth: undefined
  cachedWidthFor: 0      
  doc: null              
  mode: null
  updateInput: false   
  gutterDirty: false
  gutter: null
  lineDiv: null    
  wrapper: null
  scroller: null 
  updateDisplay: false  
   
  matching =
    "(": ")>"
    ")": "(<"
    "[": "]>"
    "]": "[<"
    "{": "}>"
    "}": "{<"
  
  setValueF: (code) =>     
    return unless code?    
    
    top =
      line: 0
      ch: 0

    @updateLines top,
      line: @doc.size - 1
      ch: @getLine(@doc.size - 1).text.length
    , @splitLines(code), top, top  
    
    @updateInput = true      

  getValue: (code) =>  
    
    text = []
    @doc.iter 0, @doc.size, (line) =>
      text.push line.text

    text.join "\n"     

  selectWordAt: (pos) ->    
    line  = @getLine(pos.line).text
    start = pos.ch
    end   = pos.ch     
    
    --start while start > 0 and @isWordChar(line.charAt(start - 1))
    ++end while end < line.length and @isWordChar(line.charAt(end)) 
    
    @setSelectionUser
      line: pos.line
      ch: start
    ,
      line: pos.line
      ch: end           
      
  selectLine: (line) ->     
    @setSelectionUser
      line: line
      ch: 0
    ,
      line: line
      ch: @getLine(line).text.length   
      
  indentSelected: (mode) =>       
    return @indentLineF(@sel.from.line, mode) if @posEq(@sel.from, @sel.to)    
    
    e = @sel.to.line - (if @sel.to.ch then 0 else 1)
    i = @sel.from.line

    while i <= e
      @indentLineF i, mode
      ++i          
      
  indentLineF: (n, how) ->    
    how   = "add" unless how
    state = @getStateBefore(n) unless not @mode.indent or not @options.smartIndent if how is "smart"
    line  = @getLine(n)                   
        
    curSpace       = line.indentation(@options.tabSize)
    curSpaceString = line.text.match(/^\s*/)[0]
    indentation    = undefined       
    
    if how is "prev"
      if n
        indentation = @getLine(n - 1).indentation(@options.tabSize)
      else
        indentation = 0
    else if how is "smart"
      indentation = @mode.indent(state, line.text.slice(curSpaceString.length), line.text)
    else if how is "add"
      indentation = curSpace + @options.indentUnit
    else indentation = curSpace - @options.indentUnit if how is "subtract"  
    
    indentation = Math.max(0, indentation)
    diff        = indentation - curSpace  
    
    unless diff
      return if @sel.from.line isnt n and @sel.to.line isnt n
      indentString = curSpaceString
    else
      indentString = ""
      pos          = 0   
      
      if @options.indentWithTabs
        i = Math.floor(indentation / @options.tabSize)

        while i
          pos += @options.tabSize
          indentString += "\t"
          --i    
          
      while pos < indentation
        ++pos
        indentString += " "    
        
    @replaceRange indentString,
      line: n
      ch: 0
    ,
      line: n
      ch: curSpaceString.length  

  gutterChanged: ->      
    visible = @options.gutter or @options.lineNumbers
    @gutter.style.display = (if visible then "" else "none")   
    
    if visible
      @gutterDirty = true
    else
      @lineDiv.parentNode.style.marginLeft = 0 

  wrappingChanged: (from, to) ->     
    if @options.lineWrapping
      @wrapper.className += " Pen-wrap"
      perLine             = @scroller.clientWidth / @charWidth() - 3   
      
      @doc.iter 0, @doc.size, (line) ->
        return if line.hidden
        
        guess = Math.ceil(line.text.length / perLine) or 1
        @updateLineHeight line, guess unless guess is 1

      @lineSpace.style.width = @code.style.width = ""
    else
      @wrapper.className = @wrapper.className.replace(" Pen-wrap", "")
      @maxWidth          = null
      @maxLine           = ""   
      
      @doc.iter 0, @doc.size, (line) ->
        @updateLineHeight line, 1 if line.height isnt 1 and not line.hidden
        @maxLine = line.text if line.text.length > @maxLine.length          
        
    @changes.push
      from: 0
      to: @doc.size   

  computeTabText: =>
    str = "<span class=\"cm-tab\">"
    i   = 0

    while i < @options.tabSize
      str += " "
      ++i
    str + "</span>"   

  tabsChanged: ->    
    @tabText = @computeTabText()
    @updateDisplay true   

  countColumn: (string, end, tabSize) ->         
    unless end?
      end = string.search(/[^\s\u00a0]/)
      end = string.length  if end is -1      
      
    i = 0
    n = 0

    while i < end
      if string.charAt(i) is "\t"
        n += tabSize - (n % tabSize)
      else
        ++n
      ++i
    n  

  textHeight: -> 
    unless @measureText?
      @measureText = "<pre>"    
      
      i = 0
      while i < 49
        @measureText += "x<br/>"
        ++i                     
        
      @measureText += "x</pre>"          
      
    offsetHeight = @lineDiv.clientHeight   
    
    return @cachedHeight if offsetHeight is @cachedHeightFor  
    
    @cachedHeightFor     = offsetHeight
    @measure.innerHTML   = @measureText
    @cachedHeight        = @measure.firstChild.offsetHeight / 50 or 1
    @measure.innerHTML   = ""        
    @cachedHeight      

  charWidth: ->      
    return @cachedWidth if @scroller.clientWidth is @cachedWidthFor       
    
    @cachedWidthFor = @scroller.clientWidth
    @cachedWidth    = @stringWidth("x")   

  paddingTop: ->   
    @lineSpace.offsetTop 

  paddingLeft: ->  
    @lineSpace.offsetLeft  
    
  matchBracketsF: (autoclear) ->   
    head  = (if @sel.inverted then @sel.from else @sel.to)
    line  = @getLine(head.line)
    pos   = head.ch - 1
    match = (pos >= 0 and @matching[line.text.charAt(pos)]) or @matching[line.text.charAt(++pos)]           

    return unless match         

    ch      = match.charAt(0)
    forward = match.charAt(1) is ">"          

    d    = (if forward then 1 else -1)
    st   = line.styles       
    
    off_ = pos + 1    
    i = 0
    e = st.length

    while i < e
      if (off_ -= st[i].length) <= 0
        style = st[i + 1]
        break
      i += 2                             

    stack = [line.text.charAt(pos)]
    re    = /[(){}[\]]/
    
    scan = (line, from, to) =>           
      return unless line.text    

      st  = line.styles
      pos = (if forward then 0 else line.text.length - 1)
      cur = undefined      

      i = (if forward then 0 else st.length - 2)
      e = (if forward then st.length else -2)

      while i isnt e
        text = st[i]
        if st[i + 1]? and st[i + 1] isnt style
          pos += d * text.length
          continue              

        j  = (if forward then 0 else text.length - 1)
        te = (if forward then text.length else -1)
        while j isnt te
          if pos >= from and pos < to and re.test(cur = text.charAt(j))
            match = @matching[cur]
            if match.charAt(1) is ">" is forward
              stack.push cur
            else unless stack.pop() is match.charAt(0)
              return (
                pos: pos
                match: false
              )
            else unless stack.length
              return (
                pos: pos
                match: true
              )  
              
          j   += d
          pos += d  
          
        i += 2 * d         

    i     = head.line
    e     = (if forward then Math.min(i + 100, @doc.size) else Math.max(-1, i - 100))
    while i isnt e
      line  = @getLine(i)
      first = i is head.line
      found = scan(line, (if first and forward then pos + 1 else 0), (if first and not forward then pos else line.text.length))
      break if found
      i += d
    unless found
      found =
        pos: null
        match: false       

    style = (if found.match then "Pen-matchingbracket" else "Pen-nonmatchingbracket")       
    
    one = @markText(
      line: head.line
      ch: pos
    ,
      line: head.line
      ch: pos + 1
    , style)  
    
    two = found.pos? and @markText(
      line: i
      ch: found.pos
    ,
      line: i
      ch: found.pos + 1
    , style)    
    
    clear = @operation(->
      one.clear()
      two and two.clear()
    )   
    
    if autoclear
      setTimeout clear, 800
    else
      @bracketHighlighted = clear    
     
module.exports = Text