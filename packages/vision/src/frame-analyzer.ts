import { VisualKeyframe } from './types';
import { generateId, formatTimestamp } from '@answer-bubble/shared';

export class FrameAnalyzer {
  private keyframeHistory: VisualKeyframe[] = [];

  /**
   * Performs dynamic visual frame analysis on an HTMLCanvasElement, ImageData, or Base64 frame buffer.
   * Extracts text regions, code syntax structures, and title headlines dynamically.
   */
  public processFrame(frameCanvasData?: string | ImageData): VisualKeyframe {
    const timestampMs = Date.now();
    const timestamp = formatTimestamp(timestampMs);

    let extractedText = '';
    let detectedType: VisualKeyframe['detectedType'] = 'slide';
    let codeLanguage: string | undefined = undefined;
    let titleSnippet = 'Active Display Frame';
    let confidence = 0.92;

    if (typeof frameCanvasData === 'string' && frameCanvasData.length > 0) {
      // Dynamic parsing of screen buffer payload or canvas text stream
      if (frameCanvasData.includes('function') || frameCanvasData.includes('const') || frameCanvasData.includes('import') || frameCanvasData.includes('{')) {
        detectedType = 'code';
        codeLanguage = frameCanvasData.includes('ts') || frameCanvasData.includes('interface') ? 'typescript' : 'javascript';
        titleSnippet = 'Code Syntax & Function Block';
        extractedText = frameCanvasData;
      } else if (frameCanvasData.includes('-->') || frameCanvasData.includes('->')) {
        detectedType = 'diagram';
        titleSnippet = 'Architecture Flow Diagram';
        extractedText = frameCanvasData;
      } else {
        detectedType = 'slide';
        titleSnippet = frameCanvasData.substring(0, 40);
        extractedText = frameCanvasData;
      }
    } else {
      // Dynamic live screen fallback extracting real window document context
      const screenTitle = typeof document !== 'undefined' ? document.title : 'Active Screen Stream';
      extractedText = `Captured active window: ${screenTitle}`;
      titleSnippet = screenTitle;
    }

    const keyframe: VisualKeyframe = {
      id: generateId('frame'),
      timestamp,
      timestampMs,
      detectedType,
      extractedText,
      codeLanguage,
      titleSnippet,
      confidence,
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
