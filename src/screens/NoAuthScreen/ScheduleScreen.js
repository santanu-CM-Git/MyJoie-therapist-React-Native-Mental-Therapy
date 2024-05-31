import React, { useContext, useState, useEffect } from 'react';
import { View, Text, SafeAreaView, StyleSheet, ScrollView, Switch, Image, Platform, Alert, Button } from 'react-native'
import CustomHeader from '../../components/CustomHeader'
import CustomButton from '../../components/CustomButton';
import { responsiveFontSize, responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { ArrowGratter, GreenTick, dateIcon, deleteImg, dotIcon, plus, timeIcon } from '../../utils/Images'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import Icon from 'react-native-vector-icons/Entypo';
import Modal from "react-native-modal";
import moment from 'moment-timezone';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import axios from 'axios';
import { API_URL } from '@env'
import Toast from 'react-native-toast-message';
import Loader from '../../utils/Loader';
const data = [
    { label: 'Today', value: '1' },
    { label: 'Date Wise', value: '2' },
];

const ScheduleScreen = ({ navigation }) => {

    const [isLoading, setIsLoading] = useState(false)

    const [groupedSlots, setGroupedSlots] = useState([]);
    const [savePatientDetails, setSavePatientDetails] = useState(null)

    const [activeTab, setActiveTab] = useState('Calender')
    // Monday
    const [isEnabled, setIsEnabled] = useState(false);
    const toggleSwitch = () => {
        setIsEnabled(previousState => !previousState)
        if (timeRanges.length != 0) {
            availabilityCheck('monday')
        }
    };
    // Tuesday
    const [isEnabledTuesday, setIsEnabledTuesday] = useState(false);
    const toggleSwitchTuesday = () => {
        setIsEnabledTuesday(previousState => !previousState)
        if (timeRangesTuesday.length != 0) {
            availabilityCheck('tuesday')
        }
    };
    // Wednesday
    const [isEnabledWednesday, setIsEnabledWednesday] = useState(false);
    const toggleSwitchWednesday = () => {
        setIsEnabledWednesday(previousState => !previousState)
        if (timeRangesWednesday.length != 0) {
            availabilityCheck('wednessday')
        }
    };
    // Thursday
    const [isEnabledThursday, setIsEnabledThursday] = useState(false);
    const toggleSwitchThursday = () => {
        setIsEnabledThursday(previousState => !previousState)
        if (timeRangesThursday.length != 0) {
            availabilityCheck('thursday')
        }
    };
    // Friday
    const [isEnabledFriday, setIsEnabledFriday] = useState(false);
    const toggleSwitchFriday = () => {
        setIsEnabledFriday(previousState => !previousState)
        if (timeRangesFriday.length != 0) {
            availabilityCheck('friday')
        }
    };
    // Saturday
    const [isEnabledSaturday, setIsEnabledSaturday] = useState(false);
    const toggleSwitchSaturday = () => {
        setIsEnabledSaturday(previousState => !previousState)
        if (timeRangesSaturday.length != 0) {
            availabilityCheck('saturday')
        }
    };
    // Sunday
    const [isEnabledSunday, setIsEnabledSunday] = useState(false);
    const toggleSwitchSunday = () => {
        setIsEnabledSunday(previousState => !previousState)
        if (timeRangesSunday.length != 0) {
            availabilityCheck('sunday')
        }
    };

    const [isModalVisible, setModalVisible] = useState(false);
    const [isFocus, setIsFocus] = useState(false);
    const [startDay, setStartDay] = useState(null);
    const [endDay, setEndDay] = useState(null);
    const [markedDates, setMarkedDates] = useState({});
    // Monday 
    const [timeRanges, setTimeRanges] = useState([{ startTime: null, endTime: null }]);
    const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
    const [currentRange, setCurrentRange] = useState(null);
    const [isStartTime, setIsStartTime] = useState(true);

    const showDatePicker = (index, isStart) => {
        setDatePickerVisibility(true);
        setCurrentRange(index);
        setIsStartTime(isStart);
    };

    const hideDatePicker = () => {
        setDatePickerVisibility(false);
    };

    const handleConfirm = (date) => {
        const dateInIST = moment(date).tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss'); // Convert to IST and back to JS Date object

        setTimeRanges(currentRanges => {
            const newRanges = [...currentRanges];
            if (isStartTime) {
                newRanges[currentRange].startTime = dateInIST;
            } else {
                //newRanges[currentRange].endTime = dateInIST;
                const startTime = newRanges[currentRange].startTime;
                if (startTime && moment(dateInIST).isBefore(moment(startTime))) {
                    Alert.alert('Invalid Time', 'End time must be greater than start time.');
                    return currentRanges; // Do not update state
                }
                newRanges[currentRange].endTime = dateInIST;
            }
            return newRanges;
        });
        hideDatePicker();
    };

    const addNewTimeRange = () => {
        setTimeRanges(currentRanges => [...currentRanges, { startTime: null, endTime: null }]);
    };

    const deleteTimeRange = index => {
        setTimeRanges(currentRanges => currentRanges.filter((_, i) => i !== index));
    };

    const saveTimeRange = () => {
        console.log(timeRanges)
        let filteredEvents = timeRanges.filter(event => event.startTime !== null && event.endTime !== null);
        console.log(filteredEvents, 'Monday time')
        const extractedTimes = filteredEvents.map(item => ({
            startTime: item.startTime.split(' ')[1],
            endTime: item.endTime.split(' ')[1],
        }));
        // Update state
        console.log(extractedTimes);
        beforetimeEntryRespectOfDay("monday", extractedTimes, "1")
    }

    // Tuesday
    const [timeRangesTuesday, setTimeRangesTuesday] = useState([{ startTime: null, endTime: null }]);
    const [isDatePickerVisibleTuesday, setDatePickerVisibilityTuesday] = useState(false);
    const [currentRangeTuesday, setCurrentRangeTuesday] = useState(null);
    const [isStartTimeTuesday, setIsStartTimeTuesday] = useState(true);

    const showDatePickerTuesday = (index, isStart) => {
        setDatePickerVisibilityTuesday(true);
        setCurrentRangeTuesday(index);
        setIsStartTimeTuesday(isStart);
    };

    const hideDatePickerTuesday = () => {
        setDatePickerVisibilityTuesday(false);
    };

    const handleConfirmTuesday = (date) => {
        console.log('hiiiii');
        const dateInIST = moment(date).tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss'); // Convert to IST and back to JS Date object

        setTimeRangesTuesday(currentRanges => {
            const newRanges = [...currentRanges];
            if (isStartTimeTuesday) {
                newRanges[currentRangeTuesday].startTime = dateInIST;
            } else {
                //newRanges[currentRangeTuesday].endTime = dateInIST;
                const startTime = newRanges[currentRangeTuesday].startTime;
                if (startTime && moment(dateInIST).isBefore(moment(startTime))) {
                    Alert.alert('Invalid Time', 'End time must be greater than start time.');
                    return currentRanges; // Do not update state
                }
                newRanges[currentRangeTuesday].endTime = dateInIST;
            }
            return newRanges;
        });
        hideDatePickerTuesday();
    };

    const addNewTimeRangeTuesday = () => {
        setTimeRangesTuesday(currentRanges => [...currentRanges, { startTime: null, endTime: null }]);
    };

    const deleteTimeRangeTuesday = index => {
        setTimeRangesTuesday(currentRanges => currentRanges.filter((_, i) => i !== index));
    };

    const saveTimeRangeTuesday = () => {
        console.log(timeRangesTuesday)
        let filteredEvents = timeRangesTuesday.filter(event => event.startTime !== null && event.endTime !== null);
        console.log(filteredEvents, 'Tuesday time')
        const extractedTimes = filteredEvents.map(item => ({
            startTime: item.startTime.split(' ')[1],
            endTime: item.endTime.split(' ')[1],
        }));
        // Update state
        console.log(extractedTimes, 'tuesday time');
        beforetimeEntryRespectOfDay("tuesday", extractedTimes, "1")
    }

    // Wednesday
    const [timeRangesWednesday, setTimeRangesWednesday] = useState([{ startTime: null, endTime: null }]);
    const [isDatePickerVisibleWednesday, setDatePickerVisibilityWednesday] = useState(false);
    const [currentRangeWednesday, setCurrentRangeWednesday] = useState(null);
    const [isStartTimeWednesday, setIsStartTimeWednesday] = useState(true);

    const showDatePickerWednesday = (index, isStart) => {
        setDatePickerVisibilityWednesday(true);
        setCurrentRangeWednesday(index);
        setIsStartTimeWednesday(isStart);
    };

    const hideDatePickerWednesday = () => {
        setDatePickerVisibilityWednesday(false);
    };

    const handleConfirmWednesday = (date) => {
        const dateInIST = moment(date).tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss'); // Convert to IST and back to JS Date object

        setTimeRangesWednesday(currentRanges => {
            const newRanges = [...currentRanges];
            if (isStartTimeWednesday) {
                newRanges[currentRangeWednesday].startTime = dateInIST;
            } else {
                //newRanges[currentRangeWednesday].endTime = dateInIST;
                const startTime = newRanges[currentRangeWednesday].startTime;
                if (startTime && moment(dateInIST).isBefore(moment(startTime))) {
                    Alert.alert('Invalid Time', 'End time must be greater than start time.');
                    return currentRanges; // Do not update state
                }
                newRanges[currentRangeWednesday].endTime = dateInIST;
            }
            return newRanges;
        });
        hideDatePickerWednesday();
    };

    const addNewTimeRangeWednesday = () => {
        setTimeRangesWednesday(currentRanges => [...currentRanges, { startTime: null, endTime: null }]);
    };

    const deleteTimeRangeWednesday = index => {
        setTimeRangesWednesday(currentRanges => currentRanges.filter((_, i) => i !== index));
    };

    const saveTimeRangeWednesday = () => {
        console.log(timeRangesWednesday)
        let filteredEvents = timeRangesWednesday.filter(event => event.startTime !== null && event.endTime !== null);
        console.log(filteredEvents)
        const extractedTimes = filteredEvents.map(item => ({
            startTime: item.startTime.split(' ')[1],
            endTime: item.endTime.split(' ')[1],
        }));
        // Update state
        console.log(extractedTimes);
        beforetimeEntryRespectOfDay("wednessday", extractedTimes, "1")
    }

    // Thursday
    const [timeRangesThursday, setTimeRangesThursday] = useState([{ startTime: null, endTime: null }]);
    const [isDatePickerVisibleThursday, setDatePickerVisibilityThursday] = useState(false);
    const [currentRangeThursday, setCurrentRangeThursday] = useState(null);
    const [isStartTimeThursday, setIsStartTimeThursday] = useState(true);

    const showDatePickerThursday = (index, isStart) => {
        setDatePickerVisibilityThursday(true);
        setCurrentRangeThursday(index);
        setIsStartTimeThursday(isStart);
    };

    const hideDatePickerThursday = () => {
        setDatePickerVisibilityThursday(false);
    };

    const handleConfirmThursday = (date) => {
        const dateInIST = moment(date).tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss'); // Convert to IST and back to JS Date object

        setTimeRangesThursday(currentRanges => {
            const newRanges = [...currentRanges];
            if (isStartTimeThursday) {
                newRanges[currentRangeThursday].startTime = dateInIST;
            } else {
                //newRanges[currentRangeThursday].endTime = dateInIST;
                const startTime = newRanges[currentRangeThursday].startTime;
                if (startTime && moment(dateInIST).isBefore(moment(startTime))) {
                    Alert.alert('Invalid Time', 'End time must be greater than start time.');
                    return currentRanges; // Do not update state
                }
                newRanges[currentRangeThursday].endTime = dateInIST;
            }
            return newRanges;
        });
        hideDatePickerThursday();
    };

    const addNewTimeRangeThursday = () => {
        setTimeRangesThursday(currentRanges => [...currentRanges, { startTime: null, endTime: null }]);
    };

    const deleteTimeRangeThursday = index => {
        setTimeRangesThursday(currentRanges => currentRanges.filter((_, i) => i !== index));
    };

    const saveTimeRangeThursday = () => {
        console.log(timeRangesThursday)
        let filteredEvents = timeRangesThursday.filter(event => event.startTime !== null && event.endTime !== null);
        console.log(filteredEvents)
        const extractedTimes = filteredEvents.map(item => ({
            startTime: item.startTime.split(' ')[1],
            endTime: item.endTime.split(' ')[1],
        }));
        // Update state
        console.log(extractedTimes);
        beforetimeEntryRespectOfDay("thursday", extractedTimes, "1")
    }
    // Friday
    const [timeRangesFriday, setTimeRangesFriday] = useState([{ startTime: null, endTime: null }]);
    const [isDatePickerVisibleFriday, setDatePickerVisibilityFriday] = useState(false);
    const [currentRangeFriday, setCurrentRangeFriday] = useState(null);
    const [isStartTimeFriday, setIsStartTimeFriday] = useState(true);

    const showDatePickerFriday = (index, isStart) => {
        setDatePickerVisibilityFriday(true);
        setCurrentRangeFriday(index);
        setIsStartTimeFriday(isStart);
    };

    const hideDatePickerFriday = () => {
        setDatePickerVisibilityFriday(false);
    };

    const handleConfirmFriday = (date) => {
        const dateInIST = moment(date).tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss'); // Convert to IST and back to JS Date object

        setTimeRangesFriday(currentRanges => {
            const newRanges = [...currentRanges];
            if (isStartTimeFriday) {
                newRanges[currentRangeFriday].startTime = dateInIST;
            } else {
                //newRanges[currentRangeFriday].endTime = dateInIST;
                const startTime = newRanges[currentRangeFriday].startTime;
                if (startTime && moment(dateInIST).isBefore(moment(startTime))) {
                    Alert.alert('Invalid Time', 'End time must be greater than start time.');
                    return currentRanges; // Do not update state
                }
                newRanges[currentRangeFriday].endTime = dateInIST;
            }
            return newRanges;
        });
        hideDatePickerFriday();
    };

    const addNewTimeRangeFriday = () => {
        setTimeRangesFriday(currentRanges => [...currentRanges, { startTime: null, endTime: null }]);
    };

    const deleteTimeRangeFriday = index => {
        setTimeRangesFriday(currentRanges => currentRanges.filter((_, i) => i !== index));
    };

    const saveTimeRangeFriday = () => {
        console.log(timeRangesFriday)
        let filteredEvents = timeRangesFriday.filter(event => event.startTime !== null && event.endTime !== null);
        console.log(filteredEvents)
        const extractedTimes = filteredEvents.map(item => ({
            startTime: item.startTime.split(' ')[1],
            endTime: item.endTime.split(' ')[1],
        }));
        // Update state
        console.log(extractedTimes);
        beforetimeEntryRespectOfDay("friday", extractedTimes, "1")
    }

    // Saturday
    const [timeRangesSaturday, setTimeRangesSaturday] = useState([{ startTime: null, endTime: null }]);
    const [isDatePickerVisibleSaturday, setDatePickerVisibilitySaturday] = useState(false);
    const [currentRangeSaturday, setCurrentRangeSaturday] = useState(null);
    const [isStartTimeSaturday, setIsStartTimeSaturday] = useState(true);

    const showDatePickerSaturday = (index, isStart) => {
        setDatePickerVisibilitySaturday(true);
        setCurrentRangeSaturday(index);
        setIsStartTimeSaturday(isStart);
    };

    const hideDatePickerSaturday = () => {
        setDatePickerVisibilitySaturday(false);
    };

    const handleConfirmSaturday = (date) => {
        const dateInIST = moment(date).tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss'); // Convert to IST and back to JS Date object

        setTimeRangesSaturday(currentRanges => {
            const newRanges = [...currentRanges];
            if (isStartTimeSaturday) {
                newRanges[currentRangeSaturday].startTime = dateInIST;
            } else {
                //newRanges[currentRangeSaturday].endTime = dateInIST;
                const startTime = newRanges[currentRangeSaturday].startTime;
                if (startTime && moment(dateInIST).isBefore(moment(startTime))) {
                    Alert.alert('Invalid Time', 'End time must be greater than start time.');
                    return currentRanges; // Do not update state
                }
                newRanges[currentRangeSaturday].endTime = dateInIST;
            }
            return newRanges;
        });
        hideDatePickerSaturday();
    };

    const addNewTimeRangeSaturday = () => {
        setTimeRangesSaturday(currentRanges => [...currentRanges, { startTime: null, endTime: null }]);
    };

    const deleteTimeRangeSaturday = index => {
        setTimeRangesSaturday(currentRanges => currentRanges.filter((_, i) => i !== index));
    };

    const saveTimeRangeSaturday = () => {
        console.log(timeRangesSaturday)
        let filteredEvents = timeRangesSaturday.filter(event => event.startTime !== null && event.endTime !== null);
        console.log(filteredEvents)
        const extractedTimes = filteredEvents.map(item => ({
            startTime: item.startTime.split(' ')[1],
            endTime: item.endTime.split(' ')[1],
        }));
        // Update state
        console.log(extractedTimes);
        beforetimeEntryRespectOfDay("saturday", extractedTimes, "1")
    }

    // Sunday
    const [timeRangesSunday, setTimeRangesSunday] = useState([{ startTime: null, endTime: null }]);
    const [isDatePickerVisibleSunday, setDatePickerVisibilitySunday] = useState(false);
    const [currentRangeSunday, setCurrentRangeSunday] = useState(null);
    const [isStartTimeSunday, setIsStartTimeSunday] = useState(true);

    const showDatePickerSunday = (index, isStart) => {
        setDatePickerVisibilitySunday(true);
        setCurrentRangeSunday(index);
        setIsStartTimeSunday(isStart);
    };

    const hideDatePickerSunday = () => {
        setDatePickerVisibilitySunday(false);
    };

    const handleConfirmSunday = (date) => {
        const dateInIST = moment(date).tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss'); // Convert to IST and back to JS Date object

        setTimeRangesSunday(currentRanges => {
            const newRanges = [...currentRanges];
            if (isStartTimeSunday) {
                newRanges[currentRangeSunday].startTime = dateInIST;
            } else {
                //newRanges[currentRangeSunday].endTime = dateInIST;
                const startTime = newRanges[currentRangeSunday].startTime;
                if (startTime && moment(dateInIST).isBefore(moment(startTime))) {
                    Alert.alert('Invalid Time', 'End time must be greater than start time.');
                    return currentRanges; // Do not update state
                }
                newRanges[currentRangeSunday].endTime = dateInIST;
            }
            return newRanges;
        });
        hideDatePickerSunday();
    };

    const addNewTimeRangeSunday = () => {
        setTimeRangesSunday(currentRanges => [...currentRanges, { startTime: null, endTime: null }]);
    };

    const deleteTimeRangeSunday = index => {
        setTimeRangesSunday(currentRanges => currentRanges.filter((_, i) => i !== index));
    };

    const saveTimeRangeSunday = () => {
        console.log(timeRangesSunday)
        let filteredEvents = timeRangesSunday.filter(event => event.startTime !== null && event.endTime !== null);
        console.log(filteredEvents)
        const extractedTimes = filteredEvents.map(item => ({
            startTime: item.startTime.split(' ')[1],
            endTime: item.endTime.split(' ')[1],
        }));
        // Update state
        console.log(extractedTimes);
        beforetimeEntryRespectOfDay("sunday", extractedTimes, "1")
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
        console.log(startDay)
        console.log(endDay)
        toggleModal()
    }

    const toggleModal = (data) => {
        console.log(data, 'ooooooooooooooo')
        setSavePatientDetails(data)
        setModalVisible(!isModalVisible);
    };

    const toggleTab = (name) => {
        setActiveTab(name)
    }

    const beforetimeEntryRespectOfDay = (day, time, status) => {
        console.log(day, 'llllllllll')
        const option = {
            "day": day,
        }
        AsyncStorage.getItem('userToken', (err, usertoken) => {
            axios.post(`${API_URL}/therapist/availabilities-check`, option, {
                headers: {
                    'Accept': 'application/json',
                    //'Content-Type': 'multipart/form-data',
                    "Authorization": 'Bearer ' + usertoken,
                },
            })
                .then(res => {
                    console.log(res.data)
                    if (res.data.response == true) {
                        setIsLoading(false)

                        if (res.data.status == 0) {
                            timeEntryinRespectOfDay(day, time, status)
                        } else {
                            Alert.alert('Hello', res.data.message, [
                                {
                                    text: 'Cancel',
                                    onPress: () => console.log('Cancel Pressed'),
                                    style: 'cancel',
                                },
                                { text: 'OK', onPress: () => timeEntryinRespectOfDay(day, time, status) },
                            ]);
                        }
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

    const timeEntryinRespectOfDay = (day, time, status) => {
        console.log(day, 'day')
        console.log(time, 'time')
        console.log(status, 'status')
        const option = {
            "day": day,
            "data": time,
            "status": status,
        }
        console.log(option)
        AsyncStorage.getItem('userToken', (err, usertoken) => {
            axios.post(`${API_URL}/therapist/set-availabilities`, option, {
                headers: {
                    'Accept': 'application/json',
                    //'Content-Type': 'multipart/form-data',
                    "Authorization": 'Bearer ' + usertoken,
                },
            })
                .then(res => {
                    console.log(res.data)
                    if (res.data.response == true) {
                        setIsLoading(false)
                        Toast.show({
                            type: 'success',
                            text1: 'Hello',
                            text2: "Time added successfully",
                            position: 'top',
                            topOffset: Platform.OS == 'ios' ? 55 : 20
                        });
                        fetchAvailability()
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
                    console.log(`set availibility error ${e}`)
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

    const fetchAvailability = () => {
        setIsLoading(true)
        AsyncStorage.getItem('userToken', (err, usertoken) => {
            axios.post(`${API_URL}/therapist/availabilities-data`, {}, {
                headers: {
                    'Accept': 'application/json',
                    "Authorization": 'Bearer ' + usertoken,
                    //'Content-Type': 'multipart/form-data',
                },
            })
                .then(res => {
                    console.log(JSON.stringify(res.data.data), 'fetch availability')
                    if (res.data.response == true) {
                        setIsLoading(false)
                        const mondayData = [];
                        const tuesdayData = [];
                        const wednessdayData = [];
                        const thursdayData = [];
                        const fridayData = [];
                        const saturdayData = [];
                        const sundayData = [];

                        res.data.data.forEach(item => {
                            item.availibilities_time.forEach(time => {
                                const transformedData = {
                                    startTime: `2024-05-09 ${time.start_time}`,
                                    endTime: `2024-05-09 ${time.end_time}`
                                };
                                if (item.day === 'monday') {
                                    mondayData.push(transformedData);
                                    if (item.status === '1') {
                                        setIsEnabled(true);
                                    }
                                } else if (item.day === 'tuesday') {
                                    tuesdayData.push(transformedData);
                                    if (item.status === '1') {
                                        setIsEnabledTuesday(true);
                                    }
                                } else if (item.day === 'wednessday') {
                                    wednessdayData.push(transformedData);
                                    if (item.status === '1') {
                                        setIsEnabledWednesday(true);
                                    }
                                } else if (item.day === 'thursday') {
                                    thursdayData.push(transformedData)
                                    if (item.status === '1') {
                                        setIsEnabledThursday(true);
                                    }
                                } else if (item.day === 'friday') {
                                    fridayData.push(transformedData)
                                    if (item.status === '1') {
                                        setIsEnabledFriday(true);
                                    }
                                } else if (item.day === 'saturday') {
                                    saturdayData.push(transformedData)
                                    if (item.status === '1') {
                                        setIsEnabledSaturday(true);
                                    }
                                } else if (item.day === 'sunday') {
                                    sundayData.push(transformedData)
                                    if (item.status === '1') {
                                        setIsEnabledSunday(true);
                                    }
                                }
                            });
                        });

                        // Update the states with the transformed data
                        setTimeRanges(mondayData);
                        setTimeRangesTuesday(tuesdayData);
                        setTimeRangesWednesday(wednessdayData)
                        setTimeRangesThursday(thursdayData)
                        setTimeRangesFriday(fridayData)
                        setTimeRangesSaturday(saturdayData)
                        setTimeRangesSunday(sundayData)
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

    const availabilityCheck = (day) => {
        console.log(day, 'llllllllll')
        const option = {
            "day": day,
        }
        AsyncStorage.getItem('userToken', (err, usertoken) => {
            axios.post(`${API_URL}/therapist/availabilities-check`, option, {
                headers: {
                    'Accept': 'application/json',
                    //'Content-Type': 'multipart/form-data',
                    "Authorization": 'Bearer ' + usertoken,
                },
            })
                .then(res => {
                    console.log(res.data)
                    if (res.data.response == true) {
                        setIsLoading(false)

                        if (res.data.status == 0) {
                            actionStatus(day)
                        } else {
                            Alert.alert('Hello', res.data.message, [
                                {
                                    text: 'Cancel',
                                    onPress: () => console.log('Cancel Pressed'),
                                    style: 'cancel',
                                },
                                { text: 'OK', onPress: () => actionStatus(day) },
                            ]);
                        }
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

    const actionStatus = (day) => {
        console.log(day, 'kkkkkkkkkkkkkkk')
        var status = ''
        if (day == 'monday') {
            if (isEnabled == true) {
                status = "0"
            } else {
                status = "1"
            }
        } else if (day == 'tuesday') {
            if (isEnabledTuesday == true) {
                status = "0"
            } else {
                status = "1"
            }
        } else if (day == 'wednessday') {
            if (isEnabledWednesday == true) {
                status = "0"
            } else {
                status = "1"
            }
        } else if (day == 'thursday') {
            if (isEnabledThursday == true) {
                status = "0"
            } else {
                status = "1"
            }
        } else if (day == 'friday') {
            if (isEnabledFriday == true) {
                status = "0"
            } else {
                status = "1"
            }
        } else if (day == 'saturday') {
            if (isEnabledSaturday == true) {
                status = "0"
            } else {
                status = "1"
            }
        } else if (day == 'sunday') {
            if (isEnabledSunday == true) {
                status = "0"
            } else {
                status = "1"
            }
        }
        const option = {
            "day": day,
            "status": status
        }
        console.log(option)
        AsyncStorage.getItem('userToken', (err, usertoken) => {
            axios.post(`${API_URL}/therapist/action_availabilities`, option, {
                headers: {
                    'Accept': 'application/json',
                    //'Content-Type': 'multipart/form-data',
                    "Authorization": 'Bearer ' + usertoken,
                },
            })
                .then(res => {
                    console.log(res.data)
                    if (res.data.response == true) {
                        setIsLoading(false)
                        Toast.show({
                            type: 'success',
                            text1: 'Hello',
                            text2: res.data.message,
                            position: 'top',
                            topOffset: Platform.OS == 'ios' ? 55 : 20
                        });

                        fetchAvailability()
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

                        // Group by date
                        const groupedData = sortedData.reduce((acc, slot) => {
                            const date = moment(slot.date).format('DD-MM-YYYY');
                            if (!acc[date]) {
                                acc[date] = [];
                            }
                            acc[date].push(slot);
                            return acc;
                        }, {});

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

    useEffect(() => {
        fetchUpcomingSlot()
        fetchAvailability()
    }, [])

    const formatISTTime = (time) => {
        return moment(time, 'HH:mm:ss').format('hh:mm A');
    };

    if (isLoading) {
        return (
            <Loader />
        )
    }

    return (
        <SafeAreaView style={styles.Container}>
            <CustomHeader commingFrom={'Schedule'} onPress={() => navigation.goBack()} title={'Schedule'} />
            <ScrollView style={styles.wrapper}>
                <View style={{ marginBottom: responsiveHeight(3) }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <TouchableOpacity onPress={() => toggleTab('Calender')}>
                            <View style={activeTab == 'Calender' ? styles.activeButtonView : styles.inActiveButtonView}>
                                <Text style={activeTab == 'Calender' ? styles.activeButtonText : styles.inActiveButtonText}>Calendar</Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => toggleTab('Availability')}>
                            <View style={activeTab == 'Availability' ? styles.activeButtonView : styles.inActiveButtonView}>
                                <Text style={activeTab == 'Availability' ? styles.activeButtonText : styles.inActiveButtonText}>Availability</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                    {activeTab == 'Calender' ?
                        <>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: responsiveHeight(2) }}>
                                <Text style={styles.headerText}>Calender</Text>
                                {/* <TouchableOpacity onPress={toggleModal}> */}
                                <Image
                                    source={dateIcon}
                                    style={styles.iconStyle}
                                />
                                {/* </TouchableOpacity> */}
                            </View>
                            {Object.keys(groupedSlots).map(date => (
                                <View style={styles.upcomingCard}>
                                    <View style={styles.upcomingCardDate}>
                                        <Text style={styles.upcomingCardDateText}>{date}</Text>
                                    </View>
                                    {groupedSlots[date].map(slot => (
                                        <TouchableOpacity onPress={() => toggleModal({ id: slot?.id, pname: slot?.patient?.name, date: date, time: `${formatISTTime(slot.start_time)} - ${formatISTTime(slot.end_time)}` })}>
                                            <View key={slot.id}>
                                                <View style={styles.headerTextView}>
                                                    <Text style={styles.headerText}>{slot.patient?.name}</Text>
                                                    <Image
                                                        source={ArrowGratter}
                                                        style={styles.iconStyle}
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
                                                <View
                                                    style={styles.horizontalLine}
                                                />
                                            </View>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            ))}
                        </>
                        :
                        <>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: responsiveHeight(2) }}>
                                <Text style={styles.headerText}>Availability</Text>
                            </View>
                            {/* Monday card */}
                            <View style={[styles.cardView, { backgroundColor: isEnabled ? '#FFF' : '#eeeeee', }]}>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: responsiveHeight(1) }}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <Image
                                            source={dateIcon}
                                            style={{ height: 20, width: 20, resizeMode: 'contain', marginRight: 5 }}
                                        />
                                        <Text style={{ color: '#2D2D2D', fontFamily: 'DMSans-Bold', fontSize: responsiveFontSize(1.7) }}>Monday</Text>
                                    </View>
                                    <Switch
                                        trackColor={{ false: '#767577', true: '#000' }}
                                        thumbColor={isEnabled ? '#fff' : '#000'}
                                        ios_backgroundColor="#3e3e3e"
                                        onValueChange={toggleSwitch}
                                        value={isEnabled}
                                        style={styles.switchStyle}
                                    />
                                </View>
                                {/* <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}> */}
                                {timeRanges.map((range, index) => (
                                    <View key={index} style={styles.timeRangeContainer}>
                                        <TouchableOpacity onPress={() => isEnabled && showDatePicker(index, true)} style={styles.timePicker}>
                                            <Text style={styles.timeText}>
                                                {range.startTime ? moment(range.startTime).format('hh:mm A') : 'Start Time'}
                                            </Text>
                                            <Image source={timeIcon} style={styles.icon} />
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => isEnabled && showDatePicker(index, false)} style={styles.timePicker}>
                                            <Text style={styles.timeText}>
                                                {range.endTime ? moment(range.endTime).format('hh:mm A') : 'End Time'}
                                            </Text>
                                            <Image source={timeIcon} style={styles.icon} />
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => isEnabled && deleteTimeRange(index)} style={styles.deleteButton}>
                                            <Image source={deleteImg} style={styles.deleteIcon} />
                                        </TouchableOpacity>
                                    </View>
                                ))}
                                {/* </View> */}
                                <TouchableOpacity onPress={() => isEnabled && addNewTimeRange()} >
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: responsiveHeight(2) }}>

                                        <View style={styles.inActiveButtonInsideView}>
                                            <Image
                                                source={plus}
                                                style={{ height: 20, width: 20, resizeMode: 'contain', marginRight: 5 }}
                                            />
                                            <Text style={styles.activeButtonInsideText}>Add New Time</Text>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                                <View style={{ marginTop: responsiveHeight(2) }}>
                                    <CustomButton buttonColor={'small'} label={"Save"} onPress={() => { saveTimeRange() }} />
                                </View>
                                <DateTimePickerModal
                                    isVisible={isDatePickerVisible}
                                    mode="time"
                                    onConfirm={handleConfirm}
                                    onCancel={hideDatePicker}
                                    locale="en_GB"
                                    is24Hour={false}
                                />
                            </View>
                            {/* Tuesday card */}
                            <View style={[styles.cardView, { backgroundColor: isEnabledTuesday ? '#FFF' : '#eeeeee', }]}>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: responsiveHeight(1) }}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <Image
                                            source={dateIcon}
                                            style={{ height: 20, width: 20, resizeMode: 'contain', marginRight: 5 }}
                                        />
                                        <Text style={{ color: '#2D2D2D', fontFamily: 'DMSans-Bold', fontSize: responsiveFontSize(1.7) }}>Tuesday</Text>
                                    </View>
                                    <Switch
                                        trackColor={{ false: '#767577', true: '#000' }}
                                        thumbColor={isEnabledTuesday ? '#fff' : '#000'}
                                        ios_backgroundColor="#3e3e3e"
                                        onValueChange={toggleSwitchTuesday}
                                        value={isEnabledTuesday}
                                        style={styles.switchStyle}
                                    />
                                </View>
                                {/* <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}> */}
                                {timeRangesTuesday.map((range, index) => (
                                    <View key={index} style={styles.timeRangeContainer}>
                                        <TouchableOpacity onPress={() => isEnabledTuesday && showDatePickerTuesday(index, true)} style={styles.timePicker}>
                                            <Text style={styles.timeText}>
                                                {range.startTime ? moment(range.startTime).format('hh:mm A') : 'Start Time'}
                                            </Text>
                                            <Image source={timeIcon} style={styles.icon} />
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => isEnabledTuesday && showDatePickerTuesday(index, false)} style={styles.timePicker}>
                                            <Text style={styles.timeText}>
                                                {range.endTime ? moment(range.endTime).format('hh:mm A') : 'End Time'}
                                            </Text>
                                            <Image source={timeIcon} style={styles.icon} />
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => isEnabledTuesday && deleteTimeRangeTuesday(index)} style={styles.deleteButton}>
                                            <Image source={deleteImg} style={styles.deleteIcon} />
                                        </TouchableOpacity>
                                    </View>
                                ))}
                                {/* </View> */}
                                <TouchableOpacity onPress={() => isEnabledTuesday && addNewTimeRangeTuesday()} >
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: responsiveHeight(2) }}>

                                        <View style={styles.inActiveButtonInsideView}>
                                            <Image
                                                source={plus}
                                                style={{ height: 20, width: 20, resizeMode: 'contain', marginRight: 5 }}
                                            />
                                            <Text style={styles.activeButtonInsideText}>Add New Time</Text>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                                <View style={{ marginTop: responsiveHeight(2) }}>
                                    <CustomButton buttonColor={'small'} label={"Save"} onPress={() => { saveTimeRangeTuesday() }} />
                                </View>
                                <DateTimePickerModal
                                    isVisible={isDatePickerVisibleTuesday}
                                    mode="time"
                                    onConfirm={handleConfirmTuesday}
                                    onCancel={hideDatePickerTuesday}
                                    locale="en_GB"
                                    is24Hour={false}
                                />
                            </View>
                            {/* Wednesday */}
                            <View style={[styles.cardView, { backgroundColor: isEnabledWednesday ? '#FFF' : '#eeeeee', }]}>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: responsiveHeight(1) }}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <Image
                                            source={dateIcon}
                                            style={{ height: 20, width: 20, resizeMode: 'contain', marginRight: 5 }}
                                        />
                                        <Text style={{ color: '#2D2D2D', fontFamily: 'DMSans-Bold', fontSize: responsiveFontSize(1.7) }}>Wednesday</Text>
                                    </View>
                                    <Switch
                                        trackColor={{ false: '#767577', true: '#000' }}
                                        thumbColor={isEnabledWednesday ? '#fff' : '#000'}
                                        ios_backgroundColor="#3e3e3e"
                                        onValueChange={toggleSwitchWednesday}
                                        value={isEnabledWednesday}
                                        style={styles.switchStyle}
                                    />
                                </View>
                                {/* <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}> */}
                                {timeRangesWednesday.map((range, index) => (
                                    <View key={index} style={styles.timeRangeContainer}>
                                        <TouchableOpacity onPress={() => isEnabledWednesday && showDatePickerWednesday(index, true)} style={styles.timePicker}>
                                            <Text style={styles.timeText}>
                                                {range.startTime ? moment(range.startTime).format('hh:mm A') : 'Start Time'}
                                            </Text>
                                            <Image source={timeIcon} style={styles.icon} />
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => isEnabledWednesday && showDatePickerWednesday(index, false)} style={styles.timePicker}>
                                            <Text style={styles.timeText}>
                                                {range.endTime ? moment(range.endTime).format('hh:mm A') : 'End Time'}
                                            </Text>
                                            <Image source={timeIcon} style={styles.icon} />
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => isEnabledWednesday && deleteTimeRangeWednesday(index)} style={styles.deleteButton}>
                                            <Image source={deleteImg} style={styles.deleteIcon} />
                                        </TouchableOpacity>
                                    </View>
                                ))}
                                {/* </View> */}
                                <TouchableOpacity onPress={() => isEnabledWednesday && addNewTimeRangeWednesday()} >
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: responsiveHeight(2) }}>

                                        <View style={styles.inActiveButtonInsideView}>
                                            <Image
                                                source={plus}
                                                style={{ height: 20, width: 20, resizeMode: 'contain', marginRight: 5 }}
                                            />
                                            <Text style={styles.activeButtonInsideText}>Add New Time</Text>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                                <View style={{ marginTop: responsiveHeight(2) }}>
                                    <CustomButton buttonColor={'small'} label={"Save"} onPress={() => { saveTimeRangeWednesday() }} />
                                </View>
                                <DateTimePickerModal
                                    isVisible={isDatePickerVisibleWednesday}
                                    mode="time"
                                    onConfirm={handleConfirmWednesday}
                                    onCancel={hideDatePickerWednesday}
                                    locale="en_GB"
                                    is24Hour={false}
                                />
                            </View>
                            {/* Thursday */}
                            <View style={[styles.cardView, { backgroundColor: isEnabledThursday ? '#FFF' : '#eeeeee', }]}>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: responsiveHeight(1) }}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <Image
                                            source={dateIcon}
                                            style={{ height: 20, width: 20, resizeMode: 'contain', marginRight: 5 }}
                                        />
                                        <Text style={{ color: '#2D2D2D', fontFamily: 'DMSans-Bold', fontSize: responsiveFontSize(1.7) }}>Thursday</Text>
                                    </View>
                                    <Switch
                                        trackColor={{ false: '#767577', true: '#000' }}
                                        thumbColor={isEnabledThursday ? '#fff' : '#000'}
                                        ios_backgroundColor="#3e3e3e"
                                        onValueChange={toggleSwitchThursday}
                                        value={isEnabledThursday}
                                        style={styles.switchStyle}
                                    />
                                </View>
                                {/* <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}> */}
                                {timeRangesThursday.map((range, index) => (
                                    <View key={index} style={styles.timeRangeContainer}>
                                        <TouchableOpacity onPress={() => isEnabledThursday && showDatePickerThursday(index, true)} style={styles.timePicker}>
                                            <Text style={styles.timeText}>
                                                {range.startTime ? moment(range.startTime).format('hh:mm A') : 'Start Time'}
                                            </Text>
                                            <Image source={timeIcon} style={styles.icon} />
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => isEnabledThursday && showDatePickerThursday(index, false)} style={styles.timePicker}>
                                            <Text style={styles.timeText}>
                                                {range.endTime ? moment(range.endTime).format('hh:mm A') : 'End Time'}
                                            </Text>
                                            <Image source={timeIcon} style={styles.icon} />
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => isEnabledThursday && deleteTimeRangeThursday(index)} style={styles.deleteButton}>
                                            <Image source={deleteImg} style={styles.deleteIcon} />
                                        </TouchableOpacity>
                                    </View>
                                ))}
                                {/* </View> */}
                                <TouchableOpacity onPress={() => isEnabledThursday && addNewTimeRangeThursday()} >
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: responsiveHeight(2) }}>

                                        <View style={styles.inActiveButtonInsideView}>
                                            <Image
                                                source={plus}
                                                style={{ height: 20, width: 20, resizeMode: 'contain', marginRight: 5 }}
                                            />
                                            <Text style={styles.activeButtonInsideText}>Add New Time</Text>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                                <View style={{ marginTop: responsiveHeight(2) }}>
                                    <CustomButton buttonColor={'small'} label={"Save"} onPress={() => { saveTimeRangeThursday() }} />
                                </View>
                                <DateTimePickerModal
                                    isVisible={isDatePickerVisibleThursday}
                                    mode="time"
                                    onConfirm={handleConfirmThursday}
                                    onCancel={hideDatePickerThursday}
                                    locale="en_GB"
                                    is24Hour={false}
                                />
                            </View>
                            {/* Friday */}
                            <View style={[styles.cardView, { backgroundColor: isEnabledFriday ? '#FFF' : '#eeeeee', }]}>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: responsiveHeight(1) }}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <Image
                                            source={dateIcon}
                                            style={{ height: 20, width: 20, resizeMode: 'contain', marginRight: 5 }}
                                        />
                                        <Text style={{ color: '#2D2D2D', fontFamily: 'DMSans-Bold', fontSize: responsiveFontSize(1.7) }}>Friday</Text>
                                    </View>
                                    <Switch
                                        trackColor={{ false: '#767577', true: '#000' }}
                                        thumbColor={isEnabledFriday ? '#fff' : '#000'}
                                        ios_backgroundColor="#3e3e3e"
                                        onValueChange={toggleSwitchFriday}
                                        value={isEnabledFriday}
                                        style={styles.switchStyle}
                                    />
                                </View>
                                {/* <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}> */}
                                {timeRangesFriday.map((range, index) => (
                                    <View key={index} style={styles.timeRangeContainer}>
                                        <TouchableOpacity onPress={() => isEnabledFriday && showDatePickerFriday(index, true)} style={styles.timePicker}>
                                            <Text style={styles.timeText}>
                                                {range.startTime ? moment(range.startTime).format('hh:mm A') : 'Start Time'}
                                            </Text>
                                            <Image source={timeIcon} style={styles.icon} />
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => isEnabledFriday && showDatePickerFriday(index, false)} style={styles.timePicker}>
                                            <Text style={styles.timeText}>
                                                {range.endTime ? moment(range.endTime).format('hh:mm A') : 'End Time'}
                                            </Text>
                                            <Image source={timeIcon} style={styles.icon} />
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => isEnabledFriday && deleteTimeRangeFriday(index)} style={styles.deleteButton}>
                                            <Image source={deleteImg} style={styles.deleteIcon} />
                                        </TouchableOpacity>
                                    </View>
                                ))}
                                {/* </View> */}
                                <TouchableOpacity onPress={() => isEnabledFriday && addNewTimeRangeFriday()} >
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: responsiveHeight(2) }}>

                                        <View style={styles.inActiveButtonInsideView}>
                                            <Image
                                                source={plus}
                                                style={{ height: 20, width: 20, resizeMode: 'contain', marginRight: 5 }}
                                            />
                                            <Text style={styles.activeButtonInsideText}>Add New Time</Text>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                                <View style={{ marginTop: responsiveHeight(2) }}>
                                    <CustomButton buttonColor={'small'} label={"Save"} onPress={() => { saveTimeRangeFriday() }} />
                                </View>
                                <DateTimePickerModal
                                    isVisible={isDatePickerVisibleFriday}
                                    mode="time"
                                    onConfirm={handleConfirmFriday}
                                    onCancel={hideDatePickerFriday}
                                    locale="en_GB"
                                    is24Hour={false}
                                />
                            </View>
                            {/* Saturday */}
                            <View style={[styles.cardView, { backgroundColor: isEnabledSaturday ? '#FFF' : '#eeeeee', }]}>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: responsiveHeight(1) }}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <Image
                                            source={dateIcon}
                                            style={{ height: 20, width: 20, resizeMode: 'contain', marginRight: 5 }}
                                        />
                                        <Text style={{ color: '#2D2D2D', fontFamily: 'DMSans-Bold', fontSize: responsiveFontSize(1.7) }}>Saturday</Text>
                                    </View>
                                    <Switch
                                        trackColor={{ false: '#767577', true: '#000' }}
                                        thumbColor={isEnabledSaturday ? '#fff' : '#000'}
                                        ios_backgroundColor="#3e3e3e"
                                        onValueChange={toggleSwitchSaturday}
                                        value={isEnabledSaturday}
                                        style={styles.switchStyle}
                                    />
                                </View>
                                {/* <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}> */}
                                {timeRangesSaturday.map((range, index) => (
                                    <View key={index} style={styles.timeRangeContainer}>
                                        <TouchableOpacity onPress={() => isEnabledSaturday && showDatePickerSaturday(index, true)} style={styles.timePicker}>
                                            <Text style={styles.timeText}>
                                                {range.startTime ? moment(range.startTime).format('hh:mm A') : 'Start Time'}
                                            </Text>
                                            <Image source={timeIcon} style={styles.icon} />
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => isEnabledSaturday && showDatePickerSaturday(index, false)} style={styles.timePicker}>
                                            <Text style={styles.timeText}>
                                                {range.endTime ? moment(range.endTime).format('hh:mm A') : 'End Time'}
                                            </Text>
                                            <Image source={timeIcon} style={styles.icon} />
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => isEnabledSaturday && deleteTimeRangeSaturday(index)} style={styles.deleteButton}>
                                            <Image source={deleteImg} style={styles.deleteIcon} />
                                        </TouchableOpacity>
                                    </View>
                                ))}
                                {/* </View> */}
                                <TouchableOpacity onPress={() => isEnabledSaturday && addNewTimeRangeSaturday()} >
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: responsiveHeight(2) }}>

                                        <View style={styles.inActiveButtonInsideView}>
                                            <Image
                                                source={plus}
                                                style={{ height: 20, width: 20, resizeMode: 'contain', marginRight: 5 }}
                                            />
                                            <Text style={styles.activeButtonInsideText}>Add New Time</Text>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                                <View style={{ marginTop: responsiveHeight(2) }}>
                                    <CustomButton buttonColor={'small'} label={"Save"} onPress={() => { saveTimeRangeSaturday() }} />
                                </View>
                                <DateTimePickerModal
                                    isVisible={isDatePickerVisibleSaturday}
                                    mode="time"
                                    onConfirm={handleConfirmSaturday}
                                    onCancel={hideDatePickerSaturday}
                                    locale="en_GB"
                                    is24Hour={false}
                                />
                            </View>
                            {/* Sunday */}
                            <View style={[styles.cardView, { backgroundColor: isEnabledSunday ? '#FFF' : '#eeeeee', }]}>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: responsiveHeight(1) }}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <Image
                                            source={dateIcon}
                                            style={{ height: 20, width: 20, resizeMode: 'contain', marginRight: 5 }}
                                        />
                                        <Text style={{ color: '#2D2D2D', fontFamily: 'DMSans-Bold', fontSize: responsiveFontSize(1.7) }}>Sunday</Text>
                                    </View>
                                    <Switch
                                        trackColor={{ false: '#767577', true: '#000' }}
                                        thumbColor={isEnabledSunday ? '#fff' : '#000'}
                                        ios_backgroundColor="#3e3e3e"
                                        onValueChange={toggleSwitchSunday}
                                        value={isEnabledSunday}
                                        style={styles.switchStyle}
                                    />
                                </View>
                                {/* <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}> */}
                                {timeRangesSunday.map((range, index) => (
                                    <View key={index} style={styles.timeRangeContainer}>
                                        <TouchableOpacity onPress={() => isEnabledSunday && showDatePickerSunday(index, true)} style={styles.timePicker}>
                                            <Text style={styles.timeText}>
                                                {range.startTime ? moment(range.startTime).format('hh:mm A') : 'Start Time'}
                                            </Text>
                                            <Image source={timeIcon} style={styles.icon} />
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => isEnabledSunday && showDatePickerSunday(index, false)} style={styles.timePicker}>
                                            <Text style={styles.timeText}>
                                                {range.endTime ? moment(range.endTime).format('hh:mm A') : 'End Time'}
                                            </Text>
                                            <Image source={timeIcon} style={styles.icon} />
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => isEnabledSunday && deleteTimeRangeSunday(index)} style={styles.deleteButton}>
                                            <Image source={deleteImg} style={styles.deleteIcon} />
                                        </TouchableOpacity>
                                    </View>
                                ))}
                                {/* </View> */}
                                <TouchableOpacity onPress={() => isEnabledSunday && addNewTimeRangeSunday()} >
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: responsiveHeight(2) }}>

                                        <View style={styles.inActiveButtonInsideView}>
                                            <Image
                                                source={plus}
                                                style={{ height: 20, width: 20, resizeMode: 'contain', marginRight: 5 }}
                                            />
                                            <Text style={styles.activeButtonInsideText}>Add New Time</Text>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                                <View style={{ marginTop: responsiveHeight(2) }}>
                                    <CustomButton buttonColor={'small'} label={"Save"} onPress={() => { saveTimeRangeSunday() }} />
                                </View>
                                <DateTimePickerModal
                                    isVisible={isDatePickerVisibleSunday}
                                    mode="time"
                                    onConfirm={handleConfirmSunday}
                                    onCancel={hideDatePickerSunday}
                                    locale="en_GB"
                                    is24Hour={false}
                                />
                            </View>
                        </>
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
                                console.log('kkkkkk')
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
                                    <View style={styles.inActiveButtonInsideView2}>
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
                          
                        </ScrollView>

                    </View>
                </View>
                {/* </TouchableWithoutFeedback> */}
            </Modal>
        </SafeAreaView>
    )
}


