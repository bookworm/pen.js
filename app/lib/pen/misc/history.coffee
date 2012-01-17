class History 
  time: 0  
  done: [] 
  undone: [] 
  
  constructor: -> 
    @time   = 0
    @done   = []
    @undone = []           
  
  addChange: (start, added, old) ->  
    @undone.length = 0            
    
    time = +new Date
    last = @done[@done.length - 1]     
    
    if time - @time > 400 or not last or last.start > start + added or last.start + last.added < start - last.added + last.old.length
      @done.push
        start: start
        added: added
        old: old
    else
      oldoff = 0
      if start < last.start
        i = last.start - start - 1

        while i >= 0
          last.old.unshift old[i]
          --i
        last.added += last.start - start
        last.start = start
      else if last.start < start
        oldoff = start - last.start
        added += oldoff       
        
      i = last.added - oldoff
      e = old.length

      while i < e
        last.old.push old[i]
        ++i        
        
      last.added = added if last.added < added
      
      
    @time = time         
    
module.exports = History        