// CagnotteCreate — formulaire de création d'une cagnotte (titre, description, objectif, deadline).
import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TextInput, Alert, Pressable } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { ScreenContainer } from '../../components/shared/ScreenContainer';
import { FunBackground } from '../../components/deco/FunBackground';
import { ScreenHeader } from '../../components/composed/ScreenHeader';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { colors, radius } from '../../theme/tokens';
import { fonts } from '../../theme/typography';
import { RootStackScreenProps } from '../../navigation/types';
import { createCagnotte } from '../../api/cagnottes';
import { getApiErrorMessage } from '../../api/client';

const GOAL_PRESETS = ['25 000', '50 000', '100 000', '250 000'];

export function CagnotteCreateScreen({ navigation }: RootStackScreenProps<'CagnotteCreate'>) {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [goal, setGoal] = useState('50000');
  const [deadline, setDeadline] = useState(''); // YYYY-MM-DD
  const [submitting, setSubmitting] = useState(false);

  const goalNum = Number(goal || '0');
  const validDeadline = !deadline || /^\d{4}-\d{2}-\d{2}$/.test(deadline);
  const canSubmit = title.trim().length >= 2 && goalNum >= 1000 && validDeadline && !submitting;

  async function onSubmit() {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      const res = await createCagnotte({
        title: title.trim(),
        description: description.trim() || undefined,
        goalAmount: goalNum,
        deadline: deadline ? new Date(deadline).toISOString() : undefined,
      });
      await queryClient.invalidateQueries({ queryKey: ['cagnottes-mine'] });
      navigation.replace('Cagnotte', { id: res.cagnotte.id });
    } catch (e) {
      Alert.alert('Impossible de créer la cagnotte', getApiErrorMessage(e));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ScreenContainer avoidKeyboard>
      <FunBackground palette="cream" density="sparse" />
      <ScreenHeader title="Créer une cagnotte 🎁" onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={{ paddingHorizontal: 22, paddingTop: 14, paddingBottom: 120 }} keyboardShouldPersistTaps="handled">
        <Card pad={14}>
          <Text style={styles.intro}>
            Rassemble tes proches autour d’un cadeau commun — anniversaire surprise, mariage, condoléances...
          </Text>
        </Card>

        <Text style={styles.label}>Titre *</Text>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="ex: Anniversaire surprise de Maman"
          placeholderTextColor={colors.ink3}
          maxLength={80}
          style={styles.input}
        />

        <Text style={styles.label}>Description (optionnel)</Text>
        <TextInput
          value={description}
          onChangeText={setDescription}
          placeholder="Détail du projet, où sera remis le cadeau..."
          placeholderTextColor={colors.ink3}
          multiline
          maxLength={500}
          style={[styles.input, { minHeight: 88, textAlignVertical: 'top' }]}
        />

        <Text style={styles.label}>Objectif (FCFA) *</Text>
        <View style={styles.chipsRow}>
          {GOAL_PRESETS.map((p) => {
            const v = p.replace(/\s/g, '');
            const on = v === goal;
            return (
              <Pressable
                key={p}
                onPress={() => setGoal(v)}
                style={[styles.chip, on && { backgroundColor: colors.coral, borderColor: colors.coral }]}
              >
                <Text style={[styles.chipText, on && { color: colors.bg }]}>{p}</Text>
              </Pressable>
            );
          })}
        </View>
        <TextInput
          value={goal}
          onChangeText={setGoal}
          placeholder="50 000"
          placeholderTextColor={colors.ink3}
          keyboardType="number-pad"
          style={[styles.input, { marginTop: 8, fontFamily: fonts.bodyBold, fontSize: 18 }]}
        />

        <Text style={styles.label}>Date de clôture (optionnel)</Text>
        <TextInput
          value={deadline}
          onChangeText={setDeadline}
          placeholder="AAAA-MM-JJ (ex: 2026-12-31)"
          placeholderTextColor={colors.ink3}
          autoCapitalize="none"
          autoCorrect={false}
          style={styles.input}
        />
        {!validDeadline && (
          <Text style={styles.error}>Format invalide. Utilise AAAA-MM-JJ.</Text>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <Button
          label={submitting ? 'Création…' : 'Créer la cagnotte'}
          pulse
          disabled={!canSubmit}
          onPress={onSubmit}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  intro: { fontSize: 13, color: colors.ink2, lineHeight: 19, fontFamily: fonts.bodyRegular },
  label: { marginTop: 16, marginBottom: 6, fontFamily: fonts.displayItalic, fontSize: 12, color: colors.ink2 },
  input: { borderRadius: radius.sm, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.lineSoft, paddingHorizontal: 14, paddingVertical: 12, fontFamily: fonts.bodyRegular, fontSize: 14, color: colors.ink },
  chipsRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  chip: { flex: 1, minWidth: 70, paddingHorizontal: 12, paddingVertical: 9, borderRadius: 99, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.lineSoft, alignItems: 'center' },
  chipText: { fontFamily: fonts.bodyBold, fontSize: 12, color: colors.ink },
  error: { marginTop: 6, fontSize: 11, color: colors.coralDeep, fontFamily: fonts.bodyMedium },
  footer: { position: 'absolute', bottom: 28, left: 22, right: 22 },
});
