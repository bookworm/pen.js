StringStream = require('lib/pen/marks/stringstream') 
class Line
  styles: null
  text: null
  height: 0 
  marked: null
  gutterMarker: null   
  className: null
  handlers: null
  stateAfter: null
  parent: null    
  hidden: null 
  changed: null
  curWord: null 
  prevWord: null       
  start: null
  end: null
  state: null  
  pen: null
     
  constructor: (pen, text, styles) ->  
    @pen        = pen
    @styles     = styles or [text, null]
    @text       = text
    @height     = @pen.textHeight()
    @marked     = @gutterMarker = @className = @handlers = null
    @stateAfter = @parent = @hidden = null      
  
  @inheritMarks: (pen, text, orig) ->        
    ln = new Line(pen, text)
    mk = orig and orig.marked   
    
    if mk
      i = 0
      while i < mk.length
        if not mk[i].to? and mk[i].style
          newmk = ln.marked or (ln.marked = [])
          mark  = mk[i]
          nmark = mark.dup()  
          
          newmk.push nmark
          nmark.attach ln
        ++i
    ln           
                                   
  split: (pos, textBefore) ->   
    st = [textBefore, null]
    mk = @marked                      
    
    @pen.copyStyles pos, @text.length, @styles, st    

    taken = new Line(@pen, textBefore + @text.slice(pos), st)         
    
    if mk
      i = 0

      while i < mk.length
        mark    = mk[i]
        newmark = mark.split(pos, textBefore.length)
        if newmark
          taken.marked = [] unless taken.marked
          taken.marked.push newmark
          newmark.attach taken
        ++i      
    taken

  append: (line) ->        
    mylen  = @text.length
    mk     = line.marked
    mymk   = @marked
    @text += line.text     
    
    @pen.copyStyles 0, line.text.length, line.styles, @styles      
    
    if mymk
      i = 0
      while i < mymk.length
        mymk[i].to = mylen unless mymk[i].to?
        ++i      
        
    if mk and mk.length
      @marked = mymk = [] unless mymk     
      
      i = 0
      while i < mk.length   
        breakloop1 = false
        mark = mk[i]   
        
        unless mark.from
          j = 0
          while j < mymk.length
            mymark = mymk[j]
            if mymark.to is mylen and mymark.sameSet(mark)
              mymark.to = (if not mark.to? then null else mark.to + mylen)
              if mymark.isDead()
                mymark.detach this
                mk.splice i--, 1
              breakLoop1 = true; break 
            ++j  
          unless breakLoop1    
            i++ 
            continue 
            
        mymk.push mark
        mark.attach this
        
        mark.from += mylen
        mark.to   += mylen  if mark.to?
        ++i

  fixMarkEnds: (other) -> 
    mk  = @marked
    omk = other.marked    
    
    return unless mk     
    
    i = 0         

    while i < mk.length
      mark  = mk[i]
      close = not mark.to?
      if close and omk
        j = 0

        while j < omk.length
          if omk[j].sameSet(mark)
            close = false
            break
          ++j
      mark.to = @text.length if close
      ++i
          
  fixMarkStarts: ->      
    mk = @marked
    return unless mk
    i = 0
    
    while i < mk.length
      mk[i].from = 0 unless mk[i].from?
      ++i

  addMark: (mark) ->        
    mark.attach this
    @marked = [] unless @marked?
    @marked.push mark  
    
    @marked.sort (a, b) =>
      (a.from or 0) - (b.from or 0)

  highlight: (mode, state, tabSize) ->        
    stream = new StringStream(@pen, @text, tabSize)  
    
    st        = @styles
    pos       = 0
    @changed  = false
    @curWord  = st[0]
    @prevWord = undefined  
    
    mode.blankLine state if @text is "" and mode.blankLine    
    
    until stream.eol()
      style        = mode.token(stream, state)
      substr       = @text.slice(stream.start, stream.pos)
      stream.start = stream.pos      
      
      if pos and st[pos - 1] is style
        st[pos - 2] += substr
      else if substr
        @changed  = true if not @changed and (st[pos + 1] isnt style or (pos and st[pos - 2] isnt @prevWord))
        st[pos++] = substr
        st[pos++] = style 
        
        @prevWord = @curWord
        @curWord  = st[pos]   
        
      if stream.pos > 5000
        st[pos++] = @text.slice(stream.pos)
        st[pos++] = null
        break     
        
    unless st.length is pos
      st.length = pos
      changed   = true    
    @changed = true if pos and st[pos - 2] isnt @prevWord    
    
    @changed or (if st.length < 5 and @text.length < 10 then null else false)

  getTokenAt: (mode, state, ch) ->   
    txt    = @text
    stream = new StringStream(@pen, txt)   
    
    while stream.pos < ch and not stream.eol()
      stream.start = stream.pos
      style        = mode.token(stream, state)      
      
    start: stream.start
    end: stream.pos
    string: stream.current()
    className: @style or null
    state: state 

  indentation: (tabSize) -> 
    @pen.countColumn @text, null, tabSize     
  
  replace: (from, to_, text) ->  
    st = []
    mk = @marked
    to = (if not to_? then @text.length else to_)   
    
    @pen.copyStyles 0, from, @styles, st    
    st.push text, null if text  
    
    @pen.copyStyles to, @text.length, @styles, st 
    
    @styles     = st    
    @text       = @text.slice(0, from) + text + @text.slice(to)    
    @stateAfter = null   
    
    if mk
      diff = text.length - (to - from)       
      
      i    = 0
      while i < mk.length     
        mark = mk[i]
        mark.clipTo not from?, from or 0, not to_?, to, diff
        if mark.isDead()
          mark.detach this
          mk.splice i--, 1
        ++i  

  getHTML: (sfrom, sto, includePre, tabText, endAt) =>     
    html  = []
    first = true
    html.push (if @className then "<pre class=\"" + @className + "\">" else "<pre>") if includePre   
    
    span = (text, style) =>     
      return  unless text
      text  = " " + text.slice(1) if first and @ie and text.charAt(0) is " "
      first = false         
      
      if style       
        type = null
        if typeof style is "object"  
          style2 = style 
          style     = style.style 
          type      = style2.type  
          @height   = style2.lineHeight
          
        style = "cm-" + style 
        if type    
          html.push "<#{type} class=\"", style, "\">", @pen.htmlEscape(text).replace(/\t/g, tabText), "</#{type}>"
        else
          html.push "<span class=\"", style, "\">", @pen.htmlEscape(text).replace(/\t/g, tabText), "</span>"
      else
        html.push @pen.htmlEscape(text).replace(/\t/g, tabText)         
      
    st      = @styles
    allText = @text
    marked  = @marked          
    sfrom   = null if sfrom is sto
    len     = allText.length
    len     = Math.min(endAt, len) if endAt?   
    
    if not allText and not endAt?
      span " ", (if sfrom? and not sto? then "Pen-selected" else null)
    else if not marked and not sfrom?
      i  = 0
      ch = 0
      while ch < len
        str   = st[i]
        style = st[i + 1]         

        l   = str.length
        str = str.slice(0, len - ch)  if ch + l > len
        ch += l
        span str, style
        i += 2
    else  
      pos     = 0
      i       = 0
      text    = ""
      style   = undefined
      sg      = 0
      markpos = -1
      mark    = null
    
      nextMark = =>
        if marked
          markpos += 1
          mark = (if (markpos < marked.length) then marked[markpos] else null)
          
      nextMark()
      
      while pos < len
        upto       = len
        extraStyle = ""    
        
        if sfrom?
          if sfrom > pos
            upto = sfrom
          else if not sto? or sto > pos
            extraStyle = " Pen-selected"
            upto       = Math.min(upto, sto) if sto?       
            
        nextMark() while mark and mark.to? and mark.to <= pos     
        
        if mark
          if mark.from > pos
            upto = Math.min(upto, mark.from)
          else
            extraStyle += " " + mark.style
            upto = Math.min(upto, mark.to)  if mark.to?
              
        loop
          end          = pos + text.length
          appliedStyle = style             
          
          appliedStyle = (if style then style + extraStyle else extraStyle) if extraStyle
          span (if end > upto then text.slice(0, upto - pos) else text), appliedStyle     
          
          if end >= upto
            text = text.slice(upto - pos)
            pos  = upto
            break   
            
          pos   = end
          text  = st[i++]
          style = "cm-" + st[i++]         
          
      span " ", "Pen-selected" if sfrom? and not sto?
      
    html.push "</pre>" if includePre
    html.join ""

  cleanUp: ->   
    @parent = null
    if @marked
      i = 0
      e = @marked.length

      while i < e
        @marked[i].detach this
        ++i
        
module.exports = Line     