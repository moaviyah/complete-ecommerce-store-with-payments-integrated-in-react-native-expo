import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import React, { useState, useEffect } from "react";
import { primaryColor, PRIMARY_BACKGROUND_COLOR } from "../colors";
import { getAuth } from "firebase/auth";
import { getDatabase, ref, onValue, update, set } from "firebase/database";
import { auth } from "../config";
import { SafeAreaView } from "react-native";

const windowWidth = Dimensions.get("window").width;
const windowHeight = Dimensions.get("window").height;

const MembershipRequest = ({ closeModal }) => {
  const db = getDatabase();
  const userId = auth.currentUser.uid;
  const [user, setUser] = useState();
  const [loading, setLoading] = useState(true);
  const [freeTrial, setFreeTrial] = useState(false);
  const [date, setDate] = useState();
  const userInfoRef = ref(db, `userinfo/${userId}`);
  useEffect(() => {
    const fetchUserInfo = () => {
      onValue(
        userInfoRef,
        (snapshot) => {
          const userInfo = snapshot.val();
          setUser(userInfo);
          if (userInfo.freeTrial === false) {
            setFreeTrial(false);
          }
          const currentDate = Date.now();
          const date1 = new Date(currentDate);
          setDate(
            `${date1.getMonth()}/${date1.getDate()}/${date1.getFullYear()}`
          );

          setLoading(false);
        },
        (error) => {
          console.log("Error fetching userInfo:", error);
          setLoading(false);
        }
      );
    };

    fetchUserInfo();
  }, [db, userId]);

  const enableFreeTrial = () => {
    if (user.freetrial === true) {
      Alert.alert("Free trial Already Availed");
    } else {
      const currentTime = new Date();
      update(userInfoRef, {
        freetrial: true,
        freeDaysLeft: 30,
        membership: "free",
        memdate: date,
        lastUpdated: currentTime.toISOString(),
      });
      Alert.alert("Free Trial Activated Successfully");
    }
  };
  const sendMemberShipRequest = () => {
    const memberShipRequestRef = ref(db, `membershipRequests/${userId}`);
    set(memberShipRequestRef, {
      key: userId,
      uid: userId,
    })
      .then(() => {
        Alert.alert("Membership request sent successfully");
      })
      .catch((error) => {
        console.log("Error sending membership request:", error);
        Alert.alert("Something went wrong");
      });
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <View>
          <Text>Loading</Text>
        </View>
      ) : (
        <SafeAreaView>
          <TouchableOpacity style={styles.topContainer} onPress={closeModal}>
            <Image
              source={require("../assets/left-arrow.png")}
              style={{ height: 35, width: 35 }}
            />
          </TouchableOpacity>
          <Text style={styles.selectMemberShipTxt}>Select Membership</Text>
          <Text style={styles.explainTxt}>
            To become a seller you have 30 days free. After, you will be charged
            a recurring monthly fee of $20 invoice that will be sent to you for
            payment each month
          </Text>

          <TouchableOpacity style={styles.btn} onPress={enableFreeTrial}>
            <Image
              source={require("../assets/free.png")}
              style={{ height: 55, width: 55, alignSelf: "center" }}
            />
            <View style={styles.btnContainer}>
              <Text style={styles.btnMainTxt}>Free Membership</Text>
              <Text style={styles.btnSecondaryTxt}>
                Pay the low cheap price for any item {"\n"}and get listed under
                spin the wheel
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.btn} onPress={sendMemberShipRequest}>
            <Image
              source={require("../assets/subscription-model.png")}
              style={{ height: 55, width: 55, alignSelf: "center" }}
            />
            <View style={styles.btnContainer}>
              <Text style={styles.btnMainTxt}>Recurring $20/Month</Text>
              <Text style={styles.btnSecondaryTxt}>
                Request for 20$ invoice
              </Text>
            </View>
          </TouchableOpacity>
        </SafeAreaView>
      )}
    </View>
  );
};

export default MembershipRequest;

const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,
    backgroundColor: PRIMARY_BACKGROUND_COLOR,
    height: windowHeight,
    width: windowWidth,
    paddingHorizontal: 20,
  },
  topContainer: {
    paddingVertical: 10,
  },
  selectMemberShipTxt: {
    fontSize: 20,
    fontWeight: "700",

    color: primaryColor,
  },
  explainTxt: {
    marginVertical: 10,
    textAlign: "justify",
  },
  btn: {
    flexDirection: "row",
    height: 100,
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    marginVertical: 10,
    paddingHorizontal: 20,
  },
  btnContainer: {
    alignSelf: "center",
    flexWrap: "wrap",
    marginHorizontal: 10,
  },
  btnMainTxt: {
    fontWeight: "600",
  },
  btnSecondaryTxt: {
    color: "gray",
  },
});
