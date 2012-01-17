class Helpers             
  nestedOperation: 0  
  updateInput: null
  changes: []
  selectionChanged: false
  callbacks: [] 
  userSelChange: null
  textChanged: null 
  reScroll: null
  updated: undefined       
  gutterDirty: false   
  leaveInputAlone: false  
  bracketHighlighted: false
  
  connect: (node, type, handler, disconnect) =>
    if typeof node.addEventListener is "function"
      node.addEventListener type, handler, false
      if disconnect
        ->
          node.removeEventListener type, handler, false
    else
      wrapHandler = (event) =>
        handler event or window.event

      node.attachEvent "on" + type, wrapHandler
      if disconnect
        ->
          node.detachEvent "on" + type, wrapHandle 
        
  startOperation: =>    
    @updateInput      = @userSelChange = @textChanged = null
    @changes          = []
    @selectionChanged = false
    @callbacks        = []    
  
  endOperation: =>     
    reScroll = false
    updated  = undefined
    reScroll = not @scrollCursorIntoView() if @selectionChanged     
         
    if @changes.length   
       updated = @updateDisplay(@changes, true)     
    else      
      @updateCursor() if @selectionChanged
      @updateGutter() if @gutterDirty     
     
    @scrollCursorIntoView() if reScroll 
           
    if @selectionChanged
      @scrollEditorIntoView()
      @restartBlink()                
           
    @resetInput @userSelChange if @focused and not @leaveInputAlone and (@updateInput is true or (@updateInput isnt false and @selectionChanged))

    if @selectionChanged and @options.matchBrackets
      setTimeout @operation(->
        if @bracketHighlighted
          @bracketHighlighted()
          @bracketHighlighted = null
        @matchBrackets false if @posEq(@sel.from, @sel.to)
      ), 20  
      
    tc  = @textChanged
    cbs = @callbacks                    
    
    @options.onCursorActivity this if @selectionChanged and @options.onCursorActivity
    @options.onChange this, tc if tc and @options.onChange and this
    
    i = 0 
    while i < cbs.length
      cbs[i] this
      ++i 
             
    @options.onUpdate this if updated and @options.onUpdate   
    
  operation: (f) =>       
    =>
      @startOperation() unless @nestedOperation++
      try
        result = f.apply(this, arguments)
      finally
        @endOperation() unless --@nestedOperation
      result  

  getTemplate: (templateName) ->
    template = '<div style="overflow: hidden; position: relative; width: 3px; height: 0px;">'
    template = template + '<textarea id="Pen-input-shim" style="position: absolute; padding: 0; width: 1px;" wrap="off" autocorrect="off" autocapitalize="off"></textarea>' 
    template = template + '</div>'
    template = template + '<div class="Pen-scroll" tabindex="-1">'  
    template = template + '<div style="position: relative">'
    template = template + '<div style="position: relative">'
    template = template + '<div class="Pen-gutter"><div class="Pen-gutter-text"></div></div>'
    template = template + '<div class="Pen-lines"><div style="position: relative">'
    template = template + '<div style="position: absolute; width: 100%; height: 0; overflow: hidden; visibility: hidden"></div>'
    template = template + '<pre class="Pen-cursor">&#160;</pre>'
    template = template + '<div></div>'        
    template = template + '</div></div></div></div></div>'
    return template 
    
module.exports = Helpers  