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
import { colors, APP_TITLE, OUTLINE } from './src/theme';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const headerStyle = {
  headerStyle: {
    backgroundColor: colors.accent,
    borderBottomWidth: OUTLINE,
    borderBottomColor: colors.ink,
  },
  headerTintColor: colors.ink,
  headerTitleStyle: { fontWeight: '900', fontSize: 20 },
  headerShadowVisible: false,
};

function Tabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        ...headerStyle,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.ink,
        tabBarLabelStyle: { fontWeight: '900', fontSize: 11 },
        tabBarStyle: {
          height: 70,
          paddingTop: 6,
          paddingBottom: 8,
          backgroundColor: colors.card,
          borderTopWidth: OUTLINE,
          borderTopColor: colors.ink,
          elevation: 0,
        },
        tabBarIcon: ({ focused, color, size }) => {
          const icons = {
            Pokédex: 'list',
            'My Team': 'people',
            Game: 'game-controller',
          };
          const base = icons[route.name];
          return (
            <Ionicons
              name={focused ? base : `${base}-outline`}
              size={size}
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
      <NavigationContainer>
        <StatusBar style="dark" />
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
              headerRight: () => (
                <Text style={{ color: colors.ink, fontWeight: '900' }}>
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