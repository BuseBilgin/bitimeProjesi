import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      
      <Stack.Screen name="index" /> 
      <Stack.Screen name="onboarding1" />
      <Stack.Screen name="onboarding2" />
      <Stack.Screen name="onboarding3" />
      <Stack.Screen name="login" />
      <Stack.Screen name="signup" />
      <Stack.Screen name="forgetpassword" />
      <Stack.Screen name="otp" />
      <Stack.Screen name="newpassword" />
      <Stack.Screen name="settings" />
      <Stack.Screen name="drug-interactions" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}
