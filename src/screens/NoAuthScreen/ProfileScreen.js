import React, { useContext, useState, useRef, useEffect } from 'react';
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
  KeyboardAvoidingView,
} from 'react-native';
import { responsiveFontSize, responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import DocumentPicker from 'react-native-document-picker';
import InputField from '../../components/InputField';
import CustomButton from '../../components/CustomButton';
import { deleteRoundImg, plus, uploadImg, uploadPicImg, userPhoto } from '../../utils/Images';
import { AuthContext } from '../../context/AuthContext';
import Loader from '../../utils/Loader';
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from 'axios';
import { API_URL } from '@env'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import CustomHeader from '../../components/CustomHeader';
import MultiSelect from 'react-native-multiple-select';
import { Dropdown } from 'react-native-element-dropdown';
import Modal from "react-native-modal";
import Icon from 'react-native-vector-icons/Entypo';
import { useFocusEffect } from '@react-navigation/native';
import Toast from 'react-native-toast-message';

const data = [
  { label: 'Absa Bank Ghana Limited', value: 'Absa Bank Ghana Limited' },
  { label: 'Access Bank (Ghana) Plc', value: 'Access Bank (Ghana) Plc' },
  { label: 'Agricultural Development Bank Plc', value: 'Agricultural Development Bank Plc' },
];
const dataYear = [
  { label: '01', value: '1' },
  { label: '02', value: '2' },
  { label: '03', value: '3' },
  { label: '04', value: '4' },
  { label: '05', value: '5' },
  { label: '06', value: '6' },
  { label: '07', value: '7' },
  { label: '08', value: '8' },
  { label: '09', value: '9' },
  { label: '10', value: '10' },
];
const dataMonth = [
  { label: '01', value: '1' },
  { label: '02', value: '2' },
  { label: '03', value: '3' },
  { label: '04', value: '4' },
  { label: '05', value: '5' },
  { label: '06', value: '6' },
  { label: '07', value: '7' },
  { label: '08', value: '8' },
  { label: '09', value: '9' },
  { label: '10', value: '10' },
];

const ProfileScreen = ({ navigation, route }) => {
  const [firstname, setFirstname] = useState('');
  const [email, setEmail] = useState('');
  const [phoneno, setPhoneno] = useState('');
  const [dob, setdob] = useState('');
  const [gender, setGender] = useState('');
  const [panno, setPanno] = useState('');
  const [aadhar, setAadhar] = useState('')
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [accountno, setAccountno] = useState('')

  const [accountChangeRequest, setAccountChangeRequest] = useState(false)

  const [pickedDocument, setPickedDocument] = useState(null);
  const [profilePic, setProfilePic] = useState(null)
  const [pickedCancelCheque, setCancelCheque] = useState(null);
  const [pickedDrivingLicenseBack, setPickedDrivingLicenseback] = useState(null);


  const [alldocument, setAllDocument] = useState(null)

  const [isModalVisible, setModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true)
  const { login, userToken } = useContext(AuthContext);

  const [statevalue, setStateValue] = useState(null);
  const [isStateFocus, setStateIsFocus] = useState(false);

  const [yearvalue, setYearValue] = useState(null);
  const [isYearFocus, setYearIsFocus] = useState(false);

  const [monthvalue, setMonthValue] = useState(null);
  const [isMonthFocus, setMonthIsFocus] = useState(false);


  // Type dropdown
  const [itemsType, setitemsType] = useState([])
  const [selectedItemsType, setSelectedItemsType] = useState([]);
  const multiSelectRefType = useRef(null);
  const onSelectedItemsChangeType = selectedItems => {
    setSelectedItemsType(selectedItems);
  };

  // Language dropdown
  const [qualificationitemsLanguage, setqualificationitemsLanguage] = useState([])
  const [selectedItemsLanguage, setSelectedItemsLanguage] = useState([]);
  const multiSelectRefLanguage = useRef(null);
  const onSelectedItemsChangeLanguage = selectedItems => {
    setSelectedItemsLanguage(selectedItems);
  };
  // Qualification dropdown
  const [qualificationitems, setqualificationitems] = useState([])
  const [selectedItems, setSelectedItems] = useState([]);
  const multiSelectRef = useRef(null);
  const onSelectedItemsChange = selectedItems => {
    setSelectedItems(selectedItems);
  };

  const toggleModal = () => {
    //setModalVisible(!isModalVisible);
    setAccountChangeRequest(!accountChangeRequest)
  };

  const changeAccountNo = (text) => {
    setAccountno(text)
  }

  const changeCity = (text) => {
    setCity(text)
  }
  const changeState = (text) => {
    setState(text)
  }


  const pickDocument = async (forwhat) => {
    try {
      const result = await DocumentPicker.pick({
        type: [DocumentPicker.types.allFiles],
      });

      //console.log('URI: ', result[0].uri);
      //console.log('Type: ', result[0].type);
      //console.log('Name: ', result[0].name);
      //console.log('Size: ', result[0].size);
      if (forwhat == 'profilepic') {
        setPickedDocument(result[0].uri);
        setProfilePic(result[0])
      } else if (forwhat == 'CancelCheque') {
        setCancelCheque(result[0])
      }

    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        // User cancelled the document picker
        console.log('Document picker was cancelled');
      } else {
        console.error('Error picking document', err);
      }
    }
  };
  const deleteProfileImg = () => {
    setPickedDocument(null)

  }
  const deleteCancelChequeImg = () => {
    setCancelCheque(null)
  }

  // const fetchUserData = () => {
  //   AsyncStorage.getItem('userToken', (err, usertoken) => {
  //     console.log(usertoken, 'usertoken')
  //     axios.post(`${API_URL}/therapist/profile`, {}, {
  //       headers: {
  //         "Authorization": `Bearer ${usertoken}`,
  //         "Content-Type": 'application/json'
  //       },
  //     })
  //       .then(res => {
  //         let userInfo = res.data.data;
  //         console.log(userInfo, 'user data from profile api ')
  //         setFirstname(userInfo?.name)
  //         setEmail(userInfo?.email)
  //         setPhoneno(userInfo?.mobile)
  //         setdob(userInfo?.dob)
  //         setGender(userInfo?.gender)
  //         setPanno(userInfo?.therapist_details1?.pan_no)
  //         setAadhar(userInfo?.therapist_details1?.addhar_no)
  //         const type_therapis = userInfo?.therapist_type;
  //         const therapyTypeIds = type_therapis.map(item => item.therapy_type_id);
  //         console.log(therapyTypeIds)
  //         setSelectedItemsType(therapyTypeIds)
  //         const language = userInfo?.therapist_languages;
  //         const languageIds = language.map(item => item.language_id);
  //         console.log(languageIds)
  //         setSelectedItemsLanguage(languageIds)
  //         const qualification = userInfo?.therapist_qualification;
  //         const qualificationIds = qualification.map(item => item.qualification_id);
  //         console.log(qualificationIds)
  //         setSelectedItems(qualificationIds)
  //         setCity(userInfo?.city)
  //         setState(userInfo?.state)
  //         setAccountno(userInfo?.therapist_details1?.bank_ac_no)
  //         const experience = userInfo?.therapist_details1?.experience;
  //         const parts = experience.toString().split('.');
  //         if (experience) {
  //           setYearValue(parts[0])
  //           setMonthValue(parts[1])
  //         } else {
  //           setYearValue(null)
  //           setMonthValue(null)
  //         }
  //         setAllDocument(userInfo?.therapist_documents)
  //         setPickedDocument(userInfo?.profile_pic)
  //         setIsLoading(false)
  //       })
  //       .catch(e => {
  //         console.log(`Profile error ${e}`)
  //         setIsLoading(false)
  //       });
  //   });
  // }
  const fetchUserData = async () => {
    try {
      const userToken = await AsyncStorage.getItem('userToken');
      if (!userToken) {
        console.log('No user token found');
        setIsLoading(false);
        return;
      }

      console.log(userToken, 'usertoken');

      const response = await axios.post(`${API_URL}/therapist/profile`, {}, {
        headers: {
          "Authorization": `Bearer ${userToken}`,
          "Content-Type": 'application/json'
        }
      });

      const userInfo = response.data.data;
      console.log(userInfo, 'user data from profile api ');

      setFirstname(userInfo?.name || '');
      setEmail(userInfo?.email || '');
      setPhoneno(userInfo?.mobile || '');
      setdob(userInfo?.dob || '');
      setGender(userInfo?.gender || '');
      setPanno(userInfo?.therapist_details1?.pan_no || '');
      setAadhar(userInfo?.therapist_details1?.addhar_no || '');

      const therapyTypeIds = userInfo?.therapist_type.map(item => item.therapy_type_id) || [];
      setSelectedItemsType(therapyTypeIds);

      const languageIds = userInfo?.therapist_languages.map(item => item.language_id) || [];
      setSelectedItemsLanguage(languageIds);

      const qualificationIds = userInfo?.therapist_qualification.map(item => item.qualification_id) || [];
      setSelectedItems(qualificationIds);

      setCity(userInfo?.city || '');
      setState(userInfo?.state || '');
      setAccountno(userInfo?.therapist_details1?.bank_ac_no || '');

      const experience = userInfo?.therapist_details1?.experience;
      const parts = experience.toString().split('.');
      if (experience) {
        setYearValue(parts[0])
        setMonthValue(parts[1])
      } else {
        setYearValue(null)
        setMonthValue(null)
      }

      setAllDocument(userInfo?.therapist_documents || []);
      setPickedDocument(userInfo?.profile_pic || null);

      setIsLoading(false);

    } catch (error) {
      console.log(`Profile error: ${error}`);
      setIsLoading(false);
    }
  };

  const fetchLanguage = async () => {
    try {
      const response = await axios.get(`${API_URL}/languages`, {
        headers: {
          "Content-Type": 'application/json'
        },
      });
      const languageInfo = response.data.data;
      setqualificationitemsLanguage(languageInfo);
    } catch (error) {
      console.log(`Language fetch error: ${error}`);
    }
  };
  const fetchQualification = async () => {
    try {
      const response = await axios.get(`${API_URL}/qualifications`, {
        headers: {
          "Content-Type": 'application/json'
        },
      });
      const qualificationInfo = response.data.data;
      setqualificationitems(qualificationInfo);
    } catch (error) {
      console.log(`Qualification fetch error: ${error}`);
    }
  };
  const fetchTherapyType = async () => {
    try {
      const response = await axios.get(`${API_URL}/therapy-type`, {
        headers: {
          "Content-Type": 'application/json'
        },
      });
      const therapyTypeInfo = response.data.data;
      setitemsType(therapyTypeInfo);
    } catch (error) {
      console.log(`Therapy type fetch error: ${error}`);
    }
  };

  useEffect(() => {
    fetchLanguage();
    fetchQualification();
    fetchTherapyType();
  }, [])

  useEffect(() => {
    fetchUserData();
  }, [])
  useFocusEffect(
    React.useCallback(() => {
      fetchUserData()
    }, [])
  )

  const submitForm = () => {
    setIsLoading(true)
    console.log(selectedItemsType, " type off therapist")
    console.log(selectedItemsLanguage, "language")
    console.log(selectedItems, 'qualification')
    console.log(city, 'city')
    console.log(state, 'state')
    var experienceValue = ''
    if (yearvalue && monthvalue) {
      var experienceValue = yearvalue + '.' + monthvalue;
    } else {
      var experienceValue = '';
    }
    console.log(experienceValue, 'experience')
    console.log(profilePic, 'profile pic')

    const formData = new FormData();
    formData.append("therapy_types", JSON.stringify(selectedItemsType));
    formData.append("languages", JSON.stringify(selectedItemsLanguage));
    formData.append("qualifications", JSON.stringify(selectedItems));
    formData.append("city", city);
    formData.append("state", state);
    formData.append("experience", experienceValue);
    formData.append("profile_pic", profilePic);
    formData.append("bank_ac_no", accountno);
    formData.append("cancel_cheque", pickedCancelCheque || '');

    console.log(JSON.stringify(formData), 'formdata')

    AsyncStorage.getItem('userToken', (err, usertoken) => {
      axios.post(`${API_URL}/therapist/profile-update`, formData, {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'multipart/form-data',
          "Authorization": `Bearer ${usertoken}`,
        },
      })
        .then(res => {
          console.log(res.data)
          if (res.data.response == true) {
            setIsLoading(false)
            Toast.show({
              type: 'success',
              text1: 'Hello',
              text2: "Update data Successfully",
              position: 'top',
              topOffset: Platform.OS == 'ios' ? 55 : 20
            });
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



  if (isLoading) {
    return (
      <Loader />
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <CustomHeader commingFrom={'My Profile'} onPress={() => navigation.goBack()} title={'My Profile'} />
      <KeyboardAwareScrollView showsVerticalScrollIndicator={false} style={{ marginBottom: responsiveHeight(4) }}>
        <View style={styles.wrapper}>
          <View style={styles.textinputview}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.header}>Name</Text>
            </View>
            <View style={styles.inputView}>
              <InputField
                label={'Name'}
                keyboardType=" "
                value={firstname}
                //helperText={'Please enter lastname'}
                inputType={'nonedit'}
              //onChangeText={(text) => changeFirstname(text)}
              />
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.header}>Email Id</Text>
            </View>
            <View style={styles.inputView}>
              <InputField
                label={'e.g. abc@gmail.com'}
                keyboardType=" "
                value={email}
                //helperText={'Please enter lastname'}
                inputType={'nonedit'}
              //onChangeText={(text) => setEmail(text)}
              />
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.header}>Mobile Number</Text>
            </View>
            <View style={styles.inputView}>
              <InputField
                label={'Mobile number'}
                keyboardType=" "
                value={phoneno}
                //helperText={firstNameError}
                inputType={'nonedit'}
              //onChangeText={(text) => changeFirstname(text)}
              />
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.header}>Date of Birth</Text>
            </View>
            <View style={styles.inputView}>
              <InputField
                label={'Date of Birth'}
                keyboardType=" "
                value={dob}
                //helperText={'Please enter lastname'}
                inputType={'nonedit'}
              //onChangeText={(text) => changePassword(text)}
              />
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.header}>Gender</Text>
            </View>
            <View style={styles.inputView}>
              <InputField
                label={'Gender'}
                keyboardType=" "
                value={gender}
                //helperText={'Please enter lastname'}
                inputType={'nonedit'}
              //onChangeText={(text) => changePassword(text)}
              />
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.header}>Pan Number</Text>
            </View>
            <View style={styles.inputView}>
              <InputField
                label={'Pan Number'}
                keyboardType=" "
                value={panno}
                //helperText={'Please enter lastname'}
                inputType={'nonedit'}
              //onChangeText={(text) => changePassword(text)}
              />
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.header}>Aadhar No</Text>
            </View>
            {/* {passwordError ? <Text style={{ color: 'red', fontFamily: 'Outfit-Regular' }}>{passwordError}</Text> : <></>} */}
            <View style={styles.inputView}>
              <InputField
                label={'Aadhar No'}
                keyboardType=" "
                value={aadhar}
                //helperText={'Please enter lastname'}
                inputType={'nonedit'}
              //onChangeText={(text) => changePassword(text)}
              />
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.header}>Type of Therapies</Text>

            </View>
            <View style={{ flex: 1, marginVertical: responsiveHeight(1) }}>
              <View style={{ paddingHorizontal: 5, borderColor: '#E0E0E0', borderWidth: 1, borderRadius: 8, width: responsiveWidth(88) }}>
                <MultiSelect
                  hideTags
                  items={itemsType}
                  uniqueKey="id"
                  ref={multiSelectRefType}
                  onSelectedItemsChange={onSelectedItemsChangeType}
                  selectedItems={selectedItemsType}
                  selectText="Pick Type"
                  searchInputPlaceholderText="Search Type..."
                  onChangeInput={(text) => console.log(text)}
                  altFontFamily="DMSans-Regular"
                  tagRemoveIconColor="#000000"
                  tagBorderColor="#87ADA8"
                  tagTextColor="#2D2D2D"
                  selectedItemTextColor="#000"
                  selectedItemIconColor="#000"
                  itemTextColor="#746868"
                  displayKey="type"
                  searchInputStyle={styles.searchInput}
                  styleDropdownMenu={styles.dropdownMenu}
                  styleDropdownMenuSubsection={styles.dropdownMenuSubsection}
                  styleMainWrapper={styles.mainWrapper}
                  submitButtonColor="#87ADA8"
                  submitButtonText="Submit"
                  styleIndicator={{ marginTop: -6, marginRight: - responsiveWidth(6) }}
                //hideSubmitButton
                />
              </View>
              <View style={{ marginVertical: responsiveHeight(2) }}>
                {multiSelectRefType.current && multiSelectRefType.current.getSelectedItemsExt(selectedItemsType)}

              </View>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.header}>Language</Text>

            </View>
            <View style={{ flex: 1, marginVertical: responsiveHeight(1) }}>
              <View style={{ paddingHorizontal: 5, borderColor: '#E0E0E0', borderWidth: 1, borderRadius: 8, width: responsiveWidth(88) }}>
                <MultiSelect
                  hideTags
                  items={qualificationitemsLanguage}
                  uniqueKey="id"
                  ref={multiSelectRefLanguage}
                  onSelectedItemsChange={onSelectedItemsChangeLanguage}
                  selectedItems={selectedItemsLanguage}
                  selectText="Pick Language"
                  searchInputPlaceholderText="Search Language..."
                  onChangeInput={(text) => console.log(text)}
                  altFontFamily="DMSans-Regular"
                  tagRemoveIconColor="#000000"
                  tagBorderColor="#87ADA8"
                  tagTextColor="#2D2D2D"
                  selectedItemTextColor="#000"
                  selectedItemIconColor="#000"
                  itemTextColor="#746868"
                  displayKey="content"
                  searchInputStyle={styles.searchInput}
                  styleDropdownMenu={styles.dropdownMenu}
                  styleDropdownMenuSubsection={styles.dropdownMenuSubsection}
                  styleMainWrapper={styles.mainWrapper}
                  submitButtonColor="#87ADA8"
                  submitButtonText="Submit"
                  styleIndicator={{ marginTop: -6, marginRight: - responsiveWidth(6) }}
                //hideSubmitButton
                />
              </View>
              <View style={{ marginVertical: responsiveHeight(2) }}>
                {multiSelectRefLanguage.current && multiSelectRefLanguage.current.getSelectedItemsExt(selectedItemsLanguage)}
              </View>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.header}>Qualification</Text>
            </View>
            <View style={{ flex: 1, marginVertical: responsiveHeight(1) }}>
              <View style={{
                fontFamily: 'Outfit-Regular', paddingHorizontal: 5, borderColor: '#E0E0E0', borderWidth: 1, borderRadius: 8, width: responsiveWidth(88)
              }}>
                <MultiSelect
                  hideTags
                  items={qualificationitems}
                  uniqueKey="id"
                  ref={multiSelectRef}
                  onSelectedItemsChange={onSelectedItemsChange}
                  selectedItems={selectedItems}
                  selectText="Pick Qualification"
                  searchInputPlaceholderText="Search Qualification..."
                  onChangeInput={(text) => console.log(text)}
                  altFontFamily="DMSans-Regular"
                  tagRemoveIconColor="#000000"
                  tagBorderColor="#87ADA8"
                  tagTextColor="#2D2D2D"
                  selectedItemTextColor="#000"
                  selectedItemIconColor="#000"
                  itemTextColor="#746868"
                  displayKey="content"
                  searchInputStyle={styles.searchInput}
                  styleDropdownMenu={styles.dropdownMenu}
                  styleDropdownMenuSubsection={styles.dropdownMenuSubsection}
                  styleMainWrapper={styles.mainWrapper}
                  submitButtonColor="#87ADA8"
                  submitButtonText="Submit"
                  styleIndicator={{ marginTop: -6, marginRight: - responsiveWidth(6) }}
                //hideSubmitButton
                />
              </View>
              <View style={{ marginVertical: responsiveHeight(2) }}>
                {multiSelectRef.current && multiSelectRef.current.getSelectedItemsExt(selectedItems)}
              </View>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.header}>City</Text>
            </View>
            {/* {passwordError ? <Text style={{ color: 'red', fontFamily: 'Outfit-Regular' }}>{passwordError}</Text> : <></>} */}
            <View style={styles.inputView}>
              <InputField
                label={'City'}
                keyboardType=" "
                value={city}
                //helperText={'Please enter lastname'}
                inputType={'others'}
                onChangeText={(text) => changeCity(text)}
              />
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.header}>State</Text>
            </View>
            {/* <Dropdown
              style={[styles.dropdown, isStateFocus && { borderColor: '#DDD' }]}
              placeholderStyle={styles.placeholderStyle}
              selectedTextStyle={styles.selectedTextStyle}
              inputSearchStyle={styles.inputSearchStyle}
              itemTextStyle={styles.selectedTextStyle}
              data={data}
              //search
              maxHeight={300}
              labelField="label"
              valueField="value"
              placeholder={!isStateFocus ? 'Select item' : '...'}
              searchPlaceholder="Search..."
              value={statevalue}
              onFocus={() => setStateIsFocus(true)}
              onBlur={() => setStateIsFocus(false)}
              onChange={item => {
                setStateValue(item.value);
                setStateIsFocus(false);
              }}
            /> */}
            <View style={styles.inputView}>
              <InputField
                label={'State'}
                keyboardType=" "
                value={state}
                //helperText={'Please enter lastname'}
                inputType={'others'}
                onChangeText={(text) => changeState(text)}
              />
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.header}>Experience</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Dropdown
                style={[styles.dropdownHalf, isYearFocus && { borderColor: '#DDD' }]}
                placeholderStyle={styles.placeholderStyle}
                selectedTextStyle={styles.selectedTextStyle}
                inputSearchStyle={styles.inputSearchStyle}
                itemTextStyle={styles.selectedTextStyle}
                data={dataYear}
                //search
                maxHeight={300}
                labelField="label"
                valueField="value"
                placeholder={!isYearFocus ? 'Select year' : '...'}
                searchPlaceholder="Search..."
                value={yearvalue}
                onFocus={() => setYearIsFocus(true)}
                onBlur={() => setYearIsFocus(false)}
                onChange={item => {
                  setYearValue(item.value);
                  setYearIsFocus(false);
                }}
              />
              <Dropdown
                style={[styles.dropdownHalf, isMonthFocus && { borderColor: '#DDD' }]}
                placeholderStyle={styles.placeholderStyle}
                selectedTextStyle={styles.selectedTextStyle}
                inputSearchStyle={styles.inputSearchStyle}
                itemTextStyle={styles.selectedTextStyle}
                data={dataMonth}
                //search
                maxHeight={300}
                labelField="label"
                valueField="value"
                placeholder={!isStateFocus ? 'Select month' : '...'}
                searchPlaceholder="Search..."
                value={monthvalue}
                onFocus={() => setMonthIsFocus(true)}
                onBlur={() => setMonthIsFocus(false)}
                onChange={item => {
                  setMonthValue(item.value);
                  setMonthIsFocus(false);
                }}
              />
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={styles.header}>Bank Account</Text>
              <TouchableOpacity onPress={() => toggleModal()}>
                <Text style={{ fontFamily: 'DMSans-Medium', fontSize: responsiveFontSize(1.7), color: '#444343', marginBottom: responsiveHeight(1), }}>{accountChangeRequest ? 'Cancel' : 'Change'}</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.inputView}>
              <InputField
                label={'Account No'}
                keyboardType=" "
                value={accountno}
                //helperText={'Please enter lastname'}
                inputType={accountChangeRequest ? 'others' : 'nonedit'}
                onChangeText={(text) => changeAccountNo(text)}
              />
            </View>
            {accountChangeRequest ?
              pickedCancelCheque == null ?
                <View style={{ height: responsiveHeight(18), width: responsiveWidth(88), borderColor: '#E0E0E0', borderWidth: 1, borderRadius: 10, borderStyle: 'dashed', backgroundColor: '#FAFAFA', marginBottom: responsiveHeight(2) }}>
                  <View style={{ flexDirection: 'column', alignItems: 'center', marginVertical: 40 }}>

                    <TouchableOpacity onPress={() => pickDocument('CancelCheque')}>
                      <Image
                        source={uploadImg}
                        style={{ height: 25, width: 25, resizeMode: 'contain', marginBottom: 5 }}
                      />
                    </TouchableOpacity>
                    <Text style={{ fontFamily: 'DMSans-Regular', fontSize: responsiveFontSize(1.5), color: '#808080', }}>Upload Cancel Cheque</Text>
                  </View>
                </View>
                :
                <View>
                  <Image source={{ uri: pickedCancelCheque.uri }} style={{ height: responsiveHeight(18), width: responsiveWidth(88), borderRadius: 10, marginBottom: responsiveHeight(2) }} />
                  <View style={{ position: 'absolute', right: 15, top: 7 }}>
                    <TouchableOpacity onPress={() => deleteCancelChequeImg()}>
                      <Image
                        source={deleteRoundImg}
                        style={{ height: 25, width: 25 }}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              : <></>}
            <Text
              style={styles.header}>
              Upload Supporting Documents
            </Text>
            <ScrollView contentContainerStyle={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: responsiveHeight(2), flexWrap: 'wrap', }}>
              {alldocument ?
                alldocument?.map((doc) => (
                  // <View style={{ height: responsiveHeight(18), width: responsiveWidth(40), borderColor: '#E0E0E0', borderWidth: 1, borderRadius: 10, borderStyle: 'dashed', backgroundColor: '#FAFAFA',marginBottom:10 }}>
                  <Image
                    source={{ uri: doc.document_file }}
                    style={{ height: responsiveHeight(18), width: responsiveWidth(40), resizeMode: 'contain', borderRadius: 10, marginBottom: 10 }}
                  />
                  // </View>
                ))
                :
                <Text>No documents uploaded yet</Text>
              }

            </ScrollView>

            <Text
              style={[styles.header, { marginTop: responsiveHeight(2) }]}>
              Upload Picture
            </Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: responsiveHeight(2), marginTop: responsiveHeight(1) }}>
              {pickedDocument == null ?
                <View style={{ height: responsiveHeight(18), width: responsiveWidth(40), borderColor: '#E0E0E0', borderWidth: 1, borderRadius: 10, borderStyle: 'dashed', backgroundColor: '#FAFAFA' }}>
                  <View style={{ flexDirection: 'column', alignItems: 'center', marginVertical: 40 }}>

                    <TouchableOpacity onPress={() => pickDocument('profilepic')}>
                      <Image
                        source={uploadPicImg}
                        style={{ height: 25, width: 25, resizeMode: 'contain', marginBottom: 5 }}
                      />
                    </TouchableOpacity>
                    <Text style={{ fontFamily: 'DMSans-Regular', fontSize: responsiveFontSize(1.5), color: '#808080', }}>Upload Photo</Text>
                  </View>
                </View>
                :
                <View>
                  <Image source={{ uri: pickedDocument }} style={{ height: responsiveHeight(18), width: responsiveWidth(40), borderRadius: 10 }} />
                  <View style={{ position: 'absolute', right: 15, top: 7 }}>
                    <TouchableOpacity onPress={() => deleteProfileImg()}>
                      <Image
                        source={deleteRoundImg}
                        style={{ height: 25, width: 25 }}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              }
            </View>
          </View>

        </View>
        <View style={styles.buttonwrapper}>
          <CustomButton label={"Submit For Review"}
            // onPress={() => { login() }}
            onPress={() => { submitForm() }}
          />
        </View>
      </KeyboardAwareScrollView>
      <Modal
        isVisible={isModalVisible}
        style={{
          margin: 0, // Add this line to remove the default margin
          justifyContent: 'flex-end',
        }}>
        <View style={{ justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff', height: 50, width: 50, borderRadius: 25, position: 'absolute', bottom: '45%', left: '45%', right: '45%' }}>
          <Icon name="cross" size={30} color="#000" onPress={toggleModal} />
        </View>
        <View style={{ height: '39%', backgroundColor: '#fff', position: 'absolute', bottom: 0, width: '100%' }}>
          <View style={{ padding: 25 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', }}>
              <Text style={styles.header}>Bank Account</Text>
              <TouchableOpacity onPress={() => toggleModal()}>
                <Text style={{ fontFamily: 'DMSans-Medium', fontSize: responsiveFontSize(1.7), color: '#444343', marginBottom: responsiveHeight(1), }}>Cancel</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.inputView}>
              <InputField
                label={'Aadhar No'}
                keyboardType=" "
                value={'56897 85698 78965 96636'}
                //helperText={'Please enter lastname'}
                inputType={'others'}
                onChangeText={(text) => changeAadhar(text)}
              />
            </View>
            <View style={{ height: responsiveHeight(18), width: responsiveWidth(88), borderColor: '#E0E0E0', borderWidth: 1, borderRadius: 10, borderStyle: 'dashed', backgroundColor: '#FAFAFA' }}>
              <View style={{ flexDirection: 'column', alignItems: 'center', marginVertical: 40 }}>

                <TouchableOpacity onPress={() => pickDocument('DrivingLicenseBack')}>
                  <Image
                    source={uploadImg}
                    style={{ height: 25, width: 25, resizeMode: 'contain', marginBottom: 5 }}
                  />
                </TouchableOpacity>

                {!pickedDrivingLicenseBack ?
                  <Text style={{ fontFamily: 'DMSans-Regular', fontSize: responsiveFontSize(1.5), color: '#808080', }}>Upload Cancel Cheque</Text>
                  :
                  <Text style={{ fontFamily: 'DMSans-Regular', fontSize: responsiveFontSize(1.5), color: '#808080', paddingHorizontal: 5 }}>{pickedDrivingLicenseBack.name}</Text>
                }
              </View>
            </View>
          </View>

        </View>
      </Modal>
    </SafeAreaView >
  );
};

export default ProfileScreen;

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
    bottom: 0,
    width: responsiveWidth(100),
  },
  searchInput: {
    color: '#333',
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 10,
    //borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 5
  },
  dropdownMenu: {
    backgroundColor: '#FFF'
  },
  dropdownMenuSubsection: {
    borderBottomWidth: 0,

  },
  mainWrapper: {
    flex: 1,
    marginTop: responsiveHeight(1)

  },
  dropdown: {
    height: responsiveHeight(7.2),
    borderColor: '#DDD',
    borderWidth: 0.7,
    borderRadius: 5,
    paddingHorizontal: 8,
    marginTop: 5,
    marginBottom: responsiveHeight(4)
  },
  placeholderStyle: {
    fontSize: responsiveFontSize(1.8),
    color: '#2F2F2F',
    fontFamily: 'DMSans-Regular'
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
  dropdownHalf: {
    height: responsiveHeight(7.2),
    width: responsiveWidth(40),
    borderColor: '#DDD',
    borderWidth: 0.7,
    borderRadius: 5,
    paddingHorizontal: 8,
    marginTop: 5,
    marginBottom: responsiveHeight(4)
  },
});
