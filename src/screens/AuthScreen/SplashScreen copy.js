import React, {useRef, useEffect} from 'react';
import {
  SafeAreaView,
  Image,
  Text,
  View,
  StyleSheet,
  Dimensions,
  Animated,
  StatusBar,
  ImageBackground
} from 'react-native';

const SplashScreen = ({navigation}) => {
  const moveAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    setTimeout(() => {
      navigation.push('Onboarding');
    }, 5000);
  }, []);
  // useEffect(() => {
  //   Animated.sequence([
  //     Animated.timing(moveAnim, {
  //       duration: 2000,
  //       toValue: Dimensions.get('window').width / 1.6,
  //       delay: 0,
  //       useNativeDriver: false,
  //     }),
  //     Animated.timing(moveAnim, {
  //       duration: 2000,
  //       toValue: 0,
  //       delay: 0,
  //       useNativeDriver: false,
  //     }),
  //   ]).start();
  //   Animated.timing(fadeAnim, {
  //     duration: 1000,
  //     toValue: 1,
  //     delay: 2000,
  //     useNativeDriver: false,
  //   }).start();
  // }, [moveAnim, fadeAnim]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ImageBackground
        source={require('../../assets/images/splash.png')}
        style={{width: '100%', height: '100%'}}
        resizeMode={'cover'}
      />
    </View>
    // <SafeAreaView style={styles.container}>
    //   <View style={styles.contentContainer}>
    //     <Animated.View style={[styles.logoContainer, {marginLeft: moveAnim}]}>
    //       {/* <Text style={[styles.logoText]}>D</Text> */}
    //       <Animated.Text style={[styles.logoText, {opacity: fadeAnim}]}>
    //         OPFLEX
    //       </Animated.Text>
    //     </Animated.View>
    //   </View>
    // </SafeAreaView>
  );
};

export default SplashScreen;

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  logoText: {
    fontSize: 35,
    marginTop: 20,
    color: '#000000',
    fontWeight: '700',
  },
  contentContainer: {
    top: '35%',
    alignItems: 'center',
  },
  image: {
    width: 100,
    height: 100,
  },
  logoContainer: {
    flexDirection: 'row',
  },
});
