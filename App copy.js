import { StyleSheet, Text, View, Platform } from "react-native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Icon from "react-native-vector-icons/FontAwesome5";
import HomeScreen from "./screens/HomeScreen";
import WinnersScreen from "./screens/WinnersScreen";
import NotificationsScreen from "./screens/NotificationsScreen";
import SettingScreen from "./screens/SettingScreen";
import { NavigationContainer } from "@react-navigation/native";
import Reels from "./screens/Reels";
import {
  FOREGROUND_COLOR,
  primaryColor,
  PRIMARY_BACKGROUND_COLOR,
  SECONDARY_BACKGROUND_COLOR,
} from "./colors";
import LoginScreen from "./screens/LoginScreen";
import { useState, useEffect } from "react";
import AllCategoriesScreen from "./screens/AllCategories";
import { getAuth, onAuthStateChanged } from "firebase/auth";
const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// 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
function MainTabNavigator() {
  return (
    <NavigationContainer independent={true}>
      <Tab.Navigator
        initialRouteName="Home"
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;
            if (focused) {
              switch (route.name) {
                case "Home":
                  iconName = "home";
                  color = primaryColor;
                  break;
                case "Winners":
                  iconName = "trophy";
                  color = primaryColor;
                  break;
                
                case "Notifications":
                  iconName = "video";
                  color = primaryColor;
                  break;
                case "Settings":
                  iconName = "cog";
                  color = primaryColor;
                  break;
                default:
                  iconName = "question";
                  break;
              }
            } else {
              switch (route.name) {
                case "Home":
                  iconName = "home";
                  color = "black";
                  break;
                case "Winners":
                  iconName = "trophy";
                  color = "black";
                  break;
                case "Notifications":
                  iconName = "bell";
                  color = "black";
                  break;
                case "Settings":
                  iconName = "cog";
                  color = "black";
                  break;
                default:
                  iconName = "question";
                  break;
              }
            }
            return (
              <View>
                <Icon name={iconName} size={24} color={color} />
              </View>
            );
          },
          tabBarLabel: ({ focused, color }) => {
            let label = "";
            if (focused) {
              switch (route.name) {
                case "Home":
                  label = "Home";
                  color = primaryColor;
                  break;
                case "Winners":
                  label = "Winners";
                  color = primaryColor;
                  break;
                case "Notifications":
                  label = "Notifications";
                  color = primaryColor;
                  break;
                case "Settings":
                  label = "Settings";
                  color = primaryColor;
                  break;
              }
            } else {
              switch (route.name) {
                case "Home":
                  label = "Home";
                  break;
                case "Winners":
                  label = "Winners";
                  break;
                case "Notifications":
                  label = "Notifications";
                  break;
                case "Settings":
                  label = "Settings";
                  break;
              }
            }
            return <Text style={{ color: color, fontSize: 11 }}>{label}</Text>;
          },
          tabBarStyle: {
            backgroundColor: "#FFFFFF",
            height: 60,
            paddingVertical: 15,

            borderTopLeftRadius: 35,
            borderTopRightRadius: 35,
            borderTopWidth: 0,
          },
        })}
      >
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{ headerShown: false }}
        />
        <Tab.Screen
          name="Winners"
          component={WinnersScreen}
          options={{ headerShown: false }}
        />
        <Tab.Screen
          name="Reels" // Set the name to "Reels"
          component={Reels} // Use your Reels screen component
          options={{
            headerShown:false,
            tabBarIcon: ({ focused, color, size }) =>{ 
              if (focused) {
                return(
              <View>
                <Icon name="video" size={24} color={primaryColor} />
              </View>
              )
              }
              else{
                return(
                  <View>
                    <Icon name="video" size={24} color={'black'} />
                  </View>
                )
              }
            },
            tabBarLabel: ({ focused, color }) => {
              if (focused) {
                return (
              <Text style={{ color: primaryColor, fontSize: 11 }}>Shorts</Text>
              )
            }else{
              return(
                <Text style={{ color: 'black', fontSize: 11 }}>Shorts</Text>
              )
            }
            },
          }}
        />
        <Tab.Screen
          name="Notifications"
          component={NotificationsScreen}
          options={{ headerShown: false }}
        />
        <Tab.Screen
          name="Settings"
          component={SettingScreen}
          options={{ headerShown: false }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  const [signedIn, setSignedIn] = useState(false);
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log(user);
      if (user) {
        setSignedIn(true);
        console.log("user", user);
      } else {
        setSignedIn(false);
        console.log("not user");
      }
    });
    return unsubscribe;
  }, []);
  return (
    <NavigationContainer>
      <Stack.Navigator>
        {signedIn ? (
          <Stack.Group>
            <Stack.Screen
              name="TabNavigator"
              component={MainTabNavigator}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="AllCategories"
              component={AllCategoriesScreen}
              options={{ headerShown: false }}
            />
          </Stack.Group>
        ) : (
          <Stack.Group>
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{ headerShown: false }}
            />
          </Stack.Group>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
