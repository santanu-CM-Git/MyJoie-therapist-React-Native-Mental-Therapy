import React, { useContext, useState, useEffect } from 'react';
import { View, Text, SafeAreaView, StyleSheet, ScrollView, ImageBackground, Image, Platform, Alert, FlatList } from 'react-native'
import CustomHeader from '../../components/CustomHeader'
import { responsiveFontSize, responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { ArrowDown, ArrowGratter, ArrowUp, GreenTick, Payment, RedCross, YellowTck, dateIcon, notifyImg, timeIcon, userPhoto } from '../../utils/Images'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Dropdown } from 'react-native-element-dropdown';
import Modal from "react-native-modal";
import Icon from 'react-native-vector-icons/Entypo';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import CustomButton from '../../components/CustomButton'
import moment from 'moment';
import axios from 'axios';
import Loader from '../../utils/Loader';
import { API_URL } from '@env'
import { useFocusEffect } from '@react-navigation/native';
const data = [
    { label: 'Today', value: '1' },
    { label: 'Yesterday', value: '2' },
    { label: 'This Week', value: '3' },
    { label: 'This Month', value: '4' },
    { label: 'Date Wise', value: '5' },
];

const EarningScreen = ({ navigation }) => {
    const [isLoading, setIsLoading] = useState(false)
    const [value, setValue] = useState('1');
    const [isFocus, setIsFocus] = useState(false);
    const [breakdownVisibility, setBreakdownVisibility] = useState(false);
    const [isCalendarModalVisible, setCalendarModalVisible] = useState(false);
    const [markedDates, setMarkedDates] = useState({});
    const [startDay, setStartDay] = useState(null);
    const [endDay, setEndDay] = useState(null);
    const [earningSum, setEarningSum] = useState(0);
    const [gstCharges, setGstCharges] = useState(0);
    const [payableSum, setPayableSum] = useState(0);
    const [walletAmount, setWalletAmount] = useState(0);
    const [tdsAmount, setTdsAmount] = useState(0);
    const [payable, setPayable] = useState(0)
    const [earningList, setEarningList] = useState([])

    useEffect(() => {
        setValue('1')
        fetchData("1")
    }, []);
    useFocusEffect(
        React.useCallback(() => {
            setValue('1')
            fetchData("1")
        }, [])
    )

    const toggleCalendarModal = () => {
        setCalendarModalVisible(!isCalendarModalVisible);
    }
    const handleDayPress = (day) => {
        if (startDay && !endDay) {
            const date = {}
            for (const d = moment(startDay); d.isSameOrBefore(day.dateString); d.add(1, 'days')) {
                //console.log(d,'vvvvvvvvvv')
                date[d.format('YYYY-MM-DD')] = {
                    marked: true,
                    color: 'black',
                    textColor: 'white'
                };

                if (d.format('YYYY-MM-DD') === startDay) {
                    date[d.format('YYYY-MM-DD')].startingDay = true;
                }
                if (d.format('YYYY-MM-DD') === day.dateString) {
                    date[d.format('YYYY-MM-DD')].endingDay = true;
                }
            }

            setMarkedDates(date);
            setEndDay(day.dateString);
        }
        else {
            setStartDay(day.dateString)
            setEndDay(null)
            setMarkedDates({
                [day.dateString]: {
                    marked: true,
                    color: 'black',
                    textColor: 'white',
                    startingDay: true,
                    endingDay: true
                }
            })
        }

    }

    const dateRangeSearch = () => {
        //console.log(startDay)
        //console.log(endDay)
        fetchData('5', startDay, endDay)
        toggleCalendarModal()
    }

    const fetchData = async (selectedValue, startDay, endDay) => {
        setIsLoading(true)
        let option = {};

        switch (selectedValue) {
            case '1':
                const currentDate = moment().format('YYYY-MM-DD');
                option = {
                    sdate: currentDate,
                    edate: currentDate,
                };
                break;
            case '2':
                const yesterdayDate = moment().subtract(1, 'days').format('YYYY-MM-DD');
                option = {
                    sdate: yesterdayDate,
                    edate: yesterdayDate,
                };
                break;
            case '3':
                const startOfWeek = moment().startOf('week').format('YYYY-MM-DD');
                const endOfWeek = moment().endOf('week').format('YYYY-MM-DD');
                option = {
                    sdate: startOfWeek,
                    edate: endOfWeek,
                };
                break;
            case '4':
                const startOfMonth = moment().startOf('month').format('YYYY-MM-DD');
                const endOfMonth = moment().endOf('month').format('YYYY-MM-DD');
                option = {
                    sdate: startOfMonth,
                    edate: endOfMonth,
                };
                break;
            case '5':
                option = {
                    sdate: startDay,
                    edate: endDay || startDay,
                };
                break;
            default:
                console.error('Invalid value');
        }
        console.log(option);

        try {
            const userToken = await AsyncStorage.getItem('userToken');
            const response = await axios.post(`${API_URL}/therapist/earnnings`, option, {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${userToken}`,
                },
            });

            console.log(JSON.stringify(response.data), 'response');

            if (response.data.response === true) {
                const res = response.data.data;
                setIsLoading(false);
                setEarningSum((res.earnings_sum).toFixed(2));
                setGstCharges((res.gst_charges).toFixed(2));
                setPayableSum((res.payable_sum).toFixed(2));
                setWalletAmount((res.briefcase).toFixed(2));
                setTdsAmount((res.tds).toFixed(2));
                setPayable((res.payable).toFixed(2))
                setEarningList(response.data.slots)
            } else {
                console.log('not okk');
                setIsLoading(false);
                Alert.alert('Oops..', "Something went wrong", [
                    { text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
                    { text: 'OK', onPress: () => console.log('OK Pressed') },
                ]);
            }
        } catch (e) {
            setIsLoading(false);
            console.error('Fetch error:', e);
            Alert.alert('Oops..', e.response?.data?.message, [
                { text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
                { text: 'OK', onPress: () => console.log('OK Pressed') },
            ]);
        }
    }

    const renderEarningList = ({ item }) => (
        <View style={styles.singleEarningView}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={styles.earningPersonName}>{item?.patient?.name}</Text>
                <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                    <Image
                        source={
                            item?.status === 'completed' ? GreenTick :
                                item?.status === 'cancel' ? RedCross : YellowTck
                        }
                        style={styles.imageStyle}
                    />
                    <Text style={styles.statusText}>
                        {item?.status === 'completed' ? 'Completed' : item?.status === 'cancel' ? 'Cancel' : 'Scheduled'}
                    </Text>
                </View>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: responsiveHeight(1.5) }}>
                <Text style={[styles.indexText, { marginRight: responsiveWidth(2) }]}>Order ID :</Text>
                <Text style={styles.indexText}>{item?.order_id}</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: responsiveHeight(1.5) }}>
                <Text style={[styles.indexText, { marginRight: responsiveWidth(2) }]}>Date :</Text>
                <Text style={styles.indexText}>{moment(item?.date).format('ddd, D MMMM')}, {moment(item?.start_time, 'HH:mm:ss').format('h:mm A')} - {moment(item?.end_time, 'HH:mm:ss').format('h:mm A')}</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: responsiveHeight(1.5) }}>
                <Text style={[styles.indexText, { marginRight: responsiveWidth(2) }]}>Appointment Time :</Text>
                <Text style={styles.indexText}>{moment(item?.end_time, 'HH:mm:ss').diff(moment(item?.start_time, 'HH:mm:ss'), 'minutes')} Min</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: responsiveHeight(1.5) }}>
                <Text style={[styles.indexText, { marginRight: responsiveWidth(2) }]}>Rate :</Text>
                <Text style={styles.indexText}>Rs {item?.therapist_details?.rate} for 30 Min</Text>
            </View>
            <View style={styles.paymentRecevedView}>
                <Image
                    source={Payment}
                    style={styles.paymentIcon}
                />
                <Text style={styles.paymentRecevedText}>Payment Received : ₹ {item?.original_amount}</Text>
            </View>
        </View>
    )

    if (isLoading) {
        return (
            <Loader />
        )
    }


    return (
        <SafeAreaView style={styles.Container}>
            <CustomHeader commingFrom={'Earnings'} onPress={() => navigation.goBack()} title={'Earnings'} />
            <ScrollView style={styles.wrapper}>
                <View style={{ alignItems: 'center', marginBottom: responsiveHeight(3) }}>
                    <View style={styles.outerView}>
                        <View style={styles.insideView}>
                            <Text style={styles.headerText}>Total Earnings</Text>
                            <View style={{ width: responsiveWidth(32), }}>
                                <Dropdown
                                    style={[styles.dropdown, isFocus && { borderColor: 'blue' }]}
                                    placeholderStyle={styles.placeholderStyle}
                                    selectedTextStyle={styles.selectedTextStyle}
                                    inputSearchStyle={styles.inputSearchStyle}
                                    itemTextStyle={styles.selectedTextStyle}
                                    data={data}
                                    //search
                                    maxHeight={300}
                                    labelField="label"
                                    valueField="value"
                                    placeholder={!isFocus ? 'Select item' : '...'}
                                    searchPlaceholder="Search..."
                                    value={value}
                                    onFocus={() => setIsFocus(true)}
                                    onBlur={() => setIsFocus(false)}
                                    onChange={item => {
                                        setValue(item.value);
                                        if (item.value === '5') {
                                            toggleCalendarModal();
                                        } else {
                                            fetchData(item.value);
                                        }
                                        setIsFocus(false);
                                    }}
                                />
                            </View>
                        </View>
                        <Text style={styles.priceText}>₹ {earningSum}</Text>
                        <View style={styles.priceBreakdownView}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Text style={styles.earningText}>Earning Breakdown</Text>
                                <TouchableOpacity onPress={() => setBreakdownVisibility(!breakdownVisibility)}>
                                    <Image
                                        source={breakdownVisibility ? ArrowUp : ArrowDown}
                                        style={{ height: 15, width: 15, resizeMode: 'contain' }}
                                    />
                                </TouchableOpacity>
                            </View>

                            {breakdownVisibility ?
                                <>
                                    <View
                                        style={styles.horizontalLine}
                                    />
                                    <View style={styles.earningItemView}>
                                        <Text style={styles.earningItemText}>Earning (including GST)</Text>
                                        <Text style={styles.earningItemText}>₹ {earningSum}</Text>
                                    </View>
                                    <View style={styles.earningItemView}>
                                        <Text style={styles.earningItemText}>GST </Text>
                                        <Text style={styles.earningItemText}>- ₹ {gstCharges}</Text>
                                    </View>
                                    <View style={styles.earningItemView}>
                                        <Text style={styles.earningItemText}>Earning (excluding GST)</Text>
                                        <Text style={styles.earningItemText}>₹ {payableSum}</Text>
                                    </View>
                                    <View style={styles.earningItemView}>
                                        <Text style={styles.earningItemText}>Wallet Amount</Text>
                                        <Text style={styles.earningItemText}>₹ {walletAmount}</Text>
                                    </View>
                                    <View style={styles.earningItemView}>
                                        <Text style={styles.earningItemText}>TDS</Text>
                                        <Text style={styles.earningItemText}>₹ {tdsAmount}</Text>
                                    </View>
                                    <View style={styles.earningItemView}>
                                        <Text style={styles.earningItemText}>Net Payable</Text>
                                        <Text style={styles.earningItemText}>₹ {payable}</Text>
                                    </View>
                                </> : null}
                        </View>
                    </View>
                    <FlatList
                        data={earningList}
                        renderItem={renderEarningList}
                        keyExtractor={(item) => item.id.toString()}
                        maxToRenderPerBatch={10}
                        windowSize={5}
                        initialNumToRender={10}
                        showsVerticalScrollIndicator={false}
                        onEndReachedThreshold={0.5}
                    />

                </View>
            </ScrollView>
            <Modal
                isVisible={isCalendarModalVisible}
                style={{
                    margin: 0, // Add this line to remove the default margin
                    justifyContent: 'flex-end',
                }}>
                <View style={{ justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff', height: 50, width: 50, borderRadius: 25, position: 'absolute', bottom: '75%', left: '45%', right: '45%' }}>
                    <Icon name="cross" size={30} color="#B0B0B0" onPress={toggleCalendarModal} />
                </View>
                <View style={{ height: '70%', backgroundColor: '#fff', position: 'absolute', bottom: 0, width: '100%' }}>
                    <View style={{ padding: 20 }}>
                        <View style={{ marginBottom: responsiveHeight(3) }}>
                            <Text style={{ color: '#444', fontFamily: 'DMSans-Medium', fontSize: responsiveFontSize(2) }}>Select your date</Text>
                            <Calendar
                                onDayPress={(day) => {
                                    handleDayPress(day)
                                }}
                                //monthFormat={"yyyy MMM"}
                                //hideDayNames={false}
                                markingType={'period'}
                                markedDates={markedDates}
                                theme={{
                                    selectedDayBackgroundColor: '#417AA4',
                                    selectedDayTextColor: 'white',
                                    monthTextColor: '#417AA4',
                                    textMonthFontFamily: 'DMSans-Medium',
                                    dayTextColor: 'black',
                                    textMonthFontSize: 18,
                                    textDayHeaderFontSize: 16,
                                    arrowColor: '#2E2E2E',
                                    dotColor: 'black'
                                }}
                                style={{
                                    borderWidth: 1,
                                    borderColor: '#E3EBF2',
                                    borderRadius: 15,
                                    height: responsiveHeight(50),
                                    marginTop: 20,
                                    marginBottom: 10
                                }}
                            />
                            <View style={styles.buttonwrapper2}>
                                <CustomButton label={"Ok"} onPress={() => { dateRangeSearch() }} />
                            </View>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    )
}


export default EarningScreen


const styles = StyleSheet.create({
    Container: {
        flex: 1,
        backgroundColor: '#fff'
    },
    wrapper: {
        padding: 15,
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
        height: 20,
        width: 20,
        resizeMode: 'contain'
    },
    outerView: {
        //height: responsiveHeight(45),
        width: '100%',
        backgroundColor: '#F4F5F5',
        padding: 20,
        borderRadius: 20,
    },
    insideView: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: responsiveHeight(2)
    },
    headerText: {
        color: '#07273E',
        fontSize: responsiveFontSize(2),
        fontFamily: 'DMSans-Medium'
    },
    priceText: {
        color: '#2D2D2D',
        fontSize: responsiveFontSize(3),
        fontFamily: 'DMSans-Bold',
    },
    priceBreakdownView: {
        // height: responsiveHeight(25),
        width: '100%',
        backgroundColor: '#FFF',
        padding: 20,
        borderRadius: 20,
        marginTop: responsiveHeight(2)
    },
    earningText: {
        color: '#07273E',
        fontSize: responsiveFontSize(2),
        fontFamily: 'DMSans-Medium'
    },
    horizontalLine: {
        borderBottomColor: '#E3E3E3',
        borderBottomWidth: 1,
        marginTop: 10
    },
    earningItemView: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 10
    },
    earningItemText: {
        color: '#746868',
        fontSize: responsiveFontSize(1.7),
        fontFamily: 'DMSans-Regular'
    },
    earningItemTextBold: {
        color: '#444343',
        fontSize: responsiveFontSize(1.7),
        fontFamily: 'DMSans-SemiBold'
    },
    singleEarningView: {
        width: responsiveWidth(91),
        backgroundColor: '#FFF',
        padding: 20,
        borderRadius: 20,
        marginTop: responsiveHeight(2),
        borderColor: '#F4F5F5',
        borderWidth: 2,
    },
    indexText: {
        color: '#444343',
        fontFamily: 'DMSans-Medium',
        fontSize: responsiveFontSize(1.7),

    },
    paymentRecevedView: {
        height: responsiveHeight(5),
        width: responsiveWidth(78),
        marginTop: responsiveHeight(2),
        backgroundColor: '#F4F5F5',
        borderRadius: 15,
        padding: 5,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center'
    },
    paymentIcon: {
        height: 20,
        width: 20,
        resizeMode: 'contain',
        marginRight: 5
    },
    paymentRecevedText: {
        color: '#2D2D2D',
        fontFamily: 'DMSans-SemiBold',
        fontSize: responsiveFontSize(1.7)
    },
    statusText: {
        color: '#444343',
        fontSize: responsiveFontSize(1.7),
        fontFamily: 'DMSans-SemiBold',
        marginLeft: responsiveWidth(1)
    },
    earningPersonName: {
        color: '#2D2D2D',
        fontSize: responsiveFontSize(2),
        fontFamily: 'DMSans-Bold'
    }

});
