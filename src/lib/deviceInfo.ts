// Petit helper qui renvoie un nom d'appareil humain lisible pour la session,
// afin que "Appareils connectés" montre "Tecno Camon 20" plutôt que "Android · Donia app".
// Combine Device.brand + Device.modelName (expo-device).
import * as Device from 'expo-device';

export function getDeviceName(): string {
  const brand = Device.brand?.trim();           // "Tecno", "Apple", "Samsung", "Infinix", "Xiaomi", etc.
  const model = Device.modelName?.trim();       // "Camon 20", "iPhone 13", "SM-G991B", "Redmi Note 10"
  const os = Device.osName;                      // "iOS" ou "Android"

  // Si on a la marque + le modèle, on combine
  if (brand && model) {
    // Évite la redondance "Apple iPhone 13" → on garde juste "iPhone 13" si modelName commence par la marque
    if (model.toLowerCase().includes(brand.toLowerCase())) return model;
    return `${brand} ${model}`;
  }
  if (model) return model;
  if (brand) return brand;
  return os ?? 'Appareil inconnu';
}
