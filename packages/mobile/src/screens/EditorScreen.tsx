// packages/mobile/src/screens/EditorScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { promptService, markdownUtils } from '@promptzy/shared';
import Icon from 'react-native-vector-icons/Ionicons';
import Markdown from 'react-native-markdown-display';
import Share from 'react-native-share';

export default function EditorScreen({ route, navigation }: any) {
  const { promptId } = route.params;
  const [prompt, setPrompt] = useState<any>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [stats, setStats] = useState<any>({});
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    loadPrompt();
  }, [promptId]);

  useEffect(() => {
    if (content) {
      const newStats = markdownUtils.getStats(content);
      setStats(newStats);
    }
  }, [content]);

  useEffect(() => {
    if (prompt) {
      setHasChanges(title !== prompt.title || content !== prompt.content);
    }
  }, [title, content, prompt]);

  const loadPrompt = async () => {
    try {
      const data = await promptService.getById(promptId);
      setPrompt(data);
      setTitle(data.title);
      setContent(data.content);
    } catch (error) {
      console.error('Failed to load prompt:', error);
      Alert.alert('Error', 'Failed to load prompt');
    }
  };

  const handleSave = async () => {
    try {
      await promptService.update(promptId, { title, content });
      setHasChanges(false);
      Alert.alert('Success', 'Prompt saved');
      await loadPrompt();
    } catch (error) {
      console.error('Failed to save:', error);
      Alert.alert('Error', 'Failed to save prompt');
    }
  };

  const handleShare = async () => {
    try {
      await Share.open({
        message: `${title}\n\n${content}`,
        title: title,
      });
    } catch (error) {
      console.log('Share cancelled');
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Prompt',
      'Are you sure you want to delete this prompt?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await promptService.delete(promptId);
              navigation.goBack();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete prompt');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Editor</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={handleShare} style={styles.iconButton}>
            <Icon name="share-outline" size={24} color="#000" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleSave}
            disabled={!hasChanges}
            style={[styles.iconButton, !hasChanges && styles.iconButtonDisabled]}
          >
            <Icon name="save-outline" size={24} color={hasChanges ? '#3b82f6' : '#ccc'} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.toolbar}>
        <TouchableOpacity
          onPress={() => setShowPreview(!showPreview)}
          style={styles.toolbarButton}
        >
          <Icon name={showPreview ? 'code-outline' : 'eye-outline'} size={20} />
          <Text style={styles.toolbarText}>
            {showPreview ? 'Edit' : 'Preview'}
          </Text>
        </TouchableOpacity>
        <View style={styles.stats}>
          <Text style={styles.statsText}>
            {stats.words || 0}w • {stats.characters || 0}c • {stats.tokens || 0}t
          </Text>
        </View>
        <TouchableOpacity onPress={handleDelete} style={styles.toolbarButton}>
          <Icon name="trash-outline" size={20} color="#ef4444" />
        </TouchableOpacity>
      </View>

      <TextInput
        style={styles.titleInput}
        placeholder="Prompt title"
        value={title}
        onChangeText={setTitle}
      />

      <ScrollView style={styles.content}>
        {showPreview ? (
          <Markdown>{content || '*No content yet*'}</Markdown>
        ) : (
          <TextInput
            style={styles.contentInput}
            placeholder="Write your prompt in markdown..."
            value={content}
            onChangeText={setContent}
            multiline
            textAlignVertical="top"
          />
        )}
      </ScrollView>
    </View>
  );
}

// Shared styles for mobile screens
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  iconButton: {
    padding: 4,
  },
  iconButtonDisabled: {
    opacity: 0.5,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    margin: 16,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  promptCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  promptHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  promptTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  promptContent: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  promptFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  promptMeta: {
    fontSize: 12,
    color: '#9ca3af',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6b7280',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 8,
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  toolbarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  toolbarText: {
    fontSize: 14,
  },
  stats: {
    flex: 1,
    alignItems: 'center',
  },
  statsText: {
    fontSize: 12,
    color: '#6b7280',
  },
  titleInput: {
    fontSize: 20,
    fontWeight: '600',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  contentInput: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: 'monospace',
  },
  logo: {
    fontSize: 36,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 32,
  },
  form: {
    width: '100%',
  },
  input: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 16,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#3b82f6',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  link: {
    color: '#3b82f6',
    textAlign: 'center',
    fontSize: 14,
  },
});