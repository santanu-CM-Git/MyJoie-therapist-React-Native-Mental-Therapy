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
import MultiSelect from 'react-native-multiple-select';
import { Dropdown } from 'react-native-element-dropdown';
import Toast from 'react-native-toast-message';
import { CountryPicker } from "react-native-country-codes-picker";

// const qualificationitems = [
//   { id: '92iijs7yta', name: 'Ondo' },
//   { id: 'a0s0a8ssbsd', name: 'Ogun' },
//   { id: '16hbajsabsd', name: 'Calabar' },
//   { id: 'nahs75a5sg', name: 'Lagos' },
//   { id: '667atsas', name: 'Maiduguri' },
//   { id: 'hsyasajs', name: 'Anambra' },
//   { id: 'djsjudksjd', name: 'Benue' },
//   { id: 'sdhyaysdj', name: 'Kaduna' },
//   { id: 'suudydjsjd', name: 'Abuja' }
// ];
// const qualificationitemsType = [
//   { id: '1', name: 'Individual' },
//   { id: '2', name: 'Couple' },
//   { id: '3', name: 'Child' },

// ];
// const qualificationitemsLanguage = [
//   { id: '1', content: 'Hindi' },
//   { id: '2', content: 'English' },
//   { id: '3', content: 'Gujrati' },
// ];
const dataYear = [
  { label: '01', value: '1' },{ label: '02', value: '2' },{ label: '03', value: '3' },{ label: '04', value: '4' },{ label: '05', value: '5' },{ label: '06', value: '6' },{ label: '07', value: '7' },{ label: '08', value: '8' },{ label: '09', value: '9' },{ label: '10', value: '10' },
  { label: '11', value: '11' },
  { label: '12', value: '12' },
  { label: '13', value: '13' },
  { label: '14', value: '14' },
  { label: '15', value: '15' },
  { label: '16', value: '16' },
  { label: '17', value: '17' },
  { label: '18', value: '18' },
  { label: '19', value: '19' },
  { label: '20', value: '20' },

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
  { label: '11', value: '11' },
];

