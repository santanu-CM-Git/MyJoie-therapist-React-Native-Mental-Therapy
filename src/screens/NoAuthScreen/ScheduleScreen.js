import React, { useContext, useState, useEffect } from 'react';
import { View, Text, SafeAreaView, StyleSheet, ScrollView, Switch, Image, Platform, Alert } from 'react-native'
import CustomHeader from '../../components/CustomHeader'
import { responsiveFontSize, responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { ArrowGratter, ArrowUp, GreenTick, Payment, YellowTck, dateIcon, deleteImg, editImg, notifyImg, plus, timeIcon, userPhoto } from '../../utils/Images'
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
    const [activeTab, setActiveTab] = useState('Calender')
    const [isEnabled, setIsEnabled] = useState(false);
    const toggleSwitch = () => setIsEnabled(previousState => !previousState);

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

    const toggleTab = (name) => {
        setActiveTab(name)
    }

    return (
        <SafeAreaView style={styles.Container}>
            <CustomHeader commingFrom={'Schedule'} onPress={() => navigation.goBack()} title={'Schedule'} />
            <ScrollView style={styles.wrapper}>
                <View style={{ marginBottom: responsiveHeight(3) }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <TouchableOpacity onPress={() => toggleTab('Calender')}>
                            <View style={activeTab == 'Calender' ? styles.activeButtonView : styles.inActiveButtonView}>
                                <Text style={activeTab == 'Calender' ? styles.activeButtonText : styles.inActiveButtonText}>Calendar</Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => toggleTab('Availability')}>
                            <View style={activeTab == 'Availability' ? styles.activeButtonView : styles.inActiveButtonView}>
                                <Text style={activeTab == 'Availability' ? styles.activeButtonText : styles.inActiveButtonText}>Availability</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                    {activeTab == 'Calender' ?
                        <>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: responsiveHeight(2) }}>
                                <Text style={{ color: '#2D2D2D', fontFamily: 'DMSans-Bold', fontSize: responsiveFontSize(2) }}>Calender</Text>
                                <Image
                                    source={dateIcon}
                                    style={{ height: 20, width: 20, resizeMode: 'contain', }}
                                />
                            </View>

                            <View style={{ width: '99%', backgroundColor: '#FFF', marginHorizontal: 2, borderRadius: 20, marginTop: responsiveHeight(2), elevation: 5 }}>
                                <View style={{ flexDirection: 'row', height: responsiveHeight(7), backgroundColor: '#DEDEDE', borderTopRightRadius: 10, borderTopLeftRadius: 10, alignItems: 'center', }}>
                                    <Text style={{ color: '#2D2D2D', fontFamily: 'DMSans-Bold', fontSize: responsiveFontSize(2), fontWeight: 'bold', textAlign: 'center', marginLeft: responsiveWidth(2) }}>03-05-2024</Text>
                                </View>
                                <>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 10, paddingVertical: 5, marginTop: 5 }}>
                                        <Text style={{ color: '#2D2D2D', fontFamily: 'DMSans-Bold', fontSize: responsiveFontSize(2) }}>Shubham Halder</Text>
                                        <Image
                                            source={ArrowGratter}
                                            style={{ height: 20, width: 20, resizeMode: 'contain' }}
                                        />
                                    </View>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 10, paddingVertical: 5, }}>
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Text style={{ color: '#969696', fontFamily: 'DMSans-Medium', fontSize: responsiveFontSize(1.7) }}>06:00 PM - 06:15 PM</Text>
                                            <View style={{ paddingHorizontal: 10, paddingVertical: 5, backgroundColor: '#FF9E45', borderRadius: 15, marginLeft: responsiveWidth(2) }}>
                                                <Text style={{ color: '#FFF', fontFamily: 'DMSans-Semibold', fontSize: responsiveFontSize(1.5) }}>New</Text>
                                            </View>
                                        </View>
                                        <Text style={{ color: '#969696', fontFamily: 'DMSans-Medium', fontSize: responsiveFontSize(1.7) }}>Free</Text>
                                    </View>
                                    <View
                                        style={{
                                            borderBottomColor: '#E3E3E3',
                                            borderBottomWidth: 1,
                                            marginHorizontal: 10,
                                            marginTop: 5

                                        }}
                                    />
                                </>
                                <>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 10, paddingVertical: 5, marginTop: 5 }}>
                                        <Text style={{ color: '#2D2D2D', fontFamily: 'DMSans-Bold', fontSize: responsiveFontSize(2) }}>Shubham Halder</Text>
                                        <Image
                                            source={ArrowGratter}
                                            style={{ height: 20, width: 20, resizeMode: 'contain' }}
                                        />
                                    </View>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 10, paddingVertical: 5, }}>
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Text style={{ color: '#969696', fontFamily: 'DMSans-Medium', fontSize: responsiveFontSize(1.7) }}>06:00 PM - 06:15 PM</Text>
                                            <View style={{ paddingHorizontal: 10, paddingVertical: 5, backgroundColor: '#128807', borderRadius: 15, marginLeft: responsiveWidth(2) }}>
                                                <Text style={{ color: '#FFF', fontFamily: 'DMSans-Semibold', fontSize: responsiveFontSize(1.5) }}>New</Text>
                                            </View>
                                        </View>
                                        <Text style={{ color: '#969696', fontFamily: 'DMSans-Medium', fontSize: responsiveFontSize(1.7) }}>Free</Text>
                                    </View>
                                    <View
                                        style={{
                                            borderBottomColor: '#E3E3E3',
                                            borderBottomWidth: 1,
                                            marginHorizontal: 10,
                                            marginTop: 5

                                        }}
                                    />
                                </>
                            </View>
                        </>
                        :
                        <>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: responsiveHeight(2) }}>
                                <Text style={{ color: '#2D2D2D', fontFamily: 'DMSans-Bold', fontSize: responsiveFontSize(2) }}>Availability</Text>
                                <View style={{ flexDirection: 'row' }}>
                                    <Image
                                        source={plus}
                                        style={{ height: 18, width: 18, resizeMode: 'contain', marginRight: 5 }}
                                    />
                                    <Text style={{ color: '#444343', fontFamily: 'DMSans-Medium', fontSize: responsiveFontSize(1.7) }}>Add New Availability</Text>
                                </View>
                            </View>
                            <View style={{ width: '99%', backgroundColor: '#FFF', marginHorizontal: 2, borderRadius: 20, marginTop: responsiveHeight(2), elevation: 5, padding: 15 }}>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: responsiveHeight(1) }}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <Image
                                            source={dateIcon}
                                            style={{ height: 20, width: 20, resizeMode: 'contain', marginRight: 5 }}
                                        />
                                        <Text style={{ color: '#2D2D2D', fontFamily: 'DMSans-Bold', fontSize: responsiveFontSize(1.7) }}>Monday, Wednesday</Text>
                                    </View>
                                    <Switch
                                        trackColor={{ false: '#767577', true: '#000' }}
                                        thumbColor={isEnabled ? '#fff' : '#000'}
                                        ios_backgroundColor="#3e3e3e"
                                        onValueChange={toggleSwitch}
                                        value={isEnabled}
                                        style={styles.switchStyle}
                                    />
                                </View>
                                <Text style={{ color: '#746868', fontFamily: 'DMSans-Medium', fontSize: responsiveFontSize(1.7), marginLeft: responsiveWidth(6) }}>03:00 PM - 05:00 PM</Text>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: responsiveHeight(2) }}>

                                    <View style={styles.activeButtonInsideView}>
                                        <Image
                                            source={deleteImg}
                                            style={{ height: 20, width: 20, resizeMode: 'contain', marginRight: 5 }}
                                        />
                                        <Text style={styles.activeButtonInsideText}>Delete</Text>
                                    </View>

                                    <View style={styles.inActiveButtonInsideView}>
                                        <Image
                                            source={editImg}
                                            style={{ height: 20, width: 20, resizeMode: 'contain', marginRight: 5 }}
                                        />
                                        <Text style={styles.activeButtonInsideText}>Edit</Text>
                                    </View>

                                </View>
                            </View>
                        </>
                    }
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
        padding: 15,
        //marginBottom: responsiveHeight(1)
    },
    activeButtonView: {
        backgroundColor: '#ECFCFA',
        height: responsiveHeight(5),
        width: responsiveWidth(40),
        borderRadius: 20,
        borderColor: '#87ADA8',
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    activeButtonText: {
        color: '#2D2D2D',
        fontFamily: 'DMSans-SemiBold',
        fontSize: responsiveFontSize(1.7)
    },
    inActiveButtonView: {
        backgroundColor: '#FFF',
        height: responsiveHeight(5),
        width: responsiveWidth(40),
        borderRadius: 20,
        borderColor: '#87ADA8',
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    inActiveButtonText: {
        color: '#746868',
        fontFamily: 'DMSans-Medium',
        fontSize: responsiveFontSize(1.7)
    },
    switchStyle: {
        transform: [{ scaleX: 1.3 }, { scaleY: 1.3 }]  // Adjust scale values as needed
    },
    activeButtonInsideView: {
        backgroundColor: '#FFF',
        height: responsiveHeight(5),
        width: responsiveWidth(40),
        borderRadius: 15,
        borderColor: '#E3E3E3',
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        alignItems: 'center'
    },
    activeButtonInsideText: {
        color: '#2D2D2D',
        fontFamily: 'DMSans-SemiBold',
        fontSize: responsiveFontSize(1.7)
    },
    inActiveButtonInsideView: {
        backgroundColor: '#F4F5F5',
        height: responsiveHeight(5),
        width: responsiveWidth(40),
        borderRadius: 15,
        borderColor: '#F4F5F5',
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        alignItems: 'center'
    },


});
