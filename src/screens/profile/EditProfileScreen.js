import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput,
  TouchableOpacity, ActivityIndicator,
  ScrollView, KeyboardAvoidingView, Platform
} from 'react-native';
import { useAuth }  from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

export default function EditProfileScreen({ navigation }) {
  const { user, updateProfile } = useAuth();
  const { colors }              = useTheme();
  const [name, setName]         = useState(user?.name  || '');
  const [email, setEmail]       = useState(user?.email || '');
  const [loading, setLoading]   = useState(false);
  const [success, setSuccess]   = useState('');
  const [errors, setErrors]     = useState({ name: '', email: '', general: '' });

  const clearError = (field) => setErrors(prev => ({ ...prev, [field]: '' }));
  const hasChanges = name !== user?.name || email !== user?.email;

  const getInitials = (fullName) => {
    if (!fullName) return '?';
    const parts = fullName.trim().split(' ');
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  const handleUpdate = async () => {
    setErrors({ name: '', email: '', general: '' });
    setSuccess('');
    const newErrors = { name: '', email: '', general: '' };
    let hasError = false;

    if (!name.trim()) { newErrors.name = 'Name is required.'; hasError = true; }
    if (!email.trim()) { newErrors.email = 'Email is required.'; hasError = true; }
    else if (!/\S+@\S+\.\S+/.test(email)) { newErrors.email = 'Please enter a valid email.'; hasError = true; }
    if (hasError) { setErrors(newErrors); return; }

    setLoading(true);
    try {
      await updateProfile(name, email);
      setSuccess('Profile updated successfully!');
    } catch (error) {
      const apiErrors  = error.response?.data?.errors;
      const apiMessage = error.response?.data?.message;
      if (apiErrors) {
        setErrors({ name: apiErrors.name?.[0] || '', email: apiErrors.email?.[0] || '', general: '' });
      } else {
        setErrors({ name: '', email: '', general: apiMessage || 'Failed to update profile.' });
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
      <View style={s.container}>

        {/* ── Purple Banner ──────────────────────────── */}
        <View style={s.banner}>
          <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
            <Text style={s.backBtnText}>Back</Text>
          </TouchableOpacity>

          <View style={s.avatar}>
            <Text style={s.avatarText}>{getInitials(name || user?.name)}</Text>
          </View>

          <Text style={s.bannerName}>{name || user?.name}</Text>
          <Text style={s.bannerEmail}>{email || user?.email}</Text>

          {/* 2 Column Info Grid */}
          <View style={s.infoGrid}>
            <View style={s.infoCard}>
              <Text style={s.infoValue}>
                {new Date(user?.created_at).toLocaleDateString('en-US', {
                  year: 'numeric', month: 'short', day: 'numeric'
                })}
              </Text>
              <Text style={s.infoLabel}>📅 Member Since</Text>
            </View>
            <View style={s.infoDivider} />
            <View style={s.infoCard}>
              <Text style={[s.infoValue, { color: colors.success }]}>✅ Verified</Text>
              <Text style={s.infoLabel}>📧 Email Status</Text>
            </View>
          </View>
        </View>

        <ScrollView contentContainerStyle={s.content}>

          {/* Success Banner */}
          {success ? (
            <View style={s.successBanner}>
              <Text style={s.successText}>✅  {success}</Text>
            </View>
          ) : null}

          {/* General Error */}
          {errors.general ? (
            <View style={s.errorBanner}>
              <Text style={s.errorBannerText}>⚠️  {errors.general}</Text>
            </View>
          ) : null}

          <Text style={s.sectionTitle}>Personal Information</Text>
          <View style={s.form}>

            <Text style={s.label}>Full Name</Text>
            <TextInput
              style={[s.input, errors.name ? s.inputError : null]}
              value={name}
              onChangeText={(val) => { setName(val); clearError('name'); setSuccess(''); }}
              placeholder="Enter your full name"
              placeholderTextColor={colors.placeholder}
              autoCapitalize="words"
            />
            {errors.name ? <Text style={s.fieldError}>⚠️  {errors.name}</Text> : null}

            <Text style={s.label}>Email Address</Text>
            <TextInput
              style={[s.input, errors.email ? s.inputError : null]}
              value={email}
              onChangeText={(val) => { setEmail(val); clearError('email'); setSuccess(''); }}
              placeholder="Enter your email"
              placeholderTextColor={colors.placeholder}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {errors.email ? <Text style={s.fieldError}>⚠️  {errors.email}</Text> : null}

          </View>

          {/* Save Button */}
          <TouchableOpacity
            style={[s.button, (!hasChanges || loading) && s.buttonDisabled]}
            onPress={handleUpdate}
            disabled={!hasChanges || loading}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={s.buttonText}>Save Changes</Text>
            }
          </TouchableOpacity>

        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const makeStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  banner: {
    backgroundColor: '#6C63FF',
    paddingTop: 60,
    paddingBottom: 0,
    paddingHorizontal: 24,
    alignItems: 'center',
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  backBtn: {
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  backBtnText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600',
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.5)',
    marginBottom: 14,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  bannerName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  bannerEmail: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.75)',
    marginBottom: 24,
  },
  infoGrid: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 16,
    marginHorizontal: -24,
    width: '115%',
    paddingVertical: 16,
    shadowColor: colors.shadow,
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    marginBottom: -1,
  },
  infoCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  infoLabel: {
    fontSize: 12,
    color: colors.subtext,
    fontWeight: '500',
  },
  infoDivider: {
    width: 1,
    backgroundColor: colors.divider,
    marginVertical: 4,
  },
  content: {
    padding: 24,
    paddingBottom: 40,
  },
  successBanner: {
    backgroundColor: colors.successBg,
    borderWidth: 1,
    borderColor: colors.successBorder,
    borderRadius: 10,
    padding: 14,
    marginBottom: 16,
  },
  successText: {
    color: colors.success,
    fontSize: 14,
    fontWeight: '600',
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 14,
    marginTop: 28,
  },
  form: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: colors.shadow,
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.subtext,
    marginBottom: 8,
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
    backgroundColor: '#6C63FF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#6C63FF',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.5,
    shadowOpacity: 0,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  linkCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: colors.shadow,
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  linkCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  linkIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.input,
    justifyContent: 'center',
    alignItems: 'center',
  },
  linkCardText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  linkCardArrow: {
    fontSize: 16,
    color: colors.purple,
    fontWeight: 'bold',
  },
});