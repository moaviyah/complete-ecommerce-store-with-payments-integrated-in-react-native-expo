import { StyleSheet, Text, View, TouchableOpacity, Image, FlatList } from 'react-native'
import React, { useState, useEffect } from 'react'
import { PRIMARY_BACKGROUND_COLOR, primaryColor } from '../colors'
import { getDatabase, ref, get, query, onValue, orderByChild, equalTo } from 'firebase/database';

const Wheel = ({ closeModal, productKey }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [enrolledUsers, setEnrolledUsers] = useState([]);
  const db = getDatabase();

  useEffect(() => {
    const wheelRef = ref(db, `wheeluser/${productKey}`);
    const wheelUserQuery = query(wheelRef, orderByChild('accepted'), equalTo(true));
    const unsubscribeWheelQuery = onValue(wheelUserQuery, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const users = Object.values(data);
        setEnrolledUsers(users);
        console.log('users:', users);
      }
    });

    return () => {
      unsubscribeWheelQuery();
    };
  }, []);

  const renderUserItem = ({ item }) => (
    <View style={styles.userItemContainer}>
      <Text style={styles.userName}>{item.name}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {isLoading ? (
        <View>
          <Text>Loading</Text>
        </View>
      ) : (
        <View>
          <TouchableOpacity style={styles.topContainer} onPress={closeModal}>
            <Image source={require('../assets/left-arrow.png')} style={{ height: 35, width: 35 }} />
          </TouchableOpacity>
          <Text style={styles.headTxt}>Wheel</Text>
          <Text style={styles.wheelTxt}>Wheel will be spinned three times and winner will be notified.</Text>
          <View style={styles.wheelContainer}>
            <Text style={styles.wheelUsers}>Following are the users enrolled in wheel</Text>
            <FlatList
              data={enrolledUsers}
              renderItem={renderUserItem}
              keyExtractor={(item, index) => index.toString()}
              contentContainerStyle={styles.userListContainer}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </View>
      )}
    </View>
  );
}

export default Wheel;

const styles = StyleSheet.create({
  topContainer: {
    paddingVertical: 10,
    paddingHorizontal: 10
  },
  container: {
    height: '100%',
    backgroundColor: PRIMARY_BACKGROUND_COLOR,
    paddingTop: 20,
    paddingHorizontal: 10,
  },
  wheelContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  userListContainer: {
    flexGrow: 1,
    alignItems: 'center',
  },
  userItemContainer: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginBottom: 10,
    backgroundColor: 'white',
    borderRadius: 10,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  headTxt:{
    fontSize:'24',
    color:primaryColor,
    marginLeft:10,
    fontWeight:'bold'
  },
  wheelTxt:{
    margin:10
  },
  wheelUsers:{
    margin:10,
    fontWeight:'bold',
    color:primaryColor
  }
});
