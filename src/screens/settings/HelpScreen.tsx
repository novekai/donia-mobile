// Aide & Support — 2 cards contact (Email / WhatsApp) + FAQ accordéon.
// Le numéro WhatsApp support Donia : +22969949481
// L'email support : contact@doniia.com
import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, Alert, Linking } from 'react-native';
import { ScreenContainer } from '../../components/shared/ScreenContainer';
import { FunBackground } from '../../components/deco/FunBackground';
import { ScreenHeader } from '../../components/composed/ScreenHeader';
import { Card } from '../../components/ui/Card';
import { colors, radius } from '../../theme/tokens';
import { fonts } from '../../theme/typography';
import { RootStackScreenProps } from '../../navigation/types';

const SUPPORT_EMAIL = 'contact@doniia.com';
const SUPPORT_WHATSAPP_NUMBER = '+22969949481';
const SUPPORT_WHATSAPP_DISPLAY = '+229 69 94 94 81';

type FaqItem = { q: string; a: string };

const FAQS: FaqItem[] = [
  // ── Cartes cadeaux ──
  {
    q: 'Comment envoyer une carte cadeau ?',
    a:
      "Depuis l'accueil, tape sur \"Envoyer\". Choisis une occasion (Bonjour, Bravo, Anniversaire…), entre le numéro WhatsApp de la personne, le montant, personnalise la carte si tu veux, puis paie soit avec ton solde Donia, soit avec Mobile Money. La carte arrive instantanément côté destinataire.",
  },
  {
    q: "Comment réclamer une carte que j'ai reçue ?",
    a:
      "Ouvre le lien dans WhatsApp ou l'email. Tu peux choisir entre : la convertir en cash sur ton compte Mobile Money, ou la créditer sur ton solde Donia (utile si tu veux la garder pour envoyer une autre carte plus tard). Le destinataire reçoit 100 % du montant.",
  },
  {
    q: 'Comment retirer mon solde ?',
    a:
      'Depuis l\'écran "Mon solde", tape "Retirer". Tu seras invité·e à vérifier ton identité (KYC) si ce n\'est pas déjà fait, puis à choisir ton opérateur Mobile Money. Le virement arrive en 1 à 3 minutes.',
  },
  {
    q: 'Quels opérateurs Mobile Money sont supportés ?',
    a:
      'MTN, Moov, Orange, Wave et Free Money. On couvre le Bénin, la Côte d\'Ivoire, le Togo, le Sénégal, le Mali et le Burkina Faso. Plus de pays arrivent bientôt.',
  },
  {
    q: 'Combien Donia prélève en commission ?',
    a:
      "Donia prélève 5 % uniquement à la conversion par le destinataire (pas à l'envoi). L'expéditeur paie exactement le montant qu'il choisit, sans frais cachés. Le pourcentage exact est affiché clairement avant chaque envoi.",
  },
  {
    q: 'Comment ça marche le parrainage ?',
    a:
      'Va dans Paramètres → Parrainage pour récupérer ton code (ex : MARIE-2026). Partage-le. À vie, dès qu\'un filleul envoie une carte, tu gagnes 1 % du montant dans ta poche "Parrainage". Tu peux convertir ce solde en Mobile Money.',
  },
  // ── Compte ──
  {
    q: "J'ai oublié mon mot de passe",
    a:
      'Sur l\'écran de connexion, tape "Mot de passe oublié ?". On t\'enverra un code par WhatsApp ou email. Une fois validé, tu pourras choisir un nouveau mot de passe (8 caractères minimum).',
  },
  {
    q: "L'email avec ma carte n'arrive pas",
    a:
      "Vérifie ton dossier Spams / Indésirables — c'est souvent là. Sinon demande à l'expéditeur de re-vérifier que ton email est bien orthographié, puis de te renvoyer la carte depuis l'historique. Tu peux aussi utiliser la livraison par WhatsApp à la place.",
  },
  // ── Anonymes ──
  {
    q: 'Comment créer un lien anonyme ?',
    a:
      'Va dans l\'onglet "Anonymes" en bas de l\'écran, tape "Créer un nouveau lien". Choisis une question d\'amorce (ex : « Tu penses quoi de moi ? ») et une couleur. Tu obtiens un lien public que tu peux partager sur tes stories. Les personnes qui répondent ne sont jamais identifiées.',
  },
  {
    q: 'Qui peut voir mes messages anonymes ?',
    a:
      'Toi seul·e. Les messages reçus sur ton lien anonyme ne sont visibles que dans ton app Donia. Personne d\'autre n\'y a accès, pas même nous (à part les messages signalés pour modération).',
  },
  {
    q: 'Comment signaler un message anonyme inapproprié ?',
    a:
      'Ouvre le message, tape sur l\'icône de signalement en haut à droite, choisis la raison (harcèlement, menace, spam, sexuel, haine ou autre). On modère sous 24h. Les messages signalés deux fois sont automatiquement masqués.',
  },
  {
    q: "Mon lien anonyme est cassé ou je veux en créer un nouveau",
    a:
      'Tu peux créer plusieurs liens anonymes — un par question d\'amorce. Va dans Anonymes → "Créer un nouveau lien". Les anciens liens restent actifs sauf si tu les archives explicitement. Les messages déjà reçus sont conservés.',
  },
  // ── Sécurité ──
  {
    q: 'Mes données sont-elles sécurisées ?',
    a:
      'Oui. Tes documents KYC sont chiffrés en transit, stockés 7 jours puis supprimés. Tes transactions sont conservées 10 ans (obligation BCEAO). Tu peux supprimer ton compte à tout moment depuis Sécurité → Supprimer mon compte (RGPD).',
  },
];

