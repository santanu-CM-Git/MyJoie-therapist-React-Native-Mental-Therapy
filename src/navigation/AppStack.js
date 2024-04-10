import React from 'react';
import {Image} from 'react-native';
import {createDrawerNavigator} from '@react-navigation/drawer';
import { homeImg, contactImg, helpImg, bankDetailsImg, documentImg , capacityImg, reviewImg, earningImg, acceptedOrderImg, completedOrderImg, availabilityImg} from '../utils/Images';
import CustomDrawer from '../components/CustomDrawer';

import Ionicons from 'react-native-vector-icons/Ionicons';

import FaqScreen from '../screens/NoAuthScreen/FaqScreen';

import TabNavigator from './TabNavigator';
import TermsScreen from '../screens//NoAuthScreen/TermsScreen';

import OrderSummary from '../screens/NoAuthScreen/OrderSummary';
import NoNotification from '../screens/NoAuthScreen/NoNotification';

const Drawer = createDrawerNavigator();

const AuthStack = () => {
  return (
    <Drawer.Navigator
      drawerContent={props => <CustomDrawer {...props} />}
      screenOptions={{
        headerShown: false,
        drawerActiveBackgroundColor: '#EEFFFF',
        drawerActiveTintColor: '#333',
        drawerInactiveTintColor: '#949494',
        drawerLabelStyle: {
          marginLeft: -25,
          fontFamily: 'Outfit-Medium',
          fontSize: 15,
        },
        //swipeEdgeWidth: 0, //for off the drawer swipe
      }}>
      <Drawer.Screen
        name="Home"
        component={TabNavigator}
        options={{
          drawerIcon: ({color}) => (
            // <Ionicons name="home-outline" size={22} color={color} />
            <Image source={homeImg} style={{ width: 25,height: 25}} color={color}/>
          ),
        }}
      />
       <Drawer.Screen
        name="Help & Support"
        component={FaqScreen}
        options={{
          drawerIcon: ({color}) => (
            // <Ionicons name="settings-outline" size={22} color={color} />
            <Image source={helpImg} style={{ width: 25,height: 25}} color={color}/>
          ),
        }}
      />
      <Drawer.Screen
        name="Term of service"
        component={TermsScreen}
        options={{
          drawerIcon: ({color}) => (
            // <Ionicons name="settings-outline" size={22} color={color} />
            <Image source={helpImg} style={{ width: 25,height: 25}} color={color}/>
          ),
        }}
      />
    </Drawer.Navigator>
  );
};

export default AuthStack;
