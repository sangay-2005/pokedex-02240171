import { StatusBar } from 'expo-status-bar';
import { Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import PokedexScreen from './src/screens/PokedexScreen';
import DetailScreen from './src/screens/DetailScreen';
import TeamScreen from './src/screens/TeamScreen';
import GameScreen from './src/screens/GameScreen';
import { TeamProvider } from './src/context/TeamContext';
import { colors, APP_TITLE, MONO } from './src/theme';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const headerStyle = {
  headerStyle: {
    backgroundColor: colors.bg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTintColor: colors.text,
  headerTitleStyle: { fontWeight: '800', fontSize: 18, letterSpacing: 0.5 },
  headerShadowVisible: false,
};

const navTheme = {
  dark: true,
  colors: {
    primary: colors.accent,
    background: colors.bg,
    card: colors.bg,
    text: colors.text,
    border: colors.border,
    notification: colors.accent,
  },
  fonts: {
    regular: { fontFamily: 'System', fontWeight: '400' },
    medium: { fontFamily: 'System', fontWeight: '500' },
    bold: { fontFamily: 'System', fontWeight: '700' },
    heavy: { fontFamily: 'System', fontWeight: '900' },
  },
};

function Tabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        ...headerStyle,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.muted,
        tabBarLabelStyle: {
          fontFamily: MONO,
          fontWeight: '700',
          fontSize: 10,
          letterSpacing: 1,
        },
        tabBarStyle: {
          height: 68,
          paddingTop: 6,
          paddingBottom: 9,
          backgroundColor: colors.bg,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          elevation: 0,
        },
        tabBarIcon: ({ focused, color, size }) => {
          const icons = {
            Pokédex: 'albums',
            'My Team': 'shield-half',
            Game: 'game-controller',
          };
          const base = icons[route.name];
          return (
            <Ionicons
              name={focused ? base : `${base}-outline`}
              size={size + 2}
              color={color}
            />
          );
        },
      })}
    >
      <Tab.Screen
        name="Pokédex"
        component={PokedexScreen}
        options={{ title: APP_TITLE }}
      />
      <Tab.Screen
        name="My Team"
        component={TeamScreen}
        options={{ title: "Wangzom's Team" }}
      />
      <Tab.Screen
        name="Game"
        component={GameScreen}
        options={{ title: "Wangzom's Game" }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <TeamProvider>
      <NavigationContainer theme={navTheme}>
        <StatusBar style="light" />
        <Stack.Navigator screenOptions={headerStyle}>
          <Stack.Screen
            name="Tabs"
            component={Tabs}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Detail"
            component={DetailScreen}
            options={{
              title: 'Details',
              animation: 'slide_from_bottom',
              headerRight: () => (
                <Text
                  style={{
                    color: colors.accent,
                    fontFamily: MONO,
                    fontWeight: '700',
                  }}
                >
                  Wangzom
                </Text>
              ),
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </TeamProvider>
  );
}