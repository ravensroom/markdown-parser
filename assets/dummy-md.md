# Markdown Test

    ## indented header with `inline code`
    > indented code block

This is **bold** and *italic* and ~~strike-through~~ and `inline-code` and [link](https://www.google.com).
  This is **bold** and *italic* and ~~strike-through~~ and `inline-code` and [link](https://www.google.com).
    but **bold** text start *italic*
      **bold content with *italic* flavor**
      *italic content with **bold** flavor*

This is `inline code block with **bold** and *italic* and ~~strike-through~~ and [link](https://www.google.com)` inside.

## Lists

* start **bold**
Unordered List:
- Item 1
  1. hello
  2. world
    indented content of item 1
- Item 2
- Item 3

- Item 1
  - nested item **bolded** and *italic* and `inline` and [link](www.google.com) in one line
    - nested inside nesting nested inside nestingnested inside nestingnested inside nestingnested inside nestingnested inside nestingnested inside nestingnested inside nestingnested inside nesting
  - Item 2
  - Item 3

Ordered List:
1. First item
  - unordered inside ordered list
  1. ordered inside ordered list
  2. second
2. Second item
3. Third item

## Links

- this is a link [Google](https://www.google.com) in a list
    [an indented link](https://www.openai.com)
    **bold** content


## Images

![Markdown Logo](https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/Markdown-mark.svg/208px-Markdown-mark.svg.png)
    ![Indented Markdown Logo](https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/Markdown-mark.svg/208px-Markdown-mark.svg.png)


## Headers

# Header 1
## Header 2
### Header 3

## Blockquotes

> This is a blockquote.
> It can span multiple lines.

  > this is indented blockquote
  > and it can span multiple lines

## Code Blocks

    ```js
    // indented code
    const renderMessages = (): JSX.Element[] => {
        const viewMsgs = messages
          .filter((msgData: MsgType) => {
            if (!verboseMode && (msgData.type === 'CHAT_RESPONSE')) {
              return false;
            }
            return true;
          })
        return viewMsgs;
      };
    ```

```py
def submit_feedback(self, feedback_text, thumbs_up_or_down):
    """Logs user feedback in Grafana along with context"""
    feedback_id = uuid.uuid4()
    self.logger.info(
        {
            "type": LoggingEventType.FEEDBACK_SUBMITTED,
            "message": {
                "feedback_type": f"thumbs_{thumbs_up_or_down}",
                "feedback_id": str(feedback_id),
                "feedback": feedback_text,
                # "onstage_messages": json.dumps(self.onstage_messages),
                # "backstage_messages": json.dumps(self.backstage_messages),
                "onstage_messages": self.onstage_messages,
                "backstage_messages": self.backstage_messages,
            },
        }
    )
```

## Horizontal Rule

---

## Tables

                  | Header 1 | Header 2 |
                  |----------|----------|
                  | Cell 1   | Cell 2   |
                  | Cell 3   | Cell 4   |



| Header 1 | Header 2 |
|----------|----------|
| Cell 1   | Cell 2   |
| Cell 3   | Cell 4   |


## Inline Code

This is `inline code`.


## Emojis

- 🔒 It's just you and me here! No one else looks at your data, including the nice folks at Gather who made me.
- 🆘 At any time that I'm not giving you what you need, just click "Get Help" in the top right menu
