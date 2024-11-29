import React, { useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { getFocusedRouteNameFromRoute, useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { Text, Image, View, Platform } from 'react-native';

import HomeScreen from '../screens/NoAuthScreen/HomeScreen';
import ProfileScreen from '../screens/NoAuthScreen/ProfileScreen';
import NotificationScreen from '../screens/NoAuthScreen/NotificationScreen';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome from 'react-native-vector-icons/FontAwesome5';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Feather from 'react-native-vector-icons/Feather';
import { responsiveFontSize, responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions';

import PrivacyPolicy from '../screens/NoAuthScreen/PrivacyPolicy';
import ChatScreen from '../screens/NoAuthScreen/ChatScreen';
import EarningScreen from '../screens/NoAuthScreen/EarningScreen';
import ScheduleScreen from '../screens/NoAuthScreen/ScheduleScreen';
import UploadSessionSummary from '../screens/NoAuthScreen/UploadSessionSummary';
import { earningFillImg, earningNotFillImg, homeFillImg, homeImg, profileFillImg, profileNotFillImg, scheduleFillImg, scheduleNotFillImg } from '../utils/Images';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const HomeStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Notification"
        component={NotificationScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ChatScreen"
        component={ChatScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ProfileScreen"
        component={ProfileScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="UploadSessionSummary"
        component={UploadSessionSummary}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

const EarningStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="EarningScreen"
        component={EarningScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

const ScheduleStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="ScheduleScreen"
        component={ScheduleScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

const ProfileStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="ProfileScreen"
        component={ProfileScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="PrivacyPolicy"
        component={PrivacyPolicy}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

const TabNavigator = () => {
  const navigation = useNavigation();
  const cartProducts = useSelector(state => state.cart);

  // useEffect(() => {
  //   // Assuming you have a condition to check
  //   // For example, navigating to ScheduleScreen based on some Redux state or parameter
  //   const shouldNavigateToSchedule = true; // Replace this with your actual condition

  //   if (shouldNavigateToSchedule) {
  //     navigation.navigate('Schedule', { screen: 'ScheduleScreen' });
  //   }
  // }, [navigation]);

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarInactiveTintColor: '#CACCCE',
        tabBarActiveTintColor: '#444343',
        tabBarStyle: {
          height: 100,
        },
      }}>
      <Tab.Screen
        name="HOME"
        component={HomeStack}
        options={({ route }) => ({
          tabBarStyle: {
            display: getTabBarVisibility(route),
            backgroundColor: '#FFFFFF',
            width: responsiveWidth(100),
            height: Platform.select({
              android: responsiveHeight(8),
              ios: responsiveHeight(11),
            }),
            alignSelf: 'center',
          },
          tabBarIcon: ({ color, size, focused }) => (
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
              {focused && <View style={{ width: responsiveWidth(12), borderColor: color, backgroundColor: color, borderWidth: 2, borderBottomLeftRadius: 5, borderBottomRightRadius: 5 }} />}
              <Image source={focused ? homeFillImg : homeImg} style={{ width: responsiveWidth(7), height: responsiveHeight(3.5), marginTop: responsiveHeight(1.4), resizeMode: 'contain' }} />
            </View>
          ),
          tabBarLabel: ({ color, focused }) => (
            <Text style={{ color, fontSize: responsiveFontSize(1.2), marginBottom: responsiveHeight(1) }}>HOME</Text>
          ),
        })}
      />
      <Tab.Screen
        name="Earning"
        component={EarningStack}
        options={({ route }) => ({
          tabBarStyle: {
            display: getTabBarVisibility(route),
            backgroundColor: '#FFFFFF',
            width: responsiveWidth(100),
            height: Platform.select({
              android: responsiveHeight(8),
              ios: responsiveHeight(11),
            }),
            alignSelf: 'center',
          },
          tabBarIcon: ({ color, size, focused }) => (
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
              {focused && <View style={{ width: responsiveWidth(12), borderColor: color, backgroundColor: color, borderWidth: 2, borderBottomLeftRadius: 5, borderBottomRightRadius: 5 }} />}
              <Image source={focused ? earningFillImg : earningNotFillImg} style={{ width: responsiveWidth(7), height: responsiveHeight(3.5), marginTop: responsiveHeight(1.4), resizeMode: 'contain' }} />
            </View>
          ),
          tabBarLabel: ({ color, focused }) => (
            <Text style={{ color, fontSize: responsiveFontSize(1.2), marginBottom: responsiveHeight(1) }}>Earning</Text>
          ),
        })}
      />
      <Tab.Screen
        name="Schedule"
        component={ScheduleStack}
        options={({ route }) => ({
          tabBarStyle: {
            display: getTabBarVisibility(route),
            backgroundColor: '#FFFFFF',
            width: responsiveWidth(100),
            height: Platform.select({
              android: responsiveHeight(8),
              ios: responsiveHeight(11),
            }),
            alignSelf: 'center',
          },
          tabBarIcon: ({ color, size, focused }) => (
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
              {focused && <View style={{ width: responsiveWidth(12), borderColor: color, backgroundColor: color, borderWidth: 2, borderBottomLeftRadius: 5, borderBottomRightRadius: 5 }} />}
              <Image source={focused ? scheduleFillImg : scheduleNotFillImg} style={{ width: responsiveWidth(7), height: responsiveHeight(3.5), marginTop: responsiveHeight(1.4), resizeMode: 'contain' }} />
            </View>
          ),
          tabBarLabel: ({ color, focused }) => (
            <Text style={{ color, fontSize: responsiveFontSize(1.2), marginBottom: responsiveHeight(1) }}>Schedule</Text>
          ),
        })}
      />
      <Tab.Screen
        name="PROFILE"
        component={ProfileStack}
        options={({ route }) => ({
          tabBarStyle: {
            display: getTabBarVisibility(route),
            backgroundColor: '#FFFFFF',
            width: responsiveWidth(100),
            height: Platform.select({
              android: responsiveHeight(8),
              ios: responsiveHeight(11),
            }),
            alignSelf: 'center',
          },
          tabBarIcon: ({ color, size, focused }) => (
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
              {focused && <View style={{ width: responsiveWidth(12), borderColor: color, backgroundColor: color, borderWidth: 2, borderBottomLeftRadius: 5, borderBottomRightRadius: 5 }} />}
              <Image source={focused ? profileFillImg : profileNotFillImg} style={{ width: responsiveWidth(7), height: responsiveHeight(3.5), marginTop: responsiveHeight(1.4), resizeMode: 'contain' }} />
            </View>
          ),
          tabBarLabel: ({ color, focused }) => (
            <Text style={{ color, fontSize: responsiveFontSize(1.2), marginBottom: 5 }}>Profile</Text>
          ),
        })}
      />
    </Tab.Navigator>
  );
};

const getTabBarVisibility = route => {
  const routeName = getFocusedRouteNameFromRoute(route) ?? 'Home';
  //console.log(routeName)
  if (routeName === 'ChatScreen' || routeName === 'UploadSessionSummary' || routeName === 'ScheduleScreen') {
    return 'none';
  } else {
    return 'flex';
  }
};

export default TabNavigator;
