import { VisualKeyframe } from './types';
import { generateId, formatTimestamp } from '@answer-bubble/shared';

export class FrameAnalyzer {
  private keyframeHistory: VisualKeyframe[] = [];

  public processFrame(frameCanvasData?: string): VisualKeyframe {
    const timestampMs = Date.now();
    const timestamp = formatTimestamp(timestampMs);

    // Heuristic visual layout detection (simulated OCR & screen parser for high-performance canvas streams)
    const simulatedTemplates: Partial<VisualKeyframe>[] = [
      {
        detectedType: 'code',
        codeLanguage: 'typescript',
        titleSnippet: 'Inference Quantization Pipeline',
        extractedText: 'const quantizedModel = await quantizeFP16ToINT8(modelBuffer, { calcPrecision: "high" });',
      },
      {
        detectedType: 'slide',
        titleSnippet: 'Architecture Overview: Microservices vs Modular Monolith',
        extractedText: 'Slide 4: Key latency targets < 200ms roundtrip. Redis caching layer enabled for fast embedding lookups.',
      },
      {
        detectedType: 'diagram',
        titleSnippet: 'Real-Time Audio Stream Flow',
        extractedText: 'System Audio WASAPI -> VAD Filter -> STT Socket -> Rolling Context -> Floating Bubble Overlay',
      },
    ];

    const template = simulatedTemplates[Math.floor(Math.random() * simulatedTemplates.length)];

    const keyframe: VisualKeyframe = {
      id: generateId('frame'),
      timestamp,
      timestampMs,
      detectedType: template.detectedType || 'slide',
      extractedText: template.extractedText || 'Screen content detected',
      codeLanguage: template.codeLanguage,
      titleSnippet: template.titleSnippet,
      confidence: 0.94,
    };

    this.keyframeHistory.push(keyframe);
    return keyframe;
  }

  public getRecentKeyframes(limit = 5): VisualKeyframe[] {
    return this.keyframeHistory.slice(-limit);
  }

  public getLatestFrameText(): string {
    if (this.keyframeHistory.length === 0) return '';
    const latest = this.keyframeHistory[this.keyframeHistory.length - 1];
    return `[SHARED SCREEN (${latest.detectedType.toUpperCase()}): "${latest.titleSnippet}": ${latest.extractedText}]`;
  }
}
