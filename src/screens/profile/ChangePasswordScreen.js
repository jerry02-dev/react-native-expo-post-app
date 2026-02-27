import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput,
  TouchableOpacity, ActivityIndicator,
  ScrollView, KeyboardAvoidingView,
  Platform, Alert
} from 'react-native';
import { useAuth }  from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

export default function ChangePasswordScreen({ navigation }) {
  const { changePassword, deleteAccount } = useAuth();
  const { colors }                        = useTheme();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword]         = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading]                 = useState(false);
  const [deleting, setDeleting]               = useState(false);
  const [success, setSuccess]                 = useState('');
  const [errors, setErrors] = useState({
    current_password: '', new_password: '', confirm_password: '', general: '',
  });

  const clearError = (field) => setErrors(prev => ({ ...prev, [field]: '' }));

  const handleChangePassword = async () => {
    setErrors({ current_password: '', new_password: '', confirm_password: '', general: '' });
    setSuccess('');
    const newErrors = { current_password: '', new_password: '', confirm_password: '', general: '' };
    let hasError = false;

    if (!currentPassword) { newErrors.current_password = 'Current password is required.'; hasError = true; }
    if (!newPassword)     { newErrors.new_password = 'New password is required.'; hasError = true; }
    else if (newPassword.length < 8) { newErrors.new_password = 'Password must be at least 8 characters.'; hasError = true; }
    if (!confirmPassword) { newErrors.confirm_password = 'Please confirm your new password.'; hasError = true; }
    else if (newPassword !== confirmPassword) { newErrors.confirm_password = 'Passwords do not match.'; hasError = true; }

    if (hasError) { setErrors(newErrors); return; }

    setLoading(true);
    try {
      await changePassword(currentPassword, newPassword, confirmPassword);
      setSuccess('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      const apiErrors  = error.response?.data?.errors;
      const apiMessage = error.response?.data?.message;
      if (apiErrors) {
        setErrors({
          current_password: apiErrors.current_password?.[0] || '',
          new_password:     apiErrors.new_password?.[0]     || '',
          confirm_password: '',
          general:          '',
        });
      } else {
        setErrors({ current_password: '', new_password: '', confirm_password: '', general: apiMessage || 'Failed to change password.' });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      '⚠️ Delete Account',
      'This will permanently delete your account and all your posts. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete My Account',
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            try { await deleteAccount(); }
            catch { Alert.alert('Error', 'Failed to delete account.'); setDeleting(false); }
          },
        },
      ]
    );
  };

  const s = makeStyles(colors);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={s.container}>

        {/* Header */}
        <View style={s.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={s.backButton}>Back</Text>
          </TouchableOpacity>
          <Text style={s.headerTitle}>Security</Text>
          <View style={{ width: 50 }} />
        </View>

        <ScrollView contentContainerStyle={s.content}>

          {/* Success */}
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

          <Text style={s.sectionTitle}>Change Password</Text>
          <View style={s.form}>

            <Text style={s.label}>Current Password</Text>
            <TextInput
              style={[s.input, errors.current_password ? s.inputError : null]}
              value={currentPassword}
              onChangeText={(val) => { setCurrentPassword(val); clearError('current_password'); setSuccess(''); }}
              placeholder="Enter current password"
              placeholderTextColor={colors.placeholder}
              secureTextEntry
            />
            {errors.current_password ? <Text style={s.fieldError}>⚠️  {errors.current_password}</Text> : null}

            <Text style={s.label}>New Password</Text>
            <TextInput
              style={[s.input, errors.new_password ? s.inputError : null]}
              value={newPassword}
              onChangeText={(val) => { setNewPassword(val); clearError('new_password'); setSuccess(''); }}
              placeholder="Minimum 8 characters"
              placeholderTextColor={colors.placeholder}
              secureTextEntry
            />
            {errors.new_password ? <Text style={s.fieldError}>⚠️  {errors.new_password}</Text> : null}

            <Text style={s.label}>Confirm New Password</Text>
            <TextInput
              style={[s.input, errors.confirm_password ? s.inputError : null]}
              value={confirmPassword}
              onChangeText={(val) => { setConfirmPassword(val); clearError('confirm_password'); setSuccess(''); }}
              placeholder="Re-enter new password"
              placeholderTextColor={colors.placeholder}
              secureTextEntry
            />
            {errors.confirm_password ? <Text style={s.fieldError}>⚠️  {errors.confirm_password}</Text> : null}

          </View>

          {/* Update Button */}
          <TouchableOpacity
            style={[s.button, loading && s.buttonDisabled]}
            onPress={handleChangePassword}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={s.buttonText}>Update Password</Text>
            }
          </TouchableOpacity>

          {/* Danger Zone */}
          <Text style={[s.sectionTitle, { marginTop: 32 }]}>Danger Zone</Text>
          <View style={s.dangerCard}>
            <Text style={s.dangerTitle}>Delete Account</Text>
            <Text style={s.dangerSubtitle}>
              Permanently delete your account and all your posts. This cannot be undone.
            </Text>
            <TouchableOpacity
              style={[s.deleteButton, deleting && s.buttonDisabled]}
              onPress={handleDeleteAccount}
              disabled={deleting}
            >
              {deleting
                ? <ActivityIndicator color="#fff" />
                : <Text style={s.deleteText}>🗑️  Delete My Account</Text>
              }
            </TouchableOpacity>
          </View>

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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  backButton: {
    fontSize: 16,
    color: colors.purple,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
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
    backgroundColor: colors.purple,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 8,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  dangerCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.errorBorder,
    shadowColor: colors.danger,
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  dangerTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: colors.error,
    marginBottom: 8,
  },
  dangerSubtitle: {
    fontSize: 13,
    color: colors.subtext,
    lineHeight: 20,
    marginBottom: 16,
  },
  deleteButton: {
    backgroundColor: colors.danger,
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
  },
  deleteText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },
});