import React, { useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';

type AppId = 'messages' | 'photos' | 'notes' | 'browser' | 'board' | 'vault';
type Clue = { id: string; title: string; source: string; detail: string; tone: string };

const clues: Clue[] = [
  { id: 'alias', title: 'M. Vale is not a contact', source: 'NOTES / DRAFT', detail: 'The alias appears beside a copied transit code: 04—17.', tone: 'coral' },
  { id: 'meeting', title: 'The meeting was moved', source: 'MESSAGES / M. VALE', detail: '“Not the café. Under the old clock. Come alone.” Sent 22:41.', tone: 'teal' },
  { id: 'route', title: 'The route was rehearsed', source: 'BROWSER / HISTORY', detail: 'Three searches for North Station service doors, all before the murder.', tone: 'amber' },
  { id: 'photo', title: 'Someone else was there', source: 'PHOTOS / IMG_0417', detail: 'A second shadow in the reflection. The timestamp says 23:08.', tone: 'violet' },
  { id: 'ledger', title: 'The ledger was the target', source: 'ARCHIVE / COLD STORAGE', detail: 'A deleted export names the real story: payment trails inside Halcyon, not a source meeting.', tone: 'teal' },
];

const apps: { id: AppId; name: string; icon: string; library: keyof typeof Ionicons.glyphMap; tint: string }[] = [
  { id: 'messages', name: 'Messages', icon: 'chatbubble-ellipses-outline', library: 'chatbubble-ellipses-outline', tint: '#d85b45' },
  { id: 'photos', name: 'Photos', icon: 'image-outline', library: 'image-outline', tint: '#c88c5a' },
  { id: 'notes', name: 'Notes', icon: 'document-text-outline', library: 'document-text-outline', tint: '#7aa89e' },
  { id: 'browser', name: 'Browser', icon: 'globe-outline', library: 'globe-outline', tint: '#7190b5' },
];

function Icon({ name, size = 20, color }: { name: keyof typeof Ionicons.glyphMap; size?: number; color: string }) {
  return <Ionicons name={name} size={size} color={color} />;
}

function StatusBar({ colors }: { colors: ReturnType<typeof useColors> }) {
  return (
    <View style={styles.statusBar}>
      <Text style={[styles.statusTime, { color: colors.foreground }]}>11:47</Text>
      <View style={styles.statusRight}>
        <Ionicons name="cellular" size={13} color={colors.foreground} />
        <Ionicons name="wifi" size={14} color={colors.foreground} />
        <Ionicons name="battery-full" size={18} color={colors.foreground} />
      </View>
    </View>
  );
}

function AppTile({ app, onPress, colors }: { app: (typeof apps)[number]; onPress: () => void; colors: ReturnType<typeof useColors> }) {
  return (
    <Pressable testID={`app-${app.id}`} onPress={onPress} style={({ pressed }) => [styles.appTile, pressed && styles.pressed]}>
      <View style={[styles.appIcon, { backgroundColor: app.tint }]}>
        <Icon name={app.icon as keyof typeof Ionicons.glyphMap} size={26} color={colors.primaryForeground} />
      </View>
      <Text style={[styles.appName, { color: colors.foreground }]}>{app.name}</Text>
    </Pressable>
  );
}

function SectionLabel({ children, colors }: { children: React.ReactNode; colors: ReturnType<typeof useColors> }) {
  return <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>{children}</Text>;
}

function Messages({ colors, onBack, onPin }: { colors: ReturnType<typeof useColors>; onBack: () => void; onPin: (id: string) => void }) {
  return (
    <View style={styles.flex}>
      <Header title="Messages" subtitle="4 conversations" onBack={onBack} colors={colors} />
      <ScrollView contentContainerStyle={styles.screenPad}>
        <View style={[styles.warning, { backgroundColor: colors.accent, borderColor: colors.border }]}>
          <Icon name="lock-closed-outline" color={colors.accentForeground} size={16} />
          <Text style={[styles.warningText, { color: colors.accentForeground }]}>One conversation is protected by an alias.</Text>
        </View>
        <Thread name="M. Vale" preview="Not the café. Under the old clock." time="22:41" unread colors={colors} onPress={() => onPin('meeting')} />
        <Thread name="Elena R." preview="You promised you would tell me first." time="18:03" colors={colors} />
        <Thread name="Newsroom" preview="The source wants a correction by noon." time="Yesterday" colors={colors} />
        <Thread name="Unknown" preview="Delete this thread." time="Aug 16" muted colors={colors} />
        <EvidenceNote text="The alias is the first deliberate mislabel. Tap it twice in your mind: who benefits from being called “Vale”?" colors={colors} />
      </ScrollView>
    </View>
  );
}

function Thread({ name, preview, time, unread, muted, colors, onPress }: { name: string; preview: string; time: string; unread?: boolean; muted?: boolean; colors: ReturnType<typeof useColors>; onPress?: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.thread, { borderBottomColor: colors.border }, pressed && styles.pressed]}>
      <View style={[styles.avatar, { backgroundColor: muted ? colors.muted : colors.secondary }]}><Text style={[styles.avatarText, { color: muted ? colors.mutedForeground : colors.primary }]}>{name[0]}</Text></View>
      <View style={styles.threadCopy}><View style={styles.row}><Text style={[styles.threadName, { color: colors.foreground }, muted && { color: colors.mutedForeground }]}>{name}</Text><Text style={[styles.time, { color: colors.mutedForeground }]}>{time}</Text></View><Text numberOfLines={1} style={[styles.threadPreview, { color: colors.mutedForeground }, unread && { color: colors.foreground }]}>{preview}</Text></View>
      {unread && <View style={[styles.dot, { backgroundColor: colors.primary }]} />}
    </Pressable>
  );
}

