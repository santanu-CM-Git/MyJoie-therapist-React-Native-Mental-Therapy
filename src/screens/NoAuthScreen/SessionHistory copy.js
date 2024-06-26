import React, { useContext, useState, useEffect } from 'react';
import { View, Text, SafeAreaView, StyleSheet, ScrollView, FlatList, Image, Platform, Alert } from 'react-native'
import CustomHeader from '../../components/CustomHeader'
import { responsiveFontSize, responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { ArrowGratter, ArrowUp, GreenTick, Payment, RedCross, YellowTck, dateIcon, notifyImg, timeIcon, userPhoto } from '../../utils/Images'
import messaging from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NoNotification from './NoNotification';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { Dropdown } from 'react-native-element-dropdown';
import Modal from "react-native-modal";
import Icon from 'react-native-vector-icons/Entypo';
import InputField from '../../components/InputField';
import CustomButton from '../../components/CustomButton';
import axios from 'axios';
import { API_URL } from '@env'
import Loader from '../../utils/Loader';
import moment from 'moment-timezone';
import { useFocusEffect } from '@react-navigation/native';
import { ActivityIndicator } from '@react-native-material/core';

const SessionHistory = ({ navigation }) => {

    const [therapistSessionHistory, setTherapistSessionHistory] = useState([])
    const [perPage, setPerPage] = useState(3)
    const [pageno, setPageno] = useState(1)
    const [isFocus, setIsFocus] = useState(false);
    const [isModalVisible, setModalVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(true)
    const [loading, setLoading] = useState(false)

    const toggleModal = () => {
        setModalVisible(!isModalVisible);
    };
    const fetchSessionHistory = async () => {
        try {
            const userToken = await AsyncStorage.getItem('userToken');
            if (!userToken) {
                console.log('No user token found');
                setIsLoading(false);
                return;
            }
            const option = {
                "per_page": perPage
            }
            const response = await axios.post(`${API_URL}/therapist/therapist-all-session?page=${pageno}`, option, {
                headers: {
                    'Accept': 'application/json',
                    "Authorization": `Bearer ${userToken}`,
                },
            });

            const { data } = response.data;
            console.log(JSON.stringify(data.data), 'fetch all session history');
            setTherapistSessionHistory(data.data)

        } catch (error) {
            console.log(`Fetch upcoming slot error: ${error}`);
            Alert.alert('Oops..', error.response?.data?.message || 'Something went wrong', [
                {
                    text: 'Cancel',
                    onPress: () => console.log('Cancel Pressed'),
                    style: 'cancel',
                },
                { text: 'OK', onPress: () => console.log('OK Pressed') },
            ]);
        } finally {
            setIsLoading(false);
        }
    }

    const renderFooter = () => {
        //it will show indicator at the bottom of the list when data is loading otherwise it returns null
        if (!loading) return null;
        return (
            <ActivityIndicator
                style={{ color: '#000' }}
            />
        );
    };

    const renderSessionHistory = ({ item }) => (
        <View style={styles.cardView}>
            <View style={styles.flexStyle}>
                <Text style={styles.userName}>{item?.patient?.name}</Text>
                <View style={styles.flexCenter}>
                    <Image
                        source={
                            item?.status === 'completed' ? GreenTick :
                                item?.status === 'scheduled' ? YellowTck :
                                    item?.status === 'cancel' ? RedCross :
                                        null // You can set a default image or handle the null case appropriately
                        }
                        style={styles.iconstyle}
                    />
                    <Text style={styles.completedText}>
                        {item?.status === 'completed' ? 'Completed' : item?.status === 'cancel' ? 'Cancel' : 'Scheduled'}
                    </Text>
                </View>
            </View>
            <View style={styles.paraView}>
                <Text style={styles.paraIndex}>Order ID :</Text>
                <Text style={styles.paraValue}>{item?.order_id}</Text>
            </View>
            <View style={styles.paraView}>
                <Text style={styles.paraIndex}>Date :</Text>
                <Text style={styles.paraValue}>{moment(item?.date).format('ddd, D MMMM')}, {moment(item?.start_time, 'HH:mm:ss').format('h:mm A')} - {moment(item?.end_time, 'HH:mm:ss').format('h:mm A')}</Text>
            </View>
            <View style={styles.paraView}>
                <Text style={styles.paraIndex}>Appointment Time :</Text>
                <Text style={styles.paraValue}>{moment(item?.end_time, 'HH:mm:ss').diff(moment(item?.start_time, 'HH:mm:ss'), 'minutes')} Min</Text>
            </View>
            {/* <View style={styles.paraView}>
                <Text style={styles.paraIndex}>Rate :</Text>
                <Text style={styles.paraValue}>Rs 1100 for 30 Min</Text>
            </View> */}
            <View style={{ marginTop: responsiveHeight(1.5) }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={styles.paraIndex}>Session Summary :</Text>
                    {item?.prescription_content ?
                        <></> :
                        <TouchableOpacity onPress={() => toggleModal()}>
                            <Text style={styles.editText}>Add Summary</Text>
                        </TouchableOpacity>}
                </View>
                <Text style={{ color: '#746868', fontFamily: 'DMSans-Medium', fontSize: responsiveFontSize(1.7), marginTop: 5 }}>{item?.prescription_content}</Text>
            </View>
            {/* <View style={{ height: responsiveHeight(5), width: responsiveWidth(78), marginTop: responsiveHeight(2), backgroundColor: '#F4F5F5', borderRadius: 15, padding: 5, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                <Image
                    source={Payment}
                    style={{ height: 20, width: 20, resizeMode: 'contain', marginRight: 5 }}
                />
                <Text style={{ color: '#2D2D2D', fontFamily: 'DMSans-SemiBold', fontSize: responsiveFontSize(1.7) }}>Payment Received : ₹ 800</Text>
            </View> */}
        </View>

    )

    useEffect(() => {
        fetchSessionHistory()
    }, [])
    useFocusEffect(
        React.useCallback(() => {
            fetchSessionHistory()
        }, [])
    )

    const handleLoadMore = () => {
        console.log(pageno);
         setPageno(pageno + 1)
         fetchSessionHistory()
    };

    if (isLoading) {
        return (
            <Loader />
        )
    }

    return (
        <SafeAreaView style={styles.Container}>
            <CustomHeader commingFrom={'Session History'} onPress={() => navigation.goBack()} title={'Session History'} />
            <View style={styles.wrapper}>
                <View style={{ alignItems: 'center', marginBottom: responsiveHeight(5) }}>
                    <FlatList
                        data={therapistSessionHistory}
                        renderItem={renderSessionHistory}
                        keyExtractor={(item) => item.id.toString()}
                        maxToRenderPerBatch={10}
                        windowSize={5}
                        initialNumToRender={10}
                        //horizontal={true}
                        showsVerticalScrollIndicator={false}
                        onEndReached={() => handleLoadMore()}
                        //ListFooterComponent={() => renderFooter()}
                        getItemLayout={(therapistSessionHistory, index) => (
                            { length: 50, offset: 50 * index, index }
                        )}
                    />
                </View>
            </View>
            <Modal
                isVisible={isModalVisible}
                style={{
                    margin: 0, // Add this line to remove the default margin
                    justifyContent: 'flex-end',
                }}>
                <View style={{ justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff', height: 50, width: 50, borderRadius: 25, position: 'absolute', bottom: '55%', left: '45%', right: '45%' }}>
                    <Icon name="cross" size={30} color="#B0B0B0" onPress={toggleModal} />
                </View>
                <View style={{ height: '50%', backgroundColor: '#fff', position: 'absolute', bottom: 0, width: '100%' }}>
                    <View style={{ padding: 25 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', }}>
                            <Text style={styles.header}>Session Summary</Text>
                        </View>
                        <View style={styles.inputView}>
                            <InputField
                                label={'Aadhar No'}
                                keyboardType=" "
                                value={'56897 85698 78965 96636'}
                                //helperText={'Please enter lastname'}
                                inputType={'address'}
                                onChangeText={(text) => changePassword(text)}
                            />
                        </View>
                        <CustomButton label={"Upload"}
                            // onPress={() => { login() }}
                            onPress={() => { submitForm() }}
                        />
                    </View>

                </View>
            </Modal>
        </SafeAreaView>
    )
}


export default SessionHistory


const styles = StyleSheet.create({
    Container: {
        flex: 1,
        backgroundColor: '#fff'
    },
    wrapper: {
        padding: 10,
        //marginBottom: responsiveHeight(1)
    },
    dropdown: {
        //height: responsiveHeight(4),
        //borderColor: 'gray',
        //borderWidth: 0.7,
        //borderRadius: 8,
        //paddingHorizontal: 8,

    },
    placeholderStyle: {
        fontSize: 16,
        color: '#746868',
        fontFamily: 'DMSans-Regular'
    },
    selectedTextStyle: {
        fontSize: 16,
        color: '#746868',
        fontFamily: 'DMSans-Regular'
    },
    inputSearchStyle: {
        height: 40,
        fontSize: 16,
        color: '#746868',
        fontFamily: 'DMSans-Regular'
    },
    imageStyle: {
        height: 35,
        width: 35,
        marginBottom: 5,
        resizeMode: 'contain'
    },
    activeButtonInsideView: {
        backgroundColor: '#FFF',
        height: responsiveHeight(6),
        width: responsiveWidth(78),
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
        fontFamily: 'DMSans-Bold',
        fontSize: responsiveFontSize(1.7)
    },
    cardView: {
        width: responsiveWidth(90),
        backgroundColor: '#FFF',
        padding: 20,
        borderRadius: 20,
        marginTop: responsiveHeight(1),
        marginBottom: responsiveHeight(4),
        borderColor: '#F4F5F5',
        borderWidth: 2,
    },
    flexStyle: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    userName: {
        color: '#2D2D2D',
        fontSize: responsiveFontSize(2),
        fontFamily: 'DMSans-Bold'
    },
    flexCenter: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center'
    },
    iconstyle: {
        height: 20,
        width: 20,
        resizeMode: 'contain'
    },
    completedText: {
        color: '#444343',
        fontSize: responsiveFontSize(1.7),
        fontFamily: 'DMSans-SemiBold',
        marginLeft: responsiveWidth(1)
    },
    paraView: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: responsiveHeight(1.5)
    },
    paraIndex: {
        color: '#444343',
        fontFamily: 'DMSans-Medium',
        fontSize: responsiveFontSize(1.7),
        marginRight: responsiveWidth(2)
    },
    paraValue: {
        color: '#746868',
        fontFamily: 'DMSans-Medium',
        fontSize: responsiveFontSize(1.7)
    },
    editText: {
        color: '#5C9ECF',
        fontFamily: 'DMSans-Medium',
        fontSize: responsiveFontSize(1.7),
        marginRight: responsiveWidth(2)
    }

});
