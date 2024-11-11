import React, {useContext, useState, useEffect, useCallback } from 'react';
import { View, Text, SafeAreaView, StyleSheet, FlatList, Image, Alert, Platform, RefreshControl } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TouchableOpacity } from 'react-native-gesture-handler';
import axios from 'axios';
import moment from 'moment-timezone';
import { useFocusEffect } from '@react-navigation/native';
import Modal from 'react-native-modal';
import { API_URL } from '@env';
import Loader from '../../utils/Loader';
import { responsiveFontSize, responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions';
import InputField from '../../components/InputField';
import CustomButton from '../../components/CustomButton';
import { GreenTick, RedCross, YellowTck } from '../../utils/Images';
import CustomHeader from '../../components/CustomHeader';
import Toast from 'react-native-toast-message';
import { AuthContext } from '../../context/AuthContext';

const SessionHistory = ({ navigation }) => {
    const { logout } = useContext(AuthContext);
    const [refreshing, setRefreshing] = useState(false);
    const [therapistSessionHistory, setTherapistSessionHistory] = useState([]);
    const [perPage, setPerPage] = useState(10);
    const [pageno, setPageno] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [summaryData, setSummaryData] = useState('')
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setModalVisible] = useState(false);
    const [selectedSession, setSelectedSession] = useState(null);
    const [hasMore, setHasMore] = useState(true);

    const toggleModal = (session) => {
        console.log(session, 'hhhhhhhhhh')
        setSelectedSession(session);
        setSummaryData(session?.prescription_content)
        setModalVisible(!isModalVisible);
    };

    const fetchSessionHistory = useCallback(async (page = 1) => {
        try {
            setLoading(true);
            const userToken = await AsyncStorage.getItem('userToken');
            if (!userToken) {
                console.log('No user token found');
                setIsLoading(false);
                return;
            }
            const response = await axios.post(`${API_URL}/therapist/therapist-all-session`, {}, {
                params: {
                    page
                },
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${userToken}`,
                },
            });

            const responseData = response.data.data.data;
            console.log(responseData, 'session historyy')
            setTherapistSessionHistory(prevData => page === 1 ? responseData : [...prevData, ...responseData]);
            if (responseData.length === 0) {
                setHasMore(false); // No more data to load
            }
        } catch (error) {
            console.log(`Fetch session history error: ${error}`);
            let myerror = error.response?.data?.message;
            Alert.alert('Oops..', error.response?.data?.message || 'Something went wrong', [
                { text: 'OK', onPress: () => myerror == 'Unauthorized' ? logout() : console.log('OK Pressed') },
            ]);
        } finally {
            setIsLoading(false);
            setLoading(false);
        }
    }, []);
    useEffect(() => {
        fetchSessionHistory(pageno);
    }, [fetchSessionHistory, pageno]);

    useFocusEffect(
        useCallback(() => {
            setTherapistSessionHistory([]);
            setPageno(1);
            setHasMore(true); // Reset hasMore on focus
            fetchSessionHistory(1);
        }, [fetchSessionHistory])
    );

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        setTherapistSessionHistory([]);
        setPageno(1);
        setHasMore(true); // Reset hasMore on focus
        fetchSessionHistory(1);
        setRefreshing(false);
    }, []);

    const handleLoadMore = () => {
        if (!loading && hasMore) {
            setPageno(prevPage => prevPage + 1);
        }
    };

    const renderFooter = () => {
        if (!loading) return null;
        return (
            <View style={styles.loaderContainer}>
                <Loader />
            </View>
        );
    };

    const renderSessionHistory = ({ item }) => {
        const sessionEndDate = moment(item?.date + ' ' + item?.end_time, 'YYYY-MM-DD HH:mm:ss');
        const currentDate = moment();
        const isWithin24Hours = currentDate.diff(sessionEndDate, 'hours') < 24;
        return (
            <View style={styles.cardView}>
                <View style={styles.flexStyle}>
                    <Text style={styles.userName}>{item?.patient?.name}</Text>
                    <View style={styles.flexCenter}>
                        <Image
                            source={
                                item?.status === 'completed' ? GreenTick :
                                    item?.status === 'cancel' ? RedCross : YellowTck
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
                    <Text style={styles.paraValue}>
                        {moment(item?.date).format('ddd, D MMMM')}, {moment(item?.start_time, 'HH:mm:ss').format('h:mm A')} - {moment(item?.end_time, 'HH:mm:ss').format('h:mm A')}
                    </Text>
                </View>
                <View style={styles.paraView}>
                    <Text style={styles.paraIndex}>Appointment Time :</Text>
                    <Text style={styles.paraValue}>
                        {moment(item?.end_time, 'HH:mm:ss').diff(moment(item?.start_time, 'HH:mm:ss'), 'minutes')} Min
                    </Text>
                </View>
                <View style={{ marginTop: responsiveHeight(1.5) }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text style={styles.paraIndex}>Session Summary :</Text>
                        {/* {item?.prescription_content ? null : ( */}
                        {
                            item?.status === 'completed' && isWithin24Hours && (
                                <TouchableOpacity onPress={() => toggleModal(item)}>
                                    <Text style={styles.editText}>Edit Summary</Text>
                                </TouchableOpacity>
                            )
                        }
                        {/* )} */}
                    </View>
                    <Text style={styles.contentText}>
                        {item?.prescription_content ? item?.prescription_content : 'No content yet'}
                    </Text>
                </View>
            </View>
        )
    };

    const submitForm = () => {
        if (summaryData == '') {
            Toast.show({
                type: 'error',
                text1: '',
                text2: "Please write session summary.",
                position: 'top',
                topOffset: Platform.OS == 'ios' ? 55 : 20
            });
        } else {
            const option = {
                "slot_booked_id": selectedSession?.id,
                "summary": summaryData
            }
            setIsLoading(true)
            AsyncStorage.getItem('userToken', (err, usertoken) => {
                axios.post(`${API_URL}/therapist/prescription-update`, option, {
                    headers: {
                        Accept: 'application/json',
                        "Authorization": `Bearer ${usertoken}`,
                    },
                })
                    .then(res => {
                        console.log(res.data)
                        if (res.data.response == true) {
                            setIsLoading(false)
                            Toast.show({
                                type: 'success',
                                text1: '',
                                text2: "Summary uploaded successfully.",
                                position: 'top',
                                topOffset: Platform.OS == 'ios' ? 55 : 20
                            });
                            fetchSessionHistory();
                            setModalVisible(false)
                            setIsLoading(false)
                        } else {
                            console.log('not okk')
                            setIsLoading(false)
                            Alert.alert('Oops..', "Something went wrong", [
                                {
                                    text: 'Cancel',
                                    onPress: () => console.log('Cancel Pressed'),
                                    style: 'cancel',
                                },
                                { text: 'OK', onPress: () => console.log('OK Pressed') },
                            ]);
                        }
                    })
                    .catch(e => {
                        setIsLoading(false)
                        console.log(`user register error ${e}`)
                        console.log(e.response)
                        Alert.alert('Oops..', e.response?.data?.message, [
                            {
                                text: 'Cancel',
                                onPress: () => console.log('Cancel Pressed'),
                                style: 'cancel',
                            },
                            { text: 'OK', onPress: () => console.log('OK Pressed') },
                        ]);
                    });
            });
        }

    }

    if (isLoading) {
        return <Loader />;
    }

    return (
        <SafeAreaView style={styles.Container}>
            <CustomHeader commingFrom={'Session History'} onPress={() => navigation.goBack()} title={'Session History'} />
            <View style={styles.wrapper}>
                <FlatList
                    data={therapistSessionHistory}
                    renderItem={renderSessionHistory}
                    keyExtractor={(item) => item.id.toString()}
                    maxToRenderPerBatch={10}
                    windowSize={5}
                    initialNumToRender={10}
                    showsVerticalScrollIndicator={false}
                    onEndReached={handleLoadMore}
                    onEndReachedThreshold={0.5}
                    ListFooterComponent={renderFooter}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#417AA4" colors={['#417AA4']} />
                    }
                />
            </View>
            <Modal
                isVisible={isModalVisible}
                style={styles.modalContainer}
                onBackdropPress={() => setModalVisible(false)}
            >
                <View style={styles.modalContent}>
                    <Text style={styles.modalHeader}>Session Summary</Text>
                    <InputField
                        label={'Enter Seesion Summary'}
                        value={summaryData}
                        inputType={'address'}
                        onChangeText={(text) => setSummaryData(text)} // Change as needed
                    />
                    <CustomButton label={"Upload"} onPress={() => submitForm()} />
                </View>
            </Modal>
        </SafeAreaView>
    );
};

export default SessionHistory;

const styles = StyleSheet.create({
    Container: {
        flex: 1,
        backgroundColor: '#fff'
    },
    wrapper: {
        flex: 1,
        padding: 15,
    },
    cardView: {
        width: responsiveWidth(92),
        backgroundColor: '#FFF',
        padding: 20,
        borderRadius: 20,
        marginTop: responsiveHeight(1),
        marginBottom: responsiveHeight(1),
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
    contentText: { color: '#746868', fontFamily: 'DMSans-Medium', fontSize: responsiveFontSize(1.7), marginTop: 5 },
    editText: {
        color: '#5C9ECF',
        fontFamily: 'DMSans-Medium',
        fontSize: responsiveFontSize(1.7),
        marginRight: responsiveWidth(2)
    },
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    modalContainer: {
        margin: 0,
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#fff',
        padding: 25,
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
    },
    modalHeader: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
    },
});
