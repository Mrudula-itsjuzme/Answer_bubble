# AnswerBubble — Desktop AI Meeting Copilot

**AnswerBubble** is a cross-platform desktop application built with **Tauri v2 + React + TypeScript + Vite + Tailwind CSS**. It acts as a real-time AI meeting copilot, transcribing conversations in real-time, maintaining rolling conversation context, and presenting ultra-concise contextual suggestions via a floating desktop bubble overlay.

---

## 🌟 Key Features

1. **Floating AI Assistant Bubble**:
   - Draggable, translucent dark glass overlay window (`alwaysOnTop`).
   - Collapsible & resizable modes with micro-animations.
   - **Enforces strict <25 word maximum & 1-3 short lines rule** (e.g. `> Don't forget caching.`, `> Mention quantization.`).
   - Answer ready spring pop badge & quick copy controls.
   - **Screenshare Transparent & Invisible Overlay**: Designed with native transparent window background (`transparent: true`) and OS window capture exclusion (`WDA_EXCLUDEFROMCAPTURE` on Windows / `NSWindowSharingNone` on macOS), allowing the bubble to float above shared screens without interfering with Zoom/Teams presentations.

2. **System Audio & Mic Capture**:
   - Captures desktop audio (PulseAudio/PipeWire loopback, WASAPI), microphone, or both simultaneously.
   - WebAudio Voice Activity Detection (VAD) to avoid silent frame processing.
   - Simulated speech audio feed for instant testing without mic hardware.

3. **Swappable Speech-to-Text (STT) Providers**:
   - Adapters for **OpenAI Whisper API**, **Deepgram Live Streaming**, **Gladia Realtime**, **Whisper.cpp (Local Server)**, **WebSpeech API**, and **Mock Engine**.

4. **Speaker Diarization**:
   - Tracks speaker channels with custom names, colors, confidence scores, and timestamps.

5. **Rolling Context & Swappable LLM Adapters**:
   - Maintains token-efficient context window (recent segments + extracted facts + entities).
   - Swappable providers: **OpenAI**, **Anthropic Claude**, **OpenRouter**, **Ollama (Local Llama 3)**, and **Mock Engine**.
   - Question detection gatekeeper rule: returns `NONE` if no input is needed.

6. **Structured Meeting Notes & Action Extraction**:
   - Auto-detects meeting types (Technical, Interview, Client, Standup, Brainstorm, Lecture).
   - Generates Executive Summary, Key Decisions, Risks, Open Questions, Deadlines, and Action Items.
   - Exports to **Markdown (`.md`)**, **HTML / PDF (`.html`)**, and **JSON**.

7. **Local Hybrid Semantic Memory Search**:
   - On-device vector similarity & TF-IDF search indexing past summaries, action items, and transcripts.
   - Natural language queries: *"What did John promise last week?"* or *"How to reduce inference cost?"*.

8. **Windows Package Installers**:
   - Configured for **NSIS (`.exe`)** and **MSI (`.msi`)** desktop installer compilation via Tauri v2.

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- [Rust](https://www.rust-lang.org/) (for Tauri desktop builds)

### Installation
```bash
# Clone the repository
git clone https://github.com/Mrudula-itsjuzme/Answer_bubble.git
cd Answer_bubble

# Install workspace dependencies
npm install
```

### Development Mode
```bash
# Run web & desktop app in development mode
npm run dev
```

Open `http://localhost:1420/` in your browser.

---

## 📦 Building Desktop Packages

```bash
# Typecheck all packages
npx tsc --noEmit

# Build production frontend assets
npm run build

# Package desktop installer binaries (NSIS .exe and .msi)
npm run tauri build --workspace=apps/desktop
```

---

## 📐 Architecture Structure

```
Answer_bubble/
├── packages/
│   ├── shared/         # Common domain types, event bus, formatters
│   ├── audio/          # System loopback, mic capture, VAD, audio simulation
│   ├── transcription/  # STT adapter framework (Whisper, Deepgram, Gladia, WebSpeech, Mock)
│   ├── diarization/    # Speaker tracking & color engine
│   ├── llm/            # Swappable LLM adapters (OpenAI, Anthropic, OpenRouter, Ollama)
│   ├── notes/          # Meeting classifier, note generator, action item parser, exporter
│   └── memory/         # Vector memory store & hybrid semantic search engine
└── apps/
    └── desktop/        # Tauri v2 + React 18 + Vite + Tailwind desktop application
        ├── src/        # Floating Bubble Overlay, Live Dashboard, Search, Notes, Settings
        └── src-tauri/  # Rust backend configuration & Windows installer specs
```

---

## 📄 License
MIT License.
