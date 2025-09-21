import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ActivityIndicator, View } from "react-native";
import { useAuth } from "../context/AuthContext";

import Login from "../screens/Auth/Login";
import Register from "../screens/Auth/Register";
import ConfirmSignUp from "../screens/Auth/ConfirmSignUp";

import Home from "../screens/Home/Home";
import Profile from "../screens/Profile/Profile";
import NewQuestion from "../screens/Home/NewQuestion";
import QuestionDetail from "../screens/Home/QuestionDetail";
import Timers from "../screens/Timers/Timers";
import Milestones from "../screens/Milestones/Milestones";
import Forums from "../screens/Forums/Forums";
import ProfilePublic from "../screens/Profile/ProfilePublic";
import SearchResults from "../screens/Home/SearchResults"; 
import Bibi from "../screens/Bibi/Bibi";
import Breakroom from "../screens/Breakrooms/Breakroom";
import MyQuestions from "../screens/Profile/MyQuestions";
import SavedForums from "../screens/Profile/SavedForums";

import TopNav from "../components/TopNav";

const Stack = createNativeStackNavigator();

function activeTabFor(
  routeName: string
): "home" | "forums" | "timers" | "milestones" | undefined {
  switch (routeName) {
    case "Home":
      return "home";
    case "QuestionDetail":
    case "Forums":
    case "SearchResults":  //  show Forums tab active on results
    case "NewQuestion":    //  and on compose
      return "forums";
    case "Timers":
      return "timers";
    case "Milestones":
      return "milestones";
    default:
      return undefined; // e.g., Profile, ProfilePublic
  }
}

export default function RootNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {user ? (
        <Stack.Navigator
          screenOptions={({ navigation, route }) => ({
            header: () => (
              <TopNav navigation={navigation} activeTab={activeTabFor(route.name)} />
            ),
          })}
        >
          <Stack.Screen name="Home" component={Home} />
          <Stack.Screen name="Forums" component={Forums} />
          <Stack.Screen name="SearchResults" component={SearchResults} /> 
          <Stack.Screen name="NewQuestion" component={NewQuestion} />
          <Stack.Screen name="QuestionDetail" component={QuestionDetail} />
          <Stack.Screen name="Timers" component={Timers} />
          <Stack.Screen name="Milestones" component={Milestones} />
          <Stack.Screen name="Profile" component={Profile} />
          <Stack.Screen name="ProfilePublic" component={ProfilePublic} />
          <Stack.Screen name="Bibi" component={Bibi} />
          <Stack.Screen name="Breakroom" component={Breakroom} />
          <Stack.Screen name="MyQuestions" component={MyQuestions} />
          <Stack.Screen name="SavedForums" component={SavedForums} />
        </Stack.Navigator>
      ) : (
        <Stack.Navigator screenOptions={{ headerTitle: "" }}>
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="Register" component={Register} />
          <Stack.Screen
            name="ConfirmSignUp"
            component={ConfirmSignUp}
            options={{ headerTitle: "Confirm account" }}
          />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
}
