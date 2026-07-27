import React, { useState } from 'react';
import { Mail, Check, Copy, Share2, Sparkles, FileCode, CheckSquare, MessageSquare, Terminal } from 'lucide-react';
import { useAppStore } from '../../stores/appStore';

export const FollowupAssistant: React.FC = () => {
  const { activeMeeting } = useAppStore();
  const [activeTab, setActiveTab] = useState<'email' | 'jira' | 'github' | 'slack'>('email');
  const [copiedTab, setCopiedTab] = useState<string | null>(null);

  const notes = activeMeeting?.notes;
  const actionItems = activeMeeting?.actionItems || [];

  if (!notes) {
    return (
      <div className="glass-panel p-12 rounded-2xl border border-white/10 text-center flex flex-col items-center justify-center space-y-4">
        <Mail className="w-12 h-12 text-indigo-400/40 animate-pulse" />
        <h3 className="text-base font-semibold text-slate-200">No Meeting Notes Available</h3>
        <p className="text-xs text-slate-400 max-w-md">
          Start a meeting capture or generate notes to automatically create Email drafts, Jira tickets, GitHub issues, and Slack digests.
        </p>
      </div>
    );
  }

  // Generate Email Draft
  const emailSubject = `[Meeting Follow-Up] ${notes.meetingTitle} — ${notes.date.substring(0, 10)}`;
  const emailBody = `Hi Team,\n\nHere is the quick follow-up summary from our ${notes.meetingType.toUpperCase()} meeting on ${notes.date.substring(0, 10)}.\n\nExecutive Summary:\n${notes.summary}\n\nKey Decisions:\n${notes.keyDecisions.map((d) => `• ${d}`).join('\n')}\n\nAction Items:\n${actionItems.map((a) => `• [ ] ${a.task} (Owner: ${a.owner}, Deadline: ${a.deadline})`).join('\n')}\n\nBest regards,\nMeeting Copilot`;

  // Generate Jira Ticket Payload
  const jiraPayload = JSON.stringify(
    {
      projectKey: 'PROJ',
      issueType: 'Task',
      summary: `[Meeting Action] ${notes.meetingTitle} Execution Tasks`,
      description: notes.summary,
      actionItems: actionItems.map((a) => ({
        summary: a.task,
        assignee: a.owner,
        dueDate: a.deadline,
        priority: 'High',
      })),
      keyDecisions: notes.keyDecisions,
    },
    null,
    2
  );

  // Generate GitHub Issue Markdown
  const githubIssue = `## 📌 ${notes.meetingTitle} — Action Items & Deliverables

### Executive Summary
${notes.summary}

### 🎯 Deliverables & Checklist
${actionItems.map((a) => `- [ ] **${a.task}** (@${a.owner.toLowerCase().replace(/\s+/g, '')}) - *Due: ${a.deadline}*`).join('\n')}

### 💡 Decisions Made
${notes.keyDecisions.map((d) => `- ${d}`).join('\n')}
`;

  // Generate Slack Digest
  const slackDigest = `*🚀 Meeting Digest: ${notes.meetingTitle}*\n\n*Summary:* ${notes.summary}\n\n*Decisions:* ${notes.keyDecisions.join(' | ')}\n\n*Action Items:*\n${actionItems.map((a) => `• *${a.owner}*: ${a.task} (Due ${a.deadline})`).join('\n')}`;

  const getActiveContent = () => {
    switch (activeTab) {
      case 'email':
        return `Subject: ${emailSubject}\n\n${emailBody}`;
      case 'jira':
        return jiraPayload;
      case 'github':
        return githubIssue;
      case 'slack':
        return slackDigest;
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getActiveContent());
    setCopiedTab(activeTab);
    setTimeout(() => setCopiedTab(null), 2000);
  };

  return (
    <div className="h-full flex flex-col space-y-6">
      {/* Header */}
      <div className="glass-panel p-6 rounded-2xl border border-white/10 flex items-center justify-between shadow-xl">
        <div>
          <h1 className="text-lg font-bold text-slate-100 flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <span>Post-Meeting Follow-Up Assistant</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Auto-generate professional Email drafts, Jira ticket specs, GitHub issues, and Slack digests
          </p>
        </div>

        <button
          onClick={handleCopy}
          className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition-colors shadow-lg shadow-indigo-600/30"
        >
          {copiedTab === activeTab ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copiedTab === activeTab ? 'Copied to Clipboard!' : 'Copy Format'}</span>
        </button>
      </div>

      {/* Tabs Row */}
      <div className="flex items-center space-x-2">
        <button
          onClick={() => setActiveTab('email')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-medium transition-all ${
            activeTab === 'email'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-white/10'
          }`}
        >
          <Mail className="w-4 h-4" />
          <span>Executive Email</span>
        </button>

        <button
          onClick={() => setActiveTab('jira')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-medium transition-all ${
            activeTab === 'jira'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-white/10'
          }`}
        >
          <FileCode className="w-4 h-4" />
          <span>Jira Ticket JSON</span>
        </button>

        <button
          onClick={() => setActiveTab('github')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-medium transition-all ${
            activeTab === 'github'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-white/10'
          }`}
        >
          <CheckSquare className="w-4 h-4" />
          <span>GitHub Issue</span>
        </button>

        <button
          onClick={() => setActiveTab('slack')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-medium transition-all ${
            activeTab === 'slack'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-white/10'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Slack Digest</span>
        </button>
      </div>

      {/* Editor / Draft Display Container */}
      <div className="flex-1 glass-panel p-6 rounded-2xl border border-white/10 flex flex-col shadow-xl">
        <textarea
          readOnly
          value={getActiveContent()}
          className="w-full flex-1 bg-slate-950/80 border border-white/10 rounded-xl p-4 text-xs font-mono text-slate-200 leading-relaxed focus:outline-none resize-none custom-scrollbar"
        />
      </div>
    </div>
  );
};
