import { SafeAreaView, StyleSheet, Text, View, TouchableOpacity, Image, Modal, FlatList } from 'react-native'
import React, { useState, useEffect } from 'react'
import { primaryColor, PRIMARY_BACKGROUND_COLOR } from '../colors'
import UploadVideo from './UploadVideo'
import { getDatabase, onValue, ref } from 'firebase/database'
import { getAuth } from 'firebase/auth'
import { Video } from 'expo-av'
import MoreInfo from './MoreInfo'
const ReelsUploadScreen = ({ closeModal }) => {
  const db = getDatabase()
  const auth = getAuth()
  const userId = auth.currentUser.uid
  const [isLoading, setIsLoading] = useState(true)
  const [uploadVideoModalOpen, setUploadVideoModalOpen] = useState(false)
  const [liveVideos, setLiveVideos] = useState([])
  const [moreInfoModalOpen, setMoreInfoModalOpen] = useState(false)
  const [productKey, setProductKey] = useState([])
  const openUploadVideoScreen = () => {
    setUploadVideoModalOpen(true)
  }
  const closeUploadVideoScreen = () => {
    setUploadVideoModalOpen(false)
  }

  const fetchVideos = () => {
    const videosRef = ref(db, `liveVideos`);
    onValue(videosRef, (snapshot) => {
      const videosData = snapshot.val();
      if (videosData) {
        const liveVideosArray = Object.keys(videosData).map((key) => videosData[key]).filter((item) => item.user === userId);
        setLiveVideos(liveVideosArray)
        console.log(liveVideosArray)
      }
    })
    setIsLoading(false)
  }

  useEffect(() => {
    fetchVideos()

  }, [])

  const openInfoModal = (item) => {
    setProductKey(item)
    setMoreInfoModalOpen(true)

  }
  const closeInfoModal = () => {
    setMoreInfoModalOpen(false)
  }

  return (
    <SafeAreaView style={{ backgroundColor: PRIMARY_BACKGROUND_COLOR }}>
      {isLoading ? (
        <View>
          <Text>Loading</Text>
        </View>
      ) : (
        <View style={styles.container}>
          <TouchableOpacity style={styles.topContainer} onPress={closeModal}>
            <Image
              source={require("../assets/left-arrow.png")}
              style={{ height: 35, width: 35 }}
            />
          </TouchableOpacity>

          <FlatList
            data={liveVideos}
            keyExtractor={(item) => item.video}
            numColumns={2}
            columnWrapperStyle={{ gap: 2 }}
            contentContainerStyle={{ gap: 2 }}
            renderItem={({ item }) => {
              return (

                <View style={{ width: '45%', height: 250, borderRadius: 10, marginVertical: 10, marginHorizontal: 7, position: 'relative' }}>
                  <Video
                    source={{ uri: item.video }}
                    style={{ width: '100%', height: '100%', borderRadius: 10 }}
                    resizeMode="cover"
                    shouldPlay
                    rate={1.0}
                    volume={1.0}
                    useNativeControls
                    isMuted
                    isLooping
                  />
                  <TouchableOpacity
                    style={{ position: 'absolute', right: 10, bottom:10 }}
                    onPress={() => openInfoModal(item)}
                  >
                    <Image source={require('../assets/info.png')} style={{ height: 30, width: 30, margin: 10 }} />
                  </TouchableOpacity>
                </View>


              )
            }}
          />

          <TouchableOpacity
            style={styles.addButton}
            onPress={openUploadVideoScreen}
          >
            <Image
              source={require("../assets/plus.png")}
              style={{ height: 65, width: 65 }}
            />
          </TouchableOpacity>
        </View>
      )
      }
      <Modal visible={uploadVideoModalOpen}>
        <UploadVideo closeModal={closeUploadVideoScreen} />
      </Modal>
      <Modal visible={moreInfoModalOpen}>
        <MoreInfo closeModal={closeInfoModal} item={productKey} />
      </Modal>

    </SafeAreaView>
  )
}

export default ReelsUploadScreen

const styles = StyleSheet.create({
  container: {
    height: "100%",
    backgroundColor: PRIMARY_BACKGROUND_COLOR,
    marginHorizontal: 10,
  },
  topContainer: {
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  addButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    borderRadius: 40,
    width: 80,
    height: 80,
    justifyContent: "center",
    alignItems: "center",
  },
  videobtn: {
    marginVertical: 10,
    marginHorizontal: 10
  },
  scrollViewContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    paddingVertical: 20,
    backgroundColor: 'PRIMARY_BACKGROUND_COLOR',
  },
})