function Photos({ colors, onBack, onPin }: { colors: ReturnType<typeof useColors>; onBack: () => void; onPin: (id: string) => void }) {
  return <View style={styles.flex}><Header title="Photos" subtitle="Camera Roll · 247 items" onBack={onBack} colors={colors} /><ScrollView contentContainerStyle={styles.screenPad}>
    <SectionLabel colors={colors}>AUGUST 2026</SectionLabel>
    <Pressable onPress={() => onPin('photo')} style={({ pressed }) => [styles.photoCard, { backgroundColor: colors.secondary, borderColor: colors.border }, pressed && styles.pressed]}>
      <View style={styles.photoScene}><View style={styles.clock}><Text style={styles.clockText}>N</Text></View><View style={styles.shadowOne} /><View style={styles.shadowTwo} /><View style={styles.photoGrain} /><View style={styles.photoCaption}><Text style={styles.photoTitle}>IMG_0417</Text><Text style={styles.photoMeta}>North Station · 23:08</Text></View></View>
      <View style={styles.inspectRow}><Icon name="scan-outline" size={17} color={colors.primary} /><Text style={[styles.inspectText, { color: colors.foreground }]}>Tap to inspect metadata</Text><Icon name="chevron-forward" size={16} color={colors.mutedForeground} /></View>
    </Pressable>
    <View style={styles.photoGrid}><PhotoThumb label="IMG_0411" icon="rainy-outline" colors={colors} /><PhotoThumb label="IMG_0409" icon="bus-outline" colors={colors} /><PhotoThumb label="IMG_0402" icon="newspaper-outline" colors={colors} /></View>
    <EvidenceNote text="The reflection isn't a face. It's a second route: a station clock, caught in glass." colors={colors} />
  </ScrollView></View>;
}

function PhotoThumb({ label, icon, colors }: { label: string; icon: keyof typeof Ionicons.glyphMap; colors: ReturnType<typeof useColors> }) {
  return <View style={[styles.thumb, { backgroundColor: colors.card, borderColor: colors.border }]}><Icon name={icon} size={28} color={colors.mutedForeground} /><Text style={[styles.thumbLabel, { color: colors.mutedForeground }]}>{label}</Text></View>;
}

function Notes({ colors, onBack, onPin }: { colors: ReturnType<typeof useColors>; onBack: () => void; onPin: (id: string) => void }) {
  return <View style={styles.flex}><Header title="Notes" subtitle="On My iPhone · 18 notes" onBack={onBack} colors={colors} /><ScrollView contentContainerStyle={styles.screenPad}>
    <NoteRow title="recipes — August" date="Aug 21" preview="The good sauce needs 04—17. Do not write it down." colors={colors} onPress={() => onPin('alias')} />
    <NoteRow title="draft / no subject" date="Aug 19" preview="M. Vale is a story, not a person. Check the old clock." colors={colors} onPress={() => onPin('alias')} />
    <NoteRow title="things to forget" date="Aug 14" preview="Call Elena. Return the blue book. Buy oranges." colors={colors} />
    <View style={[styles.noteDetail, { backgroundColor: colors.card, borderColor: colors.border }]}><View style={styles.noteDetailHead}><Text style={[styles.noteDetailTitle, { color: colors.foreground }]}>recipes — August</Text><Icon name="ellipsis-horizontal" size={20} color={colors.mutedForeground} /></View><Text style={[styles.noteBody, { color: colors.foreground }]}>The good sauce needs <Text style={{ color: colors.primary, fontWeight: '700' }}>04—17</Text>.</Text><Text style={[styles.noteBody, { color: colors.foreground }]}>{"\n"}M. Vale is a story, not a person.{"\n"}Check the old clock.{"\n"}{"\n"}— A.</Text><Text style={[styles.noteFooter, { color: colors.mutedForeground }]}>Edited 2 days ago · This note was never shared</Text></View>
  </ScrollView></View>;
}

function NoteRow({ title, date, preview, colors, onPress }: { title: string; date: string; preview: string; colors: ReturnType<typeof useColors>; onPress?: () => void }) {
  return <Pressable onPress={onPress} style={({ pressed }) => [styles.noteRow, { borderBottomColor: colors.border }, pressed && styles.pressed]}><View style={styles.noteIcon}><Icon name="document-text-outline" size={19} color={colors.primary} /></View><View style={styles.threadCopy}><View style={styles.row}><Text style={[styles.noteRowTitle, { color: colors.foreground }]}>{title}</Text><Text style={[styles.time, { color: colors.mutedForeground }]}>{date}</Text></View><Text numberOfLines={1} style={[styles.threadPreview, { color: colors.mutedForeground }]}>{preview}</Text></View></Pressable>;
}

