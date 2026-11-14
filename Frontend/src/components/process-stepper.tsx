import { StyleSheet, Text, View } from 'react-native';

import { PROCESS_STAGES, activeStageIndex } from '@/constants/design';
import { useDesign } from '@/hooks/use-design';
import type { JobStatus } from '@/types';

interface ProcessStepperProps {
  status: JobStatus;
  stage?: string;
}

/** Stepper 6 tahap; memetakan status backend ke tahap tampilan (PRD §7.2). */
export function ProcessStepper({ status, stage }: ProcessStepperProps) {
  const tokens = useDesign();
  const failed = status === 'failed';
  const current = activeStageIndex(status, stage);

  return (
    <View>
      {PROCESS_STAGES.map((step, index) => {
        const done = index < current;
        const active = index === current && !failed;
        const stopped = index === current && failed;
        const color = stopped
          ? tokens.danger
          : done
            ? tokens.dark
              ? '#9CDC9F'
              : '#1B5E20'
            : active
              ? tokens.primary
              : tokens.borderStrong;

        return (
          <View key={step.key} style={styles.row}>
            <View style={styles.rail}>
              <View
                style={[
                  styles.circle,
                  {
                    borderColor: color,
                    backgroundColor: done ? color : tokens.surface,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.circleText,
                    { color: done ? (tokens.dark ? '#06121F' : '#FFFFFF') : color },
                  ]}
                >
                  {done ? '✓' : index + 1}
                </Text>
              </View>
              {index < PROCESS_STAGES.length - 1 ? (
                <View style={[styles.connector, { backgroundColor: done ? color : tokens.border }]} />
              ) : null}
            </View>
            <View style={styles.body}>
              <Text
                style={[
                  styles.label,
                  {
                    color: done || active || stopped ? tokens.text : tokens.textSecondary,
                    fontWeight: active || stopped ? '700' : '500',
                  },
                ]}
              >
                {step.label}
              </Text>
              {active ? (
                <Text style={[styles.hint, { color: tokens.textSecondary }]}>Sedang berlangsung</Text>
              ) : null}
              {stopped ? (
                <Text style={[styles.hint, { color: tokens.danger }]}>Terhenti pada tahap ini</Text>
              ) : null}
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 12,
    minHeight: 44,
  },
  rail: {
    alignItems: 'center',
    width: 26,
  },
  circle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleText: {
    fontSize: 12,
    fontWeight: '700',
  },
  connector: {
    width: 2,
    flex: 1,
    minHeight: 18,
  },
  body: {
    flex: 1,
    paddingBottom: 12,
    gap: 2,
  },
  label: {
    fontSize: 15,
    lineHeight: 22,
  },
  hint: {
    fontSize: 12,
    fontWeight: '500',
  },
});
