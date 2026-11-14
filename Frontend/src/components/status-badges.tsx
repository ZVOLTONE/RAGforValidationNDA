import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { Badge } from '@/components/ui/badge';
import {
  FINDING_TYPE_META,
  JOB_STATUS_META,
  RISK_META,
  VALIDATION_META,
} from '@/constants/design';
import { useDesign } from '@/hooks/use-design';
import type { FindingType, JobStatus, RiskLevel, ValidationStatus } from '@/types';

export function RiskBadge({ level }: { level: RiskLevel }) {
  const tokens = useDesign();
  const meta = RISK_META[level];
  return (
    <Badge
      label={meta.label}
      color={tokens.dark ? meta.colorDark : meta.color}
      background={tokens.dark ? meta.softDark : meta.soft}
      borderColor={tokens.dark ? meta.softDark : meta.soft}
      icon={meta.icon}
    />
  );
}

export function FindingTypeBadge({ type }: { type: FindingType }) {
  const tokens = useDesign();
  return (
    <Badge
      label={FINDING_TYPE_META[type].label}
      color={tokens.textSecondary}
      background={tokens.surfaceMuted}
      borderColor={tokens.border}
    />
  );
}

export function ValidationBadge({ status }: { status: ValidationStatus }) {
  const tokens = useDesign();
  const meta = VALIDATION_META[status];
  return (
    <Badge
      label={meta.label}
      color={tokens.dark ? meta.colorDark : meta.color}
      background={tokens.dark ? meta.softDark : meta.soft}
      borderColor={tokens.dark ? meta.softDark : meta.soft}
      icon={meta.icon}
    />
  );
}

export function ReviewFlag() {
  const tokens = useDesign();
  return (
    <Badge
      label="Perlu ditinjau"
      color={tokens.dark ? '#FFD08A' : '#7A4B00'}
      background={tokens.warningSoft}
      icon={{ ios: 'person.fill.questionmark', android: 'person_search', web: 'person_search' }}
    />
  );
}

const STATUS_COLOR: Record<JobStatus, 'neutral' | 'success' | 'danger' | 'progress'> = {
  uploaded: 'neutral',
  queued: 'neutral',
  processing: 'progress',
  validating: 'progress',
  generating_report: 'progress',
  completed: 'success',
  failed: 'danger',
};

export function JobStatusBadge({ status }: { status: JobStatus }) {
  const tokens = useDesign();
  const tone = STATUS_COLOR[status];
  const palette = {
    neutral: { color: tokens.textSecondary, background: tokens.surfaceMuted },
    success: { color: tokens.dark ? '#9CDC9F' : '#1B5E20', background: tokens.dark ? '#16301B' : '#E7F3E8' },
    danger: { color: tokens.danger, background: tokens.dangerSoft },
    progress: { color: tokens.dark ? '#A9CBFF' : '#0B57D0', background: tokens.primarySoft },
  }[tone];

  return (
    <View>
      <Badge
        label={JOB_STATUS_META[status].label}
        color={palette.color}
        background={palette.background}
        icon={
          status === 'failed'
            ? { ios: 'xmark.octagon.fill', android: 'error', web: 'error' }
            : status === 'completed'
              ? { ios: 'checkmark.circle.fill', android: 'check_circle', web: 'check_circle' }
              : { ios: 'clock', android: 'schedule', web: 'schedule' }
        }
      />
    </View>
  );
}

export function BadgeRow({ children }: { children: ReactNode }) {
  return <View style={styles.row}>{children}</View>;
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    alignItems: 'center',
  },
});
