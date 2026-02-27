import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, ActivityIndicator, Alert
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import postApi      from '../../api/postApi';

export default function PostDetailScreen({ navigation, route }) {
  const { postId }              = route.params;
  const { colors }              = useTheme();
  const [post, setPost]         = useState(null);
  const [loading, setLoading]   = useState(true);
  const [deleting, setDeleting] = useState(false);

  const fetchPost = async () => {
    try {
      const response = await postApi.getOne(postId);
      setPost(response.data.data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load post.');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPost();
    const unsubscribe = navigation.addListener('focus', () => fetchPost());
    return unsubscribe;
  }, [navigation]);

  const handleDelete = () => {
    Alert.alert(
      'Delete Post',
      'Are you sure you want to delete this post? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            try {
              await postApi.delete(postId);
              Alert.alert('Deleted', 'Post deleted successfully.', [
                { text: 'OK', onPress: () => navigation.goBack() }
              ]);
            } catch (error) {
              Alert.alert('Error', 'Failed to delete post.');
            } finally {
              setDeleting(false);
            }
          },
        },
      ]
    );
  };

  const getStatusStyle = (status) => ({
    backgroundColor: status === 'published' ? '#e6f4ea' : '#fff3e0',
    color:           status === 'published' ? '#2e7d32' : '#e65100',
  });

  const s = makeStyles(colors);

  if (loading) {
    return (
      <View style={s.centered}>
        <ActivityIndicator size="large" color={colors.purple} />
      </View>
    );
  }

  return (
    <View style={s.container}>

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={s.backButton}>Back</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>Post Detail</Text>
        <TouchableOpacity onPress={() => navigation.navigate('EditPost', { post })}>
          <Text style={s.editButton}>Edit</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={s.content}>

        {/* Status Badge */}
        <View style={[
          s.badge,
          { backgroundColor: getStatusStyle(post.status).backgroundColor }
        ]}>
          <Text style={[s.badgeText, { color: getStatusStyle(post.status).color }]}>
            {post.status === 'published' ? '● Published' : '● Draft'}
          </Text>
        </View>

        {/* Title */}
        <Text style={s.title}>{post.title}</Text>

        {/* Meta */}
        <View style={s.meta}>
          <Text style={s.metaText}>
            Created {new Date(post.created_at).toLocaleDateString('en-US', {
              year: 'numeric', month: 'long', day: 'numeric'
            })}
          </Text>
          {post.updated_at !== post.created_at && (
            <Text style={s.metaText}>
              Updated {new Date(post.updated_at).toLocaleDateString('en-US', {
                year: 'numeric', month: 'long', day: 'numeric'
              })}
            </Text>
          )}
        </View>

        {/* Divider */}
        <View style={s.divider} />

        {/* Body */}
        <Text style={s.body}>{post.body}</Text>

      </ScrollView>

      {/* Delete Button */}
      <View style={s.footer}>
        <TouchableOpacity
          style={[s.deleteButton, deleting && s.buttonDisabled]}
          onPress={handleDelete}
          disabled={deleting}
        >
          {deleting
            ? <ActivityIndicator color="#fff" />
            : <Text style={s.deleteText}>🗑️  Delete Post</Text>
          }
        </TouchableOpacity>
      </View>

    </View>
  );
}

const makeStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  editButton: {
    fontSize: 16,
    color: colors.purple,
    fontWeight: '600',
  },
  content: {
    padding: 24,
    paddingBottom: 40,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 16,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '600',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
    lineHeight: 34,
  },
  meta: {
    marginBottom: 16,
    gap: 4,
  },
  metaText: {
    fontSize: 13,
    color: colors.subtext,
  },
  divider: {
    height: 1,
    backgroundColor: colors.divider,
    marginBottom: 20,
  },
  body: {
    fontSize: 16,
    color: colors.subtext,
    lineHeight: 26,
  },
  footer: {
    padding: 24,
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  deleteButton: {
    backgroundColor: colors.danger,
    borderRadius: 10,
    marginBottom: 16,
    padding: 16,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  deleteText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});