export default ScheduleScreen


const styles = StyleSheet.create({
    Container: {
        flex: 1,
        backgroundColor: '#fff'
    },
    wrapper: {
        padding: 15,
        //marginBottom: responsiveHeight(1)
    },
    activeButtonView: {
        backgroundColor: '#ECFCFA',
        height: responsiveHeight(5),
        width: responsiveWidth(45),
        borderRadius: 20,
        borderColor: '#87ADA8',
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    activeButtonText: {
        color: '#2D2D2D',
        fontFamily: 'DMSans-SemiBold',
        fontSize: responsiveFontSize(1.7)
    },
    inActiveButtonView: {
        backgroundColor: '#FFF',
        height: responsiveHeight(5),
        width: responsiveWidth(45),
        borderRadius: 20,
        borderColor: '#87ADA8',
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    inActiveButtonText: {
        color: '#746868',
        fontFamily: 'DMSans-Medium',
        fontSize: responsiveFontSize(1.7)
    },
    switchStyle: {
        transform: [{ scaleX: 1.3 }, { scaleY: 1.3 }]  // Adjust scale values as needed
    },
    activeButtonInsideView: {
        backgroundColor: '#FFF',
        height: responsiveHeight(5),
        width: responsiveWidth(40),
        borderRadius: 15,
        borderColor: '#E3E3E3',
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        alignItems: 'center'
    },
    activeButtonInsideText: {
        color: '#2D2D2D',
        fontFamily: 'DMSans-SemiBold',
        fontSize: responsiveFontSize(1.7)
    },
    inActiveButtonInsideView: {
        backgroundColor: '#F4F5F5',
        height: responsiveHeight(5),
        width: responsiveWidth(84),
        borderRadius: 15,
        borderColor: '#F4F5F5',
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        alignItems: 'center'
    },
    timePicker: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E3E3E3',
        borderRadius: 15,
        padding: 10,
        width: responsiveWidth(35),
        justifyContent: 'space-between'
    },
    icon: {
        width: 20,
        height: 20,
        resizeMode: 'contain',
    },
    timeRangeContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    timeText: {
        marginRight: 10,
        fontSize: responsiveFontSize(1.7),
        color: '#746868'
    },
    deleteButton: {
        // Additional styles may be required
    },
    deleteIcon: {
        width: 24,
        height: 24,
    },
    cardView: {
        width: '99%',
        marginHorizontal: 2,
        borderRadius: 20,
        marginTop: responsiveHeight(2),
        elevation: 5,
        padding: 15
    },
    headerText: {
        color: '#2D2D2D',
        fontFamily: 'DMSans-Bold',
        fontSize: responsiveFontSize(2)
    },
    iconStyle: {
        height: 20,
        width: 20,
        resizeMode: 'contain',
    },
    upcomingCard: {
        width: '99%',
        backgroundColor: '#FFF',
        marginHorizontal: 2,
        borderRadius: 20,
        marginTop: responsiveHeight(2),
        elevation: 5
    },
    upcomingCardDate: {
        flexDirection: 'row',
        height: responsiveHeight(7),
        backgroundColor: '#DEDEDE',
        borderTopRightRadius: 10,
        borderTopLeftRadius: 10,
        alignItems: 'center',
    },
    upcomingCardDateText: {
        color: '#2D2D2D',
        fontFamily: 'DMSans-Bold',
        fontSize: responsiveFontSize(2),
        fontWeight: 'bold',
        textAlign: 'center',
        marginLeft: responsiveWidth(2)
    },
    headerTextView: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 10,
        paddingVertical: 5,
        marginTop: 5
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
    flexStyle: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        //backgroundColor:'red'
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
    freeText: {
        color: '#5C9ECF',
        fontFamily: 'DMSans-Medium',
        fontSize: responsiveFontSize(1.7)
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
    },
    iconstyle: {
        height: 20,
        width: 20,
        resizeMode: 'contain'
    },
    inActiveButtonInsideView2: {
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

});
