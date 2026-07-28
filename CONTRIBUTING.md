# Contributing to AnswerBubble

Thank you for your interest in contributing to AnswerBubble! As an open-source AI desktop copilot, we welcome bug fixes, documentation improvements, feature additions, and performance optimizations.

## Code of Conduct

All contributors are expected to adhere to our [Code of Conduct](CODE_OF_CONDUCT.md).

## Getting Started

### Prerequisites

- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

### Local Setup

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/Mrudula-itsjuzme/Answer_bubble.git
   cd Answer_bubble
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Run Development Server**:
   ```bash
   npm run dev
   ```

4. **Run Typecheck & Test Suite**:
   ```bash
   npm run typecheck
   npm test
   ```

## Development Architecture

AnswerBubble is structured as an `npm` workspace monorepo:

- `apps/desktop`: Desktop application UI built with React, Vite, and Framer Motion.
- `packages/shared`: Shared types, event bus, logger, and security utilities.
- `packages/audio`: WebAudio management, VAD processing loop, and simulator.
- `packages/transcription`: Multi-provider STT adapter registry.
- `packages/llm`: Provider failover engine, question detector, and prompt manager.
- `packages/memory`: Local meeting storage and vector search engine.
- `packages/notes`: Structured meeting note & action item generator.
- `packages/diarization`: Rule-based speaker diarization engine.
- `packages/vision`: Screen frame OCR analysis pipeline.
- `packages/graph`: Knowledge graph relationship builder.

## Submitting Pull Requests

1. **Branch Naming**: Use descriptive names such as `fix/audio-vad-leak` or `feat/whisper-cpp-adapter`.
2. **Commit Convention**: Follow Conventional Commits:
   - `feat:` for new capabilities
   - `fix:` for bug fixes
   - `docs:` for documentation
   - `test:` for test additions
   - `refactor:` for architectural improvements
3. **Tests**: Ensure existing tests pass (`npm test`) and add unit tests for new logic.
4. **Pull Request Checklist**: Fill out the PR template completely when opening your pull request.
