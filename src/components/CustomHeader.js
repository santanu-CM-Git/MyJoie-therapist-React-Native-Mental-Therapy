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
} from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { hambargar, userPhoto } from '../utils/Images';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { responsiveFontSize, responsiveHeight } from 'react-native-responsive-dimensions';
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from 'axios';
import { API_URL } from '@env'
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';

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
    const fetchProfileDetails = () => {
        AsyncStorage.getItem('userToken', (err, usertoken) => {
            axios.get(`${API_URL}/api/driver/me`, {
                headers: {
                    "Authorization": 'Bearer ' + usertoken,
                    "Content-Type": 'application/json'
                },
            })
                .then(res => {
                    //console.log(res.data, 'user details')
                    let userInfo = res.data.response.records.data;
                    setuserInfo(userInfo)
                })
                .catch(e => {
                    console.log(`User Details Fetch error ${e}`)
                });
        });
    }

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
                        colors={['#377172', '#377172']} // Example colors, replace with your desired gradient
                        style={styles.headerView}
                    >
                        <View style={styles.firstSection}>
                            <TouchableOpacity onPress={() => navigation.toggleDrawer()}>
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
                            {/* <View>
                                {userInfo ?
                                    <Text style={styles.firstText}>
                                        Hi, {userInfo?.name}
                                    </Text> :
                                    <ActivityIndicator size="small" color="#339999" />
                                }
                                <Text style={styles.secondText}>
                                    Delivery Partner
                                </Text>
                            </View> */}
                        </View>
                        <View style={{ flexDirection: 'row' }}>
                            <TouchableOpacity onPress={onPress}>
                                <Ionicons name="search-outline" size={28} color="#F4F4F4" />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={onPress}>
                                <Ionicons name="notifications-outline" size={28} color="#F4F4F4" />
                                <View style={styles.notificationdotView}>
                                    <Text style={styles.notificationdot}>{'\u2B24'}</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </LinearGradient>
                    {/* <View style={styles.headerBottomMargin} /> */}
                </>
                : commingFrom == 'chat' ?
                    <>
                        <View style={styles.chatPageheaderView}>
                            <TouchableOpacity onPress={onPress}>
                                <Ionicons name="arrow-back" size={25} color="#FFF" />
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
                                <Ionicons name="arrow-back" size={25} color="#000" />
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
        padding: 20,
        backgroundColor: '#377172',
        marginTop: -responsiveHeight(1)
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
        fontFamily: 'Outfit-Bold',
        marginLeft: 10
    },
    chatPageheaderTitle: {
        color: '#FFF',
        fontSize: responsiveFontSize(2.2),
        fontFamily: 'Outfit-Bold',
        marginLeft: 10
    },
    firstSection: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    headerImage: {
        width: 50,
        height: 50,
        borderRadius: 25
    },
    firstText: {
        fontSize: responsiveFontSize(2),
        fontFamily: 'Outfit-Bold',
        marginLeft: 10,
        color: '#FFFFFF'
    },
    secondText: {
        fontSize: responsiveFontSize(1.5),
        fontFamily: 'Outfit-Bold',
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
        borderBottomColor: '#808080',
        borderBottomWidth: StyleSheet.hairlineWidth,
    },
    imageStyle: {
        height: 40,
        width: 40,
        borderRadius: 40 / 2,
        marginLeft: 5
    },
})