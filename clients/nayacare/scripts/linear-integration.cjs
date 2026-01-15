/**
 * Linear API Integration Script
 * Fetches issues from Linear and syncs them to CLAUDE.md
 *
 * Usage:
 *   node scripts/linear-integration.js fetch <team-key>  // Fetch all issues for a team
 *   node scripts/linear-integration.js sync              // Sync issues to CLAUDE.md
 *
 * Environment Variables Required:
 *   LINEAR_API_KEY=your_linear_api_key
 *   LINEAR_TEAM_KEY=NAY (or your team key)
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const LINEAR_API_KEY = process.env.LINEAR_API_KEY;
const LINEAR_TEAM_KEY = process.env.LINEAR_TEAM_KEY || 'NAY';
const LINEAR_API_URL = 'https://api.linear.app/graphql';

// GraphQL query to fetch issues
const FETCH_ISSUES_QUERY = `
  query GetTeamIssues {
    issues(
      filter: {
        state: { type: { nin: ["completed", "canceled"] } }
      }
      orderBy: updatedAt
    ) {
      nodes {
        id
        identifier
        title
        description
        priority
        estimate
        state {
          name
          type
        }
        assignee {
          name
        }
        labels {
          nodes {
            name
          }
        }
        url
        createdAt
        updatedAt
        team {
          key
        }
      }
    }
  }
`;

/**
 * Makes a GraphQL request to Linear API
 */
function makeLinearRequest(query, variables = {}) {
  return new Promise((resolve, reject) => {
    if (!LINEAR_API_KEY) {
      reject(new Error('LINEAR_API_KEY environment variable is required'));
      return;
    }

    const data = JSON.stringify({ query, variables });

    const options = {
      hostname: 'api.linear.app',
      path: '/graphql',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': LINEAR_API_KEY,
        'Content-Length': data.length
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            const parsed = JSON.parse(responseData);
            if (parsed.errors) {
              reject(new Error(`Linear API Error: ${JSON.stringify(parsed.errors)}`));
            } else {
              resolve(parsed.data);
            }
          } catch (error) {
            reject(new Error(`Failed to parse response: ${error.message}`));
          }
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${responseData}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(data);
    req.end();
  });
}

/**
 * Fetches all active issues for the team
 */
async function fetchIssues(teamKey = LINEAR_TEAM_KEY) {
  console.log(`Fetching issues for team: ${teamKey}...`);

  try {
    const data = await makeLinearRequest(FETCH_ISSUES_QUERY);

    if (!data.issues) {
      throw new Error(`No issues found`);
    }

    // Filter issues by team key
    const issues = data.issues.nodes.filter(issue => issue.team.key === teamKey);
    console.log(`✅ Fetched ${issues.length} active issues for team ${teamKey}`);

    return issues;
  } catch (error) {
    console.error('❌ Error fetching issues:', error.message);
    throw error;
  }
}

/**
 * Formats estimate hours
 */
function formatEstimate(estimate) {
  if (!estimate) return 'TBD';
  if (estimate < 1) return `${estimate * 60}min`;
  return `${estimate}h`;
}

/**
 * Formats priority emoji
 */
function getPriorityEmoji(priority) {
  const priorityMap = {
    0: '🔴', // Urgent
    1: '🟠', // High
    2: '🟡', // Medium
    3: '⚪', // Low
    4: '⚫'  // No priority
  };
  return priorityMap[priority] || '⚪';
}

/**
 * Converts Linear issues to CLAUDE.md format
 */
