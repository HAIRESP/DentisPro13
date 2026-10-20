// Commit only a final utterance ending in the standalone word Aplicar.
export function extractAppliedVoiceCommand(text: string): string | null {
  if (!/(?:^|\s)aplicar[.!?,;:\s]*$/i.test(text.trim())) return null;
  return text.trim().replace(/(?:^|\s)aplicar[.!?,;:\s]*$/i, '').trim();
}
