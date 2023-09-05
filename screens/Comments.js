import { StyleSheet, Text, View, TouchableOpacity, Image, ActivityIndicator, SafeAreaView, ScrollView, Alert } from 'react-native'
import React, { useState, useEffect } from 'react'
import { primaryColor, PRIMARY_BACKGROUND_COLOR } from '../colors'
import { TextInput } from 'react-native'
import { getDatabase, ref as databaseRef, push, set, get } from 'firebase/database';
import { getAuth } from 'firebase/auth';
import { addSeconds } from 'date-fns';


const Comments = (props) => {
    const { closeModal, commentKey } = props
    const [isLoading, setIsLoading] = useState(false)
    const [commentText, setCommentText] = useState('');
    const [comments, setComments] = useState([])
    useEffect(() => {
        const db = getDatabase();
        const commentsRef = databaseRef(db, `liveVideos/${commentKey}/comments`);

        get(commentsRef).then((commentsSnapshot) => {
            const commentsData = commentsSnapshot.val();
            if (commentsData) {
                const commentsArray = Object.values(commentsData);
                setComments(commentsArray.reverse());
            }
        }).catch((error) => {
            console.error('Error fetching comments:', error);
        });
    }, [commentText]);


    const addComment = async () => {
        if (!commentText) {
            return
        }
        try {
            const user = getAuth().currentUser;
            const db = getDatabase();
            const commentsRef = databaseRef(db, `liveVideos/${commentKey}/comments`);
            const newCommentRef = push(commentsRef);
            const key = newCommentRef.key
            const newComment = {
                userId: user.uid,
                text: commentText,
                timestamp: Date.now(),
                userName: user.displayName,
                commentKey: key
            };
            await set(newCommentRef, newComment);
            Alert.alert("Comment Added")
            setCommentText('')
        } catch (error) {
            console.error('Error adding comment:', error);
        }
    };

    const formatTimestamp = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })

    };
    const formatDate = (timestamp) => {
        const date = new Date(timestamp);
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return date.toLocaleString('en-US', options);

    };

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
                    <TouchableOpacity style={styles.topContainer} onPress={closeModal}
                    >
                        <Image
                            source={require("../assets/left-arrow.png")}
                            style={{ height: 35, width: 35 }}
                        />
                        <Text style={{ fontWeight: 'bold', fontSize: 24, color: primaryColor }}>
                            Comments
                        </Text>
                        <Text style={{ color: PRIMARY_BACKGROUND_COLOR }}>
                            Hello
                        </Text>
                    </TouchableOpacity>
                    <View style={{ flexDirection: 'row', width: '100%', position: 'absolute', top: 50 }}>
                        <TextInput
                            placeholder='Enter Comment'
                            placeholderTextColor={'gray'}
                            style={{ padding: 10, margin: 10, fontSize: 16, borderBottomWidth: 0.5, width: '80%' }}
                            value={commentText}
                            onChangeText={(text) => setCommentText(text)}
                            multiline
                        />
                        <TouchableOpacity
                            style={{ alignSelf: 'center', justifyContent: 'center', alignItems: 'center', width: '20%', paddingRight: 20 }}
                            onPress={addComment}
                        >
                            <Image source={require('../assets/send-message.png')} style={{ height: 24, width: 24, alignSelf: 'center' }} />
                            <Text style={{ fontSize: 12 }}>
                                send
                            </Text>
                        </TouchableOpacity>

                    </View>
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
            )
            }
        </SafeAreaView>
    )
}

export default Comments

const styles = StyleSheet.create({
    loaderContainer: {
        height: "100%",
        alignItems: "center",
        justifyContent: "center",
    },
    container: {
        height: "100%",
        backgroundColor: PRIMARY_BACKGROUND_COLOR,
    },
    topContainer: {
        paddingHorizontal: 10,
        marginVertical: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    commentList: {
        flex: 1,
        padding: 10,
        top: 50
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