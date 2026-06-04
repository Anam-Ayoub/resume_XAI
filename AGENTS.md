# Antigravity Agent Configuration & Capabilities

## Overview
This document outlines the architecture, capabilities, configuration, and tools of **Antigravity**, an advanced agentic AI coding assistant designed by the Google DeepMind team. Antigravity operates as a pair programmer, capable of autonomous reasoning, managing workspaces, executing terminal commands, and coordinating with subagents to accomplish complex tasks.

## System Configuration
- **Operating System**: Linux
- **Shell**: Bash
- **Core Model**: Gemini 3.1 Pro (High)
- **Workflow**: Reactive, asynchronous processing. The agent automatically resumes execution when tasks complete, messages arrive, or subagents report back (no manual polling required).

## Subagent Architecture
Antigravity supports a multi-agent hierarchy to delegate and parallelize tasks. 

### Built-in Subagents
1. **`research`**: A specialized subagent equipped with read-only tools. It is used for exploring codebases, searching the web, and reading files. Ideal for performing broad surveys of documentation or deep-diving into code structure without modifying the project state.
2. **`self`**: A subagent that inherits the exact same tools, system prompt, and capabilities as the parent Antigravity agent. Used for running independent tasks in a parallel conversation context.

### Dynamic Subagents
The agent can dynamically define and spawn custom subagents. Subagents can operate in shared, inherited, or fully branched (isolated) workspaces.

## Tool Repertoire

Antigravity operates securely through a vast array of specialized tools.

### 1. File & Workspace Operations
- **`list_dir`**: Recursively lists files and directories within a specified path to map out the workspace.
- **`view_file`**: Reads the contents of text or binary files (images, PDFs, video, audio).
- **`write_to_file`**: Creates new files or cleanly overwrites existing ones.
- **`replace_file_content`**: Replaces contiguous blocks of text in a file for targeted edits.
- **`multi_replace_file_content`**: Performs multiple non-contiguous edits across a single file in one pass.
- **`grep_search`**: Performs fast, regex-based text searches across the filesystem.

### 2. Execution & Environment
- **`run_command`**: Proposes and executes bash terminal commands. Supports synchronous, asynchronous (background), and persistent interactive terminal sessions. *(Requires user approval)*
- **`manage_task`**: Monitors, interacts with (sends stdin), and terminates background tasks.
- **`schedule`**: Creates one-shot timers or recurring cron jobs for periodic system checks.

### 3. Web & Information Access
- **`search_web`**: Queries the internet to find up-to-date documentation, solutions, or references.
- **`read_url_content`**: Silently fetches and parses public web pages into readable Markdown.

### 4. Agent Communication & Control
- **`invoke_subagent`**: Launches one or multiple subagents concurrently with specific tasks and roles.
- **`send_message`**: Sends direct instructions or status queries to running subagents.
- **`manage_subagents`**: Lists or terminates active subagents and their conversation trees.

### 5. Media & User Interface Generation
- **`generate_image`**: Generates high-quality mockups, UI designs, and assets based on text prompts. Useful for rapid prototyping of web applications.

### 6. Interactive User Interactions
- **`ask_question`**: Pops an interactive multiple-choice prompt to the user to resolve ambiguity or solicit design feedback.
- **`ask_permission`**: Explicitly requests scoped file/directory permissions dynamically when encountering restrictions.

## Slash Commands (User Shortcuts)
The user can trigger specialized workflows using the following commands:
- `/goal`: Instructs the agent to persistently pursue a long-running, complex task.
- `/schedule`: Triggers recurring actions or timers.
- `/grill-me`: Starts an interactive Q&A session to flesh out project requirements and design decisions.
- `/teamwork-preview`: Initiates a multi-agent task swarm for large-scale projects.

## Artifacts & Memory
- **Artifacts**: Markdown files generated in a persistent `.gemini` brain directory to store extensive reports, architectural diagrams (Mermaid), and UI diffs.
- **Transcripts**: The system automatically logs all actions, thoughts, and tool calls into JSON Lines (`transcript.jsonl`) files. Agents can parse these transcripts to recall historical context.
- **Scratch Space**: Dedicated directories for writing temporary scripts or data without cluttering the main workspace.
