class Xml        
  electricChars: "/"
  
  tagName: undefined
  type: undefined
  curState: undefined
  setStyle: undefined 
  
  constructor: (pen, config, parserConfig) ->    
    @pen          = pen
    @config       = config
    @parserConfig = parserConfig
    
    @indentUnit = @config.indentUnit  
    
    Kludges = (
      if @parserConfig.htmlMode 
        autoSelfClosers:
          br: true
          img: true
          hr: true
          link: true
          input: true
          meta: true
          col: true
          frame: true
          base: true
          area: true

        doNotIndent:
          pre: true

        allowUnquoted: true
      else
        autoSelfClosers: {}
        doNotIndent: {}
        allowUnquoted: false       
    )
    @alignCDATA = @parserConfig.alignCDATA
     
  inText: (stream, state) ->  
    
    chain = (parser) =>
      state.tokenize = parser
      parser stream, state    
      
    ch = stream.next()
    if ch is "<"
      if stream.eat("!")
        if stream.eat("[")
          if stream.match("CDATA[")
            chain inBlock("atom", "]]>")
          else
            null
        else if stream.match("--")
          chain inBlock("comment", "-->")
        else if stream.match("DOCTYPE", true, true)
          stream.eatWhile /[\w\._\-]/
          chain doctype(1)
        else
          null
      else if stream.eat("?")
        stream.eatWhile /[\w\._\-]/
        state.tokenize = inBlock("meta", "?>")
        "meta"
      else
        type = (if stream.eat("/") then "closeTag" else "openTag")
        stream.eatSpace()
        tagName = ""
        c = undefined
        tagName += c  while (c = stream.eat(/[^\s\u00a0=<>\"\'\/?]/))
        state.tokenize = inTag
        "tag"
    else if ch is "&"
      stream.eatWhile /[^;]/
      stream.eat ";"
      "atom"
    else
      stream.eatWhile /[^&<]/
      null   
      
  inTag: (stream, state) ->
    ch = stream.next()
    if ch is ">" or (ch is "/" and stream.eat(">"))
      state.tokenize = inText
      type = (if ch is ">" then "endTag" else "selfcloseTag")
      "tag"
    else if ch is "="
      type = "equals"
      null
    else if /[\'\"]/.test(ch)
      state.tokenize = inAttribute(ch)
      state.tokenize stream, state
    else
      stream.eatWhile /[^\s\u00a0=<>\"\'\/?]/
      "word"     
      
  inAttribute: (quote) ->
    (stream, state) =>
      until stream.eol()
        if stream.next() is quote
          state.tokenize = inTag
          break
      "string"  
      
  inBlock: (style, terminator) ->
    (stream, state) =>
      until stream.eol()
        if stream.match(terminator)
          state.tokenize = inText
          break
        stream.next()
      style          
      
  doctype: (depth) ->
    (stream, state) =>
      ch = undefined
      while (ch = stream.next())?
        if ch is "<"
          state.tokenize = doctype(depth + 1)
          return state.tokenize(stream, state)
        else if ch is ">"
          if depth is 1
            state.tokenize = inText
            break
          else
            state.tokenize = doctype(depth - 1)
            return state.tokenize(stream, state)
      "meta"
      
  pass: ->
    i = arguments.length - 1

    while i >= 0
      @curState.cc.push arguments[i]
      i-- 
      
  cont: ->
    @pass.apply null, arguments
    true  
    
  pushContext: (tagName, startOfLine) ->
    @noIndent = @Kludges.doNotIndent.hasOwnProperty(@tagName) or (@curState.context and @curState.context.noIndent)
    @curState.context =
      prev: curState.context
      tagName: tagName
      indent: curState.indented
      startOfLine: startOfLine
      noIndent: noIndent      
      
  popContext: ->
    @curState.context = @curState.context.prev if @curState.context         
    
  element: (type) ->
    if type is "openTag"
      curState.tagName = tagName
      return cont(attributes, endtag(curState.startOfLine))
    else if type is "closeTag"
      err = false
      if curState.context
        err = curState.context.tagName isnt tagName
      else
        err = true
      setStyle = "error"  if err
      return cont(endclosetag(err))
    cont()       
    
  endtag: (startOfLine) ->
    (type) ->
      return cont()  if type is "selfcloseTag" or (type is "endTag" and Kludges.autoSelfClosers.hasOwnProperty(curState.tagName.toLowerCase()))
      if type is "endTag"
        pushContext curState.tagName, startOfLine
        return cont()
      cont()   
      
  endclosetag: (err) ->
    (type) ->
      setStyle = "error"  if err
      if type is "endTag"
        popContext()
        return cont()
      setStyle = "error"
      cont arguments.callee  
      
  attributes: (type) ->
    if type is "word"
      setStyle = "attribute"
      return cont(attributes)
    return cont(attvalue, attributes)  if type is "equals"
    if type is "string"
      setStyle = "error"
      return cont(attributes)
    pass()   
    
  attvalue: (type) ->
    if type is "word" and Kludges.allowUnquoted
      setStyle = "string"
      return cont()
    return cont(attvaluemaybe)  if type is "string"
    pass()   
    
  attvaluemaybe: (type) ->
    if type is "string"
      @cont @attvaluemaybe
    else
      @pass()  
      
  startState: ->
    tokenize: @inText
    cc: []
    indented: 0
    startOfLine: true
    tagName: null
    context: null

  token: (stream, state) ->       
    if stream.sol()
      state.startOfLine = true
      state.indented = stream.indentation()
    return null if stream.eatSpace()    
    
    setStyle = type = tagName = null
    style = state.tokenize(stream, state)
    state.type = type
    if (style or type) and style isnt "comment"
      curState = state
      loop
        comb = state.cc.pop() or element
        break  if comb(type or style)
    state.startOfLine = false
    setStyle or style

  indent: (state, textAfter, fullLine) ->
    context = state.context
    return (if fullLine then fullLine.match(/^(\s*)/)[0].length else 0)  if (state.tokenize isnt inTag and state.tokenize isnt inText) or context and context.noIndent
    return 0  if alignCDATA and /<!\[CDATA\[/.test(textAfter)
    context = context.prev  if context and /^<\//.test(textAfter)
    context = context.prev  while context and not context.startOfLine
    if context
      context.indent + indentUnit
    else
      0

  compareStates: (a, b) ->
    return false  if a.indented isnt b.indented or a.tokenize isnt b.tokenize
    ca = a.context
    cb = b.context

    loop
      return ca is cb  if not ca or not cb
      return false  unless ca.tagName is cb.tagName
      ca = ca.prev
      cb = cb.prev
  
module.exports = Xml