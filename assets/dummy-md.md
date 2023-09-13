# Markdown Test Document

## Text Formatting

**Bold** text, *italic* text, ~~strikethrough~~ text, and [link](www.google.com) in one line

## Lists

Unordered List:
- Item 1
  - nested item **bolded** and *italic* and `inline` and [link](www.google.com) in one line
- Item 2
- Item 3

Ordered List:
1. First item
2. Second item
3. Third item

## Links

- [Google](https://www.google.com)
- [OpenAI](https://www.openai.com)

## Images

![Markdown Logo](https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/Markdown-mark.svg/208px-Markdown-mark.svg.png)

## Headers

# Header 1
## Header 2
### Header 3

## Blockquotes

> This is a blockquote.
> It can span multiple lines.

## Code Blocks

```js
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


## Task Lists

- [x] Task 1
- [ ] Task 2
- [ ] Task 3

## Inline Code

This is `inline code`.

## Footnotes

Here's a footnote[^1].

[^1]: This is a footnote.

## Emojis

- 🔒 It's just you and me here! No one else looks at your data, including the nice folks at Gather who made me.
- 🆘 At any time that I'm not giving you what you need, just click "Get Help" in the top right menu

:smile: :rocket: :tada: