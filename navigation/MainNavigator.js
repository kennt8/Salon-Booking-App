import { createNativeStackNavigator } from "@react-navigation/native-stack";

import ServicesListScreen from "../screens/ServicesListScreen";
import CreateBookingScreen from "../screens/CreateBookingScreen";
import MyBookingsScreen from "../screens/MyBookingsScreen";
import StaffBookingsScreen from "../screens/StaffBookingsScreen";
import NotificationsScreen from "../screens/NotificationsScreen";
import LeaveReviewScreen from "../screens/LeaveReviewScreen";
import ServiceReviewsScreen from "../screens/ServiceReviewsScreen";
import ProfileScreen from "../screens/ProfileScreen";
import UploadPaymentProofScreen from "../screens/UploadPaymentProofScreen";

const Stack = createNativeStackNavigator();

export default function MainNavigator({ user, role }) {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Services" options={{ headerShown: false }}>
        {(props) => (
          <ServicesListScreen {...props} user={user} userRole={role} />
        )}
      </Stack.Screen>
      <Stack.Screen name="CreateBooking" options={{ headerShown: false }}>
        {(props) => <CreateBookingScreen {...props} user={user} />}
      </Stack.Screen>
      <Stack.Screen name="MyBookings" options={{ title: "My Bookings" }}>
        {(props) => <MyBookingsScreen {...props} user={user} />}
      </Stack.Screen>
      <Stack.Screen name="Notifications" options={{ title: "Notifications" }}>
        {(props) => <NotificationsScreen {...props} user={user} />}
      </Stack.Screen>
      <Stack.Screen name="LeaveReview" options={{ title: "Leave Review" }}>
        {(props) => <LeaveReviewScreen {...props} user={user} />}
      </Stack.Screen>
      <Stack.Screen name="ServiceReviews" options={{ title: "Reviews" }}>
        {(props) => <ServiceReviewsScreen {...props} />}
      </Stack.Screen>
      <Stack.Screen name="Profile" options={{ title: "Profile" }}>
        {(props) => <ProfileScreen {...props} user={user} />}
      </Stack.Screen>
      <Stack.Screen
        name="UploadPaymentProof"
        options={{ title: "Payment proof" }}
      >
        {(props) => <UploadPaymentProofScreen {...props} user={user} />}
      </Stack.Screen>
      {role === "staff" && (
        <Stack.Screen name="StaffBookings" options={{ title: "Manage Bookings" }}>
          {(props) => <StaffBookingsScreen {...props} user={user} />}
        </Stack.Screen>
      )}
    </Stack.Navigator>
  );
}