function Browser({ colors, onBack, onPin }: { colors: ReturnType<typeof useColors>; onBack: () => void; onPin: (id: string) => void }) {
  return <View style={styles.flex}><Header title="Browser" subtitle="History" onBack={onBack} colors={colors} /><ScrollView contentContainerStyle={styles.screenPad}>
    <View style={[styles.searchBar, { backgroundColor: colors.secondary }]}><Icon name="search" size={17} color={colors.mutedForeground} /><Text style={[styles.searchText, { color: colors.mutedForeground }]}>Search history</Text></View>
    <SectionLabel colors={colors}>RECENTLY VISITED</SectionLabel>
    <HistoryRow domain="northstation.gov" title="Service access &amp; public hours" time="Aug 21 · 21:16" colors={colors} onPress={() => onPin('route')} />
    <HistoryRow domain="maps.apple.com" title="North Station → Old Clock" time="Aug 21 · 20:49" colors={colors} onPress={() => onPin('route')} />
    <HistoryRow domain="newswire.local" title="The Halcyon Ledger investigation" time="Aug 20 · 09:02" colors={colors} />
    <View style={[styles.browserCallout, { backgroundColor: colors.accent, borderColor: colors.border }]}><Icon name="eye-outline" size={18} color={colors.accentForeground} /><View style={styles.threadCopy}><Text style={[styles.calloutTitle, { color: colors.accentForeground }]}>A pattern in the gaps</Text><Text style={[styles.calloutBody, { color: colors.accentForeground }]}>Three searches. Same station. All before the final message.</Text></View></View>
  </ScrollView></View>;
}

function HistoryRow({ domain, title, time, colors, onPress }: { domain: string; title: string; time: string; colors: ReturnType<typeof useColors>; onPress?: () => void }) {
  return <Pressable onPress={onPress} style={({ pressed }) => [styles.historyRow, { borderBottomColor: colors.border }, pressed && styles.pressed]}><View style={[styles.siteIcon, { backgroundColor: colors.secondary }]}><Icon name="globe-outline" size={18} color={colors.primary} /></View><View style={styles.threadCopy}><Text style={[styles.domain, { color: colors.mutedForeground }]}>{domain}</Text><Text style={[styles.historyTitle, { color: colors.foreground }]}>{title}</Text><Text style={[styles.time, { color: colors.mutedForeground }]}>{time}</Text></View><Icon name="chevron-forward" size={16} color={colors.mutedForeground} /></Pressable>;
}

function Header({ title, subtitle, onBack, colors }: { title: string; subtitle: string; onBack: () => void; colors: ReturnType<typeof useColors> }) {
  return <View style={[styles.header, { borderBottomColor: colors.border }]}><Pressable testID="back-button" onPress={onBack} style={styles.iconButton}><Icon name="chevron-back" size={23} color={colors.foreground} /></Pressable><View><Text style={[styles.headerTitle, { color: colors.foreground }]}>{title}</Text><Text style={[styles.headerSubtitle, { color: colors.mutedForeground }]}>{subtitle}</Text></View><Pressable style={styles.iconButton}><Icon name="ellipsis-horizontal" size={21} color={colors.foreground} /></Pressable></View>;
}

function EvidenceNote({ text, colors }: { text: string; colors: ReturnType<typeof useColors> }) {
  return <View style={[styles.evidenceNote, { borderColor: colors.border }]}><MaterialCommunityIcons name="fingerprint" size={19} color={colors.primary} /><Text style={[styles.evidenceText, { color: colors.mutedForeground }]}>{text}</Text></View>;
}

function Vault({ colors, onBack, onPin }: { colors: ReturnType<typeof useColors>; onBack: () => void; onPin: (id: string) => void }) {
  return <View style={[styles.flex, { backgroundColor: colors.hiddenBackground }]}>
    <View style={[styles.vaultHeader, { borderBottomColor: colors.hiddenCard }]}><Pressable testID="vault-back-button" onPress={onBack} style={styles.iconButton}><Icon name="chevron-back" size={23} color={colors.hiddenPrimary} /></Pressable><View><Text style={[styles.headerTitle, { color: colors.hiddenPrimary }]}>Cold Storage</Text><Text style={[styles.headerSubtitle, { color: colors.mutedForeground }]}>SECOND PARTITION · 01 FILE</Text></View><Icon name="shield-outline" size={19} color={colors.hiddenPrimary} /></View>
    <ScrollView contentContainerStyle={styles.screenPad}>
      <View style={styles.vaultIntro}><Text style={[styles.eyebrow, { color: colors.hiddenPrimary }]}>HIDDEN LAYER FOUND</Text><Text style={[styles.vaultTitle, { color: colors.foreground }]}>What he didn’t want the newsroom to see.</Text><Text style={[styles.vaultCopy, { color: colors.mutedForeground }]}>The phone changes when you cross the line he drew around his real investigation.</Text></View>
      <Pressable onPress={() => onPin('ledger')} style={({ pressed }) => [styles.ledgerCard, { backgroundColor: colors.hiddenCard, borderColor: colors.hiddenPrimary }, pressed && styles.pressed]}><View style={[styles.ledgerIcon, { backgroundColor: colors.hiddenPrimary }]}><Icon name="file-tray-full-outline" size={23} color={colors.hiddenBackground} /></View><View style={styles.threadCopy}><Text style={[styles.ledgerKicker, { color: colors.hiddenPrimary }]}>DELETED EXPORT · RESTORED</Text><Text style={[styles.ledgerTitle, { color: colors.foreground }]}>halcyon_payments.csv</Text><Text style={[styles.ledgerBody, { color: colors.mutedForeground }]}>A list of transfers routed through a shell company. Open to pin the discovery.</Text></View><Icon name="chevron-forward" size={18} color={colors.hiddenPrimary} /></Pressable>
      <View style={[styles.vaultQuote, { borderColor: colors.hiddenCard }]}><Icon name="chatbox-ellipses-outline" size={17} color={colors.hiddenPrimary} /><Text style={[styles.vaultQuoteText, { color: colors.mutedForeground }]}>If you found this, you already know the meeting was a decoy.</Text></View>
    </ScrollView>
  </View>;
}

