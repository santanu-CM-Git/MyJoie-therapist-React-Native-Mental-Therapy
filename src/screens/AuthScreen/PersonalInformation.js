import React, { useContext, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  KeyboardAvoidingView
} from 'react-native';
import { responsiveFontSize, responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import DocumentPicker from 'react-native-document-picker';
import InputField from '../../components/InputField';
import CustomButton from '../../components/CustomButton';
import { plus, uploadImg, uploadPicImg, userPhoto } from '../../utils/Images';
import { AuthContext } from '../../context/AuthContext';
import Loader from '../../utils/Loader';
import axios from 'axios';
import { API_URL } from '@env'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'

const PersonalInformation = ({ navigation, route }) => {
  const concatNo = route?.params?.countrycode + '-' + route?.params?.phoneno;
  const [phoneno, setPhoneno] = useState('');
  const [firstname, setFirstname] = useState('');
  const [firstNameError, setFirstNameError] = useState('')
  const [lastname, setLastname] = useState('');
  const [lastNameError, setLastNameError] = useState('')
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('')
  const [Password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('')
  const [city, setCity] = useState('');
  const [cityError, setCityError] = useState('')
  const [postaddress, setPostaddress] = useState('');
  const [postaddressError, setPostaddressError] = useState('')
  const [pickedDrivingLicenseFront, setPickedDrivingLicenseFront] = useState(null);
  const [DrivingLicenseFrontError, setDrivingLicenseFrontError] = useState('')
  const [pickedDrivingLicenseBack, setPickedDrivingLicenseback] = useState(null);
  const [DrivingLicenseBackError, setDrivingLicenseBackError] = useState('')

  const [isLoading, setIsLoading] = useState(false)
  const { login, userToken } = useContext(AuthContext);

  const changeFirstname = (text) => {
    setFirstname(text)
    if (text) {
      setFirstNameError('')
    } else {
      setFirstNameError('Please enter First name')
    }
  }

  const changeLastname = (text) => {
    setLastname(text)
    if (text) {
      setLastNameError('')
    } else {
      setLastNameError('Please enter Last name')
    }
  }

  const changePassword = (text) => {
    setPassword(text)
    if (text) {
      setPasswordError('')
    } else {
      setPasswordError('Please enter Address')
    }
  }
  const changeCity = (text) => {
    setCity(text)
    if (text) {
      setCityError('')
    } else {
      setCityError('Please enter City')
    }
  }
  const changePostAddress = (text) => {
    setPostaddress(text)
    // if (text) {
    //   setPostaddressError('')
    // } else {
    //   setPostaddressError('Please enter Ghana Post Address')
    // }
  }

  // const submitForm = () => {
  //   //navigation.navigate('DocumentsUpload')
  //   if (!firstname) {
  //     setFirstNameError('Please enter First name')
  //   }else if(!lastname){
  //     setLastNameError('Please enter Last name')
  //   }else if(!address){
  //     setAddressError('Please enter Address')
  //   }else if(!city){
  //     setCityError('Please enter City')
  //   } else {
  //     setIsLoading(true)
  //     var option = {}
  //     if(email){
  //       var option = {
  //         "firstName": firstname,
  //         "lastName": lastname,
  //         "email": email,
  //         "address": address,
  //         "zipcode": postaddress,
  //         "city" : city
  //       }
  //     }else{
  //       var option = {
  //         "firstName": firstname,
  //         "lastName": lastname,
  //         "address": address,
  //         "zipcode": postaddress,
  //         "city" : city
  //       }
  //     }

  //     axios.post(`${API_URL}/api/driver/updateInformation`, option, {
  //       headers: {
  //         Accept: 'application/json',
  //         "Authorization": 'Bearer ' + route?.params?.usertoken,
  //       },
  //     })
  //       .then(res => {
  //         console.log(res.data)
  //         if (res.data.response.status.code === 200) {
  //           setIsLoading(false)
  //           navigation.push('DocumentsUpload', { usertoken: route?.params?.usertoken })
  //       } else {
  //           Alert.alert('Oops..', "Something went wrong", [
  //               {
  //                   text: 'Cancel',
  //                   onPress: () => console.log('Cancel Pressed'),
  //                   style: 'cancel',
  //               },
  //               { text: 'OK', onPress: () => console.log('OK Pressed') },
  //           ]);
  //       }
  //       })
  //       .catch(e => {
  //         setIsLoading(false)
  //         console.log(`user update error ${e}`)
  //         console.log(e.response.data?.response.records)
  //         Alert.alert('Oops..', "Something went wrong", [
  //           {
  //               text: 'Cancel',
  //               onPress: () => console.log('Cancel Pressed'),
  //               style: 'cancel',
  //           },
  //           { text: 'OK', onPress: () => console.log('OK Pressed') },
  //       ]);
  //       });
  //   }


  // }

  if (isLoading) {
    return (
      <Loader />
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAwareScrollView showsVerticalScrollIndicator={false} style={{ marginBottom: responsiveHeight(4) }}>
        <View style={{ paddingHorizontal: 20, paddingVertical: 25 }}>
          <MaterialIcons name="arrow-back" size={25} color="#000" onPress={() => navigation.goBack()} />
        </View>
        <View style={styles.wrapper}>

          <Text style={styles.header1}>Registration Form</Text>
          <Text style={styles.subheader}>Enter the details below so we can get to know and serve you better</Text>

          <View style={styles.textinputview}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.header}>Name</Text>
              <Text style={styles.requiredheader}>*</Text>
            </View>
            {firstNameError ? <Text style={{ color: 'red', fontFamily: 'Outfit-Regular' }}>{firstNameError}</Text> : <></>}
            <View style={styles.inputView}>
              <InputField
                label={'First name'}
                keyboardType=" "
                value={firstname}
                //helperText={'Please enter lastname'}
                inputType={'others'}
                onChangeText={(text) => changeFirstname(text)}
              />
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.header}>Email Id</Text>
              <Text style={styles.requiredheader}>*</Text>
            </View>
            <View style={styles.inputView}>
              <InputField
                label={'e.g. abc@gmail.com'}
                keyboardType=" "
                value={email}
                //helperText={'Please enter lastname'}
                inputType={'others'}
                onChangeText={(text) => setEmail(text)}
              />
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.header}>Mobile Number</Text>
              <Text style={styles.requiredheader}>*</Text>
            </View>
            <View style={styles.inputView}>
              <InputField
                label={'Mobile number'}
                keyboardType=" "
                value={phoneno}
                helperText={firstNameError}
                inputType={'nonedit'}
              //onChangeText={(text) => changeFirstname(text)}
              />
            </View>

            {/* <Text
              style={styles.header}>
              Last Name
            </Text>
            {lastNameError?<Text style={{color:'red',fontFamily:'Outfit-Regular'}}>{lastNameError}</Text>:<></>}
            <View style={styles.inputView}>
              <InputField
                label={'Last Name'}
                keyboardType=" "
                value={lastname}
                //helperText={'Please enter lastname'}
                inputType={'others'}
                onChangeText={(text) => changeLastname(text)}
              />
            </View> */}

            {/* <Text
              style={styles.header}>
              Upload Supporting Documents
            </Text>
            {DrivingLicenseFrontError ? <Text style={{ color: 'red', fontFamily: 'Outfit-Regular' }}>{DrivingLicenseFrontError}</Text> : <></>}
            {DrivingLicenseBackError ? <Text style={{ color: 'red', fontFamily: 'Outfit-Regular' }}>{DrivingLicenseBackError}</Text> : <></>}

            <View style={{ flexDirection: 'row', justifyContent: 'space-between',marginTop: responsiveHeight(2) }}>
              <View style={{ height: responsiveHeight(18), width: responsiveWidth(40), borderColor: '#E0E0E0', borderWidth: 1, borderRadius: 10, borderStyle: 'dashed', backgroundColor: '#FAFAFA' }}>
                <View style={{ flexDirection: 'column', alignItems: 'center', marginVertical: 40 }}>

                  <TouchableOpacity onPress={() => pickDocument('DrivingLicenseFront')}>
                    <Image
                      source={uploadImg}
                      style={{ height: 25, width: 25, resizeMode: 'contain', marginBottom: 5 }}
                    />
                  </TouchableOpacity>

                  {!pickedDrivingLicenseFront ?
                    <Text style={{ fontFamily: 'DMSans-Regular', fontSize: responsiveFontSize(1.5), color: '#808080', }}>Upload Degree</Text>
                    :
                    <Text style={{ fontFamily: 'DMSans-Regular', fontSize: responsiveFontSize(1.5), color: '#808080', paddingHorizontal: 5 }}>{pickedDrivingLicenseFront.name}</Text>
                  }
                </View>
              </View>
              <View style={{ height: responsiveHeight(18), width: responsiveWidth(40), borderColor: '#E0E0E0', borderWidth: 1, borderRadius: 10, borderStyle: 'dashed', backgroundColor: '#FAFAFA' }}>
                <View style={{ flexDirection: 'column', alignItems: 'center', marginVertical: 40 }}>

                  <TouchableOpacity onPress={() => pickDocument('DrivingLicenseBack')}>
                    <Image
                      source={uploadImg}
                      style={{ height: 25, width: 25, resizeMode: 'contain', marginBottom: 5 }}
                    />
                  </TouchableOpacity>

                  {!pickedDrivingLicenseBack ?
                    <Text style={{ fontFamily: 'DMSans-Regular', fontSize: responsiveFontSize(1.5), color: '#808080', }}>Upload Marksheets</Text>
                    :
                    <Text style={{ fontFamily: 'DMSans-Regular', fontSize: responsiveFontSize(1.5), color: '#808080', paddingHorizontal: 5 }}>{pickedDrivingLicenseBack.name}</Text>
                  }
                </View>
              </View>

            </View> */}
            {/* <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: responsiveHeight(2), marginBottom: responsiveHeight(2) }}>
              <View style={{ height: responsiveHeight(18), width: responsiveWidth(40), borderColor: '#E0E0E0', borderWidth: 1, borderRadius: 10, borderStyle: 'dashed', backgroundColor: '#FAFAFA' }}>
                <View style={{ flexDirection: 'column', alignItems: 'center', marginVertical: 40 }}>

                  <TouchableOpacity onPress={() => pickDocument('DrivingLicenseFront')}>
                    <Image
                      source={uploadImg}
                      style={{ height: 25, width: 25, resizeMode: 'contain', marginBottom: 5 }}
                    />
                  </TouchableOpacity>

                  {!pickedDrivingLicenseFront ?
                    <Text style={{ fontFamily: 'DMSans-Regular', fontSize: responsiveFontSize(1.5), color: '#808080', }}>Upload Degree</Text>
                    :
                    <Text style={{ fontFamily: 'DMSans-Regular', fontSize: responsiveFontSize(1.5), color: '#808080', paddingHorizontal: 5 }}>{pickedDrivingLicenseFront.name}</Text>
                  }
                </View>
              </View>
              <View style={{ height: responsiveHeight(18), width: responsiveWidth(40), borderColor: '#E0E0E0', borderWidth: 1, borderRadius: 10, borderStyle: 'dashed', backgroundColor: '#FAFAFA' }}>
                <View style={{ flexDirection: 'column', alignItems: 'center', marginVertical: 40 }}>

                  <TouchableOpacity onPress={() => pickDocument('DrivingLicenseBack')}>
                    <Image
                      source={uploadImg}
                      style={{ height: 25, width: 25, resizeMode: 'contain', marginBottom: 5 }}
                    />
                  </TouchableOpacity>

                  {!pickedDrivingLicenseBack ?
                    <Text style={{ fontFamily: 'DMSans-Regular', fontSize: responsiveFontSize(1.5), color: '#808080', }}>Upload Marksheets</Text>
                    :
                    <Text style={{ fontFamily: 'DMSans-Regular', fontSize: responsiveFontSize(1.5), color: '#808080', paddingHorizontal: 5 }}>{pickedDrivingLicenseBack.name}</Text>
                  }
                </View>
              </View>
            </View> */}
            {/* <Text
              style={styles.header}>
              Upload Picture
            </Text> */}
            {/* <View style={{ flexDirection: 'row', justifyContent: 'space-between',marginBottom: responsiveHeight(2),marginTop: responsiveHeight(1) }}>
              <View style={{ height: responsiveHeight(18), width: responsiveWidth(40), borderColor: '#E0E0E0', borderWidth: 1, borderRadius: 10, borderStyle: 'dashed', backgroundColor: '#FAFAFA' }}>
                <View style={{ flexDirection: 'column', alignItems: 'center', marginVertical: 40 }}>

                  <TouchableOpacity onPress={() => pickDocument('DrivingLicenseFront')}>
                    <Image
                      source={uploadPicImg}
                      style={{ height: 25, width: 25, resizeMode: 'contain', marginBottom: 5 }}
                    />
                  </TouchableOpacity>

                  {!pickedDrivingLicenseFront ?
                    <Text style={{ fontFamily: 'DMSans-Regular', fontSize: responsiveFontSize(1.5), color: '#808080', }}>Upload Photo</Text>
                    :
                    <Text style={{ fontFamily: 'DMSans-Regular', fontSize: responsiveFontSize(1.5), color: '#808080', paddingHorizontal: 5 }}>{pickedDrivingLicenseFront.name}</Text>
                  }
                </View>
              </View>
            </View> */}
          </View>

        </View>
        <View style={styles.buttonwrapper}>
          <CustomButton label={"Submit"}
            // onPress={() => { login() }}
            onPress={() => { submitForm() }}
          />
        </View>
        <View style={{ paddingHorizontal: 20, flexDirection: 'row', justifyContent: 'space-between', }}>
          <Text style={{ fontFamily: 'DMSans-Regular', fontSize: responsiveFontSize(1.5), color: '#746868' }}>Already Have an account?</Text>
          <Text style={{ fontFamily: 'DMSans-SemiBold', fontSize: responsiveFontSize(1.5), color: '#2D2D2D' }}>Sign In</Text>
        </View>
      </KeyboardAwareScrollView>

    </SafeAreaView >
  );
};

