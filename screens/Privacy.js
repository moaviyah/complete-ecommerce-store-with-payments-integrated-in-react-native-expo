import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  TouchableOpacity,
  Image,
  SafeAreaView,
} from "react-native";
import React, { useState, useEffect } from "react";
import { getDatabase, ref, onValue } from "firebase/database";
import { primaryColor, PRIMARY_BACKGROUND_COLOR } from "../colors";

const windowWidth = Dimensions.get("window").width;
const windowHeight = Dimensions.get("window").height;

const Privacy = ({ closeModal }) => {
  const [tocData, setTocData] = useState("");

  useEffect(() => {
    // Fetch TOC data from Firebase
    const db = getDatabase();
    const tocRef = ref(db, "TOC/tocchild/toc_data");
    const unsubscribe = onValue(tocRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setTocData(data);
      }
    });

    // Clean up the subscription
    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.topContainer} onPress={closeModal}>
        <Image
          source={require("../assets/left-arrow.png")}
          style={{ height: 35, width: 35 }}
        />
      </TouchableOpacity>
      <Text style={styles.headTxt}>Our Privacy Policy</Text>
      <Text style={styles.tocText}>{tocData}</Text>
    </SafeAreaView>
  );
};

export default Privacy;

const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,
    backgroundColor: PRIMARY_BACKGROUND_COLOR,
    height: windowHeight,
    width: windowWidth,
  },
  topContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  tocText: {
    fontSize: 16,
    marginHorizontal: 20,
    marginTop: 20,
    textAlign: "center",
  },
  headTxt: {
    fontSize: "24",
    color: primaryColor,
    alignSelf: "center",
    fontWeight: "bold",
  },
});
