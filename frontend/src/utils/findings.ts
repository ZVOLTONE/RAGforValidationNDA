import type { Finding, RiskLevel } from '@/types';

export const RISK_WEIGHT: Record<RiskLevel, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

/** Urutan bawaan dashboard: level tertinggi lebih dulu, lalu nomor halaman. */
export function sortFindings(findings: Finding[]): Finding[] {
  return [...findings].sort((a, b) => {
    const byLevel = RISK_WEIGHT[a.risk_level] - RISK_WEIGHT[b.risk_level];
    if (byLevel !== 0) return byLevel;
    const pageA = a.evidence[0]?.page_number ?? Number.MAX_SAFE_INTEGER;
    const pageB = b.evidence[0]?.page_number ?? Number.MAX_SAFE_INTEGER;
    if (pageA !== pageB) return pageA - pageB;
    return a.finding_id.localeCompare(b.finding_id);
  });
}

export function findingPage(finding: Finding): number | undefined {
  return finding.bounding_boxes[0]?.page ?? finding.evidence[0]?.page_number;
}

export function hasLocation(finding: Finding): boolean {
  return finding.bounding_boxes.length > 0;
}

export function countByLevel(findings: Finding[]): Record<RiskLevel, number> {
  const counts: Record<RiskLevel, number> = { critical: 0, high: 0, medium: 0, low: 0 };
  findings.forEach((finding) => {
    counts[finding.risk_level] += 1;
  });
  return counts;
}

export function countByCategory(findings: Finding[]): { category: string; total: number }[] {
  const totals = new Map<string, number>();
  findings.forEach((finding) => {
    totals.set(finding.risk_category, (totals.get(finding.risk_category) ?? 0) + 1);
  });
  return Array.from(totals.entries())
    .map(([category, total]) => ({ category, total }))
    .sort((a, b) => b.total - a.total);
}

export function snippet(text: string, max = 160): string {
  const clean = text.trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max).trimEnd()}…`;
}
