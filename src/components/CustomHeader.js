import React, { useContext, useState, useEffect } from 'react';
import {
    View,
    Text,
    SafeAreaView,
    ActivityIndicator,
    ImageBackground,
    TextInput,
    TouchableOpacity,
    FlatList,
    StyleSheet,
    Image,
    Switch,
} from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { hambargar, userPhoto } from '../utils/Images';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { responsiveFontSize, responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions';
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from 'axios';
import { API_URL } from '@env'
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import Logo from '../../src/assets/images/misc/logo.svg';

export default function CustomHeader({
    onPress,
    commingFrom,
    title,
    onPressProfile,
}) {
    // const { userInfo } = useContext(AuthContext)
    // console.log(userInfo?.photo)
    const navigation = useNavigation();
    const [userInfo, setuserInfo] = useState([])
    const [isEnabled, setIsEnabled] = useState(false);

    const toggleSwitch = async () => {
        const newStatus = !isEnabled;
    
        // Optimistically update the switch UI
        setIsEnabled(newStatus);
    
        const status = newStatus ? 'on' : 'off';
    
        try {
            const userToken = await AsyncStorage.getItem('userToken');
            if (!userToken) {
                console.log('No user token found');
                return;
            }
            const option = { status };
            //console.log(userToken, 'usertoken');
            //console.log(option);
            const response = await axios.post(`${API_URL}/therapist/instant-connect`, option, {
                headers: {
                    "Authorization": `Bearer ${userToken}`,
                    "Content-Type": 'application/json'
                }
            });
    
            if (response.data.response !== true) {
                // If the response is not successful, revert the switch state
                setIsEnabled(prevState => !prevState);
            }
        } catch (error) {
            console.log(`Profile error: ${error}`);
            // Revert the switch state in case of an error
            setIsEnabled(prevState => !prevState);
        }
    };

    const fetchProfileDetails = async () => {
        try {
            const userToken = await AsyncStorage.getItem('userToken');
            if (!userToken) {
                console.log('No user token found');
                return;
            }
            //console.log(userToken, 'usertoken');
            const response = await axios.post(`${API_URL}/therapist/profile`, {}, {
                headers: {
                    "Authorization": `Bearer ${userToken}`,
                    "Content-Type": 'application/json'
                }
            });
            const userInfo = response.data.data;
            //console.log(userInfo, 'user data from header');
            setuserInfo(userInfo);
            if (userInfo.instant_availability === 'off') {
                setIsEnabled(false)
            } else if (userInfo.instant_availability === 'on') {
                setIsEnabled(true)
            }

        } catch (error) {
            console.log(`Profile error ${error}`);
        }
    };
    useEffect(() => {
        fetchProfileDetails()
    }, [])
    useFocusEffect(
        React.useCallback(() => {
            fetchProfileDetails()
        }, [])
    )
    return (
        <>
            {commingFrom == 'Home' ?
                <>
                    <LinearGradient
                        colors={['#fff', '#fff']} // Example colors, replace with your desired gradient
                        style={styles.headerView}
                    >
                        <View style={styles.firstSection}>
                            <TouchableOpacity onPress={() => navigation.toggleDrawer()} style={{ width: 44, height: 44, borderRadius: 44 / 2, justifyContent: 'center', alignItems: 'center' }}>
                                {/* {userInfo?.photo ?
                                    <Image
                                        source={{ uri: userInfo?.photo }}
                                        style={styles.headerImage}
                                    /> : */}
                                <Image
                                    source={hambargar}
                                    style={styles.headerImage}
                                />
                                {/* } */}
                            </TouchableOpacity>
                            <Image
                                source={require('../assets/images/icon.png')}
                                style={{ height: responsiveHeight(3.5), width: responsiveWidth(25), resizeMode: 'contain', marginLeft: responsiveWidth(0) }}
                            />
                            {/* <Logo
                                width={responsiveWidth(30)}
                                height={responsiveHeight(3.5)}
                            //style={{transform: [{rotate: '-15deg'}]}}
                            /> */}
                        </View>
                        {/* <View style={{ height: responsiveHeight(6), width: responsiveWidth(30), flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 2, }}>
                            <Text style={{ fontSize: responsiveFontSize(1.5), fontFamily: 'DMSans-SemiBold', marginRight: responsiveWidth(3) }}>Current Availability</Text>
                            <Switch
                                trackColor={{ false: '#767577', true: '#000' }}
                                thumbColor={isEnabled ? '#fff' : '#000'}
                                ios_backgroundColor="#3e3e3e"
                                onValueChange={toggleSwitch}
                                value={isEnabled}
                                style={styles.switchStyle}
                            />
                        </View> */}
                    </LinearGradient>
                    <View style={styles.headerBottomMargin} />
                </>
                : commingFrom == 'chat' ?
                    <>
                        <View style={styles.chatPageheaderView}>
                            <TouchableOpacity onPress={onPress}>
                                <Ionicons name="chevron-back" size={25} color="#FFF" />
                            </TouchableOpacity>
                            <Image
                                source={userPhoto}
                                style={styles.imageStyle}
                            />
                            <Text style={styles.chatPageheaderTitle}>{title}</Text>
                        </View>
                        <View style={styles.headerBottomMargin} />
                    </>
                    :
                    <>
                        <View style={styles.innerPageheaderView}>
                            <TouchableOpacity onPress={onPress}>
                                <Ionicons name="chevron-back" size={25} color="#000" />
                            </TouchableOpacity>
                            <Text style={styles.innerPageheaderTitle}>{title}</Text>
                        </View>
                        <View style={styles.headerBottomMargin} />
                    </>
            }
        </>
    )
}

const styles = StyleSheet.create({
    headerView: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal:10,
        backgroundColor: '#377172',
        marginTop: -responsiveHeight(1),
        paddingRight: responsiveWidth(10)
    },
    innerPageheaderView: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
    },
    chatPageheaderView: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#4B47FF'
    },
    innerPageheaderTitle: {
        color: '#2F2F2F',
        fontSize: responsiveFontSize(2.2),
        fontFamily: 'DMSans-SemiBold',
        marginLeft: 10
    },
    chatPageheaderTitle: {
        color: '#FFF',
        fontSize: responsiveFontSize(2.2),
        fontFamily: 'DMSans-SemiBold',
        marginLeft: 10
    },
    firstSection: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    headerImage: {
        width: 28,
        height: 28,
    },
    firstText: {
        fontSize: responsiveFontSize(2),
        fontFamily: 'DMSans-SemiBold',
        marginLeft: 10,
        color: '#FFFFFF'
    },
    secondText: {
        fontSize: responsiveFontSize(1.5),
        fontFamily: 'DMSans-SemiBold',
        marginLeft: 10,
        color: '#F4F4F4'
    },
    notificationdotView: {
        position: 'absolute',
        top: -2,
        right: 3
    },
    notificationdot: {
        color: '#EB0000',
        fontSize: 12
    },
    headerBottomMargin: {
        borderBottomColor: '#FFFFFF',
        borderBottomWidth: StyleSheet.hairlineWidth,
        elevation: 2
    },
    imageStyle: {
        height: 40,
        width: 40,
        borderRadius: 40 / 2,
        marginLeft: 5
    },
    switchStyle: {
        transform: [{ scaleX: 1.3 }, { scaleY: 1.3 }]  // Adjust scale values as needed
    }
})