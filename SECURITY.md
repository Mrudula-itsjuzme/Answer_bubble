# Security Policy

## Supported Versions

Only the latest major release of AnswerBubble receives security updates.

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

If you discover a security vulnerability within AnswerBubble, please send an email to **security@answerbubble.org** or open a confidential security report on GitHub. Please do **not** report security vulnerabilities through public GitHub issues.

### Response Timeline

- **Acknowledgement**: Within 48 hours.
- **Triage & Impact Assessment**: Within 5 business days.
- **Fix & Patch Release**: Within 14 business days.

## Security Architecture & Local Protection

AnswerBubble takes security and privacy seriously:

1. **Zero Raw Audio Storage**: Audio feeds are processed in ephemeral memory buffers for Voice Activity Detection and transcription. Raw audio is never persisted to disk.
2. **Local Credential Encryption**: API keys for external providers (OpenAI, Deepgram, Anthropic, OpenRouter) are encrypted on disk using machine-bound PBKDF2 + AES-256-GCM derivation (`NativeDPAPISecurity`).
3. **Automatic Log Redaction**: The internal `StructuredLogger` automatically strips API keys, Authorization headers, and sensitive parameters prior to writing logs or debug buffers.
4. **Offline Capability**: When local provider options (Ollama, local Whisper) are configured, no external network requests leave your machine.
