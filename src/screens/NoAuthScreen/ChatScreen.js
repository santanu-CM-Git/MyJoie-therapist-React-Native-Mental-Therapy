import React, { useState, useCallback, useEffect } from 'react'
import { View, Text, SafeAreaView, StyleSheet, ScrollView, ImageBackground, Image, KeyboardAvoidingView } from 'react-native'
import CustomHeader from '../../components/CustomHeader'
import { responsiveFontSize, responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { filesendImg, sendImg, userPhoto } from '../../utils/Images'
import { GiftedChat, InputToolbar, Bubble, Send } from 'react-native-gifted-chat'
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import * as DocumentPicker from 'react-native-document-picker';
import InChatFileTransfer from '../../components/InChatFileTransfer';
import InChatViewFile from '../../components/InChatViewFile';
// import { getAuth, onAuthStateChanged } from '@react-native-firebase/auth';
// import { getDatabase, ref, onValue, push } from '@react-native-firebase/database';
// import * as firebase from "firebase/app"
import firebase from '@react-native-firebase/app';
import auth from '@react-native-firebase/auth';
import database from '@react-native-firebase/database';
import storage from '@react-native-firebase/storage';
import RNFetchBlob from 'rn-fetch-blob'
// import { CometChat } from '@cometchat/chat-sdk-react-native'

const ChatScreen = ({ navigation }) => {
  const [messages, setMessages] = useState([])
  const [chatgenidres, setChatgenidres] = useState('4');
  const [isAttachImage, setIsAttachImage] = useState(false);
  const [isAttachFile, setIsAttachFile] = useState(false);
  const [imagePath, setImagePath] = useState('');
  const [filePath, setFilePath] = useState('');
  const [fileVisible, setFileVisible] = useState(false);

  useEffect(() => {
    //receivedMsg()
  }, [])


  const _pickDocument = async () => {
    try {
      const result = await DocumentPicker.pick({
        type: [DocumentPicker.types.allFiles],
        copyTo: 'documentDirectory',
        mode: 'import',
        allowMultiSelection: true,
      });
      const fileUri = result[0].fileCopyUri;
      if (!fileUri) {
        console.log('File URI is undefined or null');
        return;
      }
      console.log(fileUri)
      if (fileUri.indexOf('.png') !== -1 || fileUri.indexOf('.jpg') !== -1) {
        setImagePath(fileUri);
        setIsAttachImage(true);
      } else {
        setFilePath(fileUri);
        setIsAttachFile(true);
      }
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        console.log('User cancelled file picker');
      } else {
        console.log('DocumentPicker err => ', err);
        throw err;
      }
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
            backgroundColor: props.currentMessage.user._id === 2 ? '#4B47FF' : '#efefef',
            borderBottomLeftRadius: props.currentMessage.user._id === 2 ? 15 : 5,
            borderBottomRightRadius: props.currentMessage.user._id === 2 ? 5 : 15,
          }}
          onPress={() => setFileVisible(true)}
        >
         
          <View style={{ flexDirection: 'column' }}>
            <Text style={{
              ...styles.fileText,
              color: currentMessage.user._id === 2 ? 'white' : 'black',
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
            backgroundColor: '#4B47FF',
          },
        }}
        textStyle={{
          right: {
            color: '#efefef',
          },
        }}
      />
    );
  };

  const scrollToBottomComponent = () => {
    return <FontAwesome name="angle-double-down" size={28} color="#000" />;
  };

  useEffect(() => {
    // setMessages([
    //   {
    //     _id: 1,
    //     text: 'Hello developer',
    //     createdAt: new Date(),
    //     user: {
    //       _id: 2,
    //       name: 'React Native',
    //       avatar: require('../../assets/images/user-profile.jpg'),
    //     },
    //   },
    // ])
  }, [])

  const onSend = useCallback((messages = []) => {
    const [messageToSend] = messages;
    if (isAttachImage) {
      const newMessage = {
        _id: messages[0]._id + 1,
        text: messageToSend.text,
        timestamp: firebase.database.ServerValue.TIMESTAMP,
        user: {
          _id: 1,
          avatar: require('../../assets/images/user-profile.jpg'),
        },
        codeSnippet: true,
        image: imagePath,
        file: {
          url: ''
        }
      };
      setMessages(previousMessages =>
        GiftedChat.append(previousMessages, newMessage),
      );
      // messages.forEach(item => {
      //   const message = newMessage
      //   db.push(message);
      // });
      setImagePath('');
      setIsAttachImage(false);
    } else if (isAttachFile) {
      const newMessage = {
        _id: messages[0]._id + 1,
        text: messageToSend.text,
        createdAt: new Date(),
        user: {
          _id: 1,
          avatar: require('../../assets/images/user-profile.jpg'),
        },
        image: '',
        file: {
          url: filePath
        }
      };
      setMessages(previousMessages =>
        GiftedChat.append(previousMessages, newMessage),
      );
      setFilePath('');
      setIsAttachFile(false);
    } else {
      setMessages(previousMessages =>
        GiftedChat.append(previousMessages, messages),
      );
      // let receiverID = "1";
      // let messageText = JSON.stringify(messages);
      // let receiverType = CometChat.RECEIVER_TYPE.USER;
      // let textMessage = new CometChat.TextMessage(receiverID, messageText, receiverType);

      // CometChat.sendMessage(textMessage).then(
      //   message => {
      //     console.log("Message sent successfully:", message);
      //   }, error => {
      //     console.log("Message sending failed with error:", error);
      //   }
      // );

    }
  },
    [filePath, imagePath, isAttachFile, isAttachImage],
  );

 
  return (
    <SafeAreaView style={styles.Container} behavior="padding" keyboardVerticalOffset={30} enabled>
      <CustomHeader commingFrom={'chat'} onPress={() => navigation.goBack()} title={'Admin Community'} />
      <GiftedChat
        messages={messages}
        renderInputToolbar={props => customtInputToolbar(props)}
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
          _id: 1,
          avatar: require('../../assets/images/user-profile.jpg'),
        }}
      //user={user}
      />
    </SafeAreaView>
  )
}

export default ChatScreen

const styles = StyleSheet.create({
  Container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingBottom: 10
  },
  messageContainer: {
    backgroundColor: 'red'
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
    shadowColor: '#1F2687',
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
  },
  textTime: {
    fontSize: 10,
    color: 'gray',
    marginLeft: 2,
  },

});