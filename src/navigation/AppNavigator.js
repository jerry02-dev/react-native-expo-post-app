import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth }            from '../context/AuthContext';
import SplashScreen           from '../screens/SplashScreen';
import LoginScreen            from '../screens/LoginScreen';
import RegisterScreen         from '../screens/RegisterScreen';
import HomeScreen             from '../screens/HomeScreen';
import PostsListScreen        from '../screens/posts/PostsListScreen';
import PostDetailScreen       from '../screens/posts/PostDetailScreen';
import CreatePostScreen       from '../screens/posts/CreatePostScreen';
import EditPostScreen         from '../screens/posts/EditPostScreen';
import EditProfileScreen    from '../screens/profile/EditProfileScreen';
import ChangePasswordScreen from '../screens/profile/ChangePasswordScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { token, loading } = useAuth();

  if (loading) return <SplashScreen />;

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {token ? (
          // ✅ Authenticated screens
          <>
            <Stack.Screen name="Home"        component={HomeScreen} />
            <Stack.Screen
              name="PostsList"
              component={PostsListScreen}
              getId={({ params }) => params?.filterStatus}
            />
            <Stack.Screen name="PostDetail"  component={PostDetailScreen} />
            <Stack.Screen name="CreatePost"  component={CreatePostScreen} />
            <Stack.Screen name="EditPost"    component={EditPostScreen} />

            <Stack.Screen name="EditProfile"     component={EditProfileScreen} />
            <Stack.Screen name="ChangePassword"  component={ChangePasswordScreen} />
          </>
        ) : (
          // 🔒 Auth screens
          <>
            <Stack.Screen name="Login"    component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}