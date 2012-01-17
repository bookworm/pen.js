Text = require('lib/pen/text/Text')        
class Selection extends Text         
  shiftSelecting: null
  
  hasSelection: (if window.getSelection then (te) =>  
    try
      return te.selectionStart isnt te.selectionEnd
    catch e
      return false    
      
   else (te) =>
    try
      range = te.ownerDocument.selection.createRange() 
      
    return false if not range or range.parentElement() isnt te  
     
    range.compareEndPoints("StartToEnd", range) isnt 0
  ) 

  somethingSelected: ->       
    not @posEq(@sel.from, @sel.to) 

  replaceRangeF: (code, from, to) =>    

    
    from = @clipPos(from)   
    
    unless to
      to = from
    else
      to = @clipPos(to)  
      
    code = @splitLines(code)     

    adjustPos = (pos) =>      
      return pos if @posLess(pos, from)
      return end unless @posLess(to, pos)   
      
      line = pos.line + code.length - (to.line - from.line) - 1
      ch   = pos.ch
      ch  += code[code.length - 1].length - (to.ch - (if to.line is from.line then from.ch else 0))  if pos.line is to.line
      
      line: line
      ch: ch
      
    end  = undefined 
    
    @replaceRange1 code, from, to, (end1) =>
      end = end1
      from: @adjustPos(@sel.from)
      to: @adjustPos(@sel.to)  
      
    return end                    

  replaceSelectionF: (code, collapse) =>    
    @replaceRange1 @splitLines(code), @sel.from, @sel.to, (end) =>   
      if collapse is "end"
        from: end
        to: end
      else if collapse is "start"
        from: @sel.from
        to: @sel.from
      else
        from: @sel.from
        to: end             

  replaceRange1: (code, from, to, computeSel) ->      
    endch = (if code.length is 1 then code[0].length + from.ch else code[code.length - 1].length)     
    
    newSel = computeSel(
      line: from.line + code.length - 1
      ch: endch
    )           
    
    @updateLines from, to, code, newSel.from, newSel.to      

  getRange: (from, to) ->    
    l1 = from.line
    l2 = to.line  
    
    return @getLine(l1).text.slice(from.ch, to.ch)  if l1 is l2
    code = [@getLine(l1).text.slice(from.ch)]    
    
    @doc.iter l1 + 1, l2, (line) =>
      code.push line.text

    code.push @getLine(l2).text.slice(0, to.ch)
    code.join "\n"    

  getSelection: ->  
    @getRangeWrap @sel.from, @sel.to     

  setShift: (val) -> 
    if val
      @shiftSelecting = @shiftSelecting or (if @sel.inverted then @sel.to else @sel.from)
    else
      @shiftSelecting = null    

  setSelectionUser: (from, to) ->   
    sh = @shiftSelecting and @clipPos(@shiftSelecting) 
    
    if sh
      if @posLess(sh, from)
        from = sh
      else to = sh if @posLess(to, sh)  
      
    @setSelection from, to
    @userSelChange = true     

  setSelectionF: (from, to, oldFrom, oldTo) ->       
    @goalColumn = null     
    
    unless oldFrom?
      oldFrom = @sel.from.line
      oldTo   = @sel.to.line    
      
    return if @posEq(@sel.from, from) and @posEq(@sel.to, to)         
    
    if @posLess(to, from)
      tmp  = to
      to   = from
      from = tmp    
      
    from = @skipHidden(from, oldFrom, @sel.from.ch) unless from.line is oldFrom
    to   = @skipHidden(to, oldTo, @sel.to.ch) unless to.line is oldTo   
    
    if @posEq(from, to)
      @sel.inverted = false
    else if @posEq(from, @sel.to)
      @sel.inverted = false
    else @sel.inverted = true if @posEq(to, @sel.from) 
    
    if @posEq(from, to)
      unless @posEq(@sel.from, @sel.to)
        @changes.push
          from: oldFrom
          to: oldTo + 1
    else if @posEq(@sel.from, @sel.to)
      @changes.push
        from: from.line
        to: to.line + 1
    else
      unless @posEq(from, @sel.from)
        if from.line < oldFrom
          @changes.push
            from: from.line
            to: Math.min(to.line, oldFrom) + 1
        else
          @changes.push
            from: oldFrom
            to: Math.min(oldTo, from.line) + 1
      unless @posEq(to, @sel.to)
        if to.line < oldTo
          @changes.push
            from: Math.max(oldFrom, from.line)
            to: oldTo + 1
        else
          @changes.push
            from: Math.max(from.line, oldTo)
            to: to.line + 1 
            
    @sel.from         = from
    @sel.to           = to        
    @selectionChanged = true  

  skipHidden: (pos, oldLine, oldCh) ->          
    getNonHidden = (dir) =>              
      lNo = pos.line + dir
      end = (if dir is 1 then @doc.size else -1)
      
      until lNo is end
        line = @getLine(lNo)
        unless line.hidden
          ch = pos.ch
          ch = line.text.length  if ch > oldCh or ch > line.text.length
          return (
            line: lNo
            ch: ch
          )
        lNo += dir       
        
    line = @getLine(pos.line)  
    
    return pos unless line.hidden
    
    if pos.line >= oldLine
      getNonHidden(1) or getNonHidden(-1)
    else
      getNonHidden(-1) or getNonHidden(1)          

  stringWidth: (str) ->  
    @measure.innerHTML = "<pre><span>x</span></pre>"
    @measure.firstChild.firstChild.firstChild.nodeValue = str
    @measure.firstChild.firstChild.offsetWidth or 10  

  charFromX: (line, x) ->       
    return 0 if x <= 0      
    
    lineObj   = @getLine(line)
    text      = lineObj.text    
    
    getX = (len) =>        
      @measure.innerHTML = "<pre><span>" + lineObj.getHTML(null, null, false, @tabText, len) + "</span></pre>"
      @measure.firstChild.firstChild.offsetWidth          

    from      = 0
    fromX     = 0
    to        = text.length
    toX       = undefined
    estimated = Math.min(to, Math.ceil(x / @charWidth()))  
    
    loop
      estX = getX(estimated)
      if estX <= x and estimated < to
        estimated = Math.min(to, Math.ceil(estimated * 1.2))
      else
        toX = estX
        to  = estimated
        break               
        
    return to if x > toX   
    
    estimated = Math.floor(to * 0.8)
    estX      = getX(estimated)   
    
    if estX < x
      from  = estimated
      fromX = estX    
      
    loop
      return (if (toX - x > x - fromX) then from else to) if to - from <= 1       
      
      middle  = Math.ceil((from + to) / 2)
      middleX = getX(middle)      
      
      if middleX > x
        to  = middle
        toX = middleX
      else
        from  = middle
        fromX = middleX       
        
module.exports = Selection