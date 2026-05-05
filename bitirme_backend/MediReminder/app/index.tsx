import React, { useEffect } from 'react'; 
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

export default function Splash() {
  const router = useRouter();

  useEffect(() => {
    
    const timer = setTimeout(() => {

      router.replace('/onboarding1');
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.logoCircle}>
        <Text style={{fontSize: 60}}>💊</Text>
      </View>
      <Text style={styles.title}>MEDIREMINDER</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#005CEE', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  logoCircle: { 
    marginBottom: 20 
  },
  title: { 
    color: 'white', 
    fontSize: 32, 
    fontWeight: 'bold', 
    letterSpacing: 2 
  }
});