export function HelpScreen({ navigation }: RootStackScreenProps<'Help'>) {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  async function openMail() {
    const url = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent('Aide Donia')}`;
    try {
      const ok = await Linking.canOpenURL(url);
      if (ok) await Linking.openURL(url);
      else Alert.alert("Aucune app mail", `Écris-nous à ${SUPPORT_EMAIL}`);
    } catch {
      Alert.alert("Aucune app mail", `Écris-nous à ${SUPPORT_EMAIL}`);
    }
  }

  async function openWhatsApp() {
    // Format pour wa.me / whatsapp:// : numéro sans le + ni espaces
    const digits = SUPPORT_WHATSAPP_NUMBER.replace(/\D/g, '');
    const deepLink = `whatsapp://send?phone=${digits}&text=${encodeURIComponent('Bonjour, j\'ai besoin d\'aide sur Donia.')}`;
    const webFallback = `https://wa.me/${digits}?text=${encodeURIComponent('Bonjour, j\'ai besoin d\'aide sur Donia.')}`;
    try {
      const ok = await Linking.canOpenURL(deepLink);
      if (ok) {
        await Linking.openURL(deepLink);
        return;
      }
      await Linking.openURL(webFallback);
    } catch {
      Alert.alert('WhatsApp indisponible', `Contacte-nous au ${SUPPORT_WHATSAPP_DISPLAY}`);
    }
  }

  return (
    <ScreenContainer tabBar="home">
      <FunBackground palette="cream" density="sparse" />
      <ScreenHeader title="Aide & Support" onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={{ paddingHorizontal: 22, paddingTop: 12, paddingBottom: 120 }}>
        <Text style={styles.sectionLabel}>NOUS CONTACTER</Text>

        <View style={styles.contactRow}>
          <Pressable onPress={openMail} style={styles.contactCard}>
            <View style={[styles.contactIcon, { backgroundColor: colors.indigo }]}>
              <Text style={styles.contactIconText}>✉️</Text>
            </View>
            <Text style={styles.contactTitle}>Email</Text>
            <Text style={styles.contactSub} numberOfLines={1}>{SUPPORT_EMAIL}</Text>
          </Pressable>

          <Pressable onPress={openWhatsApp} style={styles.contactCard}>
            <View style={[styles.contactIcon, { backgroundColor: '#25D366' }]}>
              <Text style={styles.contactIconText}>💬</Text>
            </View>
            <Text style={styles.contactTitle}>WhatsApp</Text>
            <Text style={styles.contactSub}>Réponse rapide</Text>
          </Pressable>
        </View>

        <Text style={[styles.sectionLabel, { marginTop: 26 }]}>QUESTIONS FRÉQUENTES</Text>

        <View style={{ gap: 8 }}>
          {FAQS.map((item, i) => {
            const open = openIdx === i;
            return (
              <Card key={i} pad={0}>
                <Pressable onPress={() => setOpenIdx(open ? null : i)} style={styles.faqHeader}>
                  <Text style={[styles.faqQuestion, open && { color: colors.coral }]}>{item.q}</Text>
                  <Text style={[styles.faqChevron, open && { transform: [{ rotate: '180deg' }], color: colors.coral }]}>⌄</Text>
                </Pressable>
                {open && (
                  <View style={styles.faqBody}>
                    <Text style={styles.faqAnswer}>{item.a}</Text>
                  </View>
                )}
              </Card>
            );
          })}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  sectionLabel: { fontFamily: fonts.bodyBold, fontSize: 11, color: colors.indigo, letterSpacing: 1.5, marginBottom: 12 },

  // Cards de contact
  contactRow: { flexDirection: 'row', gap: 10 },
  contactCard: {
    flex: 1,
    padding: 18,
    borderRadius: 18,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.lineSoft,
    alignItems: 'center',
    gap: 8,
  },
  contactIcon: {
    width: 56, height: 56, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
  },
  contactIconText: { fontSize: 26 },
  contactTitle: { fontFamily: fonts.displaySemiBold, fontSize: 16, color: colors.ink },
  contactSub: { fontFamily: fonts.bodyRegular, fontSize: 11, color: colors.ink2, marginTop: 0, maxWidth: '100%' },

  // Accordéon FAQ
  faqHeader: { padding: 16, flexDirection: 'row', alignItems: 'center', gap: 10 },
  faqQuestion: { flex: 1, fontFamily: fonts.displaySemiBold, fontSize: 14, color: colors.ink, lineHeight: 19 },
  faqChevron: { fontSize: 18, color: colors.ink3, fontWeight: '700' },
  faqBody: { paddingHorizontal: 16, paddingBottom: 16, paddingTop: 0 },
  faqAnswer: { fontFamily: fonts.bodyRegular, fontSize: 13, color: colors.ink2, lineHeight: 20 },
});
