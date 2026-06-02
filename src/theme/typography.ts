// Donia — Typography
// Duo : Fraunces (display serif, italic-friendly) × Bricolage Grotesque (body grotesk)
// Font names match what `@expo-google-fonts/*` exports as keys

export const fonts = {
  // Display (Fraunces) — used for headings, gift card occasions, "donia" wordmark
  displayRegular: 'Fraunces_400Regular',
  displayItalic: 'Fraunces_400Regular_Italic',
  displayMedium: 'Fraunces_500Medium',
  displaySemiBold: 'Fraunces_600SemiBold',
  displayBold: 'Fraunces_700Bold',

  // Body (Bricolage Grotesque) — used for paragraphs, buttons, labels, numbers
  bodyRegular: 'BricolageGrotesque_400Regular',
  bodyMedium: 'BricolageGrotesque_500Medium',
  bodySemiBold: 'BricolageGrotesque_600SemiBold',
  bodyBold: 'BricolageGrotesque_700Bold',
} as const;

export const type = {
  // Display scale
  display: { fontFamily: fonts.displayMedium, fontSize: 32, lineHeight: 36, letterSpacing: -0.6 },
  title: { fontFamily: fonts.displayMedium, fontSize: 22, lineHeight: 26, letterSpacing: -0.4 },
  heading: { fontFamily: fonts.displayMedium, fontSize: 17, lineHeight: 22, letterSpacing: -0.2 },

  // Body scale
  body: { fontFamily: fonts.bodyRegular, fontSize: 15, lineHeight: 22 },
  bodyMedium: { fontFamily: fonts.bodyMedium, fontSize: 15, lineHeight: 22 },
  bodyBold: { fontFamily: fonts.bodyBold, fontSize: 15, lineHeight: 22 },
  caption: { fontFamily: fonts.bodyRegular, fontSize: 12, lineHeight: 16 },
  micro: { fontFamily: fonts.bodyMedium, fontSize: 10, lineHeight: 14, letterSpacing: 0.8 },

  // Numeric — also Bricolage Grotesque for tabular-feel
  numXL: { fontFamily: fonts.bodyBold, fontSize: 44, lineHeight: 44, letterSpacing: -1.3 },
  numLG: { fontFamily: fonts.bodyBold, fontSize: 30, lineHeight: 32, letterSpacing: -0.9 },
  numMD: { fontFamily: fonts.bodyBold, fontSize: 22, lineHeight: 26, letterSpacing: -0.4 },
} as const;

// List passed to useFonts() at app boot
export const fontMap = {
  Fraunces_400Regular: require('@expo-google-fonts/fraunces/400Regular/Fraunces_400Regular.ttf'),
  Fraunces_400Regular_Italic: require('@expo-google-fonts/fraunces/400Regular_Italic/Fraunces_400Regular_Italic.ttf'),
  Fraunces_500Medium: require('@expo-google-fonts/fraunces/500Medium/Fraunces_500Medium.ttf'),
  Fraunces_600SemiBold: require('@expo-google-fonts/fraunces/600SemiBold/Fraunces_600SemiBold.ttf'),
  Fraunces_700Bold: require('@expo-google-fonts/fraunces/700Bold/Fraunces_700Bold.ttf'),
  BricolageGrotesque_400Regular: require('@expo-google-fonts/bricolage-grotesque/400Regular/BricolageGrotesque_400Regular.ttf'),
  BricolageGrotesque_500Medium: require('@expo-google-fonts/bricolage-grotesque/500Medium/BricolageGrotesque_500Medium.ttf'),
  BricolageGrotesque_600SemiBold: require('@expo-google-fonts/bricolage-grotesque/600SemiBold/BricolageGrotesque_600SemiBold.ttf'),
  BricolageGrotesque_700Bold: require('@expo-google-fonts/bricolage-grotesque/700Bold/BricolageGrotesque_700Bold.ttf'),
};
