import { StyleSheet, Text, View, TouchableOpacity, Image, TextInput, ScrollView, Alert,  } from 'react-native'
import React, {useState, useEffect} from 'react'
import { SafeAreaView } from 'react-native'
import { primaryColor, PRIMARY_BACKGROUND_COLOR } from '../colors'
import { getStorage, uploadString, getDownloadURL, uploadBytes, ref as StorageRef, uploadBytesResumable} from 'firebase/storage';
import * as ImagePicker from 'expo-image-picker';
import { ActivityIndicator } from 'react-native';
import {Video} from 'expo-av'
import { getAuth } from 'firebase/auth';
import { getDatabase, ref, get, child, query, onValue, onChildAdded, DataSnapshot, push, set } from 'firebase/database';

const UploadVideo = ({ closeModal }) => {
    const [isLoading, setIsLoading] = useState(false)
    const storage = getStorage()
    const [video, setVideo] = useState()
    const [title, setTitle] = useState()
    const [description, setDescription] = useState()
    const auth = getAuth()
    const db = getDatabase();
    const userId = auth.currentUser.uid
    const selectVideo = async () => {
        setIsLoading(true)
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          alert('Permission to access camera roll is required!');
          return;
        }
      
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Videos,
          allowsMultipleSelection: false,
          videoQuality:1,
          allowsEditing:true
        });
        if (!result.canceled){
           await uploadVideo(result.assets[0].uri)
        }
        else{
            setIsLoading(false)
        }
      };

      async function uploadVideo (uri){
        const response = await fetch(uri);
        const blob = await response.blob();

        const storageRef = StorageRef(storage, 'LiveVideos/' + Date.now())
        const uploadTask = uploadBytesResumable(storageRef, blob)
        uploadTask.on('state_changed', (snapshot)=>{
            const progress = (snapshot.bytesTransferred /snapshot.totalBytes) * 100
            console.log('progress', progress)
        },
        (error) =>{
                console.log(error)
        },
        ()=>{
            getDownloadURL(uploadTask.snapshot.ref).then(async (url)=>{
                console.log(url)

                setIsLoading(false)
                setVideo(url)
            })
        }
        )
      }

      const SaveVideo = async()=>{
        if (!video || !title || !title || !description) {
            Alert.alert('Fill all the required fields');
            return;
          }
        const LiveVideosRef = ref(db, 'liveVideos');
        const newVideoRef = push(LiveVideosRef)
        const newVideoKey = newVideoRef.key;
        try {
            await set(newVideoRef, {
                user: userId,
                title:title,
                description:description,
                video:video,
                accepted:false,
                likes:0,
                key: newVideoKey,
                views:0,
                userName: auth.currentUser.displayName
            });
            Alert.alert("Video Uploaded Successfully")
            setVideo()
            setTitle('')
            setDescription('')
        } catch (error) {
            Alert.alert("Something WEnt Wrong")
        }
      }
    return (
        <SafeAreaView style={{backgroundColor:PRIMARY_BACKGROUND_COLOR}}>
            {isLoading ? (
                <SafeAreaView style={styles.loaderContainer}>
                    <ActivityIndicator
                        size="small"
                        color={primaryColor}
                        style={{ alignSelf: "center" }}
                    />
                </SafeAreaView>
            ) : (
                    <ScrollView style={styles.container}>
                        <TouchableOpacity style={styles.topContainer} onPress={closeModal}>
                            <Image
                                source={require("../assets/left-arrow.png")}
                                style={{ height: 35, width: 35 }}
                            />
                        </TouchableOpacity>

                        {video ? ( // Check if video is uploaded
                        <TouchableOpacity style={[styles.uploadBtn && {borderWidth:0}]} onPress={selectVideo}>
                            <Video
                               source = {{uri:video}} 
                               videoStyle={{ }}
                               rate={1.0}
                               volume={1.0}
                               isMuted
                               resizeMode='cover'
                               style={{height:150, width:150,alignSelf:'center', marginVertical:15, borderRadius:70}}
                               shouldPlay
                               isLooping
                            />
                        </TouchableOpacity>
                        ) : (
                            // Show "Upload" image if video is not uploaded
                            <TouchableOpacity style={styles.uploadBtn} onPress={selectVideo}>
                                <Image
                                    source={require('../assets/upload.png')}
                                    style={styles.uploadImage}
                                />
                            </TouchableOpacity>
                        )}

                        <TextInput placeholder='Title' placeholderTextColor={'black'} style={styles.input} onChangeText={(text)=>setTitle(text)}/>
                        <TextInput placeholder='Description' placeholderTextColor={'black'} style={styles.input} onChangeText={(text)=>setDescription(text)}/>
                        <TouchableOpacity style={styles.saveBtn} onPress={SaveVideo}>
                            <Text style={styles.saveBtnTxt}>Upload</Text>
                        </TouchableOpacity>
                    </ScrollView>
            )
            }
        </SafeAreaView>
    )
}

export default UploadVideo

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
      uploadImage:{
        height:100, 
        width:100,
      },
      uploadBtn:{
        alignSelf:'center',
        marginVertical:25,
        borderWidth:1, 
        padding:20,
        borderRadius:100,
        borderColor:primaryColor,
        alignItems:'center',
        justifyContent:'center'
      },
      input:{
        fontSize:20,
        borderWidth:1,
        borderRadius:7,
        paddingVertical:15,
        paddingHorizontal:15,
        marginHorizontal:10,
        borderColor:primaryColor,
        marginBottom:20
      },
      saveBtn:{
        backgroundColor:primaryColor,
        height:55,
        width:'80%',
        alignSelf:'center',
        borderRadius:10,
        justifyContent:'center',
        alignItems:'center',
        marginTop:10
    },
    saveBtnTxt:{
        fontWeight:'600',
        fontSize:16,
        color:'#FFFFFF'
    },
    loaderContainer: {
        height: "100%",
        alignItems: "center",
        justifyContent: "center",
      },
})