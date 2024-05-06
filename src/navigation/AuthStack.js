import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import OnboardingScreen from '../screens/AuthScreen/OnboardingScreen';
import LoginScreen from '../screens/AuthScreen/LoginScreen';
import ThankYouScreen from '../screens/AuthScreen/ThankYouScreen';
import PersonalInformation from '../screens/AuthScreen/PersonalInformation';


const Stack = createNativeStackNavigator();

const AuthStack = () => {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="PersonalInformation" component={PersonalInformation} />
      <Stack.Screen name="Thankyou" component={ThankYouScreen} />
    </Stack.Navigator>
  );
};

export default AuthStack;
