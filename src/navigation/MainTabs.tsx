// MainTabs — bottom tabs V2 : 4 onglets (Accueil / Envoyer / Anonymes / Activité)
// Le Profil et le Solde sont désormais accessibles via le RootStack (HeaderAvatar en haut à droite).
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { TabBar, TabId } from '../components/ui/TabBar';
import { MainTabsParams } from './types';

import { HomeScreen } from '../screens/main/HomeScreen';
import { SendCategoryScreen } from '../screens/send/SendCategoryScreen';
import { AnonymesScreen } from '../screens/main/AnonymesScreen';
import { HistoryScreen } from '../screens/main/HistoryScreen';

const Tab = createBottomTabNavigator<MainTabsParams>();

export function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false, tabBarStyle: { display: 'none' } }}
      tabBar={({ state, navigation }) => {
        const active: string = state.routeNames[state.index];
        const id: TabId =
          active === 'Home' ? 'home'
          : active === 'Send' ? 'send'
          : active === 'Anonyme' ? 'anonyme'
          : 'history';
        return (
          <TabBar
            active={id}
            onPress={(tabId) => {
              const target =
                tabId === 'home' ? 'Home'
                : tabId === 'send' ? 'Send'
                : tabId === 'anonyme' ? 'Anonyme'
                : 'History';
              navigation.navigate(target as keyof MainTabsParams);
            }}
          />
        );
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Send" component={SendCategoryScreen} />
      <Tab.Screen name="Anonyme" component={AnonymesScreen} />
      <Tab.Screen name="History" component={HistoryScreen} />
    </Tab.Navigator>
  );
}
