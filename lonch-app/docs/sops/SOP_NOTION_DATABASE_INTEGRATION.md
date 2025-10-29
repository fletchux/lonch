# Standard Operating Procedure: Adding Entries to Notion Database via Claude Code CLI

## Purpose
This SOP documents how employees and AI agents can add entries to the Weekly Notes & Tracking database from the Claude Code command line interface.

## Prerequisites
- Notion MCP integration configured and connected in Claude Code
- Access to the Weekly Notes & Tracking database (Database ID: `29b9ec58-0a3f-8152-a000-ea4f6fc6b1ee`)
- MPC Fletch bot integration must be connected to the database page

## Database Structure

### Properties
- **Title** (required) - Main content of the entry
- **Type** (optional) - Task, Finding, Needs Research, Question, Idea, or Note
- **Priority** (optional) - High, Medium, or Low
- **Status** (optional) - Not Started, In Progress, Completed, or Blocked
- **Week** (optional) - Date or week for the entry

## Instructions for Claude AI

When a user requests to add an entry to the database, follow these steps:

### Step 1: Gather Information
- Determine the entry title/content
- Identify the Type (if specified, otherwise leave blank)
- Note any Priority, Status, or Week/Date information

### Step 2: Use the Notion MCP API

Call `mcp__notion__API-post-page` with the following structure:

#### Example: Adding a Task with full properties

```json
{
  "parent": {
    "type": "database_id",
    "database_id": "29b9ec58-0a3f-8152-a000-ea4f6fc6b1ee"
  },
  "properties": {
    "Title": {
      "title": [
        {
          "text": {
            "content": "Your task description here"
          }
        }
      ]
    },
    "Type": {
      "select": {
        "name": "Task"
      }
    },
    "Priority": {
      "select": {
        "name": "High"
      }
    },
    "Status": {
      "select": {
        "name": "In Progress"
      }
    },
    "Week": {
      "date": {
        "start": "2025-10-28"
      }
    }
  }
}
```

#### Example: Adding a Finding with no priority

```json
{
  "parent": {
    "type": "database_id",
    "database_id": "29b9ec58-0a3f-8152-a000-ea4f6fc6b1ee"
  },
  "properties": {
    "Title": {
      "title": [
        {
          "text": {
            "content": "Your finding description here"
          }
        }
      ]
    },
    "Type": {
      "select": {
        "name": "Finding"
      }
    },
    "Week": {
      "date": {
        "start": "2025-10-28"
      }
    }
  }
}
```

### Step 3: Confirm Success
- Verify the API call returns a successful response with the new page ID
- Inform the user the entry was added successfully
- Provide the Notion URL if needed

## Important Notes

- **Only Title is required** - all other properties are optional
- **Type options**: Task, Finding, Needs Research, Question, Idea, Note
- **Priority options**: High, Medium, Low
- **Status options**: Not Started, In Progress, Completed, Blocked
- **Week format**: Accepts dates in YYYY-MM-DD format
- **Troubleshooting**: If the page was moved/renamed and integration access is lost, re-share the page with the MPC Fletch bot

## Related Documentation
- Notion MCP Integration Setup
- Claude Code CLI Configuration
- Weekly Notes & Tracking Database Structure
