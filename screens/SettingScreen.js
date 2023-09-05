import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  Dimensions,
  Image,
  TouchableOpacity,
  ScrollView,
  Modal,
  Linking,
} from "react-native";
import React, { useState, useEffect } from "react";
import {
  FOREGROUND_COLOR,
  primaryColor,
  PRIMARY_BACKGROUND_COLOR,
  SECONDARY_BACKGROUND_COLOR,
} from "../colors";
import Icon from "react-native-vector-icons/Ionicons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { getAuth, signOut } from "firebase/auth";
import { getDatabase, ref, onValue, update } from "firebase/database";
import MembershipRequest from "./MembershipRequest";
import Addproduct from "./Addproduct";
import PickupInfo from "./PickupInfo";
import Statistics from "./Statistics";
import TermOfUse from "./TermOfUse";
import Privacy from "./Privacy";
import ContactUs from "./ContactUs";
import Share from "./Share";
import AdminSupport from "./AdminSupport";
import Notifications from "./Notifications";
import { getUnixTime, sub } from "date-fns";
import UserChat from "./UserChat";
import EditProfile from "./EditProfile";
import ReelsUploadScreen from "./ReelsUploadScreen";

const windowWidth = Dimensions.get("window").width;
const windowHeight = Dimensions.get("window").height;