function Board({ colors, onBack, pinned, onAccuse }: { colors: ReturnType<typeof useColors>; onBack: () => void; pinned: string[]; onAccuse: () => void }) {
  const activeClues = clues.filter((clue) => pinned.includes(clue.id));
  return <View style={styles.flex}><Header title="Field Notes" subtitle={`${activeClues.length} of 4 evidence fragments`} onBack={onBack} colors={colors} /><ScrollView contentContainerStyle={styles.screenPad}>
    <View style={styles.boardIntro}><Text style={[styles.boardEyebrow, { color: colors.primary }]}>YOUR RECONSTRUCTION</Text><Text style={[styles.boardTitle, { color: colors.foreground }]}>The night at North Station</Text><Text style={[styles.boardCopy, { color: colors.mutedForeground }]}>Pin what you notice. The phone will not tell you what it means.</Text></View>
    {activeClues.length === 0 ? <View style={[styles.emptyBoard, { borderColor: colors.border }]}><MaterialCommunityIcons name="pin-outline" size={30} color={colors.mutedForeground} /><Text style={[styles.emptyTitle, { color: colors.foreground }]}>Nothing pinned yet</Text><Text style={[styles.emptyCopy, { color: colors.mutedForeground }]}>Explore the apps and press evidence when something doesn't fit.</Text></View> : activeClues.map((clue) => <View key={clue.id} style={[styles.clueCard, { backgroundColor: colors.card, borderColor: colors.border }]}><View style={[styles.clueStripe, { backgroundColor: colors.primary }]} /><View style={styles.clueContent}><View style={styles.row}><Text style={[styles.clueSource, { color: colors.mutedForeground }]}>{clue.source}</Text><Icon name="pin" size={15} color={colors.primary} /></View><Text style={[styles.clueTitle, { color: colors.foreground }]}>{clue.title}</Text><Text style={[styles.clueDetail, { color: colors.mutedForeground }]}>{clue.detail}</Text></View></View>)}
    <View style={[styles.connection, { backgroundColor: colors.accent }]}><Icon name="git-branch-outline" size={19} color={colors.accentForeground} /><Text style={[styles.connectionText, { color: colors.accentForeground }]}>{activeClues.length > 1 ? 'You are building a chain. Two more fragments complete the accusation.' : 'Connections appear as you pin related evidence.'}</Text></View>
    <Pressable testID="accuse-button" onPress={onAccuse} disabled={activeClues.length < 3} style={({ pressed }) => [styles.accuseButton, { backgroundColor: activeClues.length >= 3 ? colors.primary : colors.muted }, pressed && styles.pressed]}><Text style={[styles.accuseText, { color: activeClues.length >= 3 ? colors.primaryForeground : colors.mutedForeground }]}>Make an accusation</Text><Icon name="arrow-forward" size={18} color={activeClues.length >= 3 ? colors.primaryForeground : colors.mutedForeground} /></Pressable>
  </ScrollView></View>;
}

function Home({ colors, openApp, openBoard, openVault, pinned, reset, vaultUnlocked }: { colors: ReturnType<typeof useColors>; openApp: (id: AppId) => void; openBoard: () => void; openVault: () => void; pinned: string[]; reset: () => void; vaultUnlocked: boolean }) {
  const discovered = pinned.length;
  return <View style={styles.flex}><StatusBar colors={colors} /><ScrollView contentContainerStyle={styles.homePad}>
    <View style={styles.homeTop}><View><Text style={[styles.eyebrow, { color: colors.primary }]}>ARCHIVE RECOVERED</Text><Text style={[styles.homeTitle, { color: colors.foreground }]}>Alexander Cole’s iPhone</Text></View><Pressable testID="settings-button" onPress={reset} style={[styles.smallAction, { backgroundColor: colors.secondary }]}><Icon name="refresh-outline" size={17} color={colors.mutedForeground} /></Pressable></View>
    <View style={[styles.statusCard, { backgroundColor: colors.card, borderColor: colors.border }]}><View style={styles.statusIcon}><Icon name="lock-open-outline" size={18} color={colors.primary} /></View><View style={styles.threadCopy}><Text style={[styles.statusTitle, { color: colors.foreground }]}>Device unlocked</Text><Text style={[styles.statusCopy, { color: colors.mutedForeground }]}>Last backup · 11:32 PM · 18 Aug 2026</Text></View><View style={[styles.liveDot, { backgroundColor: colors.primary }]} /></View>
    <View style={styles.mission}><Text style={[styles.missionLabel, { color: colors.mutedForeground }]}>CASE FILE 01</Text><Text style={[styles.missionTitle, { color: colors.foreground }]}>Who was waiting under the old clock?</Text><Text style={[styles.missionCopy, { color: colors.mutedForeground }]}>He left a trail across the phone. It was designed for the right person to find.</Text></View>
    <SectionLabel colors={colors}>APPLICATIONS</SectionLabel><View style={styles.appGrid}>{apps.map((app) => <AppTile key={app.id} app={app} colors={colors} onPress={() => openApp(app.id)} />)}</View>
    <Pressable testID="field-notes-button" onPress={openBoard} style={({ pressed }) => [styles.fieldNotes, { backgroundColor: colors.secondary, borderColor: colors.border }, pressed && styles.pressed]}><View style={[styles.boardIcon, { backgroundColor: colors.accent }]}><MaterialCommunityIcons name="pin-outline" size={24} color={colors.accentForeground} /></View><View style={styles.threadCopy}><Text style={[styles.fieldTitle, { color: colors.foreground }]}>Field Notes</Text><Text style={[styles.fieldCopy, { color: colors.mutedForeground }]}>{discovered === 0 ? 'Your deduction board is empty' : `${discovered} evidence fragments pinned`}</Text></View><Icon name="chevron-forward" size={18} color={colors.mutedForeground} /></Pressable>
    {pinned.includes('alias') && <Pressable testID="hidden-layer-button" onPress={openVault} style={({ pressed }) => [styles.hiddenLayer, { backgroundColor: colors.hiddenBackground, borderColor: colors.hiddenPrimary }, pressed && styles.pressed]}><View style={[styles.hiddenIcon, { backgroundColor: colors.hiddenPrimary }]}><Icon name={vaultUnlocked ? 'lock-open-outline' : 'key-outline'} size={21} color={colors.hiddenBackground} /></View><View style={styles.threadCopy}><Text style={[styles.fieldTitle, { color: colors.hiddenPrimary }]}>{vaultUnlocked ? 'Cold Storage' : 'Second partition detected'}</Text><Text style={[styles.fieldCopy, { color: colors.mutedForeground }]}>{vaultUnlocked ? 'One deleted file restored' : 'The code 04—17 opened a new layer'}</Text></View><Icon name="chevron-forward" size={18} color={colors.hiddenPrimary} /></Pressable>}
    <View style={styles.homeFooter}><Icon name="shield-checkmark-outline" size={15} color={colors.mutedForeground} /><Text style={[styles.footerText, { color: colors.mutedForeground }]}>Everything here was left by Cole. Nothing is simulated.</Text></View>
  </ScrollView></View>;
}

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [active, setActive] = useState<AppId | null>(null);
  const [pinned, setPinned] = useState<string[]>([]);
  const [accusationOpen, setAccusationOpen] = useState(false);
  const [unlockOpen, setUnlockOpen] = useState(false);
  const [vaultUnlocked, setVaultUnlocked] = useState(false);
  const [code, setCode] = useState('');
  const [selectedEvidence, setSelectedEvidence] = useState<string[]>([]);
  const [selectedSuspect, setSelectedSuspect] = useState<string | null>(null);

  useEffect(() => { AsyncStorage.multiGet(['dead-letter-pinned', 'dead-letter-vault']).then(([pinEntry, vaultEntry]) => { if (pinEntry[1]) setPinned(JSON.parse(pinEntry[1]) as string[]); if (vaultEntry[1] === 'true') setVaultUnlocked(true); }); }, []);
  const pin = (id: string) => { Haptics.selectionAsync(); setPinned((old) => { const next = old.includes(id) ? old : [...old, id]; AsyncStorage.setItem('dead-letter-pinned', JSON.stringify(next)); return next; }); };
  const reset = () => { setPinned([]); setVaultUnlocked(false); AsyncStorage.multiRemove(['dead-letter-pinned', 'dead-letter-vault']); Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning); };
  const openVault = () => { if (vaultUnlocked) setActive('vault'); else setUnlockOpen(true); };
  const unlockVault = () => { if (code.replace('—', '').replace('-', '') === '0417') { setVaultUnlocked(true); AsyncStorage.setItem('dead-letter-vault', 'true'); setUnlockOpen(false); setCode(''); Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); setActive('vault'); } };
  const content = useMemo(() => {
    if (active === 'messages') return <Messages colors={colors} onBack={() => setActive(null)} onPin={pin} />;
    if (active === 'photos') return <Photos colors={colors} onBack={() => setActive(null)} onPin={pin} />;
    if (active === 'notes') return <Notes colors={colors} onBack={() => setActive(null)} onPin={pin} />;
    if (active === 'browser') return <Browser colors={colors} onBack={() => setActive(null)} onPin={pin} />;
    if (active === 'board') return <Board colors={colors} onBack={() => setActive(null)} pinned={pinned} onAccuse={() => setAccusationOpen(true)} />;
    if (active === 'vault') return <Vault colors={colors} onBack={() => setActive(null)} onPin={pin} />;
    return <Home colors={colors} openApp={setActive} openBoard={() => setActive('board')} openVault={openVault} pinned={pinned} reset={reset} vaultUnlocked={vaultUnlocked} />;
  }, [active, colors, pinned, vaultUnlocked]);
  return <View style={[styles.container, { backgroundColor: active === 'vault' ? colors.hiddenBackground : colors.background, paddingTop: Platform.OS === 'web' ? Math.max(insets.top, 67) : insets.top, paddingBottom: Platform.OS === 'web' ? 34 : insets.bottom }]}>{content}
    <Modal transparent visible={accusationOpen} animationType="slide" onRequestClose={() => setAccusationOpen(false)}><View style={styles.modalBackdrop}><View style={[styles.modal, { backgroundColor: colors.card, borderColor: colors.border }]}><View style={styles.modalGrabber} /><Text style={[styles.modalEyebrow, { color: colors.primary }]}>THE FINAL THREAD</Text><Text style={[styles.modalTitle, { color: colors.foreground }]}>Who did Cole meet?</Text><Text style={[styles.modalCopy, { color: colors.mutedForeground }]}>Choose a suspect, then support the reconstruction with three specific fragments.</Text>{['Elena R. · the editor', 'Mara Voss · the source', 'Jon Bell · the fixer'].map((name) => <Pressable key={name} onPress={() => setSelectedSuspect(name)} style={[styles.suspect, { borderColor: selectedSuspect === name ? colors.primary : colors.border, backgroundColor: selectedSuspect === name ? colors.accent : colors.secondary }]}><View style={[styles.suspectRadio, { borderColor: selectedSuspect === name ? colors.primary : colors.mutedForeground }]}>{selectedSuspect === name && <View style={[styles.suspectDot, { backgroundColor: colors.primary }]} />}</View><Text style={[styles.suspectText, { color: colors.foreground }]}>{name}</Text></Pressable>)}<SectionLabel colors={colors}>SUPPORTING EVIDENCE · {selectedEvidence.length}/3</SectionLabel>{clues.filter((clue) => pinned.includes(clue.id)).map((clue) => <Pressable key={clue.id} onPress={() => setSelectedEvidence((old) => old.includes(clue.id) ? old.filter((id) => id !== clue.id) : [...old, clue.id])} style={[styles.evidencePick, { borderColor: selectedEvidence.includes(clue.id) ? colors.primary : colors.border, backgroundColor: selectedEvidence.includes(clue.id) ? colors.accent : colors.secondary }]}><Icon name={selectedEvidence.includes(clue.id) ? 'checkbox-outline' : 'square-outline'} size={18} color={selectedEvidence.includes(clue.id) ? colors.primary : colors.mutedForeground} /><Text numberOfLines={1} style={[styles.evidencePickText, { color: colors.foreground }]}>{clue.title}</Text></Pressable>)}<Pressable onPress={() => { if (selectedSuspect && selectedEvidence.length >= 3) { setAccusationOpen(false); Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } }} disabled={!selectedSuspect || selectedEvidence.length < 3} style={[styles.confirm, { backgroundColor: selectedSuspect && selectedEvidence.length >= 3 ? colors.primary : colors.muted }]}><Text style={[styles.confirmText, { color: selectedSuspect && selectedEvidence.length >= 3 ? colors.primaryForeground : colors.mutedForeground }]}>{selectedSuspect && selectedEvidence.length >= 3 ? 'Submit reconstruction' : 'Choose 3 evidence fragments'}</Text></Pressable></View></View></Modal>
    <Modal transparent visible={unlockOpen} animationType="fade" onRequestClose={() => setUnlockOpen(false)}><View style={styles.modalBackdrop}><View style={[styles.unlockModal, { backgroundColor: colors.hiddenCard, borderColor: colors.hiddenPrimary }]}><Icon name="key-outline" size={26} color={colors.hiddenPrimary} /><Text style={[styles.modalTitle, { color: colors.foreground }]}>Enter the partition code</Text><Text style={[styles.modalCopy, { color: colors.mutedForeground }]}>The note said 04—17. Use the punctuation exactly as you found it, or don't.</Text><TextInput testID="partition-code-input" value={code} onChangeText={setCode} placeholder="04—17" placeholderTextColor={colors.mutedForeground} keyboardType="number-pad" style={[styles.codeInput, { color: colors.foreground, borderColor: colors.hiddenPrimary }]} /><View style={styles.modalActions}><Pressable onPress={() => setUnlockOpen(false)} style={styles.cancelButton}><Text style={[styles.cancelText, { color: colors.mutedForeground }]}>Not yet</Text></Pressable><Pressable testID="unlock-button" onPress={unlockVault} style={[styles.confirm, { backgroundColor: colors.hiddenPrimary }]}><Text style={[styles.confirmText, { color: colors.hiddenBackground }]}>Open layer</Text></Pressable></View></View></View></Modal>
  </View>;
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  pressed: { opacity: 0.72, transform: [{ scale: 0.985 }] },
  statusBar: { height: 32, paddingHorizontal: 22, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statusTime: { fontSize: 12, fontWeight: '700' },
  statusRight: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  homePad: { paddingHorizontal: 22, paddingBottom: 30 },
  homeTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: 18, marginBottom: 24 },
  eyebrow: { fontSize: 10, letterSpacing: 1.8, fontWeight: '700', marginBottom: 7 },
  homeTitle: { fontSize: 25, fontWeight: '700', letterSpacing: -0.6, maxWidth: 270 },
  smallAction: { width: 35, height: 35, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  statusCard: { borderWidth: 1, borderRadius: 16, padding: 14, flexDirection: 'row', alignItems: 'center', marginBottom: 27 },
  statusIcon: { width: 34, height: 34, borderRadius: 10, backgroundColor: 'rgba(216,91,69,0.13)', alignItems: 'center', justifyContent: 'center', marginRight: 11 },
  statusTitle: { fontSize: 13, fontWeight: '700', marginBottom: 3 },
  statusCopy: { fontSize: 11 },
  liveDot: { width: 7, height: 7, borderRadius: 4, marginLeft: 'auto' },
  mission: { marginBottom: 28 },
  missionLabel: { fontSize: 10, letterSpacing: 1.5, fontWeight: '700', marginBottom: 9 },
  missionTitle: { fontSize: 22, lineHeight: 28, fontWeight: '600', letterSpacing: -0.4, maxWidth: 335 },
  missionCopy: { fontSize: 13, lineHeight: 19, marginTop: 8, maxWidth: 320 },
  sectionLabel: { fontSize: 10, letterSpacing: 1.6, fontWeight: '700', marginBottom: 13 },
  appGrid: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 25, gap: 18 },
  appTile: { width: '21%', alignItems: 'center', minWidth: 63 },
  appIcon: { width: 57, height: 57, borderRadius: 17, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  appName: { fontSize: 11, fontWeight: '500' },
  fieldNotes: { borderRadius: 16, borderWidth: 1, padding: 13, flexDirection: 'row', alignItems: 'center' },
  boardIcon: { width: 43, height: 43, borderRadius: 13, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  fieldTitle: { fontSize: 14, fontWeight: '700', marginBottom: 3 },
  fieldCopy: { fontSize: 11 },
  homeFooter: { flexDirection: 'row', alignItems: 'center', gap: 7, justifyContent: 'center', marginTop: 25 },
  footerText: { fontSize: 10 },
  header: { minHeight: 67, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1 },
  iconButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '700', textAlign: 'center' },
  headerSubtitle: { fontSize: 10, textAlign: 'center', marginTop: 3 },
  screenPad: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 45 },
  warning: { borderWidth: 1, borderRadius: 13, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 9, marginBottom: 16 },
  warningText: { fontSize: 12, flex: 1, lineHeight: 17 },
  thread: { minHeight: 69, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, gap: 12 },
  avatar: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 17, fontWeight: '700' },
  threadCopy: { flex: 1 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  threadName: { fontSize: 14, fontWeight: '600' },
  time: { fontSize: 10 },
  threadPreview: { fontSize: 12, marginTop: 5 },
  dot: { width: 7, height: 7, borderRadius: 4 },
  evidenceNote: { marginTop: 22, borderWidth: 1, borderRadius: 13, padding: 13, flexDirection: 'row', gap: 9 },
  evidenceText: { flex: 1, fontSize: 11, lineHeight: 16, fontStyle: 'italic' },
  photoCard: { borderWidth: 1, borderRadius: 16, overflow: 'hidden', marginBottom: 15 },
  photoScene: { height: 216, backgroundColor: '#34434a', overflow: 'hidden', position: 'relative' },
  clock: { position: 'absolute', top: 34, alignSelf: 'center', width: 71, height: 71, borderRadius: 36, borderWidth: 5, borderColor: '#c5a47a', alignItems: 'center', justifyContent: 'center', backgroundColor: '#273137' },
  clockText: { color: '#d8b785', fontSize: 29, fontWeight: '700' },
  shadowOne: { position: 'absolute', left: 58, bottom: 0, height: 150, width: 42, backgroundColor: '#152027', transform: [{ rotate: '12deg' }], opacity: 0.85 },
  shadowTwo: { position: 'absolute', right: 65, bottom: -15, height: 181, width: 32, backgroundColor: '#1c2327', transform: [{ rotate: '-9deg' }], opacity: 0.8 },
  photoGrain: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(201,164,112,0.08)' },
  photoCaption: { position: 'absolute', left: 15, bottom: 13 },
  photoTitle: { color: '#f4f1eb', fontSize: 14, fontWeight: '700' },
  photoMeta: { color: '#ced0c8', fontSize: 11, marginTop: 3 },
  inspectRow: { height: 48, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 8 },
  inspectText: { fontSize: 12, flex: 1 },
  photoGrid: { flexDirection: 'row', gap: 10 },
  thumb: { flex: 1, height: 93, borderWidth: 1, borderRadius: 12, alignItems: 'center', justifyContent: 'center', gap: 6 },
  thumbLabel: { fontSize: 9 },
  noteRow: { minHeight: 68, borderBottomWidth: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
  noteIcon: { width: 38, height: 38, borderRadius: 11, backgroundColor: 'rgba(122,168,158,0.13)', alignItems: 'center', justifyContent: 'center' },
  noteRowTitle: { fontSize: 13, fontWeight: '600' },
  noteDetail: { borderWidth: 1, borderRadius: 15, marginTop: 22, padding: 16 },
  noteDetailHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 },
  noteDetailTitle: { fontSize: 14, fontWeight: '700' },
  noteBody: { fontFamily: 'Inter_400Regular', fontSize: 15, lineHeight: 23 },
  noteFooter: { fontSize: 10, marginTop: 28 },
  searchBar: { height: 41, borderRadius: 11, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 25 },
  searchText: { fontSize: 12 },
  historyRow: { minHeight: 76, borderBottomWidth: 1, flexDirection: 'row', alignItems: 'center', gap: 11 },
  siteIcon: { width: 35, height: 35, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  domain: { fontSize: 10, marginBottom: 3 },
  historyTitle: { fontSize: 13, fontWeight: '600', marginBottom: 5 },
  browserCallout: { borderRadius: 13, padding: 13, marginTop: 22, flexDirection: 'row', gap: 10 },
  calloutTitle: { fontSize: 12, fontWeight: '700', marginBottom: 4 },
  calloutBody: { fontSize: 11, lineHeight: 16 },
  boardIntro: { marginBottom: 23 },
  boardEyebrow: { fontSize: 10, letterSpacing: 1.5, fontWeight: '700', marginBottom: 8 },
  boardTitle: { fontSize: 23, fontWeight: '700', letterSpacing: -0.4, marginBottom: 7 },
  boardCopy: { fontSize: 13, lineHeight: 18 },
  emptyBoard: { minHeight: 190, borderWidth: 1, borderStyle: 'dashed', borderRadius: 15, alignItems: 'center', justifyContent: 'center', padding: 28 },
  emptyTitle: { fontSize: 15, fontWeight: '700', marginTop: 12, marginBottom: 6 },
  emptyCopy: { fontSize: 12, textAlign: 'center', lineHeight: 18 },
  clueCard: { minHeight: 111, borderWidth: 1, borderRadius: 14, flexDirection: 'row', overflow: 'hidden', marginBottom: 11 },
  clueStripe: { width: 4 },
  clueContent: { padding: 13, flex: 1 },
  clueSource: { fontSize: 9, letterSpacing: 1.2, fontWeight: '700' },
  clueTitle: { fontSize: 14, fontWeight: '700', marginTop: 11, marginBottom: 6 },
  clueDetail: { fontSize: 11, lineHeight: 16 },
  connection: { borderRadius: 13, padding: 13, flexDirection: 'row', gap: 10, alignItems: 'center', marginTop: 8 },
  connectionText: { fontSize: 11, lineHeight: 16, flex: 1 },
  accuseButton: { height: 49, borderRadius: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 16 },
  accuseText: { fontSize: 13, fontWeight: '700' },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(5,7,9,0.78)', justifyContent: 'flex-end' },
  modal: { borderTopLeftRadius: 25, borderTopRightRadius: 25, borderWidth: 1, paddingHorizontal: 21, paddingTop: 10, paddingBottom: 30 },
  modalGrabber: { width: 42, height: 4, borderRadius: 2, backgroundColor: '#586168', alignSelf: 'center', marginBottom: 25 },
  modalEyebrow: { fontSize: 10, letterSpacing: 1.6, fontWeight: '700', marginBottom: 9 },
  modalTitle: { fontSize: 25, fontWeight: '700', marginBottom: 8 },
  modalCopy: { fontSize: 12, lineHeight: 18, marginBottom: 18 },
  suspect: { minHeight: 50, borderWidth: 1, borderRadius: 13, paddingHorizontal: 13, flexDirection: 'row', alignItems: 'center', marginBottom: 9 },
  suspectRadio: { width: 20, height: 20, borderRadius: 10, borderWidth: 1, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  suspectDot: { width: 10, height: 10, borderRadius: 5 },
  suspectText: { fontSize: 13, fontWeight: '600' },
  confirm: { height: 49, borderRadius: 13, alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  confirmText: { fontSize: 13, fontWeight: '700' },
  vaultHeader: { minHeight: 67, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1 },
  vaultIntro: { paddingVertical: 8, marginBottom: 22 },
  vaultTitle: { fontSize: 25, lineHeight: 31, fontWeight: '700', letterSpacing: -0.5, marginTop: 8, marginBottom: 9 },
  vaultCopy: { fontSize: 13, lineHeight: 19 },
  ledgerCard: { borderWidth: 1, borderRadius: 16, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12 },
  ledgerIcon: { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  ledgerKicker: { fontSize: 9, letterSpacing: 1.1, fontWeight: '700', marginBottom: 7 },
  ledgerTitle: { fontSize: 14, fontWeight: '700', marginBottom: 5 },
  ledgerBody: { fontSize: 11, lineHeight: 16 },
  vaultQuote: { borderWidth: 1, borderRadius: 14, padding: 14, marginTop: 19, flexDirection: 'row', gap: 9 },
  vaultQuoteText: { fontSize: 12, lineHeight: 18, fontStyle: 'italic', flex: 1 },
  hiddenLayer: { borderWidth: 1, borderRadius: 16, padding: 13, flexDirection: 'row', alignItems: 'center', marginTop: 11 },
  hiddenIcon: { width: 43, height: 43, borderRadius: 13, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  unlockModal: { width: '88%', borderRadius: 21, borderWidth: 1, padding: 20, alignSelf: 'center' },
  codeInput: { height: 50, borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, fontSize: 18, letterSpacing: 3, marginTop: 5, marginBottom: 12 },
  modalActions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  cancelButton: { paddingHorizontal: 12, height: 49, justifyContent: 'center' },
  cancelText: { fontSize: 12, fontWeight: '600' },
  evidencePick: { minHeight: 40, borderWidth: 1, borderRadius: 10, paddingHorizontal: 11, flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 7 },
  evidencePickText: { fontSize: 11, flex: 1 },
});