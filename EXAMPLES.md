# 📚 Examples - AI Gateway CLI v2.0

## Real-world Use Cases với Memory Features

### 1. 👨‍💻 Multi-day Code Review Project

```bash
# Day 1: Start comprehensive code review
ai-gateway interactive --auto-save \
  --model openai/gpt-4 \
  --system "You are a senior software engineer doing code review. Focus on security, performance, and best practices."

> I'm reviewing a large codebase. Let's start with the authentication module.
> [paste authentication code...]
🤖 [AI analyzes and provides feedback...]

> Now let's look at the database layer...
🤖 [AI remembers the auth context and checks for consistency...]

# Conversation saved automatically as conv_1730180400_abc123

# Day 2: Continue where you left off
ai-gateway interactive -c conv_1730180400_abc123

> Yesterday we reviewed auth and database. Let's now check the API endpoints.
🤖 [AI remembers everything and provides contextual feedback...]

# Export full review
ai-gateway export conv_1730180400_abc123 code-review-report.md
```

### 2. 📖 Learning Complex Topic Over Time

```bash
# Start learning session
ai-gateway interactive --auto-save \
  --model anthropic/claude-3-opus \
  --max-context-tokens 50000 \
  --system "You are a patient tutor teaching advanced computer science"

> I want to learn about distributed systems. Start with the basics.
🤖 [Explains fundamentals...]

> Can you give examples?
🤖 [Provides examples...]

# Check token usage
> tokens
📊 Token Usage:
   Current: 5.2K tokens
   Limit: 200.0K tokens
   Used: 2.6%
   Messages: 12

# Continue learning over multiple sessions
# ID: conv_learning_xyz789

# Week later, continue
ai-gateway chat "Can you summarize what we learned about consensus algorithms?" \
  -c conv_learning_xyz789
```

### 3. 🎨 Creative Writing Project

```bash
# Start novel writing with high creativity
ai-gateway interactive --auto-save \
  --model anthropic/claude-3-opus \
  --temperature 0.9 \
  --system "You are a creative writing partner helping develop a sci-fi novel"

> Let's brainstorm ideas for a story about AI consciousness
🤖 [Generates creative ideas...]

> I like idea #3. Let's develop the main character
🤖 [Develops character with consistency to previous ideas...]

> Now outline the first 3 chapters
🤖 [Creates outline based on character and ideas...]

# Save as you go
> save
💾 Saved conversation: Chat 10/29/2025...
   ID: conv_novel_def456

# Later sessions
ai-gateway interactive -c conv_novel_def456
> Let's work on chapter 1 now. Remember the character traits we defined?
🤖 [Continues with perfect memory of all previous context...]

# Export for editing
ai-gateway export conv_novel_def456 novel-draft.md
```

### 4. 🔬 Research Assistant

```bash
# Long research session
ai-gateway interactive --auto-save \
  --model openai/gpt-4-turbo \
  --max-context-tokens 30000 \
  --system "You are a research assistant helping with literature review"

> I'm researching quantum computing applications. Let's start with quantum algorithms
🤖 [Provides information...]

> Now explain Shor's algorithm in detail
🤖 [Detailed explanation...]

> How does this relate to what we discussed about quantum gates?
🤖 [AI remembers and connects concepts...]

# Check progress
> tokens
📊 Token Usage:
   Current: 18.5K tokens
   Limit: 128.0K tokens
   Used: 14.5%

# Multiple sessions over weeks
# Export final research notes
ai-gateway export conv_research_123 research-notes.md
```

### 5. 🏢 Team Standup Automation

```bash
#!/bin/bash
# daily-standup.sh

CONV_ID="conv_standup_october_2025"
TODAY=$(date +%Y-%m-%d)

# Morning standup
echo "=== Daily Standup - $TODAY ==="

# Summarize yesterday
ai-gateway chat "Summarize what we accomplished yesterday" -c $CONV_ID

# Add today's tasks
ai-gateway chat "Today's tasks:
- Implement user authentication
- Review PR #123
- Meeting at 2pm about architecture
Please track these." -c $CONV_ID

# Evening review
# (run this at end of day)
ai-gateway chat "End of day update:
- ✅ Auth implemented
- ✅ PR reviewed
- ⏳ Architecture meeting - decisions made
What should be priorities tomorrow?" -c $CONV_ID

# Export weekly report
# ai-gateway export $CONV_ID standup-week-43.md
```

