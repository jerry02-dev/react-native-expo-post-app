import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput,
  TouchableOpacity, ActivityIndicator,
  ScrollView, KeyboardAvoidingView,
  Platform, Alert
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import postApi      from '../../api/postApi';

export default function EditPostScreen({ navigation, route }) {
  const { post }              = route.params;
  const { colors }            = useTheme();
  const [title, setTitle]     = useState(post.title);
  const [body, setBody]       = useState(post.body);
  const [status, setStatus]   = useState(post.status);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors]   = useState({ title: '', body: '', general: '' });

  const clearError = (field) => setErrors(prev => ({ ...prev, [field]: '' }));

  const hasChanges =
    title  !== post.title  ||
    body   !== post.body   ||
    status !== post.status;

  const handleUpdate = async () => {
    setErrors({ title: '', body: '', general: '' });
    const newErrors = { title: '', body: '', general: '' };
    let hasError = false;

    if (!title.trim()) { newErrors.title = 'Title is required.'; hasError = true; }
    if (!body.trim())  { newErrors.body  = 'Body is required.';  hasError = true; }
    if (hasError) { setErrors(newErrors); return; }

    setLoading(true);
    try {
      await postApi.update(post.id, { title, body, status });
      navigation.goBack();
    } catch (error) {
      const apiErrors  = error.response?.data?.errors;
      const apiMessage = error.response?.data?.message;
      if (apiErrors) {
        setErrors({
          title:   apiErrors.title?.[0] || '',
          body:    apiErrors.body?.[0]  || '',
          general: '',
        });
      } else {
        setErrors({ title: '', body: '', general: apiMessage || 'Failed to update post.' });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (hasChanges) {
      Alert.alert(
        'Discard Changes?',
        'You have unsaved changes. Are you sure you want to go back?',
        [
          { text: 'Keep Editing', style: 'cancel' },
          { text: 'Discard', style: 'destructive', onPress: () => navigation.goBack() },
        ]
      );
    } else {
      navigation.goBack();
    }
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
          <TouchableOpacity onPress={handleBack}>
            <Text style={s.backButton}>Back</Text>
          </TouchableOpacity>
          <Text style={s.headerTitle}>Edit Post</Text>
          <View style={{ width: 50 }} />
        </View>

        <ScrollView contentContainerStyle={s.content}>

          {/* General Error */}
          {errors.general ? (
            <View style={s.errorBanner}>
              <Text style={s.errorBannerText}>⚠️  {errors.general}</Text>
            </View>
          ) : null}

          {/* Title */}
          <Text style={s.label}>Title</Text>
          <TextInput
            style={[s.input, errors.title ? s.inputError : null]}
            placeholder="Enter post title"
            value={title}
            onChangeText={(val) => { setTitle(val); clearError('title'); }}
            placeholderTextColor={colors.placeholder}
            maxLength={255}
          />
          <View style={s.titleFooter}>
            {errors.title
              ? <Text style={s.fieldError}>⚠️  {errors.title}</Text>
              : <View />
            }
            <Text style={s.charCount}>{title.length}/255</Text>
          </View>

          {/* Body */}
          <Text style={s.label}>Body</Text>
          <TextInput
            style={[s.input, s.textArea, errors.body ? s.inputError : null]}
            placeholder="Write your post content here..."
            value={body}
            onChangeText={(val) => { setBody(val); clearError('body'); }}
            placeholderTextColor={colors.placeholder}
            multiline
            textAlignVertical="top"
          />
          {errors.body ? <Text style={s.fieldError}>⚠️  {errors.body}</Text> : null}

          {/* Status Toggle */}
          <Text style={s.label}>Status</Text>
          <View style={s.statusRow}>
            <TouchableOpacity
              style={[s.statusBtn, status === 'draft' && s.statusBtnActiveDraft]}
              onPress={() => setStatus('draft')}
            >
              <Text style={[s.statusBtnText, status === 'draft' && s.statusBtnTextActive]}>
                ✏️  Draft
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.statusBtn, status === 'published' && s.statusBtnActivePublished]}
              onPress={() => setStatus('published')}
            >
              <Text style={[s.statusBtnText, status === 'published' && s.statusBtnTextActive]}>
                🌐  Published
              </Text>
            </TouchableOpacity>
          </View>

          {/* Unsaved Changes Indicator */}
          {hasChanges ? (
            <View style={s.changesIndicator}>
              <Text style={s.changesText}>● Unsaved changes</Text>
            </View>
          ) : null}

          {/* Update Button */}
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

          {/* Cancel */}
          <TouchableOpacity
            style={s.cancelButton}
            onPress={handleBack}
            disabled={loading}
          >
            <Text style={s.cancelText}>Cancel</Text>
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
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.subtext,
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: colors.input,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: 10,
    padding: 14,
    fontSize: 15,
    color: colors.text,
  },
  inputError: {
    borderColor: colors.error,
    backgroundColor: colors.errorBg,
  },
  textArea: {
    height: 180,
    lineHeight: 22,
  },
  titleFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  fieldError: {
    color: colors.error,
    fontSize: 13,
    marginTop: 6,
    marginBottom: 4,
  },
  charCount: {
    fontSize: 12,
    color: colors.subtext,
    textAlign: 'right',
  },
  statusRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  statusBtn: {
    flex: 1,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    alignItems: 'center',
    backgroundColor: colors.card,
  },
  statusBtnActiveDraft: {
    backgroundColor: '#fff3e0',
    borderColor: '#e65100',
  },
  statusBtnActivePublished: {
    backgroundColor: '#e6f4ea',
    borderColor: '#2e7d32',
  },
  statusBtnText: {
    fontSize: 14,
    color: colors.subtext,
    fontWeight: '600',
  },
  statusBtnTextActive: {
    color: colors.text,
  },
  changesIndicator: {
    marginTop: 16,
    padding: 10,
    backgroundColor: '#fff8e1',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#f59e0b',
  },
  changesText: {
    fontSize: 13,
    color: '#92400e',
    fontWeight: '600',
  },
  button: {
    backgroundColor: colors.purple,
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    marginTop: 12,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    backgroundColor: colors.card,
  },
  cancelText: {
    color: colors.subtext,
    fontSize: 16,
    fontWeight: '600',
  },
});