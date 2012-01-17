Pen = require("lib/pen/main")
class Markdown 
  
  header:  
    style: "header"
    type: "h1"        
    lineHeight: 26
  code:     "comment"
  quote:    "quote"
  list:    
    style: "string"
    type: "li"   
    lineHeight: 13
  hr:       "hr"
  linktext: "link"
  linkhref: "string"
  em:       "em"
  strong:   "strong"
  emstrong: "emstrong"
  hrRE:     /^[*-=_]/
  ulRE:     /^[*-+]\s+/
  olRE:     /^[0-9]\.\s+/
  headerRE: /^(?:\={3,}|-{3,})$/
  codeRE:   /^(k:\t|\s{4,})/
  textRE:   /^[^\[*_\\<>`]+/
      
  constructor: (pen, config, parserConfig) -> 
    @pen          = pen   
    @config       = config
    @parserConfig = parserConfig

    @htmlMode = @pen.getMode(config,
      name: "xml"
      htmlMode: true  
    )            
   
  # setupHeights
        
  switchInline: (stream, state, f) ->
    state.f = state.inline = f
    f stream, state  
    
  switchBlock: (stream, state, f) ->
    state.f = state.block = f
    f stream, state   
    
  blockNormal: (stream, state) =>       
    if stream.match(@codeRE) 
      stream.skipToEnd()
      return @code  
      
    return null if stream.eatSpace()      
    
    if stream.peek() is "#" or stream.match(@headerRE) 
      stream.skipToEnd()
      return @header  
      
    if match = stream.match(@ulRE, true) or stream.match(@olRE, true)    
      state.indentation += match[0].length
      return @list          
    
    stream.skipToEnd()
    return null       
                   
    #   
    # if stream.eat(">")
    #   state.indentation++
    #   return @quote        
    #   
    # return @switchInline(stream, state, @footnoteLink) if stream.peek() is "["     
    # 
    # if @hrRE.test(stream.peek())
    #   re = new RegExp("(?:s*[" + stream.peek() + "]){3,}$")
    #   return @hr if stream.match(re, true)     
    #   
    # match = undefined  
    # 
    #   
    # @switchInline stream, state, state.inline   
    
  htmlBlock: (stream, state) ->
    style = @htmlMode.token(stream, state.htmlState)      
    
    if style is "tag" and state.htmlState.type isnt "openTag" and not state.htmlState.context
      state.f     = @inlineNormal
      state.block = @blockNormal
    style  
    
  getType: (state) ->
    (if state.strong then (if state.em then @emstrong else strong) else (if state.em then @em else null))   
    
  handleText: (stream, state) =>
    return @getType(state) if stream.match(@textRE, true)
    'undefined'       
    
  inlineNormal: (stream, state) ->
    style = state.text(stream, state)
    return style if typeof style isnt "undefined"      
    
    ch = stream.next()
    if ch is "\\"
      stream.next()
      return @getType(state)  
      
    return @switchInline(stream, state, @inlineElement(code, "`")) if ch is "`"
    return @switchInline(stream, state, @linkText) if ch is "["       
    
    if ch is "<" and stream.match(/^\w/, false)
      stream.backUp 1
      return @switchBlock(stream, state, @htmlBlock)   
      
    t = @getType(state)   
    
    if ch is "*" or ch is "_"
      return (if (state.strong = not state.strong) then @getType(state) else t) if stream.eat(ch)
      return (if (state.em = not state.em) then @getType(state) else t)  
      
    @getType state    
    
  linkText: (stream, state) ->
    until stream.eol()
      ch = stream.next()
      stream.next()  if ch is "\\"
      if ch is "]"
        state.inline = state.f = @linkHref
        return @linktext      
        
    @linktext        
    
  linkHref: (stream, state) ->
    stream.eatSpace()
    ch = stream.next()
    return @switchInline(stream, state, @inlineElement(@linkhref, (if ch is "(" then ")" else "]")))  if ch is "(" or ch is "["
    "error"         
    
  footnoteLink: (stream, state) ->
    if stream.match(/^[^\]]*\]:/, true)
      state.f = @footnoteUrl
      return @linktext  
      
    @switchInline stream, state, @inlineNormal   
    
  footnoteUrl: (stream, state) ->
    stream.eatSpace()
    stream.match /^[^\s]+/, true
    state.f = state.inline = @inlineNormal
    @linkhref    
    
  inlineRE: (endChar) ->
    @inlineRE[endChar] = new RegExp("^(?:[^\\\\\\" + endChar + "]|\\\\.)*(?:\\" + endChar + "|$)") unless @inlineRE[endChar]
    @inlineRE[endChar] 
    
  inlineElement: (type, endChar, next) ->
    next = next or @inlineNormal
    (stream, state) ->
      stream.match @inlineRE(endChar)
      state.inline = state.f = next
      type  
      
  startState: ->
    f: @blockNormal
    block: @blockNormal
    htmlState: @htmlMode.startState()
    indentation: 0
    inline: @inlineNormal
    text: @handleText
    em: false
    strong: false

  copyState: (s) ->
    f: s.f
    block: s.block
    htmlState: @pen.copyState(@htmlMode, s.htmlState)
    indentation: s.indentation
    inline: s.inline
    text: s.text
    em: s.em
    strong: s.strong

  token: (stream, state) -> 
    if stream.sol()
      state.f = state.block    
      
      previousIndentation = state.indentation
      currentIndentation  = 0               
      
      while previousIndentation > 0
        if stream.eat(" ")
          previousIndentation--
          currentIndentation++
        else if previousIndentation >= 4 and stream.eat("\t")
          previousIndentation -= 4
          currentIndentation += 4
        else
          break
      state.indentation = currentIndentation
      return null if currentIndentation > 0    
      
    state.f stream, state     
    
module.exports = Markdown