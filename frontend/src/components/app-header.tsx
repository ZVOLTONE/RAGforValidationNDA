import { usePathname, useRouter } from 'expo-router';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

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
          <Image
            source={require('../../assets/ConfidAI Shield Logo-2.png')}
            style={styles.mark}
            resizeMode="contain"
            accessibilityLabel={`Logo ${APP_NAME}`}
          />
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
    gap: 0,
  },
  mark: {
    width: 148,
    height: 50,
    backgroundColor: '#171715',
    borderRadius: 6,
  },
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
  },
  link: {
    minHeight: 44,
    paddingVertical: 10,
    justifyContent: 'center',
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
