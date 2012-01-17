Commands   = require('lib/pen/misc/Commands')     
Bookmark   = require('lib/pen/marks/bookmark')
class Marker extends Commands      
  gutterDirty: false
  
  markTextF: (from, to, className) ->    
    from  = @clipPos(from)
    to    = @clipPos(to)
    tm    = new TextMarker(this)       
    
    add = (line, from, to, className) =>         
      @getLine(line).addMark new MarkedText(this, from, to, className, tm.set)        
        
    if from.line is to.line
      add from.line, from.ch, to.ch, className
    else
      add from.line, from.ch, null, className
      i = from.line + 1
      e = to.line

      while i < e
        add i, null, null, className
        ++i         
        
      add to.line, null, to.ch, className
        
    @changes.push
      from: from.line
      to: to.line + 1

    tm      

  setBookmark: (pos) ->  
    pos = @clipPos(pos)
    bm  = new Bookmark(this, pos.ch)   
    
    @getLine(pos.line).addMark bm   
    
    bm      

  addGutterMarker: (line, text, className) ->   
    line = @getLine(@clipLine(line)) if typeof line is "number"     
    
    line.gutterMarker =
      text: text
      style: className

    @gutterDirty = true     
    
    line                

  removeGutterMarker: (line) ->  
    line              = @getLine(@clipLine(line)) if typeof line is "number"
    line.gutterMarker = null
    @gutterDirty      = true   
                     
module.exports = Marker