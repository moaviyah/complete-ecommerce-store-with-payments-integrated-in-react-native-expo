import { SafeAreaView, StyleSheet, Text, View, TouchableOpacity, Image, Modal, ActivityIndicator, Dimensions, FlatList } from 'react-native'
import React, { useState, useEffect, useRef } from 'react'
import { primaryColor, PRIMARY_BACKGROUND_COLOR } from '../colors'
import UploadVideo from './UploadVideo'
import { getDatabase, onValue, ref } from 'firebase/database'
import { getAuth } from 'firebase/auth'
import { Video } from 'expo-av'
import Swiper from 'react-native-swiper'
const { width, height } = Dimensions.get('window');

import SinglePost from './SinglePost'
const Reels = ({ closeModal }) => {
    const db = getDatabase()
    const auth = getAuth()
    const userId = auth.currentUser.uid
    const [isLoading, setIsLoading] = useState(false)
    const [liveVideos, setLiveVideos] = useState([])
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

    // const renderItem = ({ item }) => (
    //     <View style={styles.videoContainer}>
    //         <Video
    //             source={{ uri: item.video }}
    //             shouldPlay
    //             resizeMode="cover"
    //             style={styles.video}
    //             isLooping={false}
    //         />
    //     </View>
    // );
    const mediaRefs = useRef([])
    const array = [1, 2, 3, 4, 5, 6]
    const onViewableItemsChanged = useRef(({changed})=>{
        changed.forEach(element => {
            const cell= mediaRefs.current[element.key]
            if(cell){
                if(element.isViewable){
                    cell.play()
                }
                else{
                    cell.stop()
                }
            }
        });
    })

    const renderItem = ({ item, index }) => {
        return (
            <View style={[{ flex: 1, height: height - 55 }, index % 2 == 0 ? { backgroundColor: 'black' } : { backgroundColor: 'black' }]}>
                <SinglePost item={item} ref = {SinglePostRef => (mediaRefs.current[item.video] = SinglePostRef)}/>
            </View>
        )
    }
    return (
        <SafeAreaView style={{ backgroundColor: 'black' }}>
            {isLoading ? (
                <SafeAreaView style={styles.loaderContainer}>
                    <ActivityIndicator
                        size="small"
                        color={primaryColor}
                        style={{ alignSelf: "center" }}
                    />
                </SafeAreaView>
            ) : (
                <View style={styles.container}>
                    {/* <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', }}>
                        <TouchableOpacity style={styles.topContainer} onPress={closeModal}>
                            <Image
                                source={require("../assets/arrow.png")}
                                style={{ height: 25, width: 25 }}
                            />
                        </TouchableOpacity>
                        <View style={{ alignSelf: 'center', alignItems: 'center' }}>
                            <Text style={{ color: 'white', fontSize: 20, marginBottom: 10, fontWeight: '600' }}>
                                Shorts
                            </Text>
                        </View>
                        <Text>
                            Hello
                        </Text>
                    </View> */}
                    <FlatList
                        data={liveVideos}
                        renderItem={renderItem}
                        pagingEnabled
                        onViewableItemsChanged={onViewableItemsChanged.current}
                        windowSize={4}
                        maxToRenderPerBatch={2}
                        initialNumToRender={0}
                        removeClippedSubviews
                        viewabilityConfig={{
                            itemVisiblePercentThreshold : 100  
                        }}
                        keyExtractor={item => item.video}
                    />
                </View>)}
        </SafeAreaView>
    )
}

export default Reels

const styles = StyleSheet.create({
    container: {
        height: "100%",
        backgroundColor: 'black',
    },
    topContainer: {
        paddingHorizontal: 10,
        marginBottom: 10
    },
    loaderContainer: {
        height: "100%",
        alignItems: "center",
        justifyContent: "center",
    },
    videoContainer: {
        flex: 1,
        width,
        height: height - 55,
        justifyContent: 'center',
        alignItems: 'center',
    },
    video: {
        width,
        height,
    },
})