export default PersonalInformation;

const styles = StyleSheet.create({

  container: {
    //justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    flex: 1
  },
  wrapper: {
    paddingHorizontal: 23,
    //height: responsiveHeight(78)
  },
  header1: {
    fontFamily: 'DMSans-SemiBold',
    fontSize: responsiveFontSize(3),
    color: '#2F2F2F',
    marginBottom: responsiveHeight(1),
  },
  header: {
    fontFamily: 'DMSans-SemiBold',
    fontSize: responsiveFontSize(2),
    color: '#2F2F2F',
    marginBottom: responsiveHeight(1),
  },
  requiredheader: {
    fontFamily: 'DMSans-SemiBold',
    fontSize: responsiveFontSize(1.5),
    color: '#E1293B',
    marginBottom: responsiveHeight(1),
    marginLeft: responsiveWidth(1)
  },
  subheader: {
    fontFamily: 'DMSans-Regular',
    fontSize: responsiveFontSize(1.8),
    fontWeight: '400',
    color: '#808080',
    marginBottom: responsiveHeight(1),
  },
  photoheader: {
    fontFamily: 'Outfit-Bold',
    fontSize: responsiveFontSize(2),
    color: '#2F2F2F'
  },
  imageView: {
    marginTop: responsiveHeight(2)
  },
  imageStyle: {
    height: 80,
    width: 80,
    borderRadius: 40,
    marginBottom: 10
  },
  plusIcon: {
    position: 'absolute',
    bottom: 10,
    left: 50
  },
  textinputview: {
    marginBottom: responsiveHeight(10),
    marginTop: responsiveHeight(5)
  },
  inputView: {
    paddingVertical: 1
  },
  buttonwrapper: {
    paddingHorizontal: 20,
    position: 'absolute',
    bottom: 10,
    width: responsiveWidth(100),
  }
});
