import React, { useContext, useState, useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  Image,
  TextInput,
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
import moment from 'moment';
import CustomButton from '../../components/CustomButton'
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { add } from '../../store/cartSlice';
import { dateIcon, timeIcon, ArrowGratter, documentImg, infoImg, requestImg, userPhoto, deleteImg, editImg, blockIcon, GreenTick, Payment, dotIcon } from '../../utils/Images';
import Loader from '../../utils/Loader';
import { responsiveFontSize, responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions';
import CustomHeader from '../../components/CustomHeader';
import Carousel from 'react-native-snap-carousel';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from '@env'
import { useFocusEffect } from '@react-navigation/native';
import { Dropdown } from 'react-native-element-dropdown';
import messaging from '@react-native-firebase/messaging';
import LocationServicesDialogBox from "react-native-android-location-services-dialog-box";
import LinearGradient from 'react-native-linear-gradient';
import Toast from 'react-native-toast-message';


export default function HomeScreen({ navigation }) {

  const dispatch = useDispatch();
  const { data: products, status } = useSelector(state => state.products)
  const { userInfo } = useContext(AuthContext)
  const [isLoading, setIsLoading] = useState(true)
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


  const getFCMToken = async () => {
    try {
      // if (Platform.OS == 'android') {
      await messaging().registerDeviceForRemoteMessages();
      // }
      const token = await messaging().getToken();
      AsyncStorage.setItem('fcmToken', token)
      console.log(token, 'fcm token');
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    getFCMToken()

    if (Platform.OS == 'android') {
      /* this is app foreground notification */
      const unsubscribe = messaging().onMessage(async remoteMessage => {
        Alert.alert('A new FCM message arrived!', JSON.stringify(remoteMessage));
        console.log('Received background message:', JSON.stringify(remoteMessage));
        setNotificationStatus(true)
      });
      /* This is for handling background messages */
      messaging().setBackgroundMessageHandler(async remoteMessage => {
        console.log('Received background message:', remoteMessage);
        // Handle background message here
        setNotificationStatus(true)
      });

      return unsubscribe;
    }
  }, [])

  const formatDate = (date) => {
    const options = { weekday: 'long', day: 'numeric', month: 'long' };
    return date.toLocaleDateString('en-US', options);
  };
  const toggleModal = (data) => {
    console.log(data, 'ooooooooooooooo')
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

  const fetchData = (getId) => {


  }

  const dateRangeSearch = () => {
    console.log(startDay)
    console.log(endDay)
    //fetchData()
    toggleCalendarModal()
  }

  const fetchUpcomingSlot = () => {
    AsyncStorage.getItem('userToken', (err, usertoken) => {
      axios.post(`${API_URL}/therapist/upcomming-slots`, {}, {
        headers: {
          'Accept': 'application/json',
          "Authorization": 'Bearer ' + usertoken,
          //'Content-Type': 'multipart/form-data',
        },
      })
        .then(res => {
          console.log(JSON.stringify(res.data.data), 'fetch upcoming slot')
          if (res.data.response == true) {
            const sortedData = res.data.data.sort((a, b) => {
              const dateA = new Date(a.date);
              const dateB = new Date(b.date);
              if (dateA < dateB) return -1;
              if (dateA > dateB) return 1;

              const timeA = moment.utc(a.start_time, 'HH:mm:ss').toDate();
              const timeB = moment.utc(b.start_time, 'HH:mm:ss').toDate();
              return timeA - timeB;
            });
            console.log(sortedData, 'date wise sort data')
            console.log(sortedData[0], 'first booking data')
            setSortData(sortedData[0])

            // Group by date
            const groupedData = sortedData.reduce((acc, slot) => {
              const date = moment(slot.date).format('DD-MM-YYYY');
              if (!acc[date]) {
                acc[date] = [];
              }
              acc[date].push(slot);
              return acc;
            }, {});

            console.log(groupedData, 'grouped data')
            setGroupedSlots(groupedData);
            setIsLoading(false);

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
  const formatISTTime = (time) => {
    return moment(time, 'HH:mm:ss').format('hh:mm A');
  };

  const cancelBooking = (id) => {
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

  useEffect(() => {
    //fetchData();
    fetchUpcomingSlot()
  }, [])

  useFocusEffect(
    React.useCallback(() => {
      fetchUpcomingSlot()
    }, [])
  )

  if (isLoading) {
    return (
      <Loader />
    )
  }

  return (
    <SafeAreaView style={styles.Container}>
      <CustomHeader commingFrom={'Home'} onPress={() => navigation.navigate('Notification')} onPressProfile={() => navigation.navigate('Profile')} />
      <ScrollView>
        <View style={{ marginBottom: 10 }}>
          <View style={styles.earningView}>
            <Text style={styles.earningText}>Earned this month</Text>
            <Text style={styles.earningAmountText}>₹ 5,00,000</Text>
          </View>
          <Text style={styles.sectionHeader}>Upcoming Appointment</Text>
          {sortData?
          <View style={styles.upcomingView}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>

              <Image
                source={userPhoto}
                style={styles.userImg}
              />
              <View style={{ flexDirection: 'column', marginLeft: responsiveWidth(3), width: responsiveWidth(45) }}>
                <Text style={styles.userText}> {sortData?.patient?.name}</Text>
                <Text style={styles.userSubText}> Patient </Text>
              </View>
              <TouchableOpacity style={styles.joinButtonView} onPress={() => navigation.navigate('ChatScreen',{details: sortData})}>
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
          </View>:
          <View style={styles.upcomingView}>
            <Text style={{alignSelf:'center',fontFamily: 'DMSans-Bold', fontSize: responsiveFontSize(2)}}>No upcoming appointment yet</Text>
            </View>}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginHorizontal: 15, marginTop: responsiveHeight(2) }}>
            <Text style={{ color: '#2D2D2D', fontFamily: 'DMSans-Bold', fontSize: responsiveFontSize(2) }}>Calender</Text>
            {/* <TouchableOpacity onPress={() => toggleCalendarModal()}> */}
            <Image
              source={dateIcon}
              style={styles.datetimeIcon}
            />
            {/* </TouchableOpacity> */}
          </View>
          {sortData?
          Object.keys(groupedSlots).map(date => (
            <View style={styles.scheduleView}>
              <View style={styles.headerView}>
                <Text style={styles.headerText}>{date}</Text>
              </View>
              {groupedSlots[date].map(slot => (
                <TouchableOpacity onPress={() => toggleModal({ id: slot?.id, pname: slot?.patient?.name, date: date, time: `${formatISTTime(slot.start_time)} - ${formatISTTime(slot.end_time)}` })}>
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
                        <View style={styles.itemTagView}>
                          <Text style={styles.itemTagText}>New</Text>
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
          <Text style={{alignSelf:'center',fontFamily: 'DMSans-Bold', fontSize: responsiveFontSize(2)}}>No schedule so far</Text>
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
                    <Text style={{ color: '#746868', fontFamily: 'DMSans-Regular', fontSize: responsiveFontSize(2), marginVertical: responsiveHeight(1) }}>Report & Block</Text>

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
                    <View style={styles.insidemodalTagView}>
                      <Text style={styles.insidemodalTagtext}>New</Text>
                    </View>
                  </View>
                  <View style={styles.inActiveButtonInsideView}>
                    <Text style={styles.activeButtonInsideText}>Join Now</Text>
                  </View>
                </View>

              </View>
            </View>
            <ScrollView horizontal={true}>
              <View style={styles.previousHistoryView}>
                <View style={{ padding: 15 }}>
                  <View style={styles.flexStyle}>
                    <Text style={styles.userName}>Rohit Sharma</Text>
                    <View style={styles.flexCenter}>
                      <Image
                        source={GreenTick}
                        style={styles.iconstyle}
                      />
                      <Text style={styles.completedText}>Completed</Text>
                    </View>
                  </View>
                  <View style={styles.paraView}>
                    <Text style={styles.paraIndex}>Order ID :</Text>
                    <Text style={styles.paraValue}>1923659</Text>
                  </View>
                  <View style={styles.paraView}>
                    <Text style={styles.paraIndex}>Date :</Text>
                    <Text style={styles.paraValue}>24-02-2024, 09:30 PM</Text>
                  </View>
                  <View style={styles.paraView}>
                    <Text style={styles.paraIndex}>Appointment Time :</Text>
                    <Text style={styles.paraValue}>60 Min</Text>
                  </View>
                  <View style={styles.paraView}>
                    <Text style={styles.paraIndex}>Rate :</Text>
                    <Text style={styles.paraValue}>Rs 1100 for 30 Min</Text>
                  </View>
                  <View style={{ marginTop: responsiveHeight(1.5) }}>
                    <Text style={styles.paraIndex}>Session Summary :</Text>
                    <Text style={[styles.paraValue, { marginTop: 5 }]}>The consultation session focused on exploring and addressing the patient's mental health concerns. The patient expressed their struggles with anxiety and depressive symptoms, impacting various aspects of their daily life. The therapist employed a person-centered approach, providing a safe and non-judgmental space for the patient to share their experiences.</Text>
                  </View>
                </View>
              </View>
              <View style={styles.previousHistoryView}>
                <View style={{ padding: 15 }}>
                  <View style={styles.flexStyle}>
                    <Text style={styles.userName}>Rohit Sharma</Text>
                    <View style={styles.flexCenter}>
                      <Image
                        source={GreenTick}
                        style={styles.iconstyle}
                      />
                      <Text style={styles.completedText}>Completed</Text>
                    </View>
                  </View>
                  <View style={styles.paraView}>
                    <Text style={styles.paraIndex}>Order ID :</Text>
                    <Text style={styles.paraValue}>1923659</Text>
                  </View>
                  <View style={styles.paraView}>
                    <Text style={styles.paraIndex}>Date :</Text>
                    <Text style={styles.paraValue}>24-02-2024, 09:30 PM</Text>
                  </View>
                  <View style={styles.paraView}>
                    <Text style={styles.paraIndex}>Appointment Time :</Text>
                    <Text style={styles.paraValue}>60 Min</Text>
                  </View>
                  <View style={styles.paraView}>
                    <Text style={styles.paraIndex}>Rate :</Text>
                    <Text style={styles.paraValue}>Rs 1100 for 30 Min</Text>
                  </View>
                  <View style={{ marginTop: responsiveHeight(1.5) }}>
                    <Text style={styles.paraIndex}>Session Summary :</Text>
                    <Text style={[styles.paraValue, { marginTop: 5 }]}>The consultation session focused on exploring and addressing the patient's mental health concerns. The patient expressed their struggles with anxiety and depressive symptoms, impacting various aspects of their daily life. The therapist employed a person-centered approach, providing a safe and non-judgmental space for the patient to share their experiences.</Text>
                  </View>
                </View>
              </View>
            </ScrollView>

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
    backgroundColor: '#ECFCFA',
    height: responsiveHeight(5),
    width: responsiveWidth(35),
    borderRadius: 15,
    borderColor: '#87ADA8',
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    alignItems: 'center'
  },
  earningView: {
    height: responsiveHeight(15),
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
    height: responsiveHeight(20),
    width: '92%',
    backgroundColor: '#FFF',
    marginHorizontal: 15,
    padding: 20,
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
    padding: 10,
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
    paddingVertical: 5,
    backgroundColor: '#FF9E45',
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
    backgroundColor: '#FF9E45',
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