### 6. 🎓 Interview Preparation

```bash
# Prepare for technical interviews
ai-gateway interactive --auto-save \
  --model openai/gpt-4 \
  --system "You are a senior engineer conducting mock technical interviews"

> Let's practice system design interviews. Start with 'Design Twitter'
🤖 [Asks clarifying questions...]

> [Answer clarifying questions...]
🤖 [Evaluates approach, gives feedback...]

> What about the database schema?
🤖 [Discusses, remembers previous constraints mentioned...]

# Practice multiple problems
# All context preserved

# Review before actual interview
ai-gateway show conv_interview_prep
# Shows all problems practiced and feedback received
```

### 7. 📊 Data Analysis Workflow

```bash
# Start analysis session
ai-gateway interactive --auto-save \
  --model openai/gpt-4 \
  --system "You are a data scientist. Help analyze data and suggest approaches."

> I have a dataset with 1M rows, 50 columns. Sales data. What should I check first?
🤖 [Suggests initial analysis steps...]

> Here are the summary statistics: [paste stats]
🤖 [Analyzes and gives insights...]

> I found anomalies in Q3. Can you help investigate based on what we've seen?
🤖 [Investigates with full context...]

# Continue analysis over days
# Export findings
ai-gateway export conv_analysis_ghi789 analysis-report.md
```

### 8. 🌐 Multi-language Translation Project

```bash
# Translation with context preservation
ai-gateway interactive --auto-save \
  --model openai/gpt-4 \
  --system "You are a professional translator. Maintain consistency across translations."

> Translate this technical document from English to Vietnamese. Let's start with the introduction.
🤖 [Translates with technical accuracy...]

> Now chapter 1. Remember the technical terms we defined in the intro.
🤖 [Maintains terminology consistency...]

> Check chapter 2 for consistency with chapter 1's style
🤖 [Reviews with memory of all previous translations...]
```

### 9. 🔧 Debugging Session

```bash
# Complex debugging with context
ai-gateway interactive --auto-save \
  --model openai/gpt-4 \
  --system "You are a debugging expert. Help trace issues systematically."

> My app crashes when uploading files. Here's the error log: [paste log]
🤖 [Analyzes error...]

> Here's the upload function: [paste code]
🤖 [Reviews code in context of error...]

> I also have this middleware that runs first: [paste middleware]
🤖 [Connects dots between middleware and upload function...]

> Found it! The middleware was the issue. Thanks!
🤖 [Can reference this solution in future questions...]
```

### 10. 📈 Business Strategy Discussion

```bash
# Strategic planning
ai-gateway interactive --auto-save \
  --model anthropic/claude-3-opus \
  --temperature 0.7 \
  --system "You are a business strategy consultant"

> Our startup is in fintech. Let's discuss market positioning.
🤖 [Discusses market...]

> Based on that positioning, what should our product roadmap be?
🤖 [Suggests roadmap considering the positioning discussed...]

> Now let's think about go-to-market strategy that aligns with this roadmap
🤖 [Everything connected with perfect memory...]

# Export for team presentation
ai-gateway export conv_strategy_jkl012 strategy-deck-draft.md
```

## 💡 Pro Tips

### Managing Long Conversations

```bash
# Monitor token usage regularly
ai-gateway interactive --auto-save
> tokens  # Check periodically

# When approaching limits, export and start fresh
ai-gateway export conv_old_123 archive.md
ai-gateway interactive --auto-save  # Start new session

# Or use max-context-tokens to auto-manage
ai-gateway interactive --auto-save --max-context-tokens 20000
# CLI will auto-trim old messages
```

### Organizing Conversations

```bash
# List all conversations
ai-gateway convs

# Review before continuing
ai-gateway show conv_123

# Clean up old conversations
ai-gateway delete conv_old_project
```

### Sharing Work

```bash
# Export with nice formatting
ai-gateway export conv_123 report.md

# Share markdown with team
cat report.md  # Well-formatted with timestamps and roles
```

---

**Với memory features, bạn có thể làm việc với AI như một partner thực sự - AI nhớ mọi thứ và build on top của context! 🚀**
