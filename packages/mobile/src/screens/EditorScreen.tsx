import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
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
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Icon name="arrow-back" size={24} color="#1f2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Editor</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={handleShare} style={styles.iconButton}>
              <Icon name="share-outline" size={24} color="#1f2937" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSave}
              disabled={!hasChanges}
              style={[styles.iconButton, !hasChanges && styles.iconButtonDisabled]}
            >
              <Icon name="save-outline" size={24} color={hasChanges ? '#3b82f6' : '#9ca3af'} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.toolbar}>
          <TouchableOpacity
            onPress={() => setShowPreview(!showPreview)}
            style={styles.toolbarButton}
          >
            <Icon name={showPreview ? 'create-outline' : 'eye-outline'} size={20} color="#4b5563" />
            <Text style={styles.toolbarText}>
              {showPreview ? 'Edit' : 'Preview'}
            </Text>
          </TouchableOpacity>
          <View style={styles.stats}>
            <Text style={styles.statsText}>
              {stats.words || 0}w • {stats.characters || 0}c
            </Text>
          </View>
          <TouchableOpacity onPress={handleDelete} style={styles.toolbarButton}>
            <Icon name="trash-outline" size={20} color="#ef4444" />
          </TouchableOpacity>
        </View>

        <View style={styles.editorContainer}>
          <TextInput
            style={styles.titleInput}
            placeholder="Prompt title"
            placeholderTextColor="#9ca3af"
            value={title}
            onChangeText={setTitle}
          />

          <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
            {showPreview ? (
              <View style={styles.previewContainer}>
                <Markdown style={markdownStyles}>{content || '*No content yet*'}</Markdown>
              </View>
            ) : (
              <TextInput
                style={styles.contentInput}
                placeholder="Write your prompt in markdown..."
                placeholderTextColor="#9ca3af"
                value={content}
                onChangeText={setContent}
                multiline
                textAlignVertical="top"
              />
            )}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const markdownStyles = {
  body: {
    color: '#1f2937',
    fontSize: 16,
    lineHeight: 24,
  },
  heading1: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 10,
    marginTop: 20,
  },
  heading2: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
    marginTop: 16,
  },
  code_block: {
    backgroundColor: '#f3f4f6',
    padding: 10,
    borderRadius: 8,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 14,
  },
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
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
    borderBottomColor: '#f3f4f6',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 16,
  },
  iconButton: {
    padding: 4,
  },
  iconButtonDisabled: {
    opacity: 0.5,
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  toolbarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 4,
  },
  toolbarText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4b5563',
  },
  stats: {
    flex: 1,
    alignItems: 'center',
  },
  statsText: {
    fontSize: 12,
    color: '#9ca3af',
    fontWeight: '500',
  },
  editorContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  titleInput: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  contentInput: {
    fontSize: 16,
    lineHeight: 24,
    color: '#374151',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    minHeight: 200,
  },
  previewContainer: {
    flex: 1,
  },
});