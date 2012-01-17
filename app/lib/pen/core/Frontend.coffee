Helpers = require('lib/pen/misc/Helpers')
class Frontend extends Helpers      
  scroller: null        
  escapeElement: undefined
  htmlEscape: null
  
  themeChanged: ->  
    @scroller.className = @scroller.className.replace(/\s*cm-s-\w+/g, "") + @options.theme.replace(/(^|\s)\s*/g, " cm-s-")
    
  computedStyle: (elt) ->    
    return elt.currentStyle if elt.currentStyle
    window.getComputedStyle elt, null  
  
  eltOffset: (node, screen) ->     
    bod = node.ownerDocument.body   
    
    x        = 0
    y        = 0
    skipBody = false  
    
    n = node
    while n
      ol = n.offsetLeft
      ot = n.offsetTop   
      
      if n is bod
        x += Math.abs(ol)
        y += Math.abs(ot)
      else
        x += ol
        y += ot         
        
      skipBody = true if screen and @computedStyle(n).position is "fixed"
      n = n.offsetParent 
      
    e = (if screen and not skipBody then null else bod)
    n = node.parentNode

    while n isnt e
      if n.scrollLeft?
        x -= n.scrollLeft
        y -= n.scrollTop  
        
      n = n.parentNode     
      
    left: x
    top: y 
  
  if document.documentElement.getBoundingClientRect?
    eltOffset: (node, screen) ->
      try
        box = node.getBoundingClientRect()
        box =
          top: box.top
          left: box.left
      catch e
        box =
          top: 0
          left: 0  
          
      unless screen
        unless window.pageYOffset?
          t = document.documentElement or document.body.parentNode
          t = document.body unless t.scrollTop?
          box.top  += t.scrollTop
          box.left += t.scrollLeft
        else
          box.top  += window.pageYOffset
          box.left += window.pageXOffset  
          
      box  
          
  eltText: (node) -> 
    node.textContent or node.innerText or node.nodeValue or ""         
  
  selectInput: (node) ->
    if ios
      node.selectionStart = 0
      node.selectionEnd   = node.value.length
    else
      node.select()  
          
  posEq: (a, b) ->        
    a.line is b.line and a.ch is b.ch     
    
  posLess: (a, b) ->       
    a.line < b.line or (a.line is b.line and a.ch < b.ch)      
    
  copyPos: (x) ->
    line: x.line
    ch: x.ch      
    
  htmlEscape: (str) ->
    @escapeElement = document.createElement("pre") unless @escapeElement
    @escapeElement.textContent = str
    @escapeElement.innerHTML 
    
  if document.documentElement.getBoundingClientRect?
    eltOffset: (node, screen) =>         
      try
        box = node.getBoundingClientRect()
        box =
          top: box.top
          left: box.left
      catch e
        box =
          top: 0
          left: 0
      unless screen
        unless window.pageYOffset?
          t = document.documentElement or document.body.parentNode
          t = document.body unless t.scrollTop?         
          
          box.top  += t.scrollTop
          box.left += t.scrollLeft
        else
          box.top  += window.pageYOffset
          box.left += window.pageXOffset
      box
  
  ## TODO: Add support for Opera + IE
  
  # if @htmlEscape("a") is "\na"
  #   htmlEscape: (str) ->
  #     @escapeElement.textContent = str
  #     @escapeElement.innerHTML.slice 1    
  #     
  # else unless @htmlEscape("\t") is "\t"
  #   htmlEscape: (str) ->
  #     @escapeElement.innerHTML = ""
  #     @escapeElement.appendChild document.createTextNode(str)
  #     @escapeElement.innerHTML         
  #     @htmlEscape = @htmlEscape     

  copyStyles: (from, to, source, dest) -> 
    i     = 0
    pos   = 0
    state = 0
    while pos < to
      part = source[i]
      end  = pos + part.length  
      
      if state is 0
        dest.push part.slice(from - pos, Math.min(part.length, to - pos)), source[i + 1] if end > from
        state = 1  if end >= from
      else if state is 1
        if end > to
          dest.push part.slice(0, to - pos), source[i + 1]
        else
          dest.push part, source[i + 1]
      pos = end
      i  += 2  

  addWidget: (pos, node, scroll, vert, horiz) ->
    pos  = @localCoords(@clipPos(pos))
    top  = pos.yBot
    left = pos.x  
    
    node.style.position = "absolute" 
    
    @code.appendChild node
    if vert is "over"
      top = pos.y
    else if vert is "near"
      vspace = Math.max(@scroller.offsetHeight, @doc.height * textHeight())
      hspace = Math.max(@code.clientWidth, @lineSpace.clientWidth) - paddingLeft() 
      
      top  = pos.y - node.offsetHeight if pos.yBot + @node.offsetHeight > vspace and pos.y > node.offsetHeight
      left = hspace - node.offsetWidth if left + node.offsetWidth > hspace        
      
    node.style.top  = (top + paddingTop()) + "px"
    node.style.left = node.style.right = ""  
    
    if horiz is "right"
      left = @code.clientWidth - node.offsetWidth
      node.style.right = "0px"
    else
      if horiz is "left"
        left = 0
      else left = (@code.clientWidth - node.offsetWidth) / 2  if horiz is "middle"
      
      node.style.left = (left + paddingLeft()) + "px"                  
      
    @scrollIntoView left, top, left + node.offsetWidth, top + node.offsetHeight  if scroll   

module.exports = Frontend