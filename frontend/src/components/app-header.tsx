import { usePathname, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Image, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { NoticeModal } from '@/components/notice-modal';
import { APP_NAME, USE_MOCK_DATA } from '@/config';
import { useDesign } from '@/hooks/use-design';

interface NavLinkProps {
  label: string;
  href: '/' | '/jobs' | '/about';
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
      style={({ pressed }) => [
        styles.link,
        active && styles.linkActiveBg,
        pressed && styles.pressed,
      ]}
    >
      <Text
        style={[
          styles.linkLabel,
          { color: active ? '#5EEAD4' : tokens.textSecondary },
          active && styles.linkActiveText,
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
  const [showNotice, setShowNotice] = useState(false);

  // Check notice modal on first visit (Web storage)
  useEffect(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
      try {
        const seen = localStorage.getItem('confidai_notice_dismissed');
        if (!seen) {
          setShowNotice(true);
        }
      } catch {
        // Ignore
      }
    }
  }, []);

  const handleCloseNotice = () => {
    setShowNotice(false);
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
      try {
        localStorage.setItem('confidai_notice_dismissed', 'true');
      } catch {
        // Ignore
      }
    }
  };

  return (
    <>
      <View style={styles.wrapper}>
        <View style={styles.inner}>
          {/* Logo & Brand Identity */}
          <Pressable
            onPress={() => router.push('/')}
            accessibilityRole="link"
            accessibilityLabel={`${APP_NAME}, kembali ke unggah dokumen`}
            style={({ pressed }) => [styles.brandRow, pressed && styles.pressed]}
          >
            <Image
              source={require('../../assets/ConfidAI Shield Logo-2.png')}
              style={styles.logoMark}
              resizeMode="contain"
              accessibilityLabel={`Logo ${APP_NAME}`}
            />
            <View style={styles.brandTitleWrap}>
              <View style={styles.brandHeaderRow}>
                <Text style={styles.brandName}>ConfidAI</Text>
                <View style={styles.betaTag}>
                  <Text style={styles.betaTagText}>v1.0</Text>
                </View>
              </View>
              <Text style={styles.brandSubtitle}>Cybersecurity Contract Intelligence</Text>
            </View>
          </Pressable>

          {/* Navigation Items */}
          <View style={styles.nav}>
            <NavLink label="Unggah" href="/" active={pathname === '/'} />
            <NavLink label="Pekerjaan" href="/jobs" active={pathname.startsWith('/jobs')} />
            <NavLink label="Batasan Analisis" href="/about" active={pathname === '/about'} />
          </View>

          {/* Right Action: On-Premise Badge & Info Modal Button */}
          <View style={styles.rightActions}>
            <View style={styles.onPremiseBadge}>
              <View style={styles.pulsingDot} />
              <Text style={styles.onPremiseText}>100% On-Premise</Text>
            </View>

            <Pressable
              onPress={() => setShowNotice(true)}
              accessibilityRole="button"
              accessibilityLabel="Buka pemberitahuan isolasi data"
              style={({ pressed }) => [styles.infoBtn, pressed && styles.pressed]}
            >
              <Text style={styles.infoIcon}>ℹ️</Text>
              <Text style={styles.infoBtnText}>Isolasi Data</Text>
            </Pressable>
          </View>
        </View>

        {USE_MOCK_DATA ? (
          <View style={[styles.mockStrip, { backgroundColor: tokens.warningSoft }]}>
            <Text style={styles.mockText}>
              Mode data contoh — seluruh temuan bersifat ilustratif dan tidak berasal dari backend.
            </Text>
          </View>
        ) : null}
      </View>

      <NoticeModal isOpen={showNotice} onClose={handleCloseNotice} />
    </>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: '#141412',
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a27',
  },
  inner: {
    width: '100%',
    maxWidth: 1180,
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    flexWrap: 'wrap',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoMark: {
    width: 42,
    height: 42,
    borderRadius: 8,
  },
  brandTitleWrap: {
    gap: 2,
  },
  brandHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  brandName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#F5F5F2',
    letterSpacing: -0.3,
  },
  betaTag: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 999,
    backgroundColor: 'rgba(20, 184, 166, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(20, 184, 166, 0.3)',
  },
  betaTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#5EEAD4',
  },
  brandSubtitle: {
    fontSize: 11,
    color: '#71717A',
    fontWeight: '500',
  },
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  link: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    justifyContent: 'center',
  },
  linkActiveBg: {
    backgroundColor: 'rgba(20, 184, 166, 0.12)',
  },
  linkLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  linkActiveText: {
    fontWeight: '700',
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  onPremiseBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
  },
  pulsingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  onPremiseText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#34D399',
  },
  infoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: '#1e1e1b',
    borderWidth: 1,
    borderColor: '#2a2a27',
  },
  infoIcon: {
    fontSize: 12,
  },
  infoBtnText: {
    fontSize: 12,
    color: '#A1A1AA',
    fontWeight: '500',
  },
  pressed: {
    opacity: 0.75,
  },
  mockStrip: {
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  mockText: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
    color: '#FDE68A',
  },
});
