import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  TextInput,
  Button,
  Alert,
  SafeAreaView,
} from "react-native";
import React, { useState } from "react";
import { PRIMARY_BACKGROUND_COLOR, primaryColor } from "../colors";
import { auth } from "../config";
import { updateProfile } from "firebase/auth";

const EditProfile = ({ closeModal }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState();
  const userName = auth.currentUser.displayName;
  const userMail = auth.currentUser.email;

  const handleSave = () => {
    updateProfile(auth.currentUser, {
      displayName: name,
    })
      .then(() => {
        console.log("profile updated sucesfully");
        Alert.alert("Profile Updated Successfully");
        setName("");
      })
      .catch((error) => {
        console.log(error);
      });
  };
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
          <Text style={styles.heading}>Edit Profile</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Name"
              value={name}
              onChangeText={setName}
              placeholderTextColor='grey'
            />
            <TextInput
              style={styles.input}
              placeholder="Email"
              editable={false}
              value={userMail} // Replace with the user's email address
            />
          </View>

          <TouchableOpacity style={styles.purchaseBtn} onPress={handleSave}>
            <Text style={styles.btnTxt}>Update</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

export default EditProfile;

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
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    borderWidth: 0.5,
    borderColor: "gray",
    borderRadius: 5,
    padding: 20,
    marginBottom: 10,
    width: "95%",
    height: 55,
    alignSelf: "center",
  },
  purchaseBtn: {
    backgroundColor: primaryColor,
    height: 55,
    width: "95%",
    alignSelf: "center",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  btnTxt: {
    fontWeight: "600",
    fontSize: 16,
    color: "#FFFFFF",
  },
  heading: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    marginHorizontal: 10,
    color: primaryColor,
  },
});
