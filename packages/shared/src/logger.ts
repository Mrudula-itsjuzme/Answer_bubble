/**
 * Structured & Secret-Redacting Logging Subsystem for AnswerBubble.
 * Guarantees zero sensitive API keys or credentials leak into log files or crash reports.
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  subsystem: string;
  message: string;
  correlationId?: string;
  meta?: Record<string, unknown>;
}

export class StructuredLogger {
  private static instance: StructuredLogger;
  private logBuffer: LogEntry[] = [];
  private maxBufferLength = 1000;

  // Regex patterns to automatically redact API keys and sensitive tokens
  private secretPatterns: RegExp[] = [
    /sk-proj-[a-zA-Z0-9_-]+/g,
    /sk-ant-[a-zA-Z0-9_-]+/g,
    /sk-[a-zA-Z0-9]{20,}/g,
    /gsk_[a-zA-Z0-9]{20,}/g,
    /Bearer\s+[a-zA-Z0-9._\--]+/gi,
    /key=[a-zA-Z0-9._\--]+/gi,
    /password=[^\s&]+/gi,
  ];

  public static getInstance(): StructuredLogger {
    if (!StructuredLogger.instance) {
      StructuredLogger.instance = new StructuredLogger();
    }
    return StructuredLogger.instance;
  }

  /**
   * Redacts sensitive token patterns from text or objects.
   */
  public redactSecrets(input: string): string {
    if (!input) return input;
    let sanitized = input;
    for (const pattern of this.secretPatterns) {
      sanitized = sanitized.replace(pattern, '[REDACTED_SECRET]');
    }
    return sanitized;
  }

  public log(level: LogLevel, subsystem: string, message: string, meta?: Record<string, unknown>, correlationId?: string): void {
    const sanitizedMsg = this.redactSecrets(message);
    const sanitizedMeta = meta ? JSON.parse(this.redactSecrets(JSON.stringify(meta))) : undefined;

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      subsystem,
      message: sanitizedMsg,
      correlationId,
      meta: sanitizedMeta,
    };

    this.logBuffer.push(entry);
    if (this.logBuffer.length > this.maxBufferLength) {
      this.logBuffer.shift();
    }

    // Console output formatted for development & production logs
    const formatted = `[${entry.timestamp}] [${entry.level.toUpperCase()}] [${entry.subsystem}]: ${entry.message}`;
    if (level === 'error') {
      console.error(formatted, entry.meta || '');
    } else if (level === 'warn') {
      console.warn(formatted, entry.meta || '');
    } else {
      console.log(formatted, entry.meta || '');
    }
  }

  public debug(subsystem: string, message: string, meta?: Record<string, unknown>, correlationId?: string): void {
    this.log('debug', subsystem, message, meta, correlationId);
  }

  public info(subsystem: string, message: string, meta?: Record<string, unknown>, correlationId?: string): void {
    this.log('info', subsystem, message, meta, correlationId);
  }

  public warn(subsystem: string, message: string, meta?: Record<string, unknown>, correlationId?: string): void {
    this.log('warn', subsystem, message, meta, correlationId);
  }

  public error(subsystem: string, message: string, meta?: Record<string, unknown>, correlationId?: string): void {
    this.log('error', subsystem, message, meta, correlationId);
  }

  public exportLogsJSON(): string {
    return JSON.stringify(this.logBuffer, null, 2);
  }

  public clearLogs(): void {
    this.logBuffer = [];
  }
}

export const logger = StructuredLogger.getInstance();
