# How to Build This App with Ralphy

## Prerequisites

1. **Install Ralphy dependencies**:
   - [Claude Code](https://github.com/anthropics/claude-code) (default AI engine)
   - `jq` (for JSON parsing)

   ```bash
   # Install Claude Code
   npm install -g @anthropic-ai/claude-code

   # Install jq (macOS)
   brew install jq
   ```

2. **Clone Ralphy** (if not already done):
   ```bash
   git clone https://github.com/michaelshimeles/ralphy.git
   cd ralphy
   chmod +x ralphy.sh
   ```

## Running Ralphy to Build the App

### Option 1: Sequential Execution (Recommended for first-time)

Navigate to this project directory and run ralphy with the PRD:

```bash
cd ~/adhd-learning-app
/path/to/ralphy/ralphy.sh --prd PRD.md
```

Replace `/path/to/ralphy/` with the actual path to your ralphy installation.

**What happens:**
- Ralphy will read each task from PRD.md
- Execute them one-by-one using Claude Code
- Auto-commit each completed task
- Update PRD.md to mark tasks as complete (change `- [ ]` to `- [x]`)
- Log progress to `.ralphy/progress.txt`

**Monitor progress:**
```bash
# In another terminal, watch progress
tail -f .ralphy/progress.txt

# Or check the PRD to see completed tasks
cat PRD.md
```

### Option 2: Parallel Execution (Faster, Advanced)

For independent tasks that can run simultaneously:

```bash
cd ~/adhd-learning-app
/path/to/ralphy/ralphy.sh --prd PRD.md --parallel --max-parallel 3
```

**Benefits:**
- 3 AI agents work on different tasks simultaneously
- Each gets isolated git worktree and branch
- Auto-merges when done (or creates PRs with `--create-pr`)

### Option 3: Single Task Mode

If you just want to add a specific feature:

```bash
cd ~/adhd-learning-app
/path/to/ralphy/ralphy.sh "add dark mode toggle to settings"
```

## Configuration

The project is already configured in `.ralphy/config.yaml` with:
- ADHD-friendly design rules
- Accessibility requirements
- Code quality guidelines

View config:
```bash
/path/to/ralphy/ralphy.sh --config
```

Add custom rules:
```bash
/path/to/ralphy/ralphy.sh --add-rule "use TypeScript for type safety"
```

## Testing the App

After ralphy completes tasks:

1. **Open the app**:
   ```bash
   cd ~/adhd-learning-app
   open index.html  # macOS
   # or just double-click index.html
   ```

2. **Test features**:
   - Navigate between pages
   - Start a quiz
   - Check progress tracking
   - Test gamification (points, badges)

3. **Add OpenAI API Key**:
   - The app will prompt for your API key on first run
   - Get key from: https://platform.openai.com/api-keys
   - Stored securely in browser's LocalStorage

## Customization After Build

Once the base app is built, you can:

1. **Modify topics**: Edit `js/data/topics.js`
2. **Adjust achievements**: Edit `js/data/achievements.js`
3. **Change styling**: Edit `css/styles.css` and `css/themes.css`
4. **Add more subjects**: Use ralphy to add new topics

Example:
```bash
/path/to/ralphy/ralphy.sh "add Geography as a new subject category"
```

## Troubleshooting

**Ralphy stops mid-task:**
- Check `.ralphy/progress.txt` for errors
- Tasks auto-retry 3 times by default
- Increase retries: `--max-retries 5`

**Task already completed:**
- Ralphy skips tasks marked `[x]` in PRD.md
- To re-run, change `[x]` back to `[ ]`

**Need to reset:**
```bash
git reset --hard HEAD  # Undo uncommitted changes
# Or start fresh:
rm -rf ~/adhd-learning-app
# Re-create using the setup steps
```

## Next Steps

1. **Run ralphy** to build the app
2. **Test thoroughly** after each phase (see PRD.md phases)
3. **Customize** topics and content for your son
4. **Deploy** to GitHub Pages or Netlify for easy access
5. **Iterate** with ralphy to add more features

## Useful Commands

```bash
# View current config
/path/to/ralphy/ralphy.sh --config

# Dry run (preview without executing)
/path/to/ralphy/ralphy.sh --prd PRD.md --dry-run

# Skip tests and linting (fast mode)
/path/to/ralphy/ralphy.sh --prd PRD.md --fast

# Create branches and PRs for each task
/path/to/ralphy/ralphy.sh --prd PRD.md --branch-per-task --create-pr

# Use different AI engine
/path/to/ralphy/ralphy.sh --prd PRD.md --cursor  # or --opencode
```

## Estimated Build Time

- **Sequential**: ~2-4 hours (depends on AI response time)
- **Parallel**: ~1-2 hours (3 agents working simultaneously)

Progress is saved continuously, so you can stop and resume anytime.

---

**Questions?** Check the main ralphy README or ask for help!