const SettingScreen = ({ navigation }) => {
  const auth = getAuth();
  const db = getDatabase();
  const userId = auth.currentUser.uid;
  const [user, setUser] = useState();
  const [loading, setLoading] = useState(true);
  const [activeModal, setActiveModal] = useState(null); // Track the active modal
  const [chatModalVisible, setChatModalVisible] = useState(false);
  const [recieverId, setRecieverId] = useState();
  const buttons = [
    {
      title: "Become a Seller",
      description: "View and edit your products",
      icon: "person-outline",
    },
  ];
  const secondaryBtn = [
    {
      id: 0,
      title:"Live Hip Videos",
      description:"Upload Short Videos",
      icon:"videocam-outline"
    },
    {
      id: 1,
      title: "Notifications",
      description: "Notify by new announcements",
      icon: "notifications-outline",
    },

    {
      id: 2,
      title: "Statistics",
      description: "See the statistics about your product",
      icon: "stats-chart-outline",
    },
    {
      id: 3,
      title: "Terms of Use",
      description: "Term of use of USPINUWINUSHIP",
      icon: "document-outline",
    },
    {
      id: 4,
      title: "Privacy Policy",
      description: "Privacy Policy of USPINUWINUSHIP",
      icon: "lock-closed-outline",
    },
    {
      id: 5,
      title: "Contact Us",
      description: "Connect with support",
      icon: "mail-outline",
    },
    {
      id: 6,
      title: "Share",
      description: "Share with friends",
      icon: "share-social-outline",
    },
    {
      id: 7,
      title: "Logout",
      description: "Logout your account",
      icon: "log-out-outline",
    },
    {
      id: 8,
      title: "Admin Support",
      description: "Live Support 24/7",
      icon: "help-circle-outline",
    },
  ];
  const fetchUserInfo = () => {
    const userInfoRef = ref(db, `userinfo/${userId}`);

    onValue(
      userInfoRef,
      (snapshot) => {
        const userInfo = snapshot.val();
        setUser(userInfo);
        setLoading(false);
        if (userInfo.freeDaysLeft > 0) {
          const currentTime = new Date();
          const lastUpdateTime = new Date(userInfo.lastUpdated);
          const timeDiffInMs = currentTime - lastUpdateTime;
          const timeDiffInHrs = timeDiffInMs / (1000 * 60 * 60);
          console.log(timeDiffInHrs);
          if (timeDiffInHrs >= 24) {
            const newDaysLeft = userInfo.freeDaysLeft - 1;
            update(userInfoRef, {
              freeDaysLeft: newDaysLeft,
              lastUpdated: currentTime.toISOString(),
            });
          }
        } else if (userInfo.freeDaysLeft <= 0) {
          update(userInfoRef, {
            membership: "None",
          });
        }
      },
      (error) => {
        console.log("Error fetching userInfo:", error);
      }
    );
  };
  useEffect(() => {
    fetchUserInfo();
  }, []);

  const handleModalOpen = (button) => {
    if (user.membership === "None") {
      setActiveModal("Membership");
    } else if (
      user.membership === "free" ||
      user.membership === "Free" ||
      user.membership === "paid" ||
      user.membership === "Paid"
    ) {
      setActiveModal("AddProduct");
    }
  };

  const handleSecondaryModalOpen = (id) => {
    if (id === 0) {
      setActiveModal("LiveVideos");
    }
     else if (id === 1) {
      setActiveModal("Notifications");
    } else if (id === 2) {
      setActiveModal("Statistics");
    } else if (id === 3) {
      setActiveModal("TOU");
    } else if (id === 4) {
      setActiveModal("Privacy");
    } else if (id === 5) {
      setActiveModal("ContactUs");
    } else if (id === 6) {
      setActiveModal("Share");
    } else if (id === 7) {
      signOut(auth).then(() => {
        console.log("User Logged out");
      });
    } else if (id === 8) {
      setActiveModal("AdminSupport");
    }
  };
  const handleModalClose = () => {
    setActiveModal(null); // Close the active modal
  };

  const [message, setMessage] = useState("");

  const handleCopyLink = () => {
    const link = "https://yourappstorelink";
    setMessage(link);
  };

  const handleWhatsApp = () => {
    Linking.openURL(
      `whatsapp://send?text=${encodeURIComponent(
        `Check out this cool app: https://yourappstorelink`
      )}`
    );
  };

  const handleInstagram = () => {
    Linking.openURL(
      `instagram://direct_message?text=${encodeURIComponent(
        `Check out this cool app: https://yourappstorelink`
      )}`
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {loading ? (
        <View>
          <Text>Loading</Text>
        </View>
      ) : (
        <ScrollView>
          <View style={styles.headingContainer}>
            <Text style={styles.heading}>SettingScreen</Text>
            <Text style={styles.balanceTxt}>Balance: {user.balance}</Text>
          </View>

          <TouchableOpacity
            style={{
              margin: windowHeight * 0.02,
              backgroundColor: "#FFFFFF",
              padding: windowWidth * 0.05,
              borderRadius: 10,
              flexDirection: "row",
            }}
            onPress={() => setActiveModal("EditProfile")}
          >
            {user.image ? (
              <Image
                source={{ uri: user.image }}
                style={{
                  width: windowWidth * 0.2,
                  height: windowWidth * 0.2,
                  borderRadius: 45,
                }}
              />
            ) : (
              <Image
                source={require("../assets/man.png")}
                style={{
                  width: windowWidth * 0.2,
                  height: windowWidth * 0.2,
                  borderRadius: 45,
                }}
              />
            )}

            <View
              style={{
                justifyContent: "center",
                marginLeft: windowWidth * 0.01,
              }}
            >
              <Text style={{ fontWeight: "600", fontSize: 14 }}>
                {auth.currentUser.displayName}
              </Text>
              <Text>{auth.currentUser.email}</Text>
              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  alignItems: "center",
                }}
              >
                <Text>Membership: {user.membership}</Text>
                {user.membership === "Free" ||
                  (user.membership === "free" && (
                    <Text>Days left: {user.freeDaysLeft}</Text>
                  ))}
              </View>
            </View>
            <Image
              source={require("../assets/membership.png")}
              style={{
                height: windowHeight * 0.05,
                width: windowWidth * 0.09,
                marginLeft: windowWidth * 0.05,
                alignSelf: "center",
              }}
            />
          </TouchableOpacity>

          {buttons.map((button, index) => (
            <TouchableOpacity
              key={index}
              style={styles.buttonContainer}
              onPress={() => handleModalOpen()}
            >
              <Icon
                name={button.icon}
                style={{ marginLeft: windowWidth * 0.01 }}
                size={26}
                color={"#1a936f"}
              />
              <View style={{ marginLeft: windowWidth * 0.05 }}>
                <Text style={styles.buttonTitle}>{button.title}</Text>
                <Text style={styles.buttonDescription}>
                  {button.description}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
          {secondaryBtn.map((button, index) => (
            <TouchableOpacity
              key={index}
              style={styles.buttonContainer}
              onPress={() => handleSecondaryModalOpen(button.id)}
            >
              <Icon
                name={button.icon}
                style={{ marginLeft: windowWidth * 0.01 }}
                size={26}
                color={"#1a936f"}
              />
              <View style={{ marginLeft: windowWidth * 0.05 }}>
                <Text style={styles.buttonTitle}>{button.title}</Text>
                <Text style={styles.buttonDescription}>
                  {button.description}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
      <Modal visible={activeModal === "EditProfile"} animationType="slide">
        <View>
          <EditProfile closeModal={handleModalClose} />
        </View>
      </Modal>
      {/* MemberShip Request Modal */}
      <Modal visible={activeModal === "Membership"} animationType="slide">
        <View>
          <MembershipRequest closeModal={handleModalClose} />
        </View>
      </Modal>
      {/* Add Product Modal */}
      <Modal visible={activeModal === "AddProduct"} animationType="slide">
        <View>
          <Addproduct closeModal={handleModalClose} />
        </View>
      </Modal>

      {/* Notifications Modal */}
      <Modal visible={activeModal === "Notifications"} animationType="slide">
        <View>
          <Notifications closeModal={handleModalClose} />
        </View>
      </Modal>

      {/* pickUp Info Modal */}

      <Modal visible={activeModal === "PickupInfo"} animationType="slide">
        <View>
          <PickupInfo closeModal={handleModalClose} />
        </View>
      </Modal>

      {/* Statistics Modal */}

      <Modal visible={activeModal === "Statistics"} animationType="slide">
        <View>
          <Statistics closeModal={handleModalClose} />
        </View>
      </Modal>

      {/* Term Of Use Modal */}

      <Modal visible={activeModal === "TOU"} animationType="slide">
        <View>
          <TermOfUse closeModal={handleModalClose} />
        </View>
      </Modal>

      {/* Privacy policy Modal */}

      <Modal visible={activeModal === "Privacy"} animationType="slide">
        <View>
          <Privacy closeModal={handleModalClose} />
        </View>
      </Modal>

      {/* Contact Us Modal */}

      <Modal visible={activeModal === "ContactUs"} animationType="slide">
        <View>
          <UserChat
            closeModal={handleModalClose}
            senderId={userId}
            recieverId={"support"}
          />
        </View>
      </Modal>

      <Modal visible={activeModal=== "LiveVideos"} animationType='slide'>
          <View>
            <ReelsUploadScreen
            closeModal={handleModalClose}
            
            />
          </View>
      </Modal>

      {/* Share Modal */}

      <Modal visible={activeModal === "Share"} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.shareButtons}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: 10,
                }}
              >
                <Text style={styles.shareText}>Share Your App</Text>
                <TouchableOpacity
                  style={styles.shareButton}
                  onPress={handleCopyLink}
                >
                  <Icon name="copy" style={styles.icon} size={25} />
                </TouchableOpacity>
              </View>

              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "center",
                  alignContent: "center",
                }}
              >
                <TouchableOpacity
                  style={styles.shareButton}
                  onPress={handleWhatsApp}
                >
                  <Image
                    source={require("../assets/whatsapp.png")}
                    style={[styles.icon, { height: 25, width: 25 }]}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.shareButton}
                  onPress={handleInstagram}
                >
                  <Image
                    source={require("../assets/instagram.png")}
                    style={[styles.icon, { height: 25, width: 25 }]}
                  />
                </TouchableOpacity>
              </View>
            </View>
            <View style={{ alignContent: "center", justifyContent: "center" }}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleModalClose}
              >
                <Text style={styles.cancelButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Admin Support Modal */}

      <Modal visible={activeModal === "AdminSupport"} animationType="slide">
        <View>
          <UserChat
            closeModal={handleModalClose}
            senderId={userId}
            recieverId={"support"}
          />
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default SettingScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PRIMARY_BACKGROUND_COLOR,
  },
  heading: {
    fontSize: 20,
    fontWeight: "700",
    margin: windowWidth * 0.03,
    color: primaryColor,
  },
  headingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: 10,
  },
  balanceTxt: {
    marginHorizontal: windowWidth * 0.03,
  },
  buttonContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#ECECEC",
    marginHorizontal: windowHeight * 0.02,
  },
  icon: {
    marginRight: 12,
  },
  buttonTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  buttonDescription: {
    fontSize: 14,
    color: "#888888",
  },
  modalContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 16,
  },

  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingTop: 20,
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20,
    height: 300,
  },
  closeButton: {
    position: "absolute",
    top: 10,
    right: 10,
  },
  closeIcon: {
    width: 20,
    height: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
  },
  inputContainer: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    paddingVertical: 5,
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  input: {
    height: 40,
  },
  button: {
    backgroundColor: "#37474F",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  buttonText: {
    color: "black",
    fontSize: 16,
    fontWeight: "bold",
  },
  share: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 30,
  },
  shareText: {
    marginRight: 10,
    fontSize: 16,
  },
  shareIcon: {
    width: 30,
    height: 30,
    marginHorizontal: 10,
  },
  icon: {
    marginLeft: 30,
    marginTop: 10,
  },
  cancelButton: {
    height: 50,
    width: 150,
    backgroundColor: primaryColor,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    position: "relative",
    alignSelf: "center",
  },
  cancelButtonText: {
    fontWeight: "500",
    color: "#FFFFFF",
  },
});
