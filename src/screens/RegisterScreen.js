import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator,
  KeyboardAvoidingView, Platform, ScrollView
} from 'react-native';
import { useAuth }  from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function RegisterScreen({ navigation }) {
  const { register }            = useAuth();
  const { colors }              = useTheme();
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm]   = useState('');
  const [loading, setLoading]   = useState(false);
  const [errors, setErrors]     = useState({
    name: '', email: '', password: '', confirm: '', general: '',
  });

  const clearError = (field) => setErrors(prev => ({ ...prev, [field]: '' }));

  const handleRegister = async () => {
    setErrors({ name: '', email: '', password: '', confirm: '', general: '' });
    const newErrors = { name: '', email: '', password: '', confirm: '', general: '' };
    let hasError = false;

    if (!name.trim())  { newErrors.name = 'Full name is required.'; hasError = true; }
    if (!email.trim()) { newErrors.email = 'Email is required.';    hasError = true; }
    else if (!/\S+@\S+\.\S+/.test(email)) { newErrors.email = 'Please enter a valid email address.'; hasError = true; }
    if (!password)     { newErrors.password = 'Password is required.'; hasError = true; }
    else if (password.length < 8) { newErrors.password = 'Password must be at least 8 characters.'; hasError = true; }
    if (!confirm)      { newErrors.confirm = 'Please confirm your password.'; hasError = true; }
    else if (password !== confirm) { newErrors.confirm = 'Passwords do not match.'; hasError = true; }

    if (hasError) { setErrors(newErrors); return; }

    setLoading(true);
    try {
      await register(name, email, password, confirm);
    } catch (error) {
      const apiErrors  = error.response?.data?.errors;
      const apiMessage = error.response?.data?.message;
      if (apiErrors) {
        setErrors({
          name:     apiErrors.name?.[0]     || '',
          email:    apiErrors.email?.[0]    || '',
          password: apiErrors.password?.[0] || '',
          confirm:  '',
          general:  '',
        });
      } else {
        setErrors({ name: '', email: '', password: '', confirm: '', general: apiMessage || 'Registration failed.' });
      }
    } finally {
      setLoading(false);
    }
  };

  const s = makeStyles(colors);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={s.container}>

        <View style={s.header}>
          <Text style={s.title}>Create Account 🚀</Text>
          <Text style={s.subtitle}>Sign up to get started</Text>
        </View>

        {errors.general ? (
          <View style={s.errorBanner}>
            <Text style={s.errorBannerText}>⚠️  {errors.general}</Text>
          </View>
        ) : null}

        <View style={s.form}>

          <Text style={s.label}>Full Name</Text>
          <TextInput
            style={[s.input, errors.name ? s.inputError : null]}
            placeholder="Enter your full name"
            value={name}
            onChangeText={(val) => { setName(val); clearError('name'); }}
            autoCapitalize="words"
            placeholderTextColor={colors.placeholder}
          />
          {errors.name ? <Text style={s.fieldError}>⚠️  {errors.name}</Text> : null}

          <Text style={s.label}>Email</Text>
          <TextInput
            style={[s.input, errors.email ? s.inputError : null]}
            placeholder="Enter your email"
            value={email}
            onChangeText={(val) => { setEmail(val); clearError('email'); }}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholderTextColor={colors.placeholder}
          />
          {errors.email ? <Text style={s.fieldError}>⚠️  {errors.email}</Text> : null}

          <Text style={s.label}>Password</Text>
          <TextInput
            style={[s.input, errors.password ? s.inputError : null]}
            placeholder="Minimum 8 characters"
            value={password}
            onChangeText={(val) => { setPassword(val); clearError('password'); }}
            secureTextEntry
            placeholderTextColor={colors.placeholder}
          />
          {errors.password ? <Text style={s.fieldError}>⚠️  {errors.password}</Text> : null}

          <Text style={s.label}>Confirm Password</Text>
          <TextInput
            style={[s.input, errors.confirm ? s.inputError : null]}
            placeholder="Re-enter your password"
            value={confirm}
            onChangeText={(val) => { setConfirm(val); clearError('confirm'); }}
            secureTextEntry
            placeholderTextColor={colors.placeholder}
          />
          {errors.confirm ? <Text style={s.fieldError}>⚠️  {errors.confirm}</Text> : null}

          <TouchableOpacity
            style={[s.button, loading && s.buttonDisabled]}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={s.buttonText}>Create Account</Text>
            }
          </TouchableOpacity>

        </View>

        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={s.link}>
            Already have an account?{' '}
            <Text style={s.linkBold}>Login</Text>
          </Text>
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const makeStyles = (colors) => StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: colors.background,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 16,
    color: colors.subtext,
  },
  errorBanner: {
    backgroundColor: colors.errorBg,
    borderWidth: 1,
    borderColor: colors.errorBorder,
    borderRadius: 10,
    padding: 14,
    marginBottom: 16,
  },
  errorBannerText: {
    color: colors.error,
    fontSize: 14,
    fontWeight: '600',
  },
  form: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: colors.shadow,
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.subtext,
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: 10,
    padding: 14,
    fontSize: 15,
    color: colors.text,
    backgroundColor: colors.input,
  },
  inputError: {
    borderColor: colors.error,
    backgroundColor: colors.errorBg,
  },
  fieldError: {
    color: colors.error,
    fontSize: 13,
    marginTop: 6,
    marginBottom: 4,
  },
  button: {
    backgroundColor: colors.purple,
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonDisabled: { opacity: 0.7 },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  link: {
    textAlign: 'center',
    color: colors.subtext,
    fontSize: 14,
  },
  linkBold: {
    color: colors.purple,
    fontWeight: 'bold',
  },
});