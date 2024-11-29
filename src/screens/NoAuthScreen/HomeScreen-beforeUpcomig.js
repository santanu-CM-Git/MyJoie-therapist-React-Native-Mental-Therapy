import React, { useContext, useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  Image,
  RefreshControl,
  TouchableOpacity,
  TouchableWithoutFeedback,
  FlatList,
  StyleSheet,
  Alert,
} from 'react-native';
import Modal from "react-native-modal";
import { AuthContext } from '../../context/AuthContext';
import { getProducts } from '../../store/productSlice'
import Icon from 'react-native-vector-icons/Entypo';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import moment from 'moment-timezone';
import CustomButton from '../../components/CustomButton'
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { add } from '../../store/cartSlice';
import { dateIcon, timeIcon, ArrowGratter, userPhoto, GreenTick, dotIcon, YellowTck, RedCross } from '../../utils/Images';
import Loader from '../../utils/Loader';
import { responsiveFontSize, responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions';
import CustomHeader from '../../components/CustomHeader';
import Carousel from 'react-native-snap-carousel';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from '@env'
import { useFocusEffect } from '@react-navigation/native';
import { Dropdown } from 'react-native-element-dropdown';
import messaging from '@react-native-firebase/messaging';
import LinearGradient from 'react-native-linear-gradient';
import Toast from 'react-native-toast-message';
import { ActivityIndicator } from '@react-native-material/core';


export default function HomeScreen({ navigation }) {

  const dispatch = useDispatch();
  const { data: products, status } = useSelector(state => state.products)
  const { userInfo } = useContext(AuthContext)
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true)
  const [isModalLoading, setIsModalLoading] = useState(false);
  const [value, setValue] = useState('1');
  const [isFocus, setIsFocus] = useState(false);
  const [isCalendarModalVisible, setCalendarModalVisible] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);
  const [startDay, setStartDay] = useState(null);
  const [endDay, setEndDay] = useState(null);
  const [markedDates, setMarkedDates] = useState({});
  const [todaysDate, setTodaysDate] = useState('')
  const [notificationStatus, setNotificationStatus] = useState(false)

  const [sortData, setSortData] = useState([])
  const [groupedSlots, setGroupedSlots] = useState([]);
  const [savePatientDetails, setSavePatientDetails] = useState(null)
  const [modalDetails, setModalDetails] = useState(null)
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [isButtonEnabled, setisButtonEnabled] = useState(false);
  const [therapistSessionHistory, setTherapistSessionHistory] = useState([])
  const [isButtonEnabledForModal, setisButtonEnabledForModal] = useState(null);
  const [earningSum, setEarningSum] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      const nowUTC = new Date();
      // IST is UTC+5:30
      const offsetIST = 5.5 * 60 * 60 * 1000; // 5 hours 30 minutes in milliseconds
      const nowIST = new Date(nowUTC.getTime() + offsetIST);
      console.log("IST Time:", nowIST);
      setCurrentDateTime(nowIST);
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  const getFCMToken = async () => {
    try {
      // if (Platform.OS == 'android') {
      await messaging().registerDeviceForRemoteMessages();
      // }
      const token = await messaging().getToken();
      AsyncStorage.setItem('fcmToken', token)
      //console.log(token, 'fcm token');
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    getFCMToken()

    if (Platform.OS == 'android' || Platform.OS === 'ios') {
      /* this is app foreground notification */
      const unsubscribe = messaging().onMessage(async remoteMessage => {
        if (remoteMessage.notification.title = 'New Booking') {
          fetchUpcomingSlot()
        }
        setNotificationStatus(true)
      });
      return unsubscribe;
    }
  }, [])

  const formatDate = (date) => {
    const options = { weekday: 'long', day: 'numeric', month: 'long' };
    return date.toLocaleDateString('en-US', options);
  };
  const toggleModal = (data, item) => {
    //console.log(data, 'ooooooooooooooo')
    //console.log(item, 'itemmmmmmmmmmmmmmmm')
    if (!isModalVisible) {
      fetchSessionHistory(data.pid)
      //const currentDateTime = currentDateTime;
      //console.log(currentDateTime, 'currentDateTimecurrentDateTimecurrentDateTime')
      const currentDateTime = moment().toDate();
      console.log(currentDateTime, 'currentDateTimecurrentDateTimecurrentDateTime')
      const bookingDateTime = new Date(`${item.date}T${item.start_time}`);
      const endDateTime = new Date(`${item.date}T${item.end_time}`);
      const twoMinutesBefore = new Date(bookingDateTime.getTime() - 2 * 60000); // Two minutes before booking start time
      const isButtonEnabled = currentDateTime >= twoMinutesBefore && currentDateTime <= endDateTime;
      setisButtonEnabledForModal(isButtonEnabled)
    }

    setModalDetails(item)
    setSavePatientDetails(data)
    setModalVisible(!isModalVisible);
  };
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
    //fetchData()
    toggleCalendarModal()
  }

  useEffect(() => {
    //console.log('useEffect called:', currentDateTime, sortData);
    if (sortData.length > 0) {
      updateButtonState();
    }
  }, [currentDateTime, sortData]);

  const updateButtonState = () => {
    if (sortData.length > 0) {
      const currentDateTime = moment().toDate();
      console.log(currentDateTime, 'currentDateTimecurrentDateTimecurrentDateTime')
      const bookingDateTime = new Date(`${sortData.date}T${sortData.start_time}`);
      const endDateTime = new Date(`${sortData.date}T${sortData.end_time}`);
      const twoMinutesBefore = new Date(bookingDateTime.getTime() - 2 * 60000); // Two minutes before booking start time
      const isButtonEnabled = currentDateTime >= twoMinutesBefore && currentDateTime <= endDateTime;
      setisButtonEnabled(isButtonEnabled)
    }
  };

  const fetchUpcomingSlot = async () => {
    try {
      const userToken = await AsyncStorage.getItem('userToken');
      if (!userToken) {
        console.log('No user token found');
        setIsLoading(false);
        return;
      }

      const response = await axios.post(`${API_URL}/therapist/upcomming-slots`, {}, {
        headers: {
          'Accept': 'application/json',
          "Authorization": `Bearer ${userToken}`,
        },
      });

      const { data } = response.data;
      //console.log(JSON.stringify(data), 'fetch upcoming slot');

      if (response.data.response && data.length > 0) {
        const sortedData = data.sort((a, b) => {
          const dateA = new Date(a.date);
          const dateB = new Date(b.date);
          if (dateA < dateB) return -1;
          if (dateA > dateB) return 1;

          const timeA = moment.utc(a.start_time, 'HH:mm:ss').toDate();
          const timeB = moment.utc(b.start_time, 'HH:mm:ss').toDate();
          return timeA - timeB;
        });

        console.log(sortedData[0], 'first booking data');
        setSortData(sortedData[0]);

        const currentDateTime = moment().toDate();
        const bookingDateTime = new Date(`${sortedData[0].date}T${sortedData[0].start_time}`);
        const endDateTime = new Date(`${sortedData[0].date}T${sortedData[0].end_time}`);
        const twoMinutesBefore = new Date(bookingDateTime.getTime() - 2 * 60000); // Two minutes before booking start time
        const isButtonEnabled = currentDateTime >= twoMinutesBefore && currentDateTime <= endDateTime;
        setisButtonEnabled(isButtonEnabled);

        // Group by date
        const groupedData = sortedData.reduce((acc, slot) => {
          const date = moment(slot.date).format('DD-MM-YYYY');
          if (!acc[date]) {
            acc[date] = [];
          }
          acc[date].push(slot);
          return acc;
        }, {});

        console.log(groupedData, 'grouped data');
        setGroupedSlots(groupedData);
      } else {
        setSortData([])
        setGroupedSlots([])
        console.log('No upcoming slots available or response not OK');
        // Alert.alert('No Slots', 'There are no upcoming slots available.', [
        //   {
        //     text: 'OK',
        //     onPress: () => console.log('OK Pressed'),
        //   },
        // ]);

      }

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
  };

  const formatISTTime = (time) => {
    return moment(time, 'HH:mm:ss').format('hh:mm A');
  };

  const cancelBooking = (id) => {
    Alert.alert('Hello', "Are you sure you want to cancel the booking?", [
      {
        text: 'Cancel',
        onPress: () => setIsFocus(!isFocus),
        style: 'cancel',
      },
      {
        text: 'OK', onPress: () => {
          console.log(JSON.stringify(id))
          const option = {
            "booked_slot_id": id
          }
          console.log(option)
          AsyncStorage.getItem('userToken', (err, usertoken) => {
            axios.post(`${API_URL}/therapist/slot-cancel`, option, {
              headers: {
                'Accept': 'application/json',
                "Authorization": 'Bearer ' + usertoken,
                //'Content-Type': 'multipart/form-data',
              },
            })
              .then(res => {
                console.log(JSON.stringify(res.data.data), 'cancel response')
                if (res.data.response == true) {
                  setIsLoading(false);
                  Toast.show({
                    type: 'success',
                    text1: 'Hello',
                    text2: "Schedule cancel successfully",
                    position: 'top',
                    topOffset: Platform.OS == 'ios' ? 55 : 20
                  });
                  toggleModal()
                  fetchUpcomingSlot()
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
      },
    ]);

  }

  const reportBlock = (patientid) => {
    Alert.alert('Hello', "Are you sure you want to block this person?", [
      {
        text: 'Cancel',
        onPress: () => setIsFocus(!isFocus),
        style: 'cancel',
      },
      {
        text: 'OK', onPress: () => {
          const option = {
            "patient_id": patientid,
            "reason": ''
          }
          console.log(option)
          AsyncStorage.getItem('userToken', (err, usertoken) => {
            axios.post(`${API_URL}/therapist/report-block`, option, {
              headers: {
                'Accept': 'application/json',
                "Authorization": 'Bearer ' + usertoken,
                //'Content-Type': 'multipart/form-data',
              },
            })
              .then(res => {
                console.log(JSON.stringify(res.data.data), 'cancel response')
                if (res.data.response == true) {
                  setIsLoading(false);
                  Toast.show({
                    type: 'success',
                    text1: 'Hello',
                    text2: "Patient successfully blocked.",
                    position: 'top',
                    topOffset: Platform.OS == 'ios' ? 55 : 20
                  });
                  toggleModal()
                  fetchUpcomingSlot()
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
      },
    ]);

  }

  const fetchTherapistEarning = async (selectedValue, startDay, endDay) => {
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
        setEarningSum((res.total_incluissive_gst).toFixed(2));
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

  useEffect(() => {
    //fetchData();
    fetchUpcomingSlot()
    fetchTherapistEarning('4')
  }, [])

  useFocusEffect(
    React.useCallback(() => {
      fetchUpcomingSlot()
      fetchTherapistEarning('4')
    }, [])
  )

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchUpcomingSlot()
    fetchTherapistEarning('4')

    setRefreshing(false);
  }, []);

  const fetchSessionHistory = async (patientId) => {
    try {
      const userToken = await AsyncStorage.getItem('userToken');
      if (!userToken) {
        console.log('No user token found');
        //setIsLoading(false);
        return;
      }
      setIsModalLoading(true)
      const option = {
        "patient_id": patientId
      }
      const response = await axios.post(`${API_URL}/therapist/patient-previous-session-check`, option, {
        headers: {
          'Accept': 'application/json',
          "Authorization": `Bearer ${userToken}`,
        },
      });

      const { data } = response.data;
      console.log(JSON.stringify(data), 'fetch session history');
      setTherapistSessionHistory(data)
      setIsModalLoading(false)
    } catch (error) {
      console.log(`Fetch upcoming slot error: ${error}`);
      setIsModalLoading(false)
      Alert.alert('Oops..', error.response?.data?.message || 'Something went wrong', [
        {
          text: 'Cancel',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel',
        },
        { text: 'OK', onPress: () => console.log('OK Pressed') },
      ]);
    } finally {
      setIsModalLoading(false);
    }
  }
  const renderSessionHistory = ({ item }) => (
    <>
      <View style={styles.previousHistoryView}>
        <View style={{ padding: 15 }}>
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
            <Text style={styles.paraValue}>Rs {item?.therapist_details?.rate} for 30 Min</Text>
          </View> */}
          <View style={{ marginTop: responsiveHeight(1.5) }}>
            <Text style={styles.paraIndex}>Session Summary :</Text>
            <Text style={[styles.paraValue, { marginTop: 5 }]}>{item?.prescription_content}</Text>
          </View>
        </View>
      </View>
    </>
  )

  if (isLoading) {
    return (
      <Loader />
    )
  }

  return (
    <SafeAreaView style={styles.Container}>
      <CustomHeader commingFrom={'Home'} onPress={() => navigation.navigate('Notification')} onPressProfile={() => navigation.navigate('Profile')} />
      <ScrollView refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#417AA4" colors={['#417AA4']} />
      }>
        <View style={{ marginBottom: 10 }}>
          <View style={styles.earningView}>
            <Text style={styles.earningText}>Earned this month</Text>
            <Text style={styles.earningAmountText}>₹ {earningSum}</Text>
          </View>
          <Text style={styles.sectionHeader}>Upcoming Appointment</Text>
          {sortData.length !== 0 ?
            <View style={styles.upcomingView}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>

                <Image
                  source={userPhoto}
                  style={styles.userImg}
                />
                <View style={{ flexDirection: 'column', marginLeft: responsiveWidth(3), width: responsiveWidth(45) }}>
                  <Text style={styles.userText}> {sortData?.patient?.name}</Text>
                  <Text style={styles.userSubText}> Patient</Text>
                </View>
                <TouchableOpacity style={[styles.joinButtonView, { opacity: isButtonEnabled ? 1 : 0.5 }]}
                  onPress={() => isButtonEnabled && navigation.navigate('ChatScreen', { details: sortData })}
                  disabled={!isButtonEnabled}
                >
                  {/* <TouchableOpacity style={[styles.joinButtonView]}
                  onPress={() => navigation.navigate('ChatScreen', { details: sortData })}
                >  */}
                  <Text style={styles.joinButtonText}>Join Now</Text>
                </TouchableOpacity>

              </View>
              <View style={styles.dateTimeView}>
                <View style={styles.dateView1}>
                  <Image
                    source={dateIcon}
                    style={styles.datetimeIcon}
                  />
                  <Text style={styles.dateTimeText}>{moment(sortData?.date).format("ddd, DD MMM YYYY")}</Text>
                </View>
                {/* <View style={styles.dividerLine} /> */}
                <View style={styles.dateView2}>
                  <Image
                    source={timeIcon}
                    style={styles.datetimeIcon}
                  />
                  <Text style={styles.dateTimeText}>{moment(sortData?.start_time, 'HH:mm:ss').format('hh:mm A')} - {moment(sortData?.end_time, 'HH:mm:ss').format('hh:mm A')}</Text>
                </View>
              </View>
            </View> :
            <View style={styles.upcomingView}>
              <Text style={{ alignSelf: 'center', fontFamily: 'DMSans-Bold', fontSize: responsiveFontSize(2), color: '#746868' }}>No upcoming appointment yet</Text>
            </View>}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginHorizontal: 15, marginTop: responsiveHeight(2) }}>
            <Text style={{ color: '#2D2D2D', fontFamily: 'DMSans-Bold', fontSize: responsiveFontSize(2) }}>Calender</Text>
            {/* <TouchableOpacity onPress={() => toggleCalendarModal()}> */}
            {/* <Image
              source={dateIcon}
              style={styles.datetimeIcon}
            /> */}
            {/* </TouchableOpacity> */}
          </View>
          {sortData.length !== 0 ?
            Object.keys(groupedSlots).map(date => (
              <View style={styles.scheduleView}>
                <View style={styles.headerView}>
                  <Text style={styles.headerText}>{date}</Text>
                </View>
                {groupedSlots[date].map(slot => (
                  <TouchableOpacity onPress={() => toggleModal({ id: slot?.id, userType: slot?.repeat_user, pname: slot?.patient?.name, pid: slot?.patient?.id, date: date, time: `${formatISTTime(slot.start_time)} - ${formatISTTime(slot.end_time)}` }, slot)}>
                    <View key={slot.id}>
                      <View style={styles.itemnameView}>
                        <Text style={styles.itemnameText}>{slot.patient?.name}</Text>
                        <Image
                          source={ArrowGratter}
                          style={styles.iconstyle}
                        />
                      </View>
                      <View style={styles.itemtimeView}>
                        <View style={styles.flexStyle}>
                          <Text style={styles.itemTimeText}>{`${formatISTTime(slot.start_time)} - ${formatISTTime(slot.end_time)}`}</Text>
                          <View style={[styles.itemTagView, {
                            backgroundColor: slot.repeat_user === 'no' ? '#FF9E45' : '#128807'
                          }]}>
                            <Text style={styles.itemTagText}>{slot.repeat_user === 'no' ? 'New' : 'Repeat'}</Text>
                          </View>
                        </View>
                        <Text style={styles.freeText}>{slot.slot_type === 'free' ? 'Free' : 'Paid'}</Text>
                      </View>
                      <View style={styles.horizontalLine} />
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            ))
            :
            <View style={styles.upcomingView}>
              <Text style={{ alignSelf: 'center', fontFamily: 'DMSans-Bold', fontSize: responsiveFontSize(2), color: '#746868' }}>No schedule so far</Text>
            </View>
          }
        </View>
      </ScrollView>
      <Modal
        isVisible={isModalVisible}
        // onBackdropPress={() => setIsFocus(false)} // modal off by clicking outside of the modal
        style={{
          margin: 0, // Add this line to remove the default margin
          justifyContent: 'flex-end',
        }}>
        <View style={styles.crossIcon}>
          <Icon name="cross" size={30} color="#B0B0B0" onPress={toggleModal} />
        </View>
        {/* <TouchableWithoutFeedback onPress={() => setIsFocus(false)} style={{  }}> */}
        <View style={styles.detailsModalView}>
          <View style={{ padding: 20 }}>
            <View style={styles.flexStyle}>
              <Text style={styles.modalHeaderText}>Patient Details</Text>
              <TouchableOpacity onPress={(e) => {
                e.stopPropagation();
                setIsFocus(!isFocus)
              }}>
                {!isFocus ?
                  <Image
                    source={dotIcon}
                    style={{ height: 25, width: 25, resizeMode: 'contain', }}
                  /> :
                  <Icon name="cross" size={25} color="#B0B0B0" onPress={() => setIsFocus(!isFocus)} />
                }
              </TouchableOpacity>
              {isFocus ?
                <View style={{ width: responsiveWidth(40), backgroundColor: '#fff', height: responsiveHeight(15), position: 'absolute', right: 0, top: 30, zIndex: 10, padding: 10, borderRadius: 15, justifyContent: 'center', elevation: 5 }}>
                  <View style={{ flexDirection: 'column', justifyContent: 'center' }}>
                    <TouchableOpacity onPress={() => cancelBooking(savePatientDetails?.id)}>
                      <Text style={{ color: '#746868', fontFamily: 'DMSans-Regular', fontSize: responsiveFontSize(2), marginVertical: responsiveHeight(1) }}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => reportBlock(savePatientDetails?.pid)}>
                      <Text style={{ color: '#746868', fontFamily: 'DMSans-Regular', fontSize: responsiveFontSize(2), marginVertical: responsiveHeight(1) }}>Report & Block</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                : <></>}

            </View>
            <View style={{ width: responsiveWidth(90), borderRadius: 15, borderColor: '#E3E3E3', borderWidth: 1, marginTop: responsiveHeight(2) }}>
              <View style={{ padding: 15 }}>
                <View style={styles.insidemodalTimedateView}>

                  <Text style={styles.insidemodalTimeText}>{savePatientDetails?.date}</Text>
                  <Text style={styles.insidemodalTimeText}>{savePatientDetails?.time}</Text>
                </View>
                <View style={styles.flexStyle}>
                  <View style={{ flexDirection: 'column' }}>
                    <Text style={styles.insidemodalName}>{savePatientDetails?.pname}</Text>
                    <View style={[styles.insidemodalTagView, {
                      backgroundColor: savePatientDetails?.userType === 'no' ? '#FF9E45' : '#128807'
                    }]}>
                      <Text style={styles.insidemodalTagtext}>{savePatientDetails?.userType === 'no' ? 'New' : 'Repeat'}</Text>
                    </View>
                  </View>
                  <TouchableOpacity style={[{ opacity: isButtonEnabledForModal ? 1 : 0.5 }]}
                    onPress={() => isButtonEnabledForModal && navigation.navigate('ChatScreen', { details: modalDetails })}
                    disabled={!isButtonEnabledForModal}
                  >
                    {/* <TouchableOpacity onPress={() => navigation.navigate('ChatScreen', { details: modalDetails })}> */}
                    <View style={styles.inActiveButtonInsideView}>
                      <Text style={styles.activeButtonInsideText}>Join Now</Text>
                    </View>
                  </TouchableOpacity>
                </View>

              </View>
            </View>

            {modalDetails?.prescription_checked === 'yes' ?
              <>
                {isModalLoading ? (
                  <ActivityIndicator size="small" color="#417AA4" style={{ marginTop: responsiveHeight(10) }} />
                ) : (
                  <FlatList
                    data={therapistSessionHistory}
                    renderItem={renderSessionHistory}
                    keyExtractor={(item) => item.id.toString()}
                    maxToRenderPerBatch={10}
                    windowSize={5}
                    initialNumToRender={10}
                    horizontal={true}
                    showsHorizontalScrollIndicator={false}
                    getItemLayout={(therapistSessionHistory, index) => (
                      { length: 50, offset: 50 * index, index }
                    )}
                  />
                )}
              </>
              :
              null}
          </View>
        </View>
        {/* </TouchableWithoutFeedback> */}
      </Modal>
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
                  selectedDayBackgroundColor: '#339999',
                  selectedDayTextColor: 'white',
                  monthTextColor: '#339999',
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
  );
}

const styles = StyleSheet.create({
  Container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: responsiveHeight(1),
  },
  activeButtonInsideText: {
    color: '#2D2D2D',
    fontFamily: 'DMSans-SemiBold',
    fontSize: responsiveFontSize(1.7)
  },
  inActiveButtonInsideView: {
    backgroundColor: '#EEF8FF',
    height: responsiveHeight(5),
    width: responsiveWidth(35),
    borderRadius: 15,
    borderColor: '#417AA4',
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    alignItems: 'center'
  },
  earningView: {
    height: responsiveHeight(13),
    width: '92%',
    backgroundColor: '#F4F5F5',
    marginHorizontal: 15,
    padding: 20,
    borderRadius: 20,
    marginTop: responsiveHeight(2)
  },
  earningText: {
    color: '#746868',
    fontSize: responsiveFontSize(2),
    fontFamily: 'DMSans-Medium',
    marginBottom: responsiveHeight(2)
  },
  earningAmountText: {
    color: '#2D2D2D',
    fontSize: responsiveFontSize(3),
    fontFamily: 'DMSans-Bold',
  },
  sectionHeader: {
    marginHorizontal: 20,
    marginTop: responsiveHeight(2),
    color: '#2D2D2D',
    fontFamily: 'DMSans-Bold',
    fontSize: responsiveFontSize(2)
  },
  upcomingView: {
    height: responsiveHeight(18),
    width: '92%',
    backgroundColor: '#FFF',
    marginHorizontal: 15,
    padding: 15,
    borderRadius: 20,
    marginTop: responsiveHeight(2),
    elevation: 5
  },
  userImg: {
    height: 50,
    width: 50,
    borderRadius: 25
  },
  userText: {
    color: '#2D2D2D',
    fontSize: responsiveFontSize(2),
    fontFamily: 'DMSans-Bold',
    marginBottom: 5,
  },
  userSubText: {
    color: '#746868',
    fontFamily: 'DMSans-Regular',
    marginRight: 5,
    fontSize: responsiveFontSize(1.5)
  },
  joinButtonView: {
    marginLeft: responsiveWidth(1),
    backgroundColor: '#EEF8FF',
    borderColor: '#417AA4',
    borderWidth: 1,
    padding: 8,
    borderRadius: 20,
    flexDirection: 'row',
    justifyContent: 'center'
  },
  joinButtonText: {
    fontFamily: 'DMSans-Bold',
    color: '#2D2D2D',
    fontSize: responsiveFontSize(1.7)
  },
  dateTimeView: {
    height: responsiveHeight(5),
    width: responsiveWidth(83),
    marginTop: responsiveHeight(2),
    borderColor: '#E3E3E3',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  dateView1: {
    flexDirection: 'row',
    alignItems: 'center',
    width: responsiveWidth(30)
  },
  dateView2: {
    flexDirection: 'row',
    alignItems: 'center',
    width: responsiveWidth(40)
  },
  datetimeIcon: {
    height: 20,
    width: 20,
    resizeMode: 'contain',
    marginRight: responsiveWidth(2)
  },
  dateTimeText: {
    color: '#444343',
    fontFamily: 'DMSans-SemiBold',
    fontSize: responsiveFontSize(1.5)
  },
  dividerLine: {
    height: '80%',
    width: 1,
    backgroundColor: '#E3E3E3',
    marginLeft: 5,
    marginRight: 5
  },
  scheduleView: {
    width: '92%',
    backgroundColor: '#FFF',
    marginHorizontal: 15,
    borderRadius: 20,
    marginTop: responsiveHeight(2),
    elevation: 5
  },
  headerView: {
    flexDirection: 'row',
    height: responsiveHeight(7),
    backgroundColor: '#DEDEDE',
    borderTopRightRadius: 10,
    borderTopLeftRadius: 10,
    alignItems: 'center',
  },
  headerText: {
    color: '#2D2D2D',
    fontFamily: 'DMSans-Bold',
    fontSize: responsiveFontSize(2),
    fontWeight: 'bold',
    textAlign: 'center',
    marginLeft: responsiveWidth(2)
  },
  itemnameView: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginTop: 5
  },
  itemnameText: {
    color: '#2D2D2D',
    fontFamily: 'DMSans-Bold',
    fontSize: responsiveFontSize(2)
  },
  iconstyle: {
    height: 20,
    width: 20,
    resizeMode: 'contain'
  },
  horizontalLine: {
    borderBottomColor: '#E3E3E3',
    borderBottomWidth: 1,
    marginHorizontal: 10,
    marginTop: 5

  },
  itemtimeView: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  freeText: {
    color: '#417AA4',
    fontFamily: 'DMSans-Medium',
    fontSize: responsiveFontSize(1.7)
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
  itemTimeText: {
    color: '#969696',
    fontFamily: 'DMSans-Medium',
    fontSize: responsiveFontSize(1.7)
  },
  itemTagView: {
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 15,
    marginLeft: responsiveWidth(2)
  },
  itemTagText: {
    color: '#FFF',
    fontFamily: 'DMSans-Semibold',
    fontSize: responsiveFontSize(1.5)
  },
  //modal
  crossIcon: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    height: 50,
    width: 50,
    borderRadius: 25,
    position: 'absolute',
    bottom: '78%',
    left: '45%',
    right: '45%'
  },
  detailsModalView: {
    height: '75%',
    backgroundColor: '#fff',
    position: 'absolute',
    bottom: 0,
    width: '100%'
  },
  modalHeaderText: {
    color: '#2D2D2D',
    fontFamily: 'DMSans-Bold',
    fontSize: responsiveFontSize(2)
  },
  previousHistoryView: {
    width: responsiveWidth(89),
    borderRadius: 15,
    borderColor: '#E3E3E3',
    borderWidth: 1,
    marginTop: responsiveHeight(2),
    marginRight: 5
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
  insidemodalTimedateView: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 10
  },
  insidemodalTimeText: {
    color: '#969696',
    fontFamily: 'DMSans-Medium',
    fontSize: responsiveFontSize(1.7)
  },
  insidemodalName: {
    color: '#2D2D2D',
    fontFamily: 'DMSans-Bold',
    fontSize: responsiveFontSize(2),
    marginVertical: 10
  },
  insidemodalTagView: {
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 15,
    width: responsiveWidth(20),
    justifyContent: 'center',
    alignItems: 'center'
  },
  insidemodalTagtext: {
    color: '#FFF',
    fontFamily: 'DMSans-Semibold',
    fontSize: responsiveFontSize(1.5)
  }

});