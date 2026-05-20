export interface ValueScoreResult {
  score: number;
  passed: boolean;
  reasons: string[];
}

const MIN_CONTENT_LENGTH = 200;
const MIN_SCORE = 40;

export function scoreSubmission(opts: {
  title: string;
  content: string;
  docType: string;
}): ValueScoreResult {
  const reasons: string[] = [];
  let score = 0;
  const contentLength = opts.content.length;

  if (contentLength < MIN_CONTENT_LENGTH) {
    reasons.push(`Content too short (${contentLength} chars, min ${MIN_CONTENT_LENGTH})`);
  } else if (contentLength < 500) {
    score += 10;
  } else if (contentLength < 1500) {
    score += 15;
  } else {
    score += 20;
  }

  const hasHeadings = /^##?\s+/m.test(opts.content);
  const hasCodeBlock = /```[\s\S]*?```/.test(opts.content);
  const hasBullets = /^[-*]\s+/m.test(opts.content);
  if (hasHeadings) score += 10;
  else reasons.push('No section headings');
  if (hasCodeBlock) score += 10;
  if (hasBullets) score += 5;

  const contentLower = opts.content.toLowerCase();
  if (/root\s*cause|why\s+this\s+happens|cause[ds]?\s+by/i.test(opts.content)) score += 10;
  else reasons.push('No identifiable root cause explanation');
  if (/## fix|## solution|## resolution|## prevention|how to fix/i.test(opts.content)) score += 10;
  else reasons.push('No fix/resolution section');
  if (/## symptoms|## signs|you.ll see|shows as|appears as/i.test(opts.content)) score += 5;

  const isJustRestart = /^(just |simply )?(restart|reboot)/im.test(opts.content) && contentLength < 400;
  if (isJustRestart) reasons.push('Fix appears to be only "restart"');
  else score += 10;

  const techTerms = ['docker', 'nginx', 'postgres', 'redis', 'node', 'ssl', 'dns', 'compose', 'systemd'];
  const techMatches = techTerms.filter(t => contentLower.includes(t));
  if (techMatches.length >= 3) score += 5;
  else if (techMatches.length >= 1) score += 3;

  if (opts.title.length > 20 && opts.title.length < 100) score += 10;
  else if (opts.title.length >= 10) score += 5;
  if (opts.title.split(/\s+/).length >= 4) score += 5;

  return {
    score: Math.min(score, 100),
    passed: score >= MIN_SCORE && contentLength >= MIN_CONTENT_LENGTH,
    reasons,
  };
}
