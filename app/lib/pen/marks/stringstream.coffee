class StringStream 
  pos: null    
  string: ""
  tabSize: null  
  start: 0    
  bracketHighlighted: null    
  sel: null 
  pen: null
  
  matching =
    "(": ")>"
    ")": "(<"
    "[": "]>"
    "]": "[<"
    "{": "}>"
    "}": "{<"
    
  constructor: (pen, string, tabSize) ->      
    @pen     = pen
    @pos     = @start = 0
    @string  = string
    @tabSize = tabSize or 8
    
  eol: ->  
    @pos >= @string.length

  sol: ->  
    @pos is 0

  peek: ->       
    @string.charAt @pos

  next: ->  
    @string.charAt @pos++ if @pos < @string.length

  eat: (match) -> 
    ch = @string.charAt(@pos)   
    
    if typeof match is "string"
      ok = ch is match
    else
      ok = ch and (if match.test then match.test(ch) else match(ch))
    if ok
      ++@pos
      ch

  eatWhile: (match) -> 
    @start = @pos
    continue while eat(match)
    @pos > @start

  eatSpace: ->   
    @start = @pos
    ++@pos while /[\s\u00a0]/.test(@string.charAt(@pos))
    @pos > @start

  skipToEnd: ->
    @pos = @string.length

  skipTo: (ch) ->   
    found = @string.indexOf(ch, @pos)
    if found > -1
      @pos = found
      true

  backUp: (n) -> 
    @pos -= n

  column: ->       
    @pen.countColumn @string, @start, @tabSize

  indentation: ->    
    @pen.countColumn @string, null, @tabSize

  match: (pattern, consume, caseInsensitive) ->  
    if typeof pattern is "string"      
      cased = (str) => 
        (if caseInsensitive then str.toLowerCase() else str)  
        
      if cased(@string).indexOf(cased(pattern), @pos) is @pos  
        @pos += pattern.length if consume isnt false
        true
    else
      match = @string.slice(@pos).match(pattern)
      @pos += match[0].length if match and consume isnt false
      match  
      
    # false

  current: -> 
    @string.slice @start, @pos    
        
module.exports = StringStream