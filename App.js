import { Text } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import PokedexScreen from './src/screens/PokedexScreen';
import DetailScreen from './src/screens/DetailScreen';
import TeamScreen from './src/screens/TeamScreen';
import GameScreen from './src/screens/GameScreen';
import { colors, APP_TITLE } from './src/theme';
import { TeamProvider } from './src/context/TeamContext';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const headerStyle = {
  headerStyle: { backgroundColor: colors.primary },
  headerTintColor: '#fff',
  headerTitleStyle: { fontWeight: '900', fontSize: 20 },
  headerShadowVisible: false,
};

function Tabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        ...headerStyle,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarLabelStyle: { fontWeight: '700', fontSize: 11 },
        tabBarStyle: {
          height: 66,
          paddingTop: 6,
          paddingBottom: 8,
          backgroundColor: '#fff',
          borderTopWidth: 0,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          elevation: 12,
          shadowColor: '#3B1F8C',
          shadowOpacity: 0.15,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: -4 },
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
              headerRight: () => (
                <Text style={{ color: '#fff', fontWeight: '800' }}>
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