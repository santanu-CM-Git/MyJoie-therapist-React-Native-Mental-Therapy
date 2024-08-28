import React, { useState, useCallback, useEffect, useRef } from 'react'
import { View, Text, SafeAreaView, StyleSheet, ScrollView, ImageBackground, Image, FlatList, PermissionsAndroid, Alert, BackHandler } from 'react-native'
import { responsiveFontSize, responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { GreenTick, RedCross, YellowTck, audioBgImg, audiooffIcon, audioonIcon, callIcon, chatImg, defaultUserImg, filesendImg, sendImg, speakeroffIcon, speakeronIcon, summaryIcon, userPhoto, videoIcon } from '../../utils/Images'
import { GiftedChat, InputToolbar, Bubble, Send, Composer } from 'react-native-gifted-chat'
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import KeepAwake from 'react-native-keep-awake';
import * as DocumentPicker from 'react-native-document-picker';
import { useRoute } from '@react-navigation/native';
import InChatFileTransfer from '../../components/InChatFileTransfer';
import { API_URL, AGORA_APP_ID } from '@env'
import moment from 'moment-timezone';
import firestore from '@react-native-firebase/firestore'
import Ionicons from 'react-native-vector-icons/Ionicons';
import Icon from 'react-native-vector-icons/Entypo';
import Modal from "react-native-modal";
import AgoraUIKit, { StreamFallbackOptions, PropsInterface, VideoRenderMode, RenderModeType } from 'agora-rn-uikit';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';
// console.log(RenderModeType.RenderModeFit,'kkkkkkkkkkk')
import {
  ClientRoleType,
  createAgoraRtcEngine,
  IRtcEngine,
  ChannelProfileType,
} from 'react-native-agora';
import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'
import Loader from '../../utils/Loader'
import BackgroundTimer from 'react-native-background-timer';


const ChatScreen = ({ navigation, route }) => {
  const routepage = useRoute();
  const [videoCall, setVideoCall] = useState(true);
  const connectionData = {
    appId: AGORA_APP_ID,
    channel: route?.params?.details?.agora_channel_id2,
    token: route?.params?.details?.agora_token2,
    //channel: 'myjoie',
    //token: '007eJxTYCi/5Ol0SJHBQGfb4oOXi54W7nj96cK7f8pGLw9Eba4W/DtJgcHMNM3IJC0xJTnV0MjEPM3SItkizTzZ3DzRyNgoNdki9YnD4bSGQEYGe7OdrIwMEAjiszHkVmblZ6YyMAAAc6cjcA=='
  };

  // Define basic information
  const appId = AGORA_APP_ID;
  const token = route?.params?.details?.agora_token;
  const channelName = route?.params?.details?.agora_channel_id;
  //const token = '007eJxTYCi/5Ol0SJHBQGfb4oOXi54W7nj96cK7f8pGLw9Eba4W/DtJgcHMNM3IJC0xJTnV0MjEPM3SItkizTzZ3DzRyNgoNdki9YnD4bSGQEYGe7OdrIwMEAjiszHkVmblZ6YyMAAAc6cjcA==';
  //const channelName = 'myjoie';
  const uid = 0; // Local user UID, no need to modify

  const rtcCallbacks = {
    EndCall: () => {
      setVideoCall(false);
      setActiveTab('chat')
    }
  };

  const [therapistSessionHistory, setTherapistSessionHistory] = useState([])
  const [messages, setMessages] = useState([])
  const [therapistId, setTherapistId] = useState(route?.params?.details?.therapist?.id)
  const [therapistProfilePic, setTherapistProfilePic] = useState(route?.params?.details?.therapist?.profile_pic)
  const [patientId, setPatientId] = useState(route?.params?.details?.patient?.id)
  const [patientProfilePic, setPatientProfilePic] = useState(route?.params?.details?.patient?.profile_pic)
  const [chatgenidres, setChatgenidres] = useState(route?.params?.details?.booking_uuid);
  const [isAttachImage, setIsAttachImage] = useState(false);
  const [isAttachFile, setIsAttachFile] = useState(false);
  const [imagePath, setImagePath] = useState('');
  const [filePath, setFilePath] = useState('');
  const [fileVisible, setFileVisible] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('chat')
  const [isLoading, setIsLoading] = useState(true)
  const [timer, setTimer] = useState(0);
  const [endTime, setEndTime] = useState(null);
  const intervalRef = useRef(null);
  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

  useEffect(() => {
    console.log(routepage.name);
    if (routepage.name === 'ChatScreen') {
      const backAction = () => {
        // Prevent the default back button action
        return true;
      };

      // Add event listener to handle the back button
      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        backAction
      );

      // Clean up the event listener when the component unmounts
      return () => backHandler.remove();
    }
  }, [routepage]);

  useEffect(() => {
    if (endTime) {
      intervalRef.current = BackgroundTimer.setInterval(() => {
        const currentTime = new Date();
        const endDate = moment(endTime, 'HH:mm:ss').toDate();
        const timeDifferenceInSeconds = Math.max(0, Math.floor((endDate - currentTime) / 1000));
        if (timeDifferenceInSeconds <= 0) {
          BackgroundTimer.clearInterval(intervalRef.current);
          handleTimerEnd();
        }
        setTimer(timeDifferenceInSeconds);
      }, 1000);

      return () => BackgroundTimer.clearInterval(intervalRef.current);
    }
  }, [endTime]);

  const formatTime = (totalSeconds) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // const requestPermissions = async () => {
  //   try {
  //     if (Platform.OS === 'android') {
  //       // Request audio and camera permissions for Android
  //       const audioPermission = await request(PERMISSIONS.ANDROID.RECORD_AUDIO);
  //       const cameraPermission = await request(PERMISSIONS.ANDROID.CAMERA);

  //       if (audioPermission === RESULTS.GRANTED && cameraPermission === RESULTS.GRANTED) {
  //         console.log('Audio and camera permissions granted');
  //       } else {
  //         console.log('Audio and camera permissions not granted');
  //         Alert.alert('Permissions Required', 'Audio and camera permissions are required for this feature.');
  //       }
  //     } else if (Platform.OS === 'ios') {
  //       // Request audio and camera permissions for iOS
  //       const audioPermission = await request(PERMISSIONS.IOS.MICROPHONE);
  //       const cameraPermission = await request(PERMISSIONS.IOS.CAMERA);

  //       if (audioPermission === RESULTS.GRANTED && cameraPermission === RESULTS.GRANTED) {
  //         console.log('Audio and camera permissions granted');
  //       } else {
  //         console.log('Audio and camera permissions not granted');
  //         Alert.alert('Permissions Required', 'Audio and camera permissions are required for this feature.');
  //       }
  //     }
  //   } catch (error) {
  //     console.error('Permission request error:', error);
  //   }
  // };

  useEffect(() => {
    // //receivedMsg()
    //requestPermissions();
    setupVideoSDKEngine();
    KeepAwake.activate();
    console.log(route?.params?.details, 'details from home page')
    fetchSessionHistory()
    sessionStart()
  }, [])

  const sessionStart = async () => {
    setIsLoading(true);
    const currentTime = moment().format('HH:mm:ss');
    const option = {
      "booked_slot_id": route?.params?.details?.id,
      "time": currentTime,
    };
    console.log('Request Payload:', option);

    try {
      // Retrieve user token
      const userToken = await AsyncStorage.getItem('userToken');
      if (!userToken) {
        throw new Error('User token is missing');
      }

      // Make API request
      const res = await axios.post(`${API_URL}/therapist/slot-start`, option, {
        headers: {
          Accept: 'application/json',
          "Authorization": `Bearer ${userToken}`,
        },
      });

      // Handle API response
      if (res.data.response === true) {
        const endTime = route?.params?.details?.end_time;
        setEndTime(endTime); // Set the end time

        const mode = route?.params?.details?.mode_of_conversation;

        switch (mode) {
          case 'chat':
            setActiveTab('chat');
            setVideoCall(false);
            await leave();
            break;
          case 'audio':
            await join();
            setActiveTab('audio');
            setVideoCall(false);
            break;
          case 'video':
            await setupVideoSDKEngine()
            setActiveTab('video');
            setVideoCall(true);
            break;
        }

        setIsLoading(false);
      } else {
        console.log('API Response Error:', res.data);
        Alert.alert('Oops..', "Something went wrong", [
          { text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
          { text: 'OK', onPress: () => console.log('OK Pressed') },
        ]);
        setIsLoading(false);
      }
    } catch (e) {
      setIsLoading(false);
      console.error('Session Start Error:', e);

      // Handle specific API errors if available
      const errorMessage = e.response?.data?.message || 'An unexpected error occurred';
      Alert.alert('Oops..', errorMessage, [
        { text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
        { text: 'OK', onPress: () => console.log('OK Pressed') },
      ]);
    }
  };

  const confirmEnd = () => {
    Alert.alert(
      'Confirm End',
      'Are you sure you want to end this session?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'OK',
          onPress: () => handleTimerEnd(),
        },
      ],
      { cancelable: false }
    );
  };

  const handleTimerEnd = async () => {
    console.log('Timer has ended. Execute your function here.');
    const currentTime = moment().format('HH:mm:ss');
    const option = {
      "booked_slot_id": route?.params?.details?.id,
      "time": currentTime
    }
    console.log(option);

    try {
      const userToken = await AsyncStorage.getItem('userToken');
      if (!userToken) {
        throw new Error('User token is missing');
      }

      const res = await axios.post(`${API_URL}/therapist/slot-complete`, option, {
        headers: {
          Accept: 'application/json',
          "Authorization": 'Bearer ' + userToken,
        },
      });

      if (res.data.response === true) {
        setVideoCall(false);
        await leave();
        navigation.navigate('UploadSessionSummary', {
          bookedId: route?.params?.details?.id,
          pname: route?.params?.details?.patient?.name
        });
      } else {
        console.log('not ok');
        setIsLoading(false);
        Alert.alert('Oops..', "Something went wrong", [
          {
            text: 'Cancel',
            onPress: () => console.log('Cancel Pressed'),
            style: 'cancel',
          },
          { text: 'OK', onPress: () => console.log('OK Pressed') },
        ]);
      }
    } catch (e) {
      setIsLoading(false);
      console.error('User update error:', e);
      console.error(e.response?.data?.response?.records);

      const errorMessage = e.response?.data?.message || 'An unexpected error occurred';
      Alert.alert('Oops..', errorMessage, [
        {
          text: 'Cancel',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel',
        },
        { text: 'OK', onPress: () => console.log('OK Pressed') },
      ]);
    }
  };


  const renderChatFooter = useCallback(() => {
    if (imagePath) {
      return (
        <View style={styles.chatFooter}>
          <Image source={{ uri: imagePath }} style={{ height: 75, width: 75 }} />
          <TouchableOpacity
            onPress={() => setImagePath('')}
            style={styles.buttonFooterChatImg}
          >
            <Text style={styles.textFooterChat}>X</Text>
          </TouchableOpacity>
        </View>
      );
    }
    if (filePath) {
      return (
        <View style={styles.chatFooter}>
          <InChatFileTransfer
            filePath={filePath}
          />
          <TouchableOpacity
            onPress={() => setFilePath('')}
            style={styles.buttonFooterChat}
          >
            <Text style={styles.textFooterChat}>X</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return null;
  }, [filePath, imagePath]);

  const customtInputToolbar = props => {
    return (
      <InputToolbar
        {...props}
        containerStyle={{
          marginLeft: 15,
          marginRight: 15,
          backgroundColor: "#E8E8E8",
          alignContent: "center",
          justifyContent: "center",
          borderWidth: 0,
          paddingTop: 6,
          borderRadius: 30,
          borderTopColor: "transparent",

        }}
      />
    );
  };
  const customRenderComposer = props => {
    return (
      <Composer
        {...props}
        textInputStyle={{
          color: '#000', // Change this to your desired text color
        }}
      />
    );
  };

  const renderSend = (props) => {
    return (

      <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
        {/* <TouchableOpacity onPress={_pickDocument}>
          <Image
            source={filesendImg}
            style={styles.imageView1}
          />
        </TouchableOpacity> */}
        <Send {...props}>
          <Image
            source={sendImg}
            style={styles.imageView2}
          />
        </Send>
      </View>

    );
  };

  const renderBubble = (props) => {
    const { currentMessage } = props;
    if (currentMessage.file && currentMessage.file.url) {
      return (
        <TouchableOpacity
          style={{
            ...styles.fileContainer,
            backgroundColor: props.currentMessage.user._id === 2 ? '#ECFCFA' : '#EAECF0',
            borderBottomLeftRadius: props.currentMessage.user._id === 2 ? 15 : 5,
            borderBottomRightRadius: props.currentMessage.user._id === 2 ? 5 : 15,
          }}
          onPress={() => setFileVisible(true)}
        >

          <View style={{ flexDirection: 'column' }}>
            <Text style={{
              ...styles.fileText,
              color: currentMessage.user._id === 2 ? '#2D2D2D' : '#2D2D2D',
            }} >
              {currentMessage.text}
            </Text>
          </View>
        </TouchableOpacity>
      );
    }
    return (
      <Bubble
        {...props}
        wrapperStyle={{
          right: {
            backgroundColor: '#EEF8FF',
          },
        }}
        textStyle={{
          right: {
            color: '#2D2D2D',
            fontFamily: 'DMSans-Regular'
          },
          left: {
            color: '#2D2D2D',
            fontFamily: 'DMSans-Regular'
          },
        }}
        timeTextStyle={{
          left: {
            color: '#8A91A8', // Change the color of timestamp text for left bubbles
          },
          right: {
            color: '#8A91A8', // Change the color of timestamp text for right bubbles
          }
        }}
      />
    );
  };

  const scrollToBottomComponent = () => {
    return <FontAwesome name="angle-double-down" size={28} color="#000" />;
  };


  useEffect(() => {
    const docid = chatgenidres;
    const messageRef = firestore().collection('chatrooms')
      .doc(docid)
      .collection('messages')
      .orderBy('createdAt', "desc")

    const unSubscribe = messageRef.onSnapshot((querySnap) => {
      const allmsg = querySnap.docs.map(docSanp => {
        const data = docSanp.data()
        if (data.createdAt) {
          return {
            ...docSanp.data(),
            createdAt: docSanp.data().createdAt.toDate()
          }
        } else {
          return {
            ...docSanp.data(),
            createdAt: new Date()
          }
        }

      })
      setMessages(allmsg)
    })


    return () => {
      unSubscribe()
    }
  }, [])

  const onSend = (messageArray) => {
    console.log(messageArray)
    const msg = messageArray[0]
    const mymsg = {
      ...msg,
      sentBy: therapistId,
      sentTo: patientId,
      createdAt: new Date()
    }
    setMessages(previousMessages => GiftedChat.append(previousMessages, mymsg))
    const docid = chatgenidres;

    firestore().collection('chatrooms')
      .doc(docid)
      .collection('messages')
      .add({ ...mymsg, createdAt: firestore.FieldValue.serverTimestamp() })


  }


  // audio call 
  const agoraEngineRef = useRef(<IRtcEngine></IRtcEngine>); // IRtcEngine instance
  const [isJoined, setIsJoined] = useState(false); // Whether the local user has joined the channel
  const [remoteUid, setRemoteUid] = useState(0); // Remote user UID
  const [message, setMessage] = useState(''); // User prompt message
  const [micOn, setMicOn] = useState(true); // Microphone state
  const [speakerOn, setSpeakerOn] = useState(false); // Loudspeaker state

  function showMessage(msg) {
    setMessage(msg);
  }

  const getPermission = async () => {
    if (Platform.OS === 'android') {
      await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
      ]);
    }
  };

  const setupVideoSDKEngine = async () => {
    try {
      // Create RtcEngine after checking and obtaining device permissions
      if (Platform.OS === 'android') {
        await getPermission();
      }
      agoraEngineRef.current = createAgoraRtcEngine();
      const agoraEngine = agoraEngineRef.current;

      // Register event callbacks
      agoraEngine.registerEventHandler({
        onJoinChannelSuccess: () => {
          showMessage('Successfully joined the channel: ' + channelName);
          setIsJoined(true);
        },
        onUserJoined: (_connection, Uid) => {
          showMessage('Remote user ' + Uid + ' has joined');
          setRemoteUid(Uid);
        },
        onUserOffline: (_connection, Uid) => {
          showMessage('Remote user ' + Uid + ' has left the channel');
          setRemoteUid(0);
        },
      });
      // Initialize the engine
      agoraEngine.initialize({
        appId: appId,
      });
    } catch (e) {
      console.log(e);
    }
  };

  const toggleMic = () => {
    try {
      const agoraEngine = agoraEngineRef.current;
      if (micOn) {
        agoraEngine?.muteLocalAudioStream(true);
        showMessage('Microphone muted');
      } else {
        agoraEngine?.muteLocalAudioStream(false);
        showMessage('Microphone unmuted');
      }
      setMicOn(!micOn);
    } catch (e) {
      console.log(e);
    }
  };

  const toggleSpeaker = () => {
    try {
      const agoraEngine = agoraEngineRef.current;
      if (speakerOn) {
        agoraEngine?.setEnableSpeakerphone(false);
        showMessage('Speaker disabled');
      } else {
        agoraEngine?.setEnableSpeakerphone(true);
        showMessage('Speaker enabled');
      }
      setSpeakerOn(!speakerOn);
    } catch (e) {
      console.log(e);
    }
  };

// Define the join method called after clicking the join channel button
const join = async () => {
  if (isJoined) {
    console.log('Already joined the channel');
    return;
  }
  try {
    if (!agoraEngineRef.current) {
      throw new Error('Agora engine is not initialized');
    }

    console.log('Setting channel profile...');
    await agoraEngineRef.current.setChannelProfile(
      ChannelProfileType.ChannelProfileCommunication
    );

    console.log('Joining channel...');
    await agoraEngineRef.current.joinChannel(token, channelName, uid, {
      clientRoleType: ClientRoleType.ClientRoleBroadcaster,
    });

    setIsJoined(true);
    console.log('Joined the channel successfully');
  } catch (e) {
    console.error('Failed to join the channel:', e);
  }
};


// Define the leave method called after clicking the leave channel button
const leave = async () => {
  try {
    if (!agoraEngineRef.current) {
      throw new Error('Agora engine is not initialized');
    }

    console.log('Leaving channel...');
    await agoraEngineRef.current.leaveChannel();
    setRemoteUid(0);
    setIsJoined(false);
    console.log('Left the channel successfully');
  } catch (e) {
    console.error('Failed to leave the channel:', e);
  }
};

  const goingToactiveTab = async (name) => {
    if (name === 'audio') {
      setVideoCall(false);
      await join();
      setActiveTab('audio');
    } else if (name === 'video') {
      await leave();
      setActiveTab('video');
      setVideoCall(true);
    } else if (name === 'chat') {
      await leave();
      setActiveTab('chat');
      setVideoCall(false);
    }
  };

  // const goingToactiveTab = async (name) => {
  //   console.log(`Switching to ${name} tab...`);
  
  //   // Avoid redundant actions if already on the desired tab
  //   if (name === activeTab) return;
  
  //   try {
  //     // Only leave the channel if we are in a different channel
  //     if (activeTab === 'video' || activeTab === 'audio' || activeTab === 'chat') {
  //       console.log(`Leaving ${activeTab} channel...`);
  //       await leave(); // Ensure the leave operation completes
  //     }
  
  //     // Update active tab state
  //     setActiveTab(name);
  
  //     // Join the new channel/tab if applicable
  //     if (name === 'audio' || name === 'video') {
  //       console.log(`Joining ${name} channel...`);
  //       await join(); // Ensure the join operation completes
  //     }
  
  //     if (name === 'video') {
  //       setVideoCall(true);
  //     } else if (name === 'audio') {
  //       setVideoCall(false);
  //     }
  //   } catch (error) {
  //     console.error('Error while switching tabs:', error);
  //   }
  // };

  const customPropsStyle = {
    localBtnStyles: {
      endCall: {
        height: 40,
        width: 40,
        backgroundColor: '#e43',
        borderWidth: 0,
        marginLeft: 5,
      },
      switchCamera: {
        height: 40,
        width: 40,
        backgroundColor: '#8D9095',
        borderWidth: 0,
      },
      muteLocalAudio: {
        height: 40,
        width: 40,
        backgroundColor: '#8D9095',
        borderWidth: 0,
      },
      muteLocalVideo: {
        height: 40,
        width: 40,
        backgroundColor: '#8D9095',
        borderWidth: 0,
      },
    },
    maxViewStyles: {
      flex: 1,
      alignSelf: 'stretch',
    },
    UIKitContainer: {
      flex: 1,
    },
    localBtnContainer: {
      backgroundColor: 'rgba(52, 52, 52, 0.8)',
      height: responsiveHeight(10),
      borderRadius: 50,
      alignItems: 'center',
      position: 'absolute',
      bottom: 5
    },
    theme: '#ffffffee',
    iconSize: 25,
    VideoRenderMode: RenderModeType.RenderModeFit,
    remoteVideo: {
      width: '100%',
      height: '100%',
      aspectRatio: 9 / 16,
    },
  };
  const agoraConfig = {
    appId: connectionData.appId,
    channelProfile: 1, // Live broadcasting profile
    videoEncoderConfig: {
      width: 720,
      height: 1280, // Portrait dimensions
      bitrate: 1130,
      frameRate: 15,
      orientationMode: 'fixedPortrait',  // Force portrait mode
    },
    // other configurations
  };

  const fetchSessionHistory = async () => {
    try {
      const userToken = await AsyncStorage.getItem('userToken');
      if (!userToken) {
        console.log('No user token found');
        //setIsLoading(false);
        return;
      }
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
      //setIsLoading(false);
    }
  }

  const renderSessionHistory = ({ item }) => (
    <View style={styles.sessionHistoryView}>
      <View style={{ padding: 15 }}>
        <View style={styles.sessionHistoryInfo}>
          <Text style={styles.sessionHistoryInfoName}>{item?.patient?.name}</Text>
          <View style={styles.sessionHistoryImgView}>
            <Image
              source={
                item?.status === 'completed' ? GreenTick :
                  item?.status === 'scheduled' ? YellowTck :
                    item?.status === 'cancel' ? RedCross :
                      null // You can set a default image or handle the null case appropriately
              }
              style={styles.sessionHistoryImg}
            />
            <Text style={styles.sessionHistoryStatus}>
              {item?.status === 'completed' ? 'Completed' : item?.status === 'cancel' ? 'Cancel' : 'Scheduled'}
            </Text>
          </View>
        </View>
        <View style={styles.sessionHistorySection1}>
          <Text style={styles.sessionHistorySection1Header}>Order ID :</Text>
          <Text style={styles.sessionHistorySection1Value}>{item?.order_id}</Text>
        </View>
        <View style={styles.sessionHistorySection1}>
          <Text style={styles.sessionHistorySection1Header}>Date :</Text>
          <Text style={styles.sessionHistorySection1Value}>{moment(item?.date).format('ddd, D MMMM')}, {moment(item?.start_time, 'HH:mm:ss').format('h:mm A')} - {moment(item?.end_time, 'HH:mm:ss').format('h:mm A')}</Text>
        </View>
        <View style={styles.sessionHistorySection1}>
          <Text style={styles.sessionHistorySection1Header}>Appointment Time :</Text>
          <Text style={styles.sessionHistorySection1Value}>{moment(item?.end_time, 'HH:mm:ss').diff(moment(item?.start_time, 'HH:mm:ss'), 'minutes')} Min</Text>
        </View>
        {/* <View style={styles.sessionHistorySection1}>
          <Text style={styles.sessionHistorySection1Header}>Rate :</Text>
          <Text style={styles.sessionHistorySection1Value}>Rs {item?.therapist_details?.rate} for 30 Min</Text>
        </View> */}
        <View style={{ marginTop: responsiveHeight(1.5) }}>
          <Text style={styles.sessionHistorySection1Header}>Session Summary :</Text>
          <Text style={[styles.sessionHistorySection1Value, { marginTop: 5 }]}>{item?.prescription_content}</Text>
        </View>
      </View>
    </View>

  )

  if (isLoading) {
    return (
      <Loader />
    )
  }

  return (
    <SafeAreaView style={styles.Container} behavior="padding" keyboardVerticalOffset={30} enabled>
      {/* <CustomHeader commingFrom={'chat'} onPress={() => navigation.goBack()} title={'Admin Community'} /> */}
      <View style={styles.Containerheader}>
        <View style={styles.HeaderSectionHalf}>
          <Ionicons name="chevron-back" size={25} color="#000" />
          <View style={{ flexDirection: 'column', marginLeft: 10 }}>
            <Text style={styles.therapistName}>{route?.params?.details?.patient?.name}</Text>
            <Text style={styles.therapistDesc}>Patient</Text>
          </View>
        </View>
        <View style={styles.HeaderSectionHalf}>
          <Text style={styles.timerText}>{formatTime(timer)}</Text>
          <TouchableOpacity onPress={() => confirmEnd()}>
            <View style={styles.endButtonView}>
              <Text style={styles.endButtonText}>End</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.TabSection}>
        {activeTab == 'chat' ?
          <>
            <TouchableOpacity onPress={() => goingToactiveTab('audio')}>
              <View style={styles.ButtonView}>
                <Image
                  source={callIcon}
                  style={styles.ButtonImg}
                />
                <Text style={styles.ButtonText}>Switch to Audio Call</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => goingToactiveTab('video')}>
              <View style={styles.ButtonView}>
                <Image
                  source={videoIcon}
                  style={styles.ButtonImg}
                />
                <Text style={styles.ButtonText}>Switch to Video Call</Text>
              </View>
            </TouchableOpacity>
          </>
          : activeTab == 'audio' ?
            <>
              <TouchableOpacity onPress={() => goingToactiveTab('chat')}>
                <View style={styles.ButtonView}>
                  <Image
                    source={chatImg}
                    style={styles.ButtonImg}
                  />
                  <Text style={styles.ButtonText}>Switch to Chat</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => goingToactiveTab('video')}>
                <View style={styles.ButtonView}>
                  <Image
                    source={videoIcon}
                    style={styles.ButtonImg}
                  />
                  <Text style={styles.ButtonText}>Switch to Video Call</Text>
                </View>
              </TouchableOpacity>
            </>
            :
            <>
              <TouchableOpacity onPress={() => goingToactiveTab('chat')}>
                <View style={styles.ButtonView}>
                  <Image
                    source={chatImg}
                    style={styles.ButtonImg}
                  />
                  <Text style={styles.ButtonText}>Switch to Chat</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => goingToactiveTab('audio')}>
                <View style={styles.ButtonView}>
                  <Image
                    source={callIcon}
                    style={styles.ButtonImg}
                  />
                  <Text style={styles.ButtonText}>Switch to Audio Call</Text>
                </View>
              </TouchableOpacity>
            </>
        }
      </View>
      {route?.params?.details?.prescription_checked === 'yes' ?
        <TouchableOpacity onPress={() => toggleModal()}>
          <View style={{ width: responsiveWidth(95), height: responsiveHeight(6), backgroundColor: '#fff', borderRadius: 10, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', alignSelf: 'center', marginTop: responsiveHeight(1) }}>
            <Image
              source={summaryIcon}
              style={styles.ButtonImg}
            />
            <Text style={styles.ButtonText}>Previous Session Summary</Text>
          </View>
        </TouchableOpacity> : null}
      <View style={{ height: route?.params?.details?.prescription_checked === 'yes' ? responsiveHeight(75) : responsiveHeight(80), width: responsiveWidth(100), backgroundColor: '#FFF', position: 'absolute', bottom: 0, paddingBottom: 10, borderTopLeftRadius: 20, borderTopRightRadius: 20 }}>
        {activeTab == 'chat' ?
          <GiftedChat
            messages={messages}
            renderInputToolbar={props => customtInputToolbar(props)}
            renderComposer={customRenderComposer}
            renderBubble={renderBubble}
            isTyping
            alwaysShowSend
            scrollToBottom
            scrollToBottomComponent={scrollToBottomComponent}
            renderChatFooter={renderChatFooter}
            renderSend={renderSend}
            onSend={messages => onSend(messages)}
            style={styles.messageContainer}
            user={{
              _id: therapistId,
              //avatar: { uri: therapistProfilePic },
            }}
            renderAvatar={null}
          //user={user}
          />
          : activeTab == 'audio' ?
            <>
              <ImageBackground source={audioBgImg} blurRadius={10} style={styles.AudioBackground}>
                {route?.params?.details?.patient?.profile_pic ?
                  <Image
                    source={{ uri: route?.params?.details?.patient?.profile_pic }}
                    style={styles.buttonImage}
                  /> :
                  <Image
                    source={defaultUserImg}
                    style={styles.buttonImage}
                  />}
                <Text style={styles.audioSectionTherapistName}>{route?.params?.details?.patient?.name}</Text>
                <View style={styles.audioButtonSection}>
                  {micOn ?
                    <TouchableOpacity onPress={() => toggleMic()}>
                      <Image
                        source={audioonIcon}
                        style={styles.iconStyle}
                      />
                    </TouchableOpacity> :
                    <TouchableOpacity onPress={() => toggleMic()}>
                      <Image
                        source={audiooffIcon}
                        style={styles.iconStyle}
                      />
                    </TouchableOpacity>}
                  {speakerOn ?
                    <TouchableOpacity onPress={() => toggleSpeaker()}>
                      <Image
                        source={speakeroffIcon}
                        style={styles.iconStyle}
                      />
                    </TouchableOpacity> :
                    <TouchableOpacity onPress={() => toggleSpeaker()}>
                      <Image
                        source={speakeronIcon}
                        style={styles.iconStyle}
                      />
                    </TouchableOpacity>}
                </View>
              </ImageBackground>
            </>

            :
            <>
              {videoCall ? (
                <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
                  {/* Agora Video Component */}
                  <View style={{ height: route?.params?.details?.prescription_checked === 'yes' ? responsiveHeight(75) : responsiveHeight(80) }}>
                    <AgoraUIKit connectionData={connectionData} rtcCallbacks={rtcCallbacks}
                      styleProps={customPropsStyle} agoraConfig={agoraConfig}
                    />
                  </View>

                </SafeAreaView>
              ) : (
                <Text onPress={() => {
                  setVideoCall(true);
                }}>
                  Start Call
                </Text>
              )}
            </>
        }
      </View>
      <Modal
        isVisible={isModalVisible}
        // onBackdropPress={() => setIsFocus(false)} // modal off by clicking outside of the modal
        style={{
          margin: 0, // Add this line to remove the default margin
          justifyContent: 'flex-end',
        }}>
        <View style={{ justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff', height: 50, width: 50, borderRadius: 25, position: 'absolute', bottom: '55%', left: '45%', right: '45%' }}>
          <Icon name="cross" size={30} color="#B0B0B0" onPress={toggleModal} />
        </View>
        {/* <TouchableWithoutFeedback onPress={() => setIsFocus(false)} style={{  }}> */}
        <View style={{ height: '52%', backgroundColor: '#fff', position: 'absolute', bottom: 0, width: '100%' }}>
          <View style={{ paddingVertical: 10 }}>
            {therapistSessionHistory.length > 0 ?
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
              /> :
              <Text style={[styles.therapistName, { alignSelf: 'center', paddingTop: responsiveHeight(20) }]}>No previous session summary</Text>
            }

          </View>
        </View>
        {/* </TouchableWithoutFeedback> */}
      </Modal>
    </SafeAreaView>
  )
}

export default ChatScreen

const styles = StyleSheet.create({
  Container: {
    flex: 1,
    backgroundColor: '#EAECF0',
    paddingBottom: 10,
  },
  Containerheader: {
    height: responsiveHeight(10),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 5
  },
  HeaderSectionHalf: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  therapistName: { color: '#2D2D2D', fontFamily: 'DMSans-Bold', fontSize: responsiveFontSize(2) },
  therapistDesc: { color: '#444343', fontFamily: 'DMSans-Medium', fontSize: responsiveFontSize(1.7) },
  timerText: { color: '#CC2131', fontFamily: 'DMSans-Medium', fontSize: responsiveFontSize(1.7), marginRight: responsiveWidth(5) },
  endButtonView: { paddingHorizontal: 20, paddingVertical: 10, backgroundColor: '#53A39F', borderRadius: 15, marginLeft: responsiveWidth(2) },
  endButtonText: { color: '#FFF', fontFamily: 'DMSans-Semibold', fontSize: responsiveFontSize(1.5) },
  TabSection: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 10 },
  ButtonView: { width: responsiveWidth(45), height: responsiveHeight(6), backgroundColor: '#fff', borderRadius: 10, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  ButtonImg: { height: 20, width: 20, resizeMode: 'contain', marginRight: 5 },
  ButtonText: { color: '#2D2D2D', fontFamily: 'DMSans-Medium', fontSize: responsiveFontSize(1.7) },
  AudioBackground: { width: responsiveWidth(100), height: responsiveHeight(75), justifyContent: 'center', alignItems: 'center' },
  buttonImage: { height: 150, width: 150, borderRadius: 150 / 2, marginTop: - responsiveHeight(20) },
  audioSectionTherapistName: { color: '#FFF', fontSize: responsiveFontSize(2.6), fontFamily: 'DMSans-Bold', marginTop: responsiveHeight(2), marginBottom: responsiveHeight(2) },
  audioButtonSection: { backgroundColor: '#000', height: responsiveHeight(9), width: responsiveWidth(50), borderRadius: 50, alignItems: 'center', position: 'absolute', bottom: 60, flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'center' },
  iconStyle: { height: 50, width: 50 },
  messageContainer: {
    backgroundColor: 'red',
    height: responsiveHeight(70)
  },
  imageView1: {
    width: 30,
    height: 30,
    marginBottom: responsiveFontSize(1)
  },
  imageView2: {
    width: 30,
    height: 30,
    marginBottom: responsiveHeight(2)
  },
  chatFooter: {
    shadowColor: '#ECFCFA',
    shadowOpacity: 0.37,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    flexDirection: 'row',
    padding: 5,
    backgroundColor: 'blue',
    marginBottom: 10
  },
  buttonFooterChat: {
    width: 25,
    height: 25,
    borderRadius: 25 / 2,
    justifyContent: 'center',
    alignItems: 'center',
    //position: 'absolute',
    borderColor: 'black',
    right: 10,
    top: -5,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  buttonFooterChatImg: {
    width: 25,
    height: 25,
    borderRadius: 25 / 2,
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: 'black',
    //position: 'absolute',
    right: 10,
    top: -5,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
  },
  textFooterChat: {
    fontSize: responsiveFontSize(2),
    fontWeight: 'bold',
    color: 'black',
  },
  fileContainer: {
    flex: 1,
    maxWidth: 300,
    marginVertical: 2,
    borderRadius: 15,
  },
  fileText: {
    marginVertical: 5,
    fontSize: 16,
    lineHeight: 20,
    marginLeft: 10,
    marginRight: 5,
    color: '#2D2D2D'
  },
  textTime: {
    fontSize: 10,
    color: '#2D2D2D',
    marginLeft: 2,
  },
  agoraStyle: {
    width: '100%',
    height: '100%',
    borderRadius: 50, // Adjust the radius as needed
    overflow: 'hidden', // Ensure child components respect the borderRadius
  },
  //modal
  sessionHistoryView: {
    width: responsiveWidth(92),
    borderRadius: 15,
    borderColor: '#E3E3E3',
    borderWidth: 1,
    marginTop: responsiveHeight(2),
    marginHorizontal: responsiveWidth(4)
  },
  sessionHistoryInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  sessionHistoryInfoName: {
    color: '#2D2D2D',
    fontSize: responsiveFontSize(2),
    fontFamily: 'DMSans-Bold'
  },
  sessionHistoryImgView: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  },
  sessionHistoryImg: {
    height: 20,
    width: 20,
    resizeMode: 'contain'
  },
  sessionHistoryStatus: {
    color: '#444343',
    fontSize: responsiveFontSize(1.7),
    fontFamily: 'DMSans-SemiBold',
    marginLeft: responsiveWidth(1)
  },
  sessionHistorySection1: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: responsiveHeight(1.5)
  },
  sessionHistorySection1Header: {
    color: '#444343',
    fontFamily: 'DMSans-Medium',
    fontSize: responsiveFontSize(1.7),
    marginRight: responsiveWidth(2)
  },
  sessionHistorySection1Value: {
    color: '#746868',
    fontFamily: 'DMSans-Medium',
    fontSize: responsiveFontSize(1.7)
  }

});