import {
  StyleSheet,
  Text,
  View,
  Image,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import React, { useState, useEffect } from "react";
import {
  FOREGROUND_COLOR,
  PRIMARY_BACKGROUND_COLOR,
  SECONDARY_BACKGROUND_COLOR,
} from "../colors";
import {
  GoogleAuthProvider,
  signInWithPopup,
  getAuth,
  signInWithRedirect,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import * as WebBrowser from "expo-web-browser";

import * as Google from "expo-auth-session/providers/google";

const windowWidth = Dimensions.get("window").width;
const windowHeight = Dimensions.get("window").height;

// web : 909064984098-urg4qmi1le756no2ieblfg23vu9jfsic.apps.googleusercontent.com
// ios : 909064984098-9e3vkug2me9m255ristviniir2vbdc67.apps.googleusercontent.com
// android: 909064984098-fg37jkdr2h9tj21ai5nr8uuhteelvfkn.apps.googleusercontent.com

const LoginScreen = () => {
  const [accessToken, setaccessToken] = useState(null);
  const [user, setUser] = useState(null);
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId:
      "909064984098-urg4qmi1le756no2ieblfg23vu9jfsic.apps.googleusercontent.com",
    iosClientId:
      "909064984098-9e3vkug2me9m255ristviniir2vbdc67.apps.googleusercontent.com",
    androidClientId:
      "909064984098-fg37jkdr2h9tj21ai5nr8uuhteelvfkn.apps.googleusercontent.com",
  });

  const signIn = async (mail, pass) => {
    const auth = getAuth();
    // const email = mail;
    // const password = pass;
    const email = "maviyaakram6@gmail.com";
    const password = "muslimmodels";
    try {
      await signInWithEmailAndPassword(auth, email, password);
      console.log("User signed in successfully");
    } catch (error) {
      if (error.code === "auth/user-not-found") {
        try {
          // Create an account with email and password
          await createUserWithEmailAndPassword(auth, email, password);
          console.log("User account created successfully");
        } catch (error) {
          console.log("Error creating user account:", error);
        }
      } else {
        console.log("Sign in error:", error);
      }
    }
  };

  useEffect(() => {
    if (response?.type === "success") {
      setaccessToken(response.authentication.accessToken);
      console.log(response.authentication.accessToken);
      accessToken && fetchUserInfo();
    } else {
      console.log("no success");
    }
  }, [response, accessToken]);

  async function fetchUserInfo() {
    let response = await fetch("https://www.googleapis.com/userinfo/v2/me", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    const userInfo = await response.json();
    if (userInfo) {
      setUser(userInfo);
      signIn(userInfo.email, userInfo.name + userInfo.email);
      console.log(userInfo);
    } else console.log(`got no information`);
  }

  return (
    <View style={styles.container}>
      <Image style={styles.img} source={require("../assets/newlogo.jpeg")} />
      <Text style={styles.nametxt}>Stimac Live</Text>
      <Text style={styles.spintxt}>Spin it to Win it</Text>
      {/* onPress={()=>{promptAsync();}} */}

      <TouchableOpacity
        style={styles.loginbtn}
        // onPress={() => {
        //   promptAsync();
        // }}
        onPress={signIn}
        
      >
        <Image
          source={require("../assets/google.png")}
          style={styles.google_icon}
        />
        <Text style={styles.btntxt}>CONTINUE WITH GOOGLE</Text>
      </TouchableOpacity>
    </View>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PRIMARY_BACKGROUND_COLOR,
  },
  img: {
    height: windowHeight * 0.3,
    width: windowWidth * 0.6,
    alignSelf: "center",
    marginTop: windowHeight * 0.12,
    borderRadius: 5,
  },
  nametxt: {
    color: SECONDARY_BACKGROUND_COLOR,
    fontSize: 24,
    fontWeight: "600",
    alignSelf: "center",
    marginTop: windowHeight * 0.03,
  },
  spintxt: {
    alignSelf: "center",
    marginTop: windowHeight * 0.03,
    fontSize: 22,
    fontWeight: "500",
    color: "#d62828",
  },
  loginbtn: {
    width: windowWidth * 0.8,
    height: windowHeight * 0.1,
    backgroundColor: "#FFFFFF",
    alignSelf: "center",
    borderRadius: 10,
    marginTop: windowHeight * 0.2,
    justifyContent: "center",
    flexDirection: "row",
  },
  btntxt: {
    color: FOREGROUND_COLOR,
    fontSize: 16,
    fontWeight: "bold",
    alignSelf: "center",
  },
  google_icon: {
    height: windowHeight * 0.04,
    width: windowWidth * 0.07,
    alignSelf: "center",
    marginRight: windowWidth * 0.03,
  },
});
