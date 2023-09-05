import { StyleSheet, Text, TouchableOpacity, View, Dimensions, Modal, ScrollView } from 'react-native'
import React, { forwardRef, useRef, useImperativeHandle, useEffect, useState } from 'react'
import { Video } from 'expo-av'
import AntDesign from 'react-native-vector-icons/AntDesign'
import Ionicons from 'react-native-vector-icons/Ionicons'
import { color } from 'react-native-reanimated';
import { getDatabase, ref as databaseRef, update, get, push, remove } from 'firebase/database'
import { getAuth } from 'firebase/auth'
import { auth } from '../config'
import { set } from 'date-fns'
import Comments from './Comments'

const { width, height } = Dimensions.get('window');
const SinglePost = forwardRef(({ item }, parentRef) => {
    const ref = useRef(null)
    const [mute, setMute] = useState(false)
    const [liked, setLiked] = useState(false)
    const [commentModalOpen, setCommentModalOpen] = useState(false)
    const [showFullDescription, setShowFullDescription] = useState(false);
    const [docKey, setDocKey] = useState()
    useImperativeHandle(parentRef, () => ({
        play,
        unload,
        stop
    }))

    useEffect(() => {
        return () =>
            unload();

    }, [])

    const play = async () => {
        if (ref.current == null) {
            return;
        }
        const status = await ref.current.getStatusAsync();
        if (status?.isPlaying) {
            return;
        }
        try {
            await ref.current.playAsync();
            incrementViewCount(item.key, item.views);
        } catch (error) {
            console.log(error)
        }

    }
    const stop = async () => {
        if (ref.current == null) {
            return;
        }
        const status = await ref.current.getStatusAsync();
        if (!status?.isPlaying) {
            return;
        }
        try {
            await ref.current.stopAsync();
        } catch (error) {
            console.log(error)
        }

    }
    const unload = async () => {
        if (ref.current == null) {
            return;
        }
        try {
            await ref.current.unloadAsync();
        } catch (error) {
            console.log(error)
        }
    }

    const toggleDescription = () => {
        setShowFullDescription(!showFullDescription);
    }
    const handleLike = async (key, itemLike) => {
        if (liked) {
            setLiked(false)
            try {
                const user = getAuth().currentUser;
                const db = getDatabase();
                console.log(key)
                const videoRef = databaseRef(db, `liveVideos/${key}`);
                const likesRef = databaseRef(db, `liveVideos/${key}/likesRecord`)
                await update(videoRef, { likes: itemLike - 1 });
                await remove(likesRef, {
                    id: auth.currentUser.uid,
                })
            } catch (error) {
                console.error('Error liking the video:', error);
            }
            return;
        }
        setLiked(true);
        try {
            const user = getAuth().currentUser;
            const db = getDatabase();
            console.log(key)
            console.log(itemLike)
            const videoRef = databaseRef(db, `liveVideos/${key}`);
            const likesRef = databaseRef(db, `liveVideos/${key}/likesRecord`)
            const likeKey = likesRef.key
            await update(videoRef, { likes: itemLike + 1 });
            await update(likesRef, {
                id: auth.currentUser.uid,
            })
        } catch (error) {
            console.error('Error liking the video:', error);
        }
    };
    useEffect(() => {
        const db = getDatabase();
        const userId = auth.currentUser.uid
        const likesRef = databaseRef(db, `liveVideos/${item.key}/likesRecord`);
        get(likesRef).then((likesSnapshot) => {
            const likesRecord = likesSnapshot.val();
            const hasLiked = likesRecord && likesRecord.id === userId;
            setDocKey(item.key)
            if (hasLiked) {
                setLiked(true);
            } else {
                setLiked(false);
            }
        }).catch((error) => {
            console.error('Error fetching likes:', error);
        });
    }, []);
    const openCommentModal = (key) => {
        setCommentModalOpen(true);

    }
    const closeCommentModal = () => {
        setCommentModalOpen(false)
    }
    const incrementViewCount = async (videoKey, views) => {
        try {
            const db = getDatabase();
            const videoRef = databaseRef(db, `liveVideos/${videoKey}`);
            await update(videoRef, { views: views + 1 });
        } catch (error) {
            console.error('Error incrementing view count:', error);
        }
    };

    return (
        <View style={{ height: height, width: width, flex: 1 }}>
            <TouchableOpacity onPress={() => setMute(!mute)} style={{ height: '100%', width: '100%', position: 'absolute' }}>
                <Video
                    ref={ref}
                    style={styles.container}
                    source={{ uri: item.video }}
                    resizeMode={'cover'}
                    shouldPlay={false}
                    isLooping
                    isMuted={true}
                />
            </TouchableOpacity>

            <View
                style={{ position: 'absolute', bottom: 150, alignSelf: 'flex-end' }}
            >
                <TouchableOpacity style={{ padding: 10, alignItems: 'center' }} onPress={() => handleLike(item.key, item.likes)}>
                    <AntDesign name={liked ? 'heart' : 'hearto'} size={32} style={{ color: liked ? 'red' : 'white', fontSize: 35 }} />
                    <Text style={{ color: 'white', alignSelf: 'center' }}>
                        {item.likes} {item.likes === 0 ? 'like' : 'likes'}
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity style={{ padding: 10, alignItems: 'center' }} onPress={() => { openCommentModal(item.key) }}>
                    <Ionicons name='ios-chatbubble-outline' style={{ color: 'white', fontSize: 35 }} />
                    <Text style={{ color: 'white', alignSelf: 'center' }}>
                        comment
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity style={{ padding: 10, alignItems: 'center' }}>
                    <AntDesign name='eyeo' style={{ color: 'white', fontSize: 35 }} />
                    <Text style={{ color: 'white', alignSelf: 'center' }}>
                        {item.views} Views
                    </Text>
                </TouchableOpacity>
            </View>
            <ScrollView style={{ position: 'absolute', top: 500, backgroundColor: 'rgba(0, 0, 0, 0.5)', width: width, height: '100%', borderTopLeftRadius: 20, borderTopRightRadius: 20 }}>
                <Text 
                style={{ color: 'white', fontSize: 20, opacity: 1, padding: 15, paddingVertical: 5, paddingTop: 10, fontWeight:'500', position:showFullDescription?'absolute':'relative', top:10}} 
                numberOfLines={showFullDescription ? 0 : 2}>
                    {item.userName}: {item.description}
                </Text>
                {item.description.length > 50 && (
                    <TouchableOpacity onPress={toggleDescription} style={{ paddingLeft: 15 }}>
                        <Text style={{ color: showFullDescription ? 'blue' : 'gray', fontSize: 18 }}>
                            {showFullDescription ? 'See Less' : 'See More'}
                        </Text>
                    </TouchableOpacity>
                )}
            </ScrollView>
            <Modal visible={commentModalOpen}>
                <Comments closeModal={closeCommentModal} commentKey={docKey} />
            </Modal>
        </View>
    )
})

export default SinglePost

const styles = StyleSheet.create({
    container: {
        height: '100%',
        width: '100%',
        position: 'absolute'
    }
})