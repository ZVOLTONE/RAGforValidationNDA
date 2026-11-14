import { usePathname, useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { APP_NAME, USE_MOCK_DATA } from '@/config';
import { useDesign } from '@/hooks/use-design';

interface NavLinkProps {
  label: string;
  href: '/jobs' | '/about';
  active: boolean;
}

function NavLink({ label, href, active }: NavLinkProps) {
  const router = useRouter();
  const tokens = useDesign();
  return (
    <Pressable
      onPress={() => router.push(href)}
      accessibilityRole="link"
      accessibilityLabel={label}
      style={({ pressed }) => [styles.link, pressed && styles.pressed]}
    >
      <Text
        style={[
          styles.linkLabel,
          { color: active ? tokens.primary : tokens.textSecondary },
          active && styles.linkActive,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function AppHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const tokens = useDesign();

  return (
    <View
      style={[styles.wrapper, { backgroundColor: tokens.surface, borderBottomColor: tokens.border }]}
    >
      <View style={styles.inner}>
        <Pressable
          onPress={() => router.push('/')}
          accessibilityRole="link"
          accessibilityLabel={`${APP_NAME}, kembali ke unggah dokumen`}
          style={({ pressed }) => pressed && styles.pressed}
        >
          <View style={styles.brandRow}>
            <View style={[styles.mark, { backgroundColor: tokens.primary }]}>
              <Text style={[styles.markText, { color: tokens.onPrimary }]}>C</Text>
            </View>
            <View>
              <Text style={[styles.brand, { color: tokens.text }]}>{APP_NAME}</Text>
              <Text style={[styles.tagline, { color: tokens.textSecondary }]}>
                Contract Intelligence
              </Text>
            </View>
          </View>
        </Pressable>

        <View style={styles.nav}>
          <NavLink label="Pekerjaan" href="/jobs" active={pathname.startsWith('/jobs')} />
          <NavLink label="Batasan Analisis" href="/about" active={pathname === '/about'} />
        </View>
      </View>

      {USE_MOCK_DATA ? (
        <View style={[styles.mockStrip, { backgroundColor: tokens.warningSoft }]}>
          <Text style={[styles.mockText, { color: tokens.dark ? '#FFD08A' : '#7A4B00' }]}>
            Mode data contoh — seluruh temuan bersifat ilustratif dan tidak berasal dari backend.
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderBottomWidth: 1,
  },
  inner: {
    width: '100%',
    maxWidth: 1120,
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    flexWrap: 'wrap',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  mark: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markText: {
    fontSize: 17,
    fontWeight: '700',
  },
  brand: {
    fontSize: 17,
    fontWeight: '700',
  },
  tagline: {
    fontSize: 11,
    fontWeight: '500',
  },
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
  },
  link: {
    paddingVertical: 6,
  },
  linkLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  linkActive: {
    textDecorationLine: 'underline',
  },
  pressed: {
    opacity: 0.7,
  },
  mockStrip: {
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  mockText: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
});
