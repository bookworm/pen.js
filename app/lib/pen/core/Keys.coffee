Cursor = require('lib/pen/core/Cursor')        
class Keys extends Cursor       
  mode: null                    
  lastStoppedKey: null
  
  keyMap: {}    
  
  setupKeyMaps: ->
    @keyMap.basic =
      Left: "goCharLeft"
      Right: "goCharRight"
      Up: "goLineUp"
      Down: "goLineDown"
      End: "goLineEnd"
      Home: "goLineStartSmart"
      PageUp: "goPageUp"
      PageDown: "goPageDown"
      Delete: "delCharRight"
      Backspace: "delCharLeft"
      Tab: "indentMore"
      "Shift-Tab": "indentLess"
      Enter: "newlineAndIndent"
      Insert: "toggleOverwrite"

    @keyMap.pcDefault =
      "Ctrl-A": "selectAll"
      "Ctrl-D": "deleteLine"
      "Ctrl-Z": "undo"
      "Shift-Ctrl-Z": "redo"
      "Ctrl-Y": "redo"
      "Ctrl-Home": "goDocStart"
      "Alt-Up": "goDocStart"
      "Ctrl-End": "goDocEnd"
      "Ctrl-Down": "goDocEnd"
      "Ctrl-Left": "goWordLeft"
      "Ctrl-Right": "goWordRight"
      "Alt-Left": "goLineStart"
      "Alt-Right": "goLineEnd"
      "Ctrl-Backspace": "delWordLeft"
      "Ctrl-Delete": "delWordRight"
      "Ctrl-S": "save"
      "Ctrl-F": "find"
      "Ctrl-G": "findNext"
      "Shift-Ctrl-G": "findPrev"
      "Shift-Ctrl-F": "replace"
      "Shift-Ctrl-R": "replaceAll"
      fallthrough: "basic"

    @keyMap.macDefault =
      "Cmd-A": "selectAll"
      "Cmd-D": "deleteLine"
      "Cmd-Z": "undo"
      "Shift-Cmd-Z": "redo"
      "Cmd-Y": "redo"
      "Cmd-Up": "goDocStart"
      "Cmd-End": "goDocEnd"
      "Cmd-Down": "goDocEnd"
      "Alt-Left": "goWordLeft"
      "Alt-Right": "goWordRight"
      "Cmd-Left": "goLineStart"
      "Cmd-Right": "goLineEnd"
      "Alt-Backspace": "delWordLeft"
      "Ctrl-Alt-Backspace": "delWordRight"
      "Alt-Delete": "delWordRight"
      "Cmd-S": "save"
      "Cmd-F": "find"
      "Cmd-G": "findNext"
      "Shift-Cmd-G": "findPrev"
      "Cmd-Alt-F": "replace"
      "Shift-Cmd-Alt-F": "replaceAll"
      fallthrough: [ "basic", "emacsy" ]

    @keyMap["default"] = (if @mac then @keyMap.macDefault else @keyMap.pcDefault)
    @keyMap.emacsy =
      "Ctrl-F": "goCharRight"
      "Ctrl-B": "goCharLeft"
      "Ctrl-P": "goLineUp"
      "Ctrl-N": "goLineDown"
      "Alt-F": "goWordRight"
      "Alt-B": "goWordLeft"
      "Ctrl-A": "goLineStart"
      "Ctrl-E": "goLineEnd"
      "Ctrl-V": "goPageUp"
      "Shift-Ctrl-V": "goPageDown"
      "Ctrl-D": "delCharRight"
      "Ctrl-H": "delCharLeft"
      "Alt-D": "delWordRight"
      "Alt-Backspace": "delWordLeft"
      "Ctrl-K": "killLine"
      "Ctrl-T": "transposeChars"

  keyNames =
    3: "Enter"
    8: "Backspace"
    9: "Tab"
    13: "Enter"
    16: "Shift"
    17: "Ctrl"
    18: "Alt"
    19: "Pause"
    20: "CapsLock"
    27: "Esc"
    32: "Space"
    33: "PageUp"
    34: "PageDown"
    35: "End"
    36: "Home"
    37: "Left"
    38: "Up"
    39: "Right"
    40: "Down"
    44: "PrintScrn"
    45: "Insert"
    46: "Delete"
    59: ";"
    91: "Mod"
    92: "Mod"
    93: "Mod"
    186: ";"
    187: "="
    188: ","
    189: "-"
    190: "."
    191: "/"
    192: "`"
    219: "["
    220: "\\"
    221: "]"
    222: "'"
    63276: "PageUp"
    63277: "PageDown"
    63275: "End"
    63273: "Home"
    63234: "Left"
    63232: "Up"
    63235: "Right"
    63233: "Down"
    63302: "Insert"
    63272: "Delete"

  keyNames: keyNames
  (->
    i = 0

    while i < 10
      keyNames[i + 48] = String(i)
      i++
    i = 65

    while i <= 90
      keyNames[i] = String.fromCharCode(i)
      i++
    i = 1

    while i <= 12
      keyNames[i + 111] = keyNames[i + 63235] = "F" + i
      i++       
  )()
    
  handleKeyBinding: (e) ->       
    name      = @keyNames[@e_prop(e, "keyCode")]
    next      = @keyMap[@options.keyMap].auto    
    bound     = undefined
    dropShift = undefined
    
    handleNext = ->
      (if next.call then next.call(null, this) else next)   
    
    if not name? or e.altGraphKey
      @options.keyMap = handleNext() if next
      return null 
      
    name = "Alt-"  + name  if @e_prop(e, "altKey")
    name = "Ctrl-" + name  if @e_prop(e, "ctrlKey")
    name = "Cmd-"  + name  if @e_prop(e, "metaKey")  
    
    if @e_prop(e, "shiftKey") and (bound = @lookupKey("Shift-" + name, @options.extraKeys, @options.keyMap))
      dropShift = true
    else
      bound = @lookupKey(name, @options.extraKeys, @options.keyMap)   
      
    if typeof bound is "string"
      if @commands.propertyIsEnumerable(bound)
        bound = @commands[bound]
      else
        bound = null       
        
    @options.keyMap = handleNext() if next and (bound or not @isModifierKey(e))        
    
    return false unless bound     
    
    prevShift = @shiftSelecting      
    
    try
      @suppressEdits  = true if @options.readOnly
      @shiftSelecting = null if dropShift
      bound this
    finally
      @shiftSelecting = prevShift
      @suppressEdits  = false       
      
    @e_preventDefault e
    true

  onKeyDown: (e) =>
    @onFocus() unless @focused  
    
    code = @e_prop(e, "keyCode")         
    e.returnValue = false if @ie and code is 27  
    @setShift code is 16 or @e_prop(e, "shiftKey")
    
    return if @options.onKeyEvent and @options.onKeyEvent(this, @addStop(e))
    handled = @handleKeyBinding(e)      
    
    if window.opera
      @lastStoppedKey = (if handled then e.keyCode else null)
      @replaceSelection ""  if not handled and code is 88 and @e_prop(e, (if @mac then "metaKey" else "ctrlKey"))

  onKeyPress: (e) => 
    keyCode  = @e_prop(e, "keyCode")
    charCode = @e_prop(e, "charCode")  
    
    if window.opera and keyCode is @lastStoppedKey
      @lastStoppedKey = null
      @e_preventDefault e
      return   
      
    return if @options.onKeyEvent and @options.onKeyEvent(this, addStop(e))
    return if window.opera and not e.which and @handleKeyBinding(e) 
    
    if @options.electricChars and @mode.electricChars and @options.smartIndent and not @options.readOnly
      ch = String.fromCharCode((if not charCode? then keyCode else charCode))       
      
      if @mode.electricChars.indexOf(ch) > -1
        setTimeout @operation(->
          @indentLine sel.to.line, "smart"
        ), 75    
        
    @fastPoll()

  onKeyUp: (e) ->         
    return if @options.onKeyEvent and @options.onKeyEvent(this, @addStop(e))
    @shiftSelecting = null if @e_prop(e, "keyCode") is 16

  lookupKey: (name, extraMap, map) ->   
    
    lookup = (name, map, ft) =>
      found = map[name]      
      
      return found if found?
      ft = map.fallthrough unless ft?   
      
      return map.catchall unless ft?
      return lookup(name, @keyMap[ft]) if typeof ft is "string"    
      
      i = 0
      e = ft.length

      while i < e
        found = lookup(name, @keyMap[ft[i]])
        return found if found?
        ++i
      null        
      
    (if extraMap then lookup(name, extraMap, map) else lookup(name, @keyMap[map]))      

  isModifierKey: (event) ->
    name = @keyNames[event.keyCode]
    name is "Ctrl" or name is "Alt" or name is "Shift" or name is "Mod"  
    
module.exports = Keys