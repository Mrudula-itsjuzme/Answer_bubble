import React from 'react';
import { useAppStore } from './stores/appStore';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { LiveMeetingDashboard } from './components/dashboard/LiveMeetingDashboard';
import { NotesViewer } from './components/notes/NotesViewer';
import { MemorySearch } from './components/search/MemorySearch';
import { MeetingHistory } from './components/history/MeetingHistory';
import { SettingsModal } from './components/settings/SettingsModal';
import { MeetingTimeline } from './components/timeline/MeetingTimeline';
import { FollowupAssistant } from './components/followup/FollowupAssistant';
import { ConversationGraphViewer } from './components/graph/ConversationGraphViewer';
import { StealthAuditConsole } from './components/audit/StealthAuditConsole';
import { MeetingRecorderModal } from './components/mom/MeetingRecorderModal';
import { FloatingBubbleOverlay } from './components/overlay/FloatingBubbleOverlay';
import { CommandPalette } from './components/common/CommandPalette';

export function App() {
  const { activeView } = useAppStore();

  return (
    <div className="min-h-screen bg-[#0B0F17] text-slate-100 flex flex-col overflow-hidden font-sans">
      {/* Top Header */}
      <Header />

      {/* Main Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Navigation */}
        <Sidebar />

        {/* Dynamic View Viewport */}
        <main className="flex-1 p-6 overflow-hidden">
          {activeView === 'dashboard' && <LiveMeetingDashboard />}
          {activeView === 'mom' && <MeetingRecorderModal />}
          {activeView === 'timeline' && <MeetingTimeline />}
          {activeView === 'graph' && <ConversationGraphViewer />}
          {activeView === 'followup' && <FollowupAssistant />}
          {activeView === 'notes' && <NotesViewer />}
          {activeView === 'search' && <MemorySearch />}
          {activeView === 'history' && <MeetingHistory />}
          {activeView === 'audit' && <StealthAuditConsole />}
          {activeView === 'settings' && <SettingsModal />}
        </main>
      </div>

      {/* Floating Desktop AI Assistant Overlay Bubble */}
      <FloatingBubbleOverlay />

      {/* Cmd + K Command Palette */}
      <CommandPalette />
    </div>
  );
}
export default App;