const PersonalInformation = ({ navigation, route }) => {
  const concatNo = route?.params?.countrycode + '-' + route?.params?.phoneno;

  const [firstname, setFirstname] = useState('');
  const [firstNameError, setFirstNameError] = useState('')
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('')
  const [phoneno, setPhoneno] = useState('');
  const [phonenoError, setPhonenoError] = useState('')
  const [countryCode, setCountryCode] = useState('+91');
  const [show, setShow] = useState(false);

  const [isLoading, setIsLoading] = useState(true)
  const { login, userToken } = useContext(AuthContext);

  // Qualification dropdown
  const [qualificationitems, setqualificationitems] = useState([])
  const [selectedItems, setSelectedItems] = useState([]);
  const multiSelectRef = useRef(null);
  const onSelectedItemsChange = selectedItems => {
    setSelectedItems(selectedItems);
  };

  // Type dropdown
  const [qualificationitemsType, setqualificationitemsType] = useState([])
  const [selectedItemsType, setSelectedItemsType] = useState([]);
  const [selectedItemError, setSelectedItemError] = useState('')
  const multiSelectRefType = useRef(null);
  const onSelectedItemsChangeType = selectedItems => {
    setSelectedItemsType(selectedItems);
    setSelectedItemError('')
  };

  // Language dropdown
  const [qualificationitemsLanguage, setqualificationitemsLanguage] = useState([])
  const [selectedItemsLanguage, setSelectedItemsLanguage] = useState([]);
  const [selectedItemLanguageError, setSelectedItemLanguageError] = useState('')
  const multiSelectRefLanguage = useRef(null);
  const onSelectedItemsChangeLanguage = selectedItems => {
    setSelectedItemsLanguage(selectedItems);
    setSelectedItemLanguageError('')
  };

  // experience dropdown
  const [yearvalue, setYearValue] = useState(null);
  const [isYearFocus, setYearIsFocus] = useState(false);

  const [monthvalue, setMonthValue] = useState(null);
  const [isMonthFocus, setMonthIsFocus] = useState(false);


  const changeFirstname = (text) => {
    setFirstname(text)
    if (text) {
      setFirstNameError('')
    } else {
      setFirstNameError('Please enter Name')
    }
  }

  const changeEmail = (text) => {
    let reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w\w+)+$/;
    if (reg.test(text) === false) {
      console.log("Email is Not Correct");
      setEmail(text)
      setEmailError('Please enter correct Email Id')
      return false;
    }
    else {
      setEmailError('')
      console.log("Email is Correct");
      setEmail(text)
    }
  }

  const changePhone = (text) => {
    let phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(text)) {
      setPhoneno(text)
      setPhonenoError('Please enter a 10-digit number.')
      return false;
    } else {
      setPhonenoError('')
      setPhoneno(text)
    }
  }

  const fetchLanguage = () => {
    axios.get(`${API_URL}/languages`, {
      headers: {
        "Content-Type": 'application/json'
      },
    })
      .then(res => {
        let languageInfo = res.data.data;
        //console.log(languageInfo, 'bbbbbbb')
        setqualificationitemsLanguage(languageInfo)
        setIsLoading(false);
      })
      .catch(e => {
        console.log(`Language fetch error ${e}`)
      });
  }
  const fetchQualification = () => {
    axios.get(`${API_URL}/qualifications`, {
      headers: {
        "Content-Type": 'application/json'
      },
    })
      .then(res => {
        let qualificationInfo = res.data.data;
        setqualificationitems(qualificationInfo)
        setIsLoading(false);
      })
      .catch(e => {
        console.log(`qualification fetch error ${e}`)
      });
  }
  const fetchTherapyType = () => {
    axios.get(`${API_URL}/therapy-type`, {
      headers: {
        "Content-Type": 'application/json'
      },
    })
      .then(res => {
        let therapyTypeInfo = res.data.data;
        setqualificationitemsType(therapyTypeInfo)
        setIsLoading(false);
      })
      .catch(e => {
        console.log(`therapytype fetch error ${e}`)
      });
  }

  useEffect(() => {
    fetchLanguage();
    fetchQualification();
    fetchTherapyType();
  }, [])

  const submitForm = () => {
    //navigation.navigate('DocumentsUpload')
    if (!firstname) {
      setFirstNameError('Please enter Name')
    } else if (!email) {
      setEmailError('Please enter Email Id')
    } else if (!phoneno) {
      setPhonenoError('Please enter Mobile No')
    }else if(!countryCode){
      setPhonenoError('Please enter Country Code.')
    } else if (selectedItemsType && selectedItemsType.length == 0) {
      setSelectedItemError('Please select type of therapist')
    } else if (selectedItemsLanguage && selectedItemsLanguage.length == 0) {
      setSelectedItemLanguageError('Please select Language')
    } else {
      //   const formData = new FormData();
      //   formData.append("name", firstname);
      //   formData.append("email", email);
      //   formData.append("mobile", phoneno);
      //   formData.append("therapy_types", selectedItemsType);
      //   formData.append("languages", selectedItemsLanguage);
      //   formData.append("qualifications", selectedItems);
      //   const experienceValue = yearvalue + '.' + monthvalue;
      //   formData.append("experience", experienceValue);
      //  console.log(JSON.stringify(formData), 'form data')
      setIsLoading(true)
      var experienceValue = ''
      if (yearvalue && monthvalue) {
        var experienceValue = yearvalue + '.' + monthvalue;
      } else {
        var experienceValue = '';
      }

      const option = {
        "name": firstname,
        "email": email,
        "mobile": phoneno,
        "country_code": countryCode,
        "therapy_types": selectedItemsType,
        "languages": selectedItemsLanguage,
        "qualifications": selectedItems,
        "experience": experienceValue,
      }
      console.log(option, 'kkkkkkkkk')
      //navigation.navigate('Thankyou')

      axios.post(`${API_URL}/therapist/registration`, option, {
        headers: {
          'Accept': 'application/json',
          //'Content-Type': 'multipart/form-data',
        },
      })
        .then(res => {
          console.log(res.data)
          if (res.data.response == true) {
            setIsLoading(false)
            Toast.show({
              type: 'success',
              text1: 'Hello',
              text2: "Registration Successfull",
              position: 'top',
              topOffset: Platform.OS == 'ios' ? 55 : 20
            });
            navigation.navigate('Thankyou')
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
    }
  }

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
            {firstNameError ? <Text style={{ color: 'red', fontFamily: 'DMSans-Regular' }}>{firstNameError}</Text> : <></>}
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
            {emailError ? <Text style={{ color: 'red', fontFamily: 'DMSans-Regular' }}>{emailError}</Text> : <></>}
            <View style={styles.inputView}>
              <InputField
                label={'e.g. abc@gmail.com'}
                keyboardType=" "
                value={email}
                //helperText={'Please enter lastname'}
                inputType={'others'}
                onChangeText={(text) => changeEmail(text)}
              />
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.header}>Mobile Number</Text>
              <Text style={styles.requiredheader}>*</Text>
            </View>
            {phonenoError ? <Text style={{ color: 'red', fontFamily: 'DMSans-Regular' }}>{phonenoError}</Text> : <></>}
            <View style={[styles.inputView, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}>

              <View style={styles.countryModal}>
                <TouchableOpacity onPress={() => setShow(true)} style={styles.countryInputView}>
                  <Text style={{ color: '#808080', fontSize: responsiveFontSize(2) }}>{countryCode}</Text>
                </TouchableOpacity>
                <CountryPicker
                  show={show}
                  initialState={'+91'}
                  pickerButtonOnPress={(item) => {
                    setCountryCode(item.dial_code);
                    setShow(false);
                  }}
                  style={{
                    modal: {
                      height: responsiveHeight(60),
                    },
                  }}
                />
              </View>
              <InputField
                label={'Mobile number'}
                keyboardType=" "
                value={phoneno}
                //helperText={firstNameError}
                inputType={'login'}
                onChangeText={(text) => changePhone(text)}
              />
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.header}>Type of Therapies</Text>
              <Text style={styles.requiredheader}>*</Text>
            </View>
            {selectedItemError ? <Text style={{ color: 'red', fontFamily: 'DMSans-Regular' }}>{selectedItemError}</Text> : <></>}
            <View style={{ flex: 1, marginVertical: responsiveHeight(1) }}>
              <View style={{ paddingHorizontal: 5, borderColor: '#E0E0E0', borderWidth: 1, borderRadius: 8, width: responsiveWidth(88) }}>
                <MultiSelect
                  hideTags
                  items={qualificationitemsType}
                  uniqueKey="id"
                  ref={multiSelectRefType}
                  onSelectedItemsChange={onSelectedItemsChangeType}
                  selectedItems={selectedItemsType}
                  selectText="Pick Type"
                  searchInputPlaceholderText="Search Type..."
                  onChangeInput={(text) => console.log(text)}
                  altFontFamily="DMSans-Regular"
                  tagRemoveIconColor="#000000"
                  tagBorderColor="#417AA4"
                  tagTextColor="#2D2D2D"
                  selectedItemTextColor="#000"
                  selectedItemIconColor="#000"
                  itemTextColor="#746868"
                  displayKey="type"
                  searchInputStyle={styles.searchInput}
                  styleDropdownMenu={styles.dropdownMenu}
                  styleDropdownMenuSubsection={styles.dropdownMenuSubsection}
                  styleMainWrapper={styles.mainWrapper}
                  submitButtonColor="#417AA4"
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
              <Text style={styles.requiredheader}>*</Text>
            </View>
            {selectedItemLanguageError ? <Text style={{ color: 'red', fontFamily: 'DMSans-Regular' }}>{selectedItemLanguageError}</Text> : <></>}
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
                  tagBorderColor="#417AA4"
                  tagTextColor="#2D2D2D"
                  selectedItemTextColor="#000"
                  selectedItemIconColor="#000"
                  itemTextColor="#746868"
                  displayKey="content"
                  searchInputStyle={styles.searchInput}
                  styleDropdownMenu={styles.dropdownMenu}
                  styleDropdownMenuSubsection={styles.dropdownMenuSubsection}
                  styleMainWrapper={styles.mainWrapper}
                  submitButtonColor="#417AA4"
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
              <View style={{ paddingHorizontal: 5, borderColor: '#E0E0E0', borderWidth: 1, borderRadius: 8, width: responsiveWidth(88) }}>
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
                  tagBorderColor="#417AA4"
                  tagTextColor="#2D2D2D"
                  selectedItemTextColor="#000"
                  selectedItemIconColor="#000"
                  itemTextColor="#746868"
                  displayKey="content"
                  searchInputStyle={styles.searchInput}
                  styleDropdownMenu={styles.dropdownMenu}
                  styleDropdownMenuSubsection={styles.dropdownMenuSubsection}
                  styleMainWrapper={styles.mainWrapper}
                  submitButtonColor="#417AA4"
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
                placeholder={!isMonthFocus ? 'Select month' : '...'}
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

          </View>
        </View>
        <View style={styles.buttonwrapper}>
          <CustomButton label={"Submit"}
            //onPress={() => { navigation.navigate('Thankyou') }}
            onPress={() => { submitForm() }}
          />
        </View>
        <View style={{ paddingHorizontal: 20, flexDirection: 'row', justifyContent: 'space-between', }}>
          <Text style={{ fontFamily: 'DMSans-Regular', fontSize: responsiveFontSize(1.5), color: '#746868' }}>Already Have an account?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={{ fontFamily: 'DMSans-SemiBold', fontSize: responsiveFontSize(1.5), color: '#2D2D2D' }}>Sign In</Text>
          </TouchableOpacity>
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
    fontFamily: 'DMSans-Regular',
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
  countryModal: {

  },
  countryInputView: {
    height: responsiveHeight(7),
    width: responsiveWidth(15),
    borderColor: '#E0E0E0',
    borderWidth: 1,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 5,
    marginTop: -responsiveHeight(2)
  },
});
