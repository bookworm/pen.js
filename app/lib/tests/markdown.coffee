class MarkdownExample       
  
  sampleDoc: ->    
    string = """       
    # hub: git + hub = github

    `hub` is a command line utility which adds GitHub knowledge to `git`.

    It can be used on its own or as a `git` wrapper.

    Normal:

        $ hub clone rtomayko/tilt

        Expands to:
        $ git clone git://github.com/rtomayko/tilt.git

    Wrapping `git`:

        $ git clone rack/rack

        Expands to:
        $ git clone git://github.com/rack/rack.git

    hub requires you have `git` installed and in your `$PATH`. It also
    requires Ruby 1.8.6+ or Ruby 1.9.1+. No other libraries necessary.


    # Install

    ## Standalone
    """
    return string
    
module.exports = MarkdownExample