function formatIssuesForClaudeMd(issues) {
  if (!issues || issues.length === 0) {
    return '**No active Linear issues found.**';
  }

  // Sort by priority (0 = highest) and then by updated date
  const sortedIssues = [...issues].sort((a, b) => {
    if (a.priority !== b.priority) {
      return a.priority - b.priority;
    }
    return new Date(b.updatedAt) - new Date(a.updatedAt);
  });

  let markdown = '### **LINEAR ISSUES TO IMPLEMENT**\n\n';
  markdown += '**Priority Order for Next Session:**\n\n';

  sortedIssues.forEach((issue, index) => {
    const priority = getPriorityEmoji(issue.priority);
    const estimate = formatEstimate(issue.estimate);
    const labels = issue.labels.nodes.map(l => l.name).join(', ');
    const assignee = issue.assignee ? ` (Assigned: ${issue.assignee.name})` : '';

    markdown += `${index + 1}. **${issue.identifier}: ${issue.title}** (${estimate}) ${priority}${assignee}\n`;

    if (issue.description) {
      // Convert description to bullet points
      const lines = issue.description.split('\n').filter(line => line.trim());
      lines.forEach(line => {
        markdown += `   - ${line.trim()}\n`;
      });
    }

    if (labels) {
      markdown += `   - **Labels**: ${labels}\n`;
    }

    markdown += `   - **Linear**: ${issue.url}\n`;
    markdown += '\n';
  });

  return markdown;
}

/**
 * Syncs Linear issues to CLAUDE.md
 */
async function syncIssuesToClaudeMd() {
  console.log('🔄 Syncing Linear issues to CLAUDE.md...');

  try {
    const issues = await fetchIssues();
    const claudeMdPath = path.join(__dirname, '..', 'CLAUDE.md');

    if (!fs.existsSync(claudeMdPath)) {
      throw new Error('CLAUDE.md not found');
    }

    const content = fs.readFileSync(claudeMdPath, 'utf8');
    const formattedIssues = formatIssuesForClaudeMd(issues);

    // Replace the LINEAR ISSUES section
    const startMarker = '### **LINEAR ISSUES TO IMPLEMENT**';
    const endMarker = '---\n\n### **Growth Charts';

    const startIndex = content.indexOf(startMarker);
    const endIndex = content.indexOf(endMarker, startIndex);

    if (startIndex === -1 || endIndex === -1) {
      console.error('❌ Could not find LINEAR ISSUES section markers in CLAUDE.md');
      console.log('Adding issues to end of NEXT SESSION PRIORITIES section...');

      // Find NEXT SESSION PRIORITIES section
      const prioritiesMarker = '**🔄 NEXT SESSION PRIORITIES:**';
      const prioritiesIndex = content.indexOf(prioritiesMarker);

      if (prioritiesIndex === -1) {
        throw new Error('Could not find NEXT SESSION PRIORITIES section');
      }

      // Insert after the priorities marker
      const insertIndex = prioritiesIndex + prioritiesMarker.length;
      const newContent =
        content.slice(0, insertIndex) +
        '\n\n' + formattedIssues + '\n---\n\n' +
        content.slice(insertIndex);

      fs.writeFileSync(claudeMdPath, newContent, 'utf8');
      console.log('✅ Linear issues synced to CLAUDE.md');
      return;
    }

    // Replace existing section
    const newContent =
      content.slice(0, startIndex) +
      formattedIssues +
      endMarker +
      content.slice(endIndex + endMarker.length);

    fs.writeFileSync(claudeMdPath, newContent, 'utf8');
    console.log('✅ Linear issues synced to CLAUDE.md');
    console.log(`📝 Updated ${issues.length} issues in documentation`);

  } catch (error) {
    console.error('❌ Error syncing issues:', error.message);
    throw error;
  }
}

/**
 * Main CLI handler
 */
async function main() {
  const command = process.argv[2];
  const arg = process.argv[3];

  try {
    switch (command) {
      case 'fetch':
        const teamKey = arg || LINEAR_TEAM_KEY;
        const issues = await fetchIssues(teamKey);
        console.log(JSON.stringify(issues, null, 2));
        break;

      case 'sync':
        await syncIssuesToClaudeMd();
        break;

      case 'test':
        console.log('Testing Linear API connection...');
        const testIssues = await fetchIssues();
        console.log(`✅ Successfully connected! Found ${testIssues.length} issues`);
        break;

      default:
        console.log('Usage:');
        console.log('  node scripts/linear-integration.js fetch [team-key]  - Fetch issues');
        console.log('  node scripts/linear-integration.js sync              - Sync to CLAUDE.md');
        console.log('  node scripts/linear-integration.js test              - Test API connection');
        process.exit(1);
    }
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = {
  fetchIssues,
  syncIssuesToClaudeMd,
  formatIssuesForClaudeMd
};
