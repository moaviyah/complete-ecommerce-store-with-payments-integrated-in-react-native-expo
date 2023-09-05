import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  Text,
  Image,
  Alert,
} from "react-native";
import AntDesign from "react-native-vector-icons/AntDesign";
import { primaryColor, PRIMARY_BACKGROUND_COLOR } from "../colors";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import * as Notifications from "expo-notifications";
import {
  getStorage,
  uploadString,
  getDownloadURL,
  uploadBytes,
  ref as StorageRef,
} from "firebase/storage";
import { getAuth, updateProfile } from "firebase/auth";
import { getDatabase, ref, set } from "firebase/database";
import { askAsync, NOTIFICATIONS } from "expo-permissions";

const UserInfo = ({ navigation, closeModal }) => {
  const auth = getAuth();
  const userId = auth.currentUser.uid;
  const [name, setName] = useState("");
  const [email, setEmail] = useState(auth.currentUser.email);
  const [mobile, setMobile] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [address, setAddress] = useState("");
  const [profileImage, setProfileImage] = useState(null);
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [fetchAddress, setFetchAddress] = useState("");
  const [fetchCity, setFetchCity] = useState("");
  const [fetchCountry, setFetchCountry] = useState("");
  const [fetchPostalCode, setFetchPostalCode] = useState("");
  const [fetchState, setFetchState] = useState("");
  const [date, setDate] = useState("14 May 2023");
  const [imageUrl, setImageUrl] = useState("");
  const storage = getStorage();

  const getLiveLocation = async () => {
    let { status } = Location.requestForegroundPermissionsAsync();
    if ((status = "granted")) {
      const loc = await Location.getCurrentPositionAsync({});
      const add = await Location.reverseGeocodeAsync(loc.coords);

      const latitude = loc.coords.latitude;
      const longitude = loc.coords.longitude;
      for (let item of add) {
        const addr = `${item.name}, ${item.street}, ${item.postalCode}, ${item.city}, ${item.country}, `;
        console.log(addr);
        setFetchAddress(addr);
        setFetchCity(item.city);
        setFetchCountry(item.country);
      }

      setLatitude(latitude);
      console.log(latitude, longitude);
      setLongitude(longitude);
      const currentDate = Date.now();
      const date1 = new Date(currentDate);
      console.log(date1.getDate(), date1.getMonth(), date1.getFullYear());
      setDate(`${date1.getMonth()}/${date1.getDate()}/${date1.getFullYear()}`);
    } else {
      console.log("No Success");
    }
  };

  useEffect(() => {
    getLiveLocation();
  }, []);

  const handleImageUpload = async () => {
    try {
      // Ask permission to access the image library
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        console.log("Permission denied");
        return;
      }

      // Launch the image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled) {
        const { uri } = result;
        const imageUri = result.assets[0].uri;
        setProfileImage(imageUri);

        // Create a reference to the file in Firebase Storage
        const fileExtension = uri.split(".").pop();
        const fileName = `${Date.now()}.${fileExtension}`;
        const storageRef = StorageRef(storage, `images/${fileName}`);

        // Convert image to Blob format
        const response = await fetch(uri);
        const blob = await response.blob();
        try {
          await uploadBytes(storageRef, blob);
          const downloadUrl = await getDownloadURL(storageRef);
          setImageUrl(downloadUrl);
          console.log("Image uploaded successfully", downloadUrl);
        } catch (error) {
          console.log("error uploading img", error);
        }
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      Alert.alert("Something went wrong");
    }
  };

  const saveUserInfo = async () => {
    const database = getDatabase();
    if (
      !name ||
      !email ||
      !mobile ||
      !city ||
      !country ||
      !zipCode ||
      !address
    ) {
      Alert.alert("Please fill in all fields");
      return;
    }

    try {
      const userInfoRef = ref(database, `userinfo/${userId}`);

      const userInfoData = {
        address: address,
        balance: 0,
        blockStatus: "false",
        city: city,
        country: country,
        email: email,
        fetchAddress: fetchAddress,
        fetchCity: fetchCity,
        fetchCountry: fetchCountry,
        fetchPostalCode: fetchPostalCode,
        fetchState: fetchState,
        freetrial: false,
        image: imageUrl,
        lattitude: latitude,
        longitude: longitude,
        membership: "None",
        mobile: mobile,
        name: name,
        zipcode: zipCode,
        token: "",
      };

      // Save the user info data to the Realtime Database
      set(userInfoRef, userInfoData)
        .then(() => {
          console.log("User info saved successfully");
        })
        .catch((error) => {
          console.error("Error saving user info:", error);
        });
    } catch (error) {
      console.error("Error saving user info:", error);
    }

    updateProfile(auth.currentUser, {
      displayName: name,
    });
  };

  return (
    <View style={styles.container}>
      {/* <TouchableOpacity style={styles.imageContainer} onPress={handleImageUpload}>
        {profileImage ? (
          <Image source={{ uri: profileImage }} style={styles.profileImage} />
        ) : (
          <View style={styles.imgContainer}>
            <AntDesign name="user" size={80} color="black" style={styles.Imgicon} />
          </View>
        )}
      </TouchableOpacity> */}
      <View style={styles.fieldContainer}>
        <AntDesign
          name="user"
          size={24}
          color={primaryColor}
          style={styles.icon}
        />
        <TextInput
          style={styles.input}
          placeholder="Name"
          placeholderTextColor={"gray"}
          value={name}
          onChangeText={setName}
        />
      </View>

      <View style={styles.fieldContainer}>
        <AntDesign
          name="mail"
          size={24}
          color={primaryColor}
          style={styles.icon}
        />
        <TextInput
          style={[styles.input, { color: "gray", fontWeight: "600" }]}
          placeholder={email}
          placeholderTextColor="gray"
          value={email}
          onChangeText={setEmail}
          editable={false}
        />
      </View>

      <View style={styles.fieldContainer}>
        <AntDesign
          name="phone"
          size={24}
          color={primaryColor}
          style={styles.icon}
        />
        <TextInput
          style={styles.input}
          placeholder="Mobile Number"
          placeholderTextColor={"gray"}
          value={mobile}
          onChangeText={setMobile}
        />
      </View>

      <View style={styles.fieldContainer}>
        <AntDesign
          name="home"
          size={24}
          color={primaryColor}
          style={styles.icon}
        />
        <TextInput
          style={styles.input}
          placeholder="City"
          placeholderTextColor={"gray"}
          value={city}
          onChangeText={setCity}
        />
      </View>

      <View style={styles.fieldContainer}>
        <AntDesign
          name="earth"
          size={24}
          color={primaryColor}
          style={styles.icon}
        />
        <TextInput
          style={styles.input}
          placeholder="Country"
          placeholderTextColor={"gray"}
          value={country}
          onChangeText={setCountry}
        />
      </View>

      <View style={styles.fieldContainer}>
        <AntDesign
          name="inbox"
          size={24}
          color={primaryColor}
          style={styles.icon}
        />
        <TextInput
          style={styles.input}
          placeholder="Zip Code"
          placeholderTextColor={"gray"}
          value={zipCode}
          onChangeText={setZipCode}
        />
      </View>

      <View style={styles.fieldContainer}>
        <AntDesign
          name="home"
          size={24}
          color={primaryColor}
          style={styles.icon}
        />
        <TextInput
          style={styles.input}
          placeholder="Address"
          placeholderTextColor={"gray"}
          value={address}
          onChangeText={setAddress}
        />
      </View>

      <TouchableOpacity style={styles.button} onPress={saveUserInfo}>
        <Text style={styles.buttonText}>Save</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: "100%",
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: PRIMARY_BACKGROUND_COLOR,
  },
  fieldContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 0.5,
    borderRadius: 10,
    paddingHorizontal: 10,
    width: "90%",
  },
  icon: {
    marginRight: 8,
  },
  Imgicon: {},
  input: {
    height: 40,
    borderColor: "gray",
    paddingHorizontal: 8,
  },
  button: {
    backgroundColor: primaryColor,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 16,
    width: "80%",
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  imageContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  imgContainer: {
    marginVertical: 20,
    borderWidth: 1,
    borderRadius: 60,
  },
  profileImage: {
    height: 80,
    width: 80,
    borderRadius: 55,
  },
});

export default UserInfo;
