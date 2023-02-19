# Overview

This plugin was created as I had some unique workflows that Logseq templates were not able to support. It allows the creation of 2 types of "PowerBlocks":

1. Button templates
2. Normal templates

Button templates allow the adding of templates using a button, while normal templates work like regular templates. A list of supported syntaxes can be found below.

# Instructions

## Creating the PowerBlocks

1. From anywhere in Logseq, create a block like the below. `#powerblocks` and `#powerblocks-button` cannot be changed.

```markdown
### To create a button template

- Buy milk #powerblocks-button
  - Today is <%DATE:5 days later%>

### To create a normal template

- testing #powerblocks
  - Today is <%DATE:5 days later%>
```

2. The syntaxes currently available can be found in the next section.

## Using the PowerBlocks

1. Trigger the PowerBlocks menu by typing `/Insert PowerBlock`
2. Select either a button template (⏺ ) or a normal template (📃) that you have created.
3. Button templates can be used within a Logseq template if you prefer..

# Syntaxes

Below is the list of available syntaxes. I may consider adding to the list, but as I am not sure how useful anyone will find this plugin, it is likely only syntaxes I use will be added.

- `<%DATE:next tuesday%>`
  In this example, if the template is used on a journal page, it will be relative to the journal day. But if used on a page, it will be relative to today.

- `<%IFDAYOFWEEK:1"%>`
  Block containing this syntax will only be added if the day of the week matches the syntax. 0 is Sunday, 1 is Monday and so on.

- `<%IFMONTHOFYEAR:2%>`
  Block containing this syntax will only be added if the month of the year matches the syntax. 0 is January, 1 is February and so on.

- `<%TIME%>`
  This simply replaces the syntax with the current time.

# Credits

Once again, [chrono-node](https://github.com/wanasit/chrono) for supplying the date parser.
