export interface VisualKeyframe {
  id: string;
  timestamp: string;
  timestampMs: number;
  detectedType: 'code' | 'slide' | 'diagram' | 'text' | 'unknown';
  extractedText: string;
  codeLanguage?: string;
  titleSnippet?: string;
  thumbnailUrl?: string;
  confidence: number;
}

export interface ScreenCaptureConfig {
  sampleIntervalMs: number; // default e.g. 4000ms
  enableOCR: boolean;
  detectCode: boolean;
}
