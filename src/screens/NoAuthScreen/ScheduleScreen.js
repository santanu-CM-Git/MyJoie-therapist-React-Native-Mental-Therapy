import React, { useContext, useState, useEffect } from 'react';
import { View, Text, SafeAreaView, StyleSheet, ScrollView, ImageBackground, Image, Platform, Alert } from 'react-native'
import CustomHeader from '../../components/CustomHeader'
import { responsiveFontSize, responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { ArrowGratter, ArrowUp, GreenTick, Payment, YellowTck, dateIcon, notifyImg, timeIcon, userPhoto } from '../../utils/Images'
import messaging from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NoNotification from './NoNotification';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { Dropdown } from 'react-native-element-dropdown';
const data = [
    { label: 'Today', value: '1' },
    { label: 'Date Wise', value: '2' },
];

const ScheduleScreen = ({ navigation }) => {
    const [notifications, setNotifications] = useState([]);
    const [notifyStatus, setnotifyStatus] = useState(false)
    const [value, setValue] = useState('1');
    const [isFocus, setIsFocus] = useState(false);

    useEffect(() => {
        if (Platform.OS == 'android') {
            const unsubscribeForeground = messaging().onMessage(async remoteMessage => {
                Alert.alert('A new FCM message arrived!', JSON.stringify(remoteMessage));
                console.log('Received foreground message:', JSON.stringify(remoteMessage));
                setNotifications(prevNotifications => {
                    const newNotifications = [...prevNotifications, remoteMessage];
                    AsyncStorage.setItem('notifications', JSON.stringify(newNotifications));
                    setnotifyStatus(true)
                    return newNotifications;
                });
            });

            const unsubscribeBackground = messaging().setBackgroundMessageHandler(async remoteMessage => {
                console.log('Received background message:', remoteMessage);
                setNotifications(prevNotifications => {
                    const newNotifications = [...prevNotifications, remoteMessage];
                    AsyncStorage.setItem('notifications', JSON.stringify(newNotifications));
                    setnotifyStatus(true)
                    return newNotifications;
                });
            });

            // Load notifications from AsyncStorage when component mounts
            AsyncStorage.getItem('notifications').then((value) => {
                if (value !== null) {
                    setNotifications(JSON.parse(value));
                    setnotifyStatus(true)
                }
            });

            return () => {
                unsubscribeForeground();
                //unsubscribeBackground();
            };
        }
    }, [])

    const handleSwipeLeft = (index) => {
        const updatedNotifications = [...notifications];
        updatedNotifications.splice(index, 1); // Remove the notification at the given index
        setNotifications(updatedNotifications);
        AsyncStorage.setItem('notifications', JSON.stringify(updatedNotifications)); // Update AsyncStorage
    }


    return (
        <SafeAreaView style={styles.Container}>
            <CustomHeader commingFrom={'Schedule'} onPress={() => navigation.goBack()} title={'Schedule'} />
            <ScrollView style={styles.wrapper}>
                <View style={{ marginBottom: responsiveHeight(3) }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <View style={{ backgroundColor: '#ECFCFA', height: responsiveHeight(5), width: responsiveWidth(40), borderRadius: 20, borderColor: '#87ADA8', borderWidth: 1, justifyContent: 'center', alignItems: 'center' }}>
                            <Text style={{ color: '#2D2D2D', fontFamily: 'DMSans-SemiBold', fontSize: responsiveFontSize(1.7) }}>Calendar</Text>
                        </View>
                        <View style={{ backgroundColor: '#FFF', height: responsiveHeight(5), width: responsiveWidth(40), borderRadius: 20, borderColor: '#87ADA8', borderWidth: 1, justifyContent: 'center', alignItems: 'center' }}>
                            <Text style={{ color: '#746868', fontFamily: 'DMSans-Medium', fontSize: responsiveFontSize(1.7) }}>Availability</Text>
                        </View>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: responsiveHeight(2) }}>
                        <Text style={{ color: '#2D2D2D', fontFamily: 'DMSans-Bold', fontSize: responsiveFontSize(2) }}>Calender</Text>
                        <Image
                            source={dateIcon}
                            style={{ height: 20, width: 20, resizeMode: 'contain', }}
                        />
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    )
}


export default ScheduleScreen


const styles = StyleSheet.create({
    Container: {
        flex: 1,
        backgroundColor: '#fff'
    },
    wrapper: {
        padding: 20,
        //marginBottom: responsiveHeight(1)
    },


});
