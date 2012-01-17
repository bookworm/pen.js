Keys = require('lib/pen/core/Keys')        
class Commands extends Keys
  commands:
    selectAll: (cm) ->          
      cm.setSelection
        line: 0
        ch: 0
      ,
        line: cm.lineCount() - 1

    killLine: (cm) ->        
      from = cm.getCursor(true)
      to   = cm.getCursor(false)
      sel  = not @posEq(from, to)  
      
      if not sel and cm.getLine(from.line).length is from.ch
        cm.replaceRange "", from,
          line: from.line + 1
          ch: 0
      else
        cm.replaceRange "", from, (if sel then to else line: from.line)

    deleteLine: (cm) ->    
      l = cm.getCursor().line
      cm.replaceRange "",
        line: l
        ch: 0
      ,
        line: l

    undo: (cm) -> 
      cm.undo()

    redo: (cm) ->  
      cm.redo()

    goDocStart: (cm) -> 
      cm.setCursor 0, 0, true

    goDocEnd: (cm) ->  
      cm.setSelection
        line: cm.lineCount() - 1
      , null, true

    goLineStart: (cm) -> 
      cm.setCursor cm.getCursor().line, 0, true

    goLineStartSmart: (cm) ->  
      cur        = cm.getCursor()
      text       = cm.getLine(cur.line)
      firstNonWS = Math.max(0, text.search(/\S/))
      cm.setCursor cur.line, (if cur.ch <= firstNonWS and cur.ch then 0 else firstNonWS), true

    goLineEnd: (cm) -> 
      cm.setSelection
        line: cm.getCursor().line
      , null, true

    goLineUp: (cm) ->
      cm.moveV -1, "line"

    goLineDown: (cm) ->  
      cm.moveV 1, "line"

    goPageUp: (cm) ->  
      cm.moveV -1, "page"

    goPageDown: (cm) ->  
      cm.moveV 1, "page"

    goCharLeft: (cm) ->       
      cm.moveH -1, "char"

    goCharRight: (cm) ->  
      cm.moveH 1, "char"

    goColumnLeft: (cm) -> 
      cm.moveH -1, "column"

    goColumnRight: (cm) ->  
      cm.moveH 1, "column"

    goWordLeft: (cm) ->  
      cm.moveH -1, "word"

    goWordRight: (cm) ->
      cm.moveH 1, "word"

    delCharLeft: (cm) ->  
      cm.deleteH -1, "char"

    delCharRight: (cm) -> 
      cm.deleteH 1, "char"

    delWordLeft: (cm) ->   
      cm.deleteH -1, "word"

    delWordRight: (cm) ->  
      cm.deleteH 1, "word"

    indentAuto: (cm) ->    
      cm.indentSelection "smart"

    indentMore: (cm) ->        
      cm.indentSelection "add"

    indentLess: (cm) ->     
      cm.indentSelection "subtract"

    insertTab: (cm) ->    
      cm.replaceSelection "\t", "end"

    transposeChars: (cm) -> 
      cur  = cm.getCursor()
      line = cm.getLine(cur.line)
      
      if cur.ch > 0 and cur.ch < line.length - 1
        cm.replaceRange line.charAt(cur.ch) + line.charAt(cur.ch - 1),
          line: cur.line
          ch: cur.ch - 1
        ,
          line: cur.line
          ch: cur.ch + 1

    newlineAndIndent: (cm) ->
      cm.replaceSelection "\n", "end"
      cm.indentLine cm.getCursor().line

    toggleOverwrite: (cm) ->  
      cm.toggleOverwrite() 
      
module.exports = Commands