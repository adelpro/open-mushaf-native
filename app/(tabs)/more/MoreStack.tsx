// more/moreStack.tsx
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import AboutScreen from './about'; // About screen
import PrivacyScreen from './privacy'; // Privacy policy screen

import MoreScreen from './index'; // The main More screen

const Stack = createNativeStackNavigator();

const MoreStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="More" component={MoreScreen} />
      <Stack.Screen name="About" component={AboutScreen} />
      <Stack.Screen name="Privacy" component={PrivacyScreen} />
    </Stack.Navigator>
  );
};

export default MoreStack;
