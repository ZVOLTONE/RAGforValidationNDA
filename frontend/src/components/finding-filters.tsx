import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import {
  CATEGORIES,
  CATEGORY_META,
  FINDING_TYPES,
  FINDING_TYPE_META,
  RISK_META,
  RISK_ORDER,
  VALIDATION_META,
} from '@/constants/design';
import { useDesign } from '@/hooks/use-design';
import type { ValidationStatus } from '@/types';

export interface DashboardFilters {
  level?: string;
  category?: string;
  finding_type?: string;
  validation_status?: string;
}

interface FilterOption {
  value: string;
  label: string;
}

interface FilterGroupProps {
  label: string;
  options: FilterOption[];
  value?: string;
  onSelect: (value?: string) => void;
}

function FilterGroup({ label, options, value, onSelect }: FilterGroupProps) {
  const tokens = useDesign();
  const items = [{ value: '', label: 'Semua' }, ...options];

  return (
    <View style={styles.group}>
      <Text style={[styles.groupLabel, { color: tokens.textSecondary }]}>{label}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
        {items.map((item) => {
          const active = (value ?? '') === item.value;
          return (
            <Pressable
              key={`${label}-${item.value || 'all'}`}
              onPress={() => onSelect(item.value || undefined)}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              accessibilityLabel={`${label}: ${item.label}`}
              style={({ pressed }) => [
                styles.chip,
                {
                  backgroundColor: active ? tokens.primary : tokens.surface,
                  borderColor: active ? tokens.primary : tokens.border,
                },
                pressed && styles.pressed,
              ]}
            >
              <Text
                style={[
                  styles.chipLabel,
                  { color: active ? tokens.onPrimary : tokens.textSecondary },
                ]}
              >
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

interface FindingFiltersProps {
  filters: DashboardFilters;
  onChange: (patch: Partial<DashboardFilters>) => void;
  onReset: () => void;
}

/** Filter dashboard; nilainya disimpan di URL oleh pemanggil (PRD §7.3). */
export function FindingFilters({ filters, onChange, onReset }: FindingFiltersProps) {
  const tokens = useDesign();
  const activeCount = Object.values(filters).filter(Boolean).length;

  const levelOptions = RISK_ORDER.map((level) => ({ value: level, label: RISK_META[level].label }));
  const categoryOptions = CATEGORIES.map((category) => ({
    value: category,
    label: CATEGORY_META[category],
  }));
  const typeOptions = FINDING_TYPES.map((type) => ({
    value: type,
    label: FINDING_TYPE_META[type].label,
  }));
  const validationOptions = (Object.keys(VALIDATION_META) as ValidationStatus[]).map((status) => ({
    value: status,
    label: VALIDATION_META[status].label,
  }));

  return (
    <View style={styles.wrapper}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: tokens.text }]}>Filter temuan</Text>
        <Pressable
          onPress={onReset}
          disabled={activeCount === 0}
          accessibilityRole="button"
          accessibilityLabel="Reset semua filter"
          style={({ pressed }) => [
            styles.reset,
            { opacity: activeCount === 0 ? 0.4 : 1 },
            pressed && styles.pressed,
          ]}
        >
          <Text style={[styles.resetLabel, { color: tokens.primary }]}>
            Reset{activeCount > 0 ? ` (${activeCount})` : ''}
          </Text>
        </Pressable>
      </View>

      <FilterGroup
        label="Level"
        options={levelOptions}
        value={filters.level}
        onSelect={(value) => onChange({ level: value })}
      />
      <FilterGroup
        label="Kategori"
        options={categoryOptions}
        value={filters.category}
        onSelect={(value) => onChange({ category: value })}
      />
      <FilterGroup
        label="Jenis"
        options={typeOptions}
        value={filters.finding_type}
        onSelect={(value) => onChange({ finding_type: value })}
      />
      <FilterGroup
        label="Validasi"
        options={validationOptions}
        value={filters.validation_status}
        onSelect={(value) => onChange({ validation_status: value })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
  },
  reset: {
    paddingVertical: 4,
  },
  resetLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  group: {
    gap: 6,
  },
  groupLabel: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  chips: {
    gap: 8,
    paddingRight: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
  },
  chipLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.75,
  },
});
