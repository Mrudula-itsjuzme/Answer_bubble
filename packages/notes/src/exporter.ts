import { MeetingNote } from '@answer-bubble/shared';

export class MeetingNoteExporter {
  public static toMarkdown(note: MeetingNote): string {
    return `# ${note.meetingTitle}
**Date:** ${new Date(note.date).toLocaleString()}  
**Meeting Type:** ${note.meetingType.toUpperCase()}  
**Participants:** ${note.participants.map((p) => p.name).join(', ')}

---

## Executive Summary
${note.summary}

---

## Key Decisions
${note.keyDecisions.map((d) => `- ${d}`).join('\n')}

---

## Action Items
| Owner | Task | Deadline | Status |
| ----- | ---- | -------- | ------ |
${note.actionItems.map((a) => `| ${a.owner} | ${a.task} | ${a.deadline} | ${a.status} |`).join('\n')}

---

## Risks & Considerations
${note.risks.map((r) => `- ${r}`).join('\n')}

---

## Open Questions
${note.openQuestions.map((q) => `- ${q}`).join('\n')}

---

## Important Deadlines
${note.deadlines.map((d) => `- ${d}`).join('\n')}
`;
  }

  public static toHTML(note: MeetingNote): string {
    const md = this.toMarkdown(note);
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${note.meetingTitle}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; line-height: 1.6; color: #1e293b; max-width: 800px; margin: 40px auto; padding: 0 20px; }
    h1 { color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; }
    h2 { color: #2563eb; margin-top: 24px; }
    table { width: 100%; border-collapse: collapse; margin: 16px 0; }
    th, td { border: 1px solid #cbd5e1; padding: 10px 14px; text-align: left; }
    th { background: #f1f5f9; }
    ul { padding-left: 20px; }
    li { margin-bottom: 6px; }
    .badge { background: #dbeafe; color: #1e40af; padding: 4px 8px; borderRadius: 4px; font-weight: bold; }
  </style>
</head>
<body>
  <h1>${note.meetingTitle}</h1>
  <p><strong>Date:</strong> ${new Date(note.date).toLocaleString()} | <span class="badge">${note.meetingType.toUpperCase()}</span></p>
  <p><strong>Participants:</strong> ${note.participants.map((p) => p.name).join(', ')}</p>

  <h2>Executive Summary</h2>
  <p>${note.summary}</p>

  <h2>Key Decisions</h2>
  <ul>
    ${note.keyDecisions.map((d) => `<li>${d}</li>`).join('')}
  </ul>

  <h2>Action Items</h2>
  <table>
    <thead>
      <tr><th>Owner</th><th>Task</th><th>Deadline</th><th>Status</th></tr>
    </thead>
    <tbody>
      ${note.actionItems.map((a) => `<tr><td>${a.owner}</td><td>${a.task}</td><td>${a.deadline}</td><td>${a.status}</td></tr>`).join('')}
    </tbody>
  </table>

  <h2>Risks & Open Questions</h2>
  <ul>
    ${note.risks.map((r) => `<li><strong>Risk:</strong> ${r}</li>`).join('')}
    ${note.openQuestions.map((q) => `<li><strong>Question:</strong> ${q}</li>`).join('')}
  </ul>
</body>
</html>`;
  }

  public static toJSON(note: MeetingNote): string {
    return JSON.stringify(note, null, 2);
  }
}
