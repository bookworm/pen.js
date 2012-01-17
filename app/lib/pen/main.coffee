History      = require('lib/pen/misc/history')
BranchChunk  = require('lib/pen/text/branch') 
LeafChunk    = require('lib/pen/text/leaf')     
Line         = require('lib/pen/text/line')     
Delayed      = require('lib/pen/core/delayed')  
StringStream = require('lib/pen/marks/stringstream')     
Markdown     = require('lib/pen/parsers/markdown/Markdown')       
Xml          = require('lib/pen/parsers/xml/Xml') 

jQuery   = require("jqueryify"); 
$        = jQuery
 
Marker = require('lib/pen/marks/Marker')        
class Pen extends Marker 
  extensions: {}
  
  options: {}      
               
  mode: null
  modes: {}
  mimeModes: {}
  
  wrapper: null 
  
  inputDiv: null
  input: null       
  scroller: null   
  code: null      
  mover: null      
  gutter: null     
  gutterText: null 
  lineSpace: null 
  measure: null   
  cursor: null    
  lineDiv: null   
  work: null   
  place: undefined  
  document: window.document 
                 
  constructor: (place, options) ->          
    @place = place  
    @setupSelection()                      
    @setDefaults(options )                     
    @setOptions(options)      
    @setupKeyMaps()
    @wrapper = @getWrapper()    
    @setElems()   
    @themeChanged()     
    @setInputStyles() 
    @checkStringWidth()       
    @setupMode()    
    
    @defineMode "null", ->
      token: (stream) ->
        stream.skipToEnd()
    
    @defineMIME "text/plain", "null"   
    @defineMIME "application/xml", "xml"  
    
    @defineMIME "text/html", 
      name: "xml" 
      htmlMode: true        
    
    @defineMIME "text/x-markdown", "markdown"
        
    @defineMode "xml", new Xml(this, @options, @options.parserConfig) 
    @defineMode "markdown", new Markdown(this, @options, @options.parserConfig)
    
    @loadMode()
    @setupVars()    
    @setOperations()  
    @setupConnections()     
    
    @hasFocus = undefined
    try
      @hasFocus = (@targetDocument.activeElement is @input)
    if @hasFocus
      setTimeout @onFocus, 20
    else
      @onBlur() 
       
    @focusInput

  isLine: (l) ->
    l >= 0 and l < @doc.size      

  setDefaults: ->
    @gecko  = /gecko\/\d{7}/i.test(navigator.userAgent)
    @ie     = /MSIE \d/.test(navigator.userAgent)
    @webkit = /WebKit\//.test(navigator.userAgent)  
    @mac    = /Mac/i.test(navigator.platform)
    @win    = /Win/i.test(navigator.platform)

    @defaults =
      value: " "
      theme: "default"
      indentUnit: 2
      indentWithTabs: false
      tabSize: 4
      keyMap: "default"
      extraKeys: null
      electricChars: true
      onKeyEvent: null
      lineWrapping: false
      lineNumbers: false
      gutter: false
      fixedGutter: false
      firstLineNumber: 1
      readOnly: false
      onChange: null
      onCursorActivity: null
      onGutterClick: null
      onHighlightComplete: null
      onUpdate: null
      onFocus: null
      onBlur: null
      onScroll: null
      matchBrackets: false
      workTime: 100
      workDelay: 200
      pollInterval: 100
      undoDepth: 40
      tabindex: null
      document: window.document
      mac: /Mac/i.test(navigator.platform)
      win: /Win/i.test(navigator.platform)
      mode: "markdown"  
      parserConfig: {}
      mimeModes: {}
      
  setOptions: (givenOptions) ->       
    defaults = @defaults
    for opt of defaults
      @options[opt] = (if givenOptions and givenOptions.hasOwnProperty(opt) then givenOptions else defaults)[opt]  if defaults.hasOwnProperty(opt)
                 
  getWrapper: ->    
    @targetDocument   = @options["document"]
    wrapper           = @targetDocument.createElement("div")         
    wrapper.className = "Pen" + (if @options.lineWrapping then " Pen-wrap" else "")    
    wrapper.innerHTML = @getTemplate()  
  
    if @place.appendChild
      @place.appendChild wrapper 
    else if @place.append
      @place.append wrapper
    else
      @place wrapper
      
    return wrapper
  
  setElems: ->      
    @inputDiv   = @wrapper.firstChild  
    @input      = @inputDiv.firstChild     
    @scroller   = @wrapper.lastChild      
    @code       = @scroller.firstChild       
    
    @mover      = @code.firstChild  
    @gutter     = @mover.firstChild    
    @gutterText = @gutter.firstChild   
    @lineSpace  = @gutter.nextSibling.firstChild   
    @measure    = @lineSpace.firstChild           
    @cursor     = @measure.nextSibling    
    @cursorDiv  = @measure.nextSibling    
    @lineDiv    = @cursor.nextSibling  
    
  setInputStyles: ->        
    @input.style.width = "0px" if @ios 
    @input.style.width    = "0px" if /AppleWebKit/.test(navigator.userAgent) and /Mobile\/\w+/.test(navigator.userAgent)
    @lineSpace.draggable  = true unless @webkit
    @input.tabIndex       = @options.tabindex if @options.tabindex?
    @gutter.style.display = "none" if not @options.gutter and not @options.lineNumbers     
  
  checkStringWidth: ->       
    try
      @stringWidth "x"
    catch e
      e = new Error("A Pen inside a P-style element does not work in Internet Explorer. (innerHTML bug)") if e.message.match(/runtime/i)
      throw e
  
  setupMode: ->  
    @poll      = new Delayed()
    @highlight = new Delayed()
    @blinker   = undefined
    @mode      = undefined
    @doc       = new BranchChunk([new LeafChunk([new Line(this,"")])])
    @work      = undefined
    @focused   = undefined     
  
  loadMode: ->
    @mode = @getMode(@options, @options.mode)   
    
    @doc.iter 0, @doc.size, (line) ->
      line.stateAfter = null
  
    @work = [0]       
    @startWorker()
  
  setupSelection: ->       
    @sel =
      from:
        line: 0
        ch: 0
  
      to:
        line: 0
        ch: 0
  
      inverted: false   
  
  setupVars: ->      
    @shiftSelecting     = undefined
    @lastClick          = undefined
    @lastDoubleClick    = undefined
    @draggingText       = undefined 
    @lastScrollPos      = 0
    @overwrite          = false      
    @suppressEdits      = false
    @updateInput        = undefined
    @userSelChange      = undefined
    @changes            = []
    @textChanged        = undefined
    @selectionChanged   = undefined
    @leaveInputAlone    = undefined
    @gutterDirty        = undefined
    @callbacks          = undefined
    @displayOffset      = 0
    @showingFrom        = 0
    @showingTo          = 0
    @lastSizeC          = 0
    @bracketHighlighted = undefined
    @maxLine            = ""
    @maxWidth           = undefined
    @tabText            = @computeTabText()   
    @escapeElement      = document.createElement("pre")   
    @tempId             = Math.floor(Math.random() * 0xffffff).toString(16)         
       
    @operate(->
      @setValueF @options.value or " "
      @updateInput = false
    )              
    @history = new History()  
  
  setOperations: ->            
    @setValue         = @operation(@setValueF)
    @replaceSelection = @operation(@replaceSelectionF)           
    
    @undo = @operation(@undoF)
    @redo = @operation(@redoF)       
    
    @indentLine = @operation((n, dir) =>
      @indentLineF n, (if not dir? then "smart" else (if dir then "add" else "subtract")) if @isLine(n)
    )       
    
    @indentSelection = @operation(@indentSelected)      
    
    @matchBrackets = @operation(->
      @matchBracketsF true
    )   
    
    @markText     = @operation(@markTextF)
    @setMarker    = @operation(@addGutterMarker)
    @clearMarker  = @operation(@removeGutterMarker)
    
    @replaceRange = @operation(@replaceRangeF) 
    
    @moveH    = @operation(@moveHF)
    @deleteH  = @operation(@deleteHF)
    @moveV    = @operation(@moveVF)   
    
    @setLineClass = @operation(@setLineClassF) 
    
    @hideLine = @operation((h) ->
      @setLineHidden h, true
    )      
    
    @showLine = @operation((h) =>
      @setLineHidden h, false
    )
    
    @setLine = @operation((line, text) =>
      if @isLine(line)
        @replaceRange text,
          line: line
          ch: 0
        ,
          line: line
          ch: @getLine(line).text.length
    )    
    
    @removeLine = @operation((line) ->
      if @isLine(line)
        @replaceRange "",
          line: line
          ch: 0
        , @clipPos(
          line: line + 1
          ch: 0
        )
    )            

    @getTokenAt = @operation((pos) ->
      pos = @clipPos(pos)
      @getLine(pos.line).getTokenAt @mode, @getStateBefore(pos.line), pos.ch
    )
    
    @setCursor = @operation((line, ch, user) =>
      if not ch? and typeof line.line is "number"
        @setCursorF line.line, line.ch, user
      else
        @setCursorF line, ch, user
    ) 
    
    @setSelection = @operation((from, to, user) =>
      if user 
        @setSelectionUser(@clipPos(from), @clipPos(to or from)) 
      else 
        @setSelectionF(@clipPos(from), @clipPos(to or from)) 
    )    
      
  setupConnections: =>     
    $(@scroller).mousedown @operation(@onMouseDown)  
    $(@scroller).dblclick @operation(@onDoubleClick)
    @connect @lineSpace, "dragstart", @onDragStart
    @connect @lineSpace, "selectstart", @e_preventDefault    
    
    @connect @scroller, "contextmenu", @onContextMenu unless @gecko
    @connect @scroller, "scroll", =>      
      @lastScrollPos = @scroller.scrollTop
      @updateDisplay []
      @gutter.style.left = @scroller.scrollLeft + "px" if @options.fixedGutter
      @options.onScroll this if @options.onScroll
    
    @connect window, "resize", =>
      @updateDisplay true 
      
    @connect @input, "keyup", @operation(@onKeyUp)
    @connect @input, "input", @operation(@fastPoll)
    @connect @input, "keydown", @operation(@onKeyDown)
    @connect @input, "keypress", @operation(@onKeyPress)
    @connect @input, "focus", @operation(@onFocus)
    @connect @input, "blur", @onBlur      
    @connect @scroller, "dragenter", @e_stop
    @connect @scroller, "dragover", @e_stop
    @connect @scroller, "drop", @operation(@onDrop)
    @connect @scroller, "paste", =>
      @focusInput()
      @fastPoll()
    
    @connect @input, "paste", @fastPoll
    @connect @input, "cut", @operation(=>
      @replaceSelection ""
    )

  defineMode: (name, mode) ->      
    @defaults.mode = name if not @defaults.mode and name isnt "null"
    @modes[name]   = mode
  
  defineMIME: (mime, spec) ->    
    @mimeModes[mime] = spec
  
  getMode: (options, spec) =>        
    spec = @mimeModes[spec] if typeof spec is "string" and @mimeModes.hasOwnProperty(spec)  
    
    if typeof spec is "string"
      mname  = spec
      config = {}
    else if spec?
      mname  = spec.name
      config = spec
    mfactory = @modes[mname]  
    
    unless mfactory
      console.warn "No mode " + mname + " found, falling back to plain text." if window.console
      return @getMode(options, "text/plain")      
        
    if typeof mfactory is "object"
      return mfactory
    else
      return new mfactory(options, config or {})
      
  listModes: ->    
    list = []
    for m of @modes
      list.push m if @modes.propertyIsEnumerable(m)
    list

  listMIMEs: -> 
    list = []      
    
    for m of @mimeModes
      if @mimeModes.propertyIsEnumerable(m)
        list.push
          mime: m
          mode: @mimeModes[m]
    list
    
  defineExtension: (name, func) ->   
    @extensions[name] = func 
        
  focus: ->       
    @focusInput()
    @onFocus()
    @fastPoll() 
  
  setOption: (option, value) ->      
    oldVal = @options[option]
    @options[option] = value      
    
    if option is "mode" or option is "indentUnit"
      @loadMode()
    else if option is "readOnly" and value
      @onBlur()
      @input.blur()
    else if option is "theme"
      @themeChanged()
    else if option is "lineWrapping" and oldVal isnt value
      @operation(@wrappingChanged)()
    else @operation(@tabsChanged)() if option is "tabSize"   
    
    @operation(@gutterChanged)() if option is "lineNumbers" or option is "gutter" or option is "firstLineNumber" or option is "theme"

  getOption: (option) ->    
    @options[option]  
  
  historySize: ->         
    undo: @history.done.length
    redo: @history.undone.length   
  
  clearHistory: ->  
    @history = new History()
  
  getStateAfter: (line) ->    
    line = @clipLine((if not line? then @doc.size - 1 else line))
    @getStateBefore line + 1
  
  cursorCoords: (start) ->  
    start = @sel.inverted  unless start?
    @pageCoords (if start then @sel.from else @sel.to)
  
  charCoords: (pos) ->      
    @pageCoords @clipPos(pos)
  
  coordsChar: (coords) ->     
    off_ = @eltOffset(@lineSpace)  
    @coordsCharF coords.x - off_.left, coords.y - off_.top     
  
  getRangeWrap: (from, to) ->  
    @getRange @clipPos(from), @clipPos(to)
  
  execCommand: (cmd) ->
    @commands[cmd] this

  toggleOverwrite: ->    
    @overwrite = not @overwrite
  
  posFromIndex: (off_) ->   
    lineNo = 0
    ch     = undefined   
    
    @doc.iter 0, @doc.size, (line) =>
      sz = line.text.length + 1
      if sz > off_
        ch = off_
        return true
      off_ -= sz
      ++lineNo
  
    @clipPos
      line: lineNo
      ch: ch
  
  indexFromPos: (coords) -> 
    return 0 if coords.line < 0 or coords.ch < 0
    index = coords.ch  
    
    @doc.iter 0, coords.line, (line) =>
      index += line.text.length + 1
  
    index
  
  operate: (f) =>  
    return @operation(f)()
  
  refresh: ->    
    @updateDisplay true
    @scroller.scrollTop = @lastScrollPos if @scroller.scrollHeight > @lastScrollPos
  
  getInputField: ->
    @input
  
  getWrapperElement: ->
    @wrapper
  
  getScrollerElement: ->
    @scroller
  
  getGutterElement: ->
    @gutter             
  
  copyState: (mode, state) ->  
    return state if state is true
    return mode.copyState(state) if mode.copyState      
    
    nstate = {}    
    for n of state
      val = state[n]
      val = val.concat([]) if val instanceof Array
      nstate[n] = val  
      
    nstate  
  
  startState: (mode, a1, a2) ->
    return true unless mode
    (if mode.startState then mode.startState(a1, a2) else true)  
    
module.exports = Pen   