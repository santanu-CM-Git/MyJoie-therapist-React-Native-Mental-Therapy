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
import { allUserImg, chatImg, chatImgRed, documentImg, infoImg, requestImg, userPhoto } from '../../utils/Images';
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

const data = [
  { label: 'Today', value: '1' },
  { label: 'Date Wise', value: '2' },
];

export default function HomeScreen({ navigation }) {

  const dispatch = useDispatch();
  const { data: products, status } = useSelector(state => state.products)
  const { userInfo } = useContext(AuthContext)
  const [isLoading, setIsLoading] = useState(true)
  const [value, setValue] = useState('1');
  const [isFocus, setIsFocus] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);
  const [startDay, setStartDay] = useState(null);
  const [endDay, setEndDay] = useState(null);
  const [markedDates, setMarkedDates] = useState({});
  const [completed, setCompleted] = useState(0);
  const [accepted, setAccepted] = useState(0);
  const [declined, setDeclined] = useState(0);
  const [todayEarning, setTodayearning] = useState(0);
  const [noofDeliverd, setNoofDeliverd] = useState(0)
  const [todaysDate, setTodaysDate] = useState('')
  const [notificationStatus, setNotificationStatus] = useState(false)

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
    LocationServicesDialogBox.checkLocationServicesIsEnabled({
      message: "<font color='#000'>To provide location-based services, we require your permission to access your device's location. Would you like to grant permission?</font>",
      ok: "YES", 
      //cancel: "NO",
      
    }).then(function (success) {
      console.log(success);
    }).catch((error) => {
      console.log(error.message);
    });
  }, [])

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
  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

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
    AsyncStorage.getItem('userToken', (err, usertoken) => {
      const option = {}
      console.log(value, 'bbbbbbbbbbb')
      if (getId == '1') {
        console.log('today')
        const today = new Date();
        const year_today = today.getFullYear();
        const month_today = today.getMonth() + 1; // Months are zero-indexed
        const day_today = today.getDate();
        const formattedDate_for_today = `${year_today}-${month_today < 10 ? '0' + month_today : month_today}-${day_today < 10 ? '0' + day_today : day_today}`;
        console.log(formattedDate_for_today)
        // Get tomorrow's date by adding one day
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const year_tomorrow = tomorrow.getFullYear();
        const month_tomorrow = tomorrow.getMonth() + 1; // Months are zero-indexed
        const day_tomorrow = tomorrow.getDate();
        const formattedDate_for_tomorrow = `${year_tomorrow}-${month_tomorrow < 10 ? '0' + month_tomorrow : month_tomorrow}-${day_tomorrow < 10 ? '0' + day_tomorrow : day_tomorrow}`;
        console.log(formattedDate_for_tomorrow)
        option.to = formattedDate_for_today;
        option.from = formattedDate_for_tomorrow;
      } else {
        if (value == '1') {
          console.log('today')
          const today = new Date();
          const year_today = today.getFullYear();
          const month_today = today.getMonth() + 1; // Months are zero-indexed
          const day_today = today.getDate();
          const formattedDate_for_today = `${year_today}-${month_today < 10 ? '0' + month_today : month_today}-${day_today < 10 ? '0' + day_today : day_today}`;
          console.log(formattedDate_for_today)
          // Get tomorrow's date by adding one day
          const tomorrow = new Date(today);
          tomorrow.setDate(tomorrow.getDate() + 1);
          const year_tomorrow = tomorrow.getFullYear();
          const month_tomorrow = tomorrow.getMonth() + 1; // Months are zero-indexed
          const day_tomorrow = tomorrow.getDate();
          const formattedDate_for_tomorrow = `${year_tomorrow}-${month_tomorrow < 10 ? '0' + month_tomorrow : month_tomorrow}-${day_tomorrow < 10 ? '0' + day_tomorrow : day_tomorrow}`;
          console.log(formattedDate_for_tomorrow)
          option.to = formattedDate_for_today;
          option.from = formattedDate_for_tomorrow;
        } else if (value == '2') {
          option.to = startDay;
          option.from = endDay;
        }
      }

      console.log(option)
      axios.post(`${API_URL}/api/driver/order-item-status-count`, option, {
        headers: {
          "Authorization": 'Bearer ' + usertoken,
          "Content-Type": 'application/json'
        },
      })
        .then(res => {
          console.log(JSON.stringify(res.data))
          if (res.data.response.status.code === 200) {
            setCompleted(res.data.response.records.completed)
            setAccepted(res.data.response.records.accepted)
            setDeclined(res.data.response.records.declined)
            setNoofDeliverd(res.data.response.records.todayCompleted)
            setTodayearning(res.data.response.records.todayEarn)
            const today = new Date();
            const formattedDate = formatDate(today);
            setTodaysDate(formattedDate)
            setIsLoading(false)
          } else {
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
          console.log(e.response.data)
        });
    });

  }

  const dateRangeSearch = () => {
    console.log(startDay)
    console.log(endDay)
    //fetchData()
    toggleModal()
  }

  useEffect(() => {
    //fetchData();
  }, [])

  useFocusEffect(
    React.useCallback(() => {
      //fetchData()
    }, [])
  )

  if (status == 'loading') {
    return (
      <Loader />
    )
  }

  return (
    <SafeAreaView style={styles.Container}>
      <CustomHeader commingFrom={'Home'} onPress={() => navigation.navigate('Notification')} onPressProfile={() => navigation.navigate('Profile')} />
      <View style={styles.wrapper}>
      <ScrollView >
       
        <View style={{ marginBottom: responsiveHeight(2) }}>
          <View style={{ marginTop: responsiveHeight(1) }}>
            <Text style={styles.dashboardHeader}>Dashboard</Text>
          </View>
          
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 15, marginBottom: 10 }}>
            <View style={styles.firstCardView}>
              <View style={{ height: 50, width: 50, borderRadius: 50 / 2, backgroundColor: '#339999', justifyContent: 'center', alignItems: 'center', marginBottom: 10 }}>
                <Text style={styles.secondCardSubText}>{completed}</Text>
              </View>
              <Text style={styles.firstCardText}>Completed Orders</Text>
            </View>

            <View style={styles.firstCardView}>
              <View style={{ height: 50, width: 50, borderRadius: 50 / 2, backgroundColor: '#EB0000', justifyContent: 'center', alignItems: 'center', marginBottom: 10 }}>
                <Text style={styles.secondCardSubText}>{declined}</Text>
              </View>
              <Text style={styles.secondCardText}>Declined Orders</Text>
            </View>

          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10, marginBottom: 10 }}>
            <View style={styles.firstCardView}>
              <View style={{ height: 50, width: 50, borderRadius: 50 / 2, backgroundColor: '#3F709E', justifyContent: 'center', alignItems: 'center', marginBottom: 10 }}>
                <Text style={styles.secondCardSubText}>{accepted}</Text>
              </View>
              <Text style={styles.thirdCardText}>Accepted Orders</Text>
            </View>

            <View style={styles.firstCardView}>
              <View style={{ height: 50, width: 50, borderRadius: 50 / 2, backgroundColor: '#FFCB45', justifyContent: 'center', alignItems: 'center', marginBottom: 10 }}>
                <Text style={styles.secondCardSubText}>05</Text>
              </View>
              <Text style={styles.forthCardText}>Rating</Text>
            </View>

          </View>
          
        </View>
      </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  Container: {
    flex: 1,
    backgroundColor: '#339999',
    paddingTop: responsiveHeight(1),
  },
  wrapper: {
    flex: 1,
    padding: 20,
    //marginBottom: responsiveHeight(12),
    borderTopLeftRadius: 20, // Add border top-left radius
    borderTopRightRadius: 20, // Add border top-right radius
    overflow: 'hidden',
    backgroundColor:'#fff'
  },
  dashboardHeader: {
    color: '#2F2F2F',
    fontFamily: 'Outfit-Medium',
    fontSize: responsiveFontSize(2.5)
  },
  dropdown: {
    height: responsiveHeight(4),
    borderColor: 'gray',
    borderWidth: 0.7,
    borderRadius: 8,
    paddingHorizontal: 8,
    marginTop: 5
  },
  placeholderStyle: {
    fontSize: 16,
    color: '#2F2F2F'
  },
  selectedTextStyle: {
    fontSize: 16,
    color: '#2F2F2F'
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
    color: '#2F2F2F'
  },
  imageStyle: {
    height: 35,
    width: 35,
    marginBottom: 5,
    resizeMode: 'contain'
  },
  earningCardView: {
    height: responsiveHeight(17),
    width: responsiveWidth(89),
    backgroundColor: '#F6F6F6',
    borderRadius: 8,
    flexDirection: 'column',
    //alignItems: 'center',
    //justifyContent: 'center',
    borderColor: '#E0E0E0',
    borderWidth: 1,
    marginTop: responsiveHeight(1),
    marginBottom: responsiveHeight(15),
    padding: 20
  },
  firstCardView: {
    height: responsiveHeight(23),
    width: responsiveWidth(42),
    backgroundColor: '#F6F6F6',
    borderRadius: 8,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: '#E0E0E0',
    borderWidth: 1
  },
  firstCardText: {
    color: '#339999',
    fontFamily: 'Outfit-Bold',
    fontSize: responsiveFontSize(2)
  },
  firstCardSubText: {
    color: '#9C9C9C',
    fontFamily: 'Outfit-Bold',
    fontSize: responsiveFontSize(1.5)
  },
  secondCardView: {
    height: responsiveHeight(25),
    width: responsiveWidth(42),
    backgroundColor: '#DEFFED',
    borderRadius: 8,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center'
  },
  secondCardText: {
    color: '#EB0000',
    fontFamily: 'Outfit-Bold',
    fontSize: responsiveFontSize(2)
  },
  thirdCardText: {
    color: '#3F709E',
    fontFamily: 'Outfit-Bold',
    fontSize: responsiveFontSize(2)
  },
  forthCardText: {
    color: '#FFCB45',
    fontFamily: 'Outfit-Bold',
    fontSize: responsiveFontSize(2)
  },
  secondCardSubText: {
    color: '#FFFFFF',
    fontFamily: 'Outfit-Bold',
    fontSize: responsiveFontSize(2)
  },
  earningCardText: {
    color: '#2F2F2F',
    fontFamily: 'Outfit-Medium',
    fontSize: responsiveFontSize(2)
  },
  earningCardTextAmount: {
    color: '#2F2F2F',
    fontFamily: 'Outfit-Medium',
    fontSize: responsiveFontSize(3),
    marginRight: 10
  },
  verticleLine: {
    height: '100%',
    width: 1,
    backgroundColor: '#909090',
  },
  earningCardTextNo: {
    color: '#2F2F2F',
    fontFamily: 'Outfit-Medium',
    fontSize: responsiveFontSize(2),
    marginLeft: 10
  },
  iconImage: {
    width: 22,
    height: 22,
    resizeMode: 'contain'
  },
  warningPopup: {
    backgroundColor: '#FFCB45',
    height: responsiveHeight(9),
    width: responsiveWidth(89),
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: 'row',
    //justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20
  },
  warningPopupView: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E0E0E0',
    borderWidth: 1,
    height: responsiveHeight(5),
    width: responsiveWidth(20),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10
  },
  warningPopupText: {
    color: '#2F2F2F',
    fontFamily: 'Outfit-Medium',
    fontSize: responsiveFontSize(2),
    marginRight: responsiveWidth(15)
  },
  warningPopupViewText: {
    color: '#2E2E2E',
    fontFamily: 'Outfit-Medium',
    fontSize: responsiveFontSize(2)
  }


});