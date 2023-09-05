import { StyleSheet, Text, View, Dimensions, TouchableOpacity, Image } from 'react-native'
import React from 'react'
import { PRIMARY_BACKGROUND_COLOR } from '../colors'

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

const PickupInfo = ({closeModal}) => {
  return (
    <View style={styles.container}>
        <TouchableOpacity style={styles.topContainer} onPress={closeModal}>
            <Image source={require('../assets/left-arrow.png')} style={{ height: 35, width: 35 }} />
          </TouchableOpacity>
      <Text>Pickup Info</Text>
    </View>
  )
}

export default PickupInfo

const styles = StyleSheet.create({
    container: {
        paddingVertical: 10,
        backgroundColor: PRIMARY_BACKGROUND_COLOR,
        height: windowHeight,
        width:windowWidth
      },
      topContainer: {
        paddingHorizontal: 20,
        paddingVertical: 10
      },
})