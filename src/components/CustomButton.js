import React from 'react';
import { Text, TouchableOpacity, StyleSheet, Image, ActivityIndicator } from 'react-native';
import { forwordImg } from '../utils/Images';

export default function CustomButton({ label, onPress, buttonIcon, buttonColor, isButtonLoader }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={buttonColor === 'red' ? styles.buttonViewRed
        : buttonColor === 'gray' ? styles.buttonViewGray
          : buttonColor === 'delete' ? styles.buttonViewDelete
            : buttonColor === 'small' ? styles.buttonViewSmall
              : styles.buttonView}
      disabled={isButtonLoader} // Disable the button while loading
    >
      {isButtonLoader ? (
        <ActivityIndicator size="small" color="#417AA4" />
      ) : (
        <>
          <Text style={buttonColor === 'red' ? styles.buttonTextRed : buttonColor === 'delete' ? styles.buttonTextDelete : styles.buttonText}>
            {label}
          </Text>
          {buttonIcon && !isButtonLoader ? (
            <Image source={forwordImg} style={styles.iconImage} tintColor={'#FFF'} />
          ) : null}
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  buttonView: {
    backgroundColor: '#EEF8FF',
    borderColor: '#417AA4',
    borderWidth: 1,
    padding: 17,
    borderRadius: 8,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'center'
  },
  buttonViewSmall: {
    backgroundColor: '#EEF8FF',
    borderColor: '#417AA4',
    borderWidth: 1,
    padding: 10,
    borderRadius: 8,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'center'
  },
  buttonViewRed: {
    backgroundColor: '#FFF',
    borderColor: '#E3E3E3',
    borderWidth: 1,
    padding: 17,
    borderRadius: 8,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'center'
  },
  buttonViewDelete: {
    backgroundColor: '#FFF',
    borderColor: '#E1293B',
    borderWidth: 1,
    padding: 17,
    borderRadius: 8,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'center'
  },
  buttonViewGray: {
    backgroundColor: '#B6B6B6',
    padding: 17,
    borderRadius: 8,
    marginBottom: 30,
    flexDirection: 'row',
    justifyContent: 'center'
  },
  buttonText: {
    fontFamily: 'DMSans-Bold',
    textAlign: 'center',
    fontWeight: '400',
    fontSize: 16,
    color: '#2D2D2D',
  },
  buttonTextRed: {
    fontFamily: 'DMSans-Bold',
    textAlign: 'center',
    fontWeight: '400',
    fontSize: 16,
    color: '#2D2D2D',
  },
  buttonTextDelete:{
    fontFamily: 'DMSans-Bold',
    textAlign: 'center',
    fontWeight: '400',
    fontSize: 16,
    color: '#E1293B',
  },
  iconImage: {
    width: 23,
    height: 23,
    marginLeft: 5
  }
});
