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
import LinearGradient from 'react-native-linear-gradient';

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
      <LinearGradient
        colors={['#377172', '#daede6']} // Change these colors as needed
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.outerCircle}
      />
      {/* <View style={styles.innerView}/> */}
      <View style={{ height: responsiveHeight(25), width: '90%', backgroundColor: '#daede6', marginHorizontal: 20, position: 'absolute', top: '20%', borderRadius: 20 }}>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  Container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: responsiveHeight(1),
  },
  outerCircle: {
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    width: '100%',
    height: responsiveHeight(20),
    marginTop: -responsiveHeight(0.5)
  },
  innerView: {
    height: responsiveHeight(25),
    width: '90%',
    backgroundColor: '#daede6',
    marginHorizontal: 20,
    position: 'absolute',
    top: '20%',
    borderRadius: 20
  },


});