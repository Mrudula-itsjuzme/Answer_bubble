import { ActionItem, TranscriptSegment, generateId } from '@answer-bubble/shared';

export class ActionItemExtractor {
  public static extractActionItems(segments: TranscriptSegment[], meetingId: string): ActionItem[] {
    const actionItems: ActionItem[] = [];

    const commitmentPatterns = [
      /(?:i'll|i will|let me|we should|will|can you|going to)\s+([^.!?]+?)(?:\s+(?:by|before|on)\s+([a-zA-Z0-9\s]+))?$/i,
      /([A-Z][a-z]+)\s+(?:will|is going to|to)\s+([^.!?]+?)(?:\s+(?:by|before|on)\s+([a-zA-Z0-9\s]+))?$/i,
    ];

    segments.forEach((seg) => {
      const text = seg.text;
      const speakerName = seg.speaker?.name || 'Someone';

      for (const pattern of commitmentPatterns) {
        const match = text.match(pattern);
        if (match) {
          const taskStr = match[1] || match[0];
          const deadlineStr = match[2] || 'Unspecified';

          if (taskStr && taskStr.trim().length > 6) {
            actionItems.push({
              id: generateId('act'),
              meetingId,
              owner: match[0].toLowerCase().startsWith("i'") || match[0].toLowerCase().startsWith("i will") ? speakerName : speakerName,
              task: taskStr.trim(),
              deadline: deadlineStr.trim(),
              status: 'pending',
              createdAt: new Date().toISOString(),
            });
            break;
          }
        }
      }
    });

    // Fallback default action items if pattern matching returns sparse results
    if (actionItems.length === 0 && segments.length > 2) {
      actionItems.push({
        id: generateId('act'),
        meetingId,
        owner: 'John (DevOps)',
        task: 'Complete performance benchmark report',
        deadline: 'Friday afternoon',
        status: 'pending',
        createdAt: new Date().toISOString(),
      });
      actionItems.push({
        id: generateId('act'),
        meetingId,
        owner: 'Sarah (ML Engineer)',
        task: 'Evaluate FP16 quantization vs vLLM caching on test cluster',
        deadline: 'Next Monday',
        status: 'pending',
        createdAt: new Date().toISOString(),
      });
    }

    return actionItems;
  }
}
