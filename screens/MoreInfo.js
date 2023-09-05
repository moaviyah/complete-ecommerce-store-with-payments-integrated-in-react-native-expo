import { SafeAreaView, StyleSheet, Text, View, ActivityIndicator, ScrollView, TouchableOpacity, Image, Alert } from 'react-native'
import React, { useState, useEffect } from 'react'
import { PRIMARY_BACKGROUND_COLOR } from '../colors'
import { getDatabase, ref as databaseRef, push, set, get, remove } from 'firebase/database';
import { getAuth } from 'firebase/auth';

const MoreInfo = ({ closeModal, item }) => {
    const [isLoading, setIsLoading] = useState(false)
    console.log('item', item)
    const [comments, setComments] = useState([])
    useEffect(() => {
        const db = getDatabase();
        const commentsRef = databaseRef(db, `liveVideos/${item.key}/comments`);

        get(commentsRef).then((commentsSnapshot) => {
            const commentsData = commentsSnapshot.val();
            if (commentsData) {
                const commentsArray = Object.values(commentsData);
                setComments(commentsArray.reverse());
            }
        }).catch((error) => {
            console.error('Error fetching comments:', error);
        });
    }, []);
    const formatTimestamp = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })

    };
    const formatDate = (timestamp) => {
        const date = new Date(timestamp);
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return date.toLocaleString('en-US', options);

    };

    const handleDeleteVideo = () => {
        Alert.alert(
            'Delete Video',
            'Are you sure you want to delete this video?',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => {
                        deleteVideo();
                    },
                },
            ],
            { cancelable: false }
        );
    };
    const deleteVideo = async () => {
        try {
            const db = getDatabase();
            const videoRef = databaseRef(db, `liveVideos/${item.key}`);
            await remove(videoRef);
            closeModal();
        } catch (error) {
            console.error('Error deleting video:', error);
        }
    };
    return (
        <SafeAreaView style={{ backgroundColor: PRIMARY_BACKGROUND_COLOR }}>
            {isLoading ? (
                <SafeAreaView style={styles.loaderContainer}>
                    <ActivityIndicator
                        size="small"
                        color={primaryColor}
                        style={{ alignSelf: "center" }}
                    />
                </SafeAreaView>
            ) : (
                <View style={{ backgroundColor: PRIMARY_BACKGROUND_COLOR, height: '100%' }} >
                    <View style={{ flexDirection: 'row', width: '100%', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 10 }}>
                        <TouchableOpacity style={styles.topContainer} onPress={closeModal}>
                            <Image
                                source={require("../assets/left-arrow.png")}
                                style={{ height: 35, width: 35 }}
                            />
                        </TouchableOpacity>
                        <TouchableOpacity style={{ paddingVertical: 10, paddingHorizontal: 10 }} onPress={handleDeleteVideo}>
                            <Text style={{ color: 'red', fontSize: 22, alignSelf: "center" }}>
                                Delete Video
                            </Text>
                        </TouchableOpacity>
                    </View>
                    <View style={{ margin: 15 }}>
                        <Text style={{ fontSize: 22, fontWeight: '600', }}>
                            Title:
                        </Text>
                        <Text style={{ fontSize: 20, marginVertical: 7 }}>{item.title}</Text>
                        <Text style={{ fontSize: 22, fontWeight: '600' }}>
                            Description:

                        </Text>
                        <Text style={{ fontSize: 20, marginVertical: 7 }}>
                            {item.description}
                        </Text>
                        <View style={{flexDirection:'row', marginVertical:10, alignItems:'center', justifyContent:'space-between', paddingRight:10}}>
                            <Text style={{fontSize:22, fontWeight:'600'}}>
                                Total Views:
                            </Text>
                            <Text style={{fontSize:20, fontWeight:'600'}}>
                                {item.views}
                            </Text>
                        </View>
                        <View style={{flexDirection:'row', marginVertical:10, alignItems:'center', justifyContent:'space-between', paddingRight:10}}>
                            <Text style={{fontSize:22, fontWeight:'600'}}>
                                Total likes:
                            </Text>
                            <Text style={{fontSize:20, fontWeight:'600'}}>
                                {item.likes}
                            </Text>
                        </View>
                        <Text style={{fontSize:22, fontWeight:'600', marginBottom:10}}>
                                Comments:
                            </Text>
                        <ScrollView style={styles.commentList}>
                        {comments.length > 0 ? (
                            comments.map((comment, index) => (
                                <View key={index} style={styles.commentItem}>
                                    <View>
                                        <Text style={styles.commentText}>{comment.text}</Text>
                                        <Text style={styles.commentUser}>{comment.userName}</Text>
                                    </View>
                                    <View>
                                        <Text style={{ alignSelf: 'center' }}>
                                            {formatTimestamp(comment.timestamp)}
                                        </Text>
                                        <Text>
                                            {formatDate(comment.timestamp)}
                                        </Text>
                                    </View>
                                </View>
                            ))
                        ) : (
                            <Text style={styles.noCommentsText}>No comments in this post yet.</Text>
                        )}
                    </ScrollView>
                    </View>
                </View>
            )
            }
        </SafeAreaView>
    )
}

export default MoreInfo

const styles = StyleSheet.create({
    topContainer: {
        paddingVertical: 10,

    },
    loaderContainer: {
        height: "100%",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: PRIMARY_BACKGROUND_COLOR
    },

    
    commentItem: {
        marginBottom: 10,
        padding: 10,
        backgroundColor: 'white',
        borderRadius: 8,
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    commentText: {
        fontSize: 16,
    },
    commentUser: {
        fontSize: 12,
        marginTop: 5,
        color: 'gray',
    },
    noCommentsText: {
        textAlign: 'center',
        fontSize: 16,
        color: 'gray',
    },
})