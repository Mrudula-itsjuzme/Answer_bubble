# Changelog

All notable changes to AnswerBubble will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-07-28

### Added
- **Real-Time Question & Answer Engine**: High-speed `QuestionDetector` heuristic engine capable of detecting direct and indirect questions sub-500ms from continuous speech transcripts.
- **Provider Failover Engine**: Resilient LLM failover fallback chain (OpenAI -> Anthropic -> OpenRouter -> Ollama -> Mock) with exponential backoff.
- **Multi-Provider STT Architecture**: Pluggable Speech-to-Text registry supporting Deepgram, Whisper (Local/Cloud), and WebSpeech adapters.
- **Floating Overlay Bubble**: Framer Motion animated glassmorphism desktop overlay featuring real-time "Answer Popped" notifications and ghost-typing relay.
- **Structured Notes & Action Item Extraction**: Automated meeting summary, key decision extraction, STAR format update generation, and export capabilities (Markdown, JSON, Clipboard).
- **Semantic Memory Search**: Indexed local meeting storage with vector search engine and TF-IDF relevance scoring.
- **Security & Secret Protection**: Machine-bound AES-256-GCM credential encryption (`NativeDPAPISecurity`) and automated logger secret redaction.
- **Comprehensive CI/CD Pipeline**: GitHub Actions for automated typechecking, linting, Vitest execution, and cross-platform release builds.
