// Donia i18n — setup react-i18next avec FR (défaut) + EN.
// La langue est :
//   1. Lue depuis AsyncStorage au démarrage (clé "donia.lang")
//   2. À défaut, détectée depuis les paramètres système (expo-localization)
//   3. Fallback FR
// Quand l'utilisateur change la langue, on persiste dans AsyncStorage ET on PATCH /v1/me
// (preferredLanguage) côté backend pour que les emails/notifs WhatsApp suivent.
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';
import fr from './locales/fr.json';
import en from './locales/en.json';

const STORAGE_KEY = 'donia.lang';

export type Lang = 'fr' | 'en';

function detectInitialLang(): Lang {
  const locales = Localization.getLocales();
  const code = locales?.[0]?.languageCode ?? 'fr';
  return code === 'en' ? 'en' : 'fr';
}

export async function getStoredLang(): Promise<Lang | null> {
  try {
    const v = await AsyncStorage.getItem(STORAGE_KEY);
    if (v === 'fr' || v === 'en') return v;
    return null;
  } catch {
    return null;
  }
}

export async function setStoredLang(lang: Lang): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, lang);
  } catch {}
}

// Convertit fr-FR / en-US (format BCP47 backend) → fr / en
export function backendLangToLocal(bcp47: string | undefined | null): Lang {
  if (!bcp47) return 'fr';
  return bcp47.startsWith('en') ? 'en' : 'fr';
}

// Convertit fr / en → fr-FR / en-US (format BCP47 backend)
export function localLangToBackend(lang: Lang): 'fr-FR' | 'en-US' {
  return lang === 'en' ? 'en-US' : 'fr-FR';
}

// Initialisation — appelée une fois au démarrage de l'app.
// Synchronisation initiale depuis AsyncStorage / locale système.
let _initialized = false;
export async function initI18n(): Promise<void> {
  if (_initialized) return;
  _initialized = true;

  const stored = await getStoredLang();
  const lang: Lang = stored ?? detectInitialLang();

  await i18n
    .use(initReactI18next)
    .init({
      resources: {
        fr: { translation: fr },
        en: { translation: en },
      },
      lng: lang,
      fallbackLng: 'fr',
      interpolation: { escapeValue: false },
      compatibilityJSON: 'v4',
      returnNull: false,
    });
}

// Change la langue à la volée (persistée).
export async function changeLanguage(lang: Lang): Promise<void> {
  await setStoredLang(lang);
  await i18n.changeLanguage(lang);
}

export default i18n;
