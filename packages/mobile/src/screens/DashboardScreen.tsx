// packages/mobile/src/screens/DashboardScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { promptService, projectService } from '@promptzy/shared';
import Icon from 'react-native-vector-icons/Ionicons';

export default function DashboardScreen({ navigation }: any) {
  const [prompts, setPrompts] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewPromptModal, setShowNewPromptModal] = useState(false);
  const [newPromptTitle, setNewPromptTitle] = useState('');
  const [newPromptContent, setNewPromptContent] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [promptsData, projectsData] = await Promise.all([
        promptService.getAll(),
        projectService.getAll(),
      ]);
      setPrompts(promptsData);
      setProjects(projectsData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const createPrompt = async () => {
    if (!newPromptTitle.trim()) {
      Alert.alert('Error', 'Please enter a prompt title');
      return;
    }

    try {
      const created = await promptService.create({
        project_id: selectedProjectId,
        title: newPromptTitle,
        content: newPromptContent,
        tags: [],
      });
      
      setNewPromptTitle('');
      setNewPromptContent('');
      setSelectedProjectId(null);
      setShowNewPromptModal(false);
      await loadData();
      
      // Navigate to editor
      navigation.navigate('Editor', { promptId: created.id });
    } catch (error) {
      console.error('Failed to create prompt:', error);
      Alert.alert('Error', 'Failed to create prompt. Please try again.');
    }
  };

  const openNewPromptModal = () => {
    setNewPromptTitle('');
    setNewPromptContent('');
    setSelectedProjectId(null);
    setShowNewPromptModal(true);
  };

  const filteredPrompts = prompts.filter((p: any) =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Prompts</Text>
      </View>

      <View style={styles.searchContainer}>
        <Icon name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search prompts..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <FlatList
        data={filteredPrompts}
        keyExtractor={(item: any) => item.id}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={loadData} />
        }
        renderItem={({ item }: any) => (
          <TouchableOpacity
            style={styles.promptCard}
            onPress={() => navigation.navigate('Editor', { promptId: item.id })}
          >
            <View style={styles.promptHeader}>
              <Text style={styles.promptTitle}>{item.title}</Text>
              {item.favorite && (
                <Icon name="star" size={18} color="#f59e0b" />
              )}
            </View>
            <Text style={styles.promptContent} numberOfLines={3}>
              {item.content}
            </Text>
            <View style={styles.promptFooter}>
              <Text style={styles.promptMeta}>
                {item.word_count} words • {new Date(item.updated_at).toLocaleDateString()}
              </Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Icon name="document-text-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>No prompts yet</Text>
            <Text style={styles.emptySubtext}>Create your first prompt to get started</Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={openNewPromptModal}
            >
              <Text style={styles.emptyButtonText}>Create Prompt</Text>
            </TouchableOpacity>
          </View>
        }
      />

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={openNewPromptModal}
        activeOpacity={0.8}
      >
        <Icon name="add" size={28} color="#fff" />
      </TouchableOpacity>

      {/* New Prompt Modal */}
      <Modal
        visible={showNewPromptModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowNewPromptModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create New Prompt</Text>
              <TouchableOpacity onPress={() => setShowNewPromptModal(false)}>
                <Icon name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            {/* Project selector */}
            {projects.length > 0 && (
              <View style={styles.formGroup}>
                <Text style={styles.label}>Project (optional)</Text>
                <View style={styles.pickerContainer}>
                  <TouchableOpacity
                    style={styles.picker}
                    onPress={() => {
                      // Show project picker
                      Alert.alert(
                        'Select Project',
                        'Choose a project for this prompt',
                        [
                          {
                            text: 'No Project',
                            onPress: () => setSelectedProjectId(null),
                          },
                          ...projects.map((project) => ({
                            text: project.name,
                            onPress: () => setSelectedProjectId(project.id),
                          })),
                          { text: 'Cancel', style: 'cancel' },
                        ]
                      );
                    }}
                  >
                    <Text style={styles.pickerText}>
                      {selectedProjectId
                        ? projects.find((p) => p.id === selectedProjectId)?.name || 'No Project'
                        : 'No Project (Inbox)'}
                    </Text>
                    <Icon name="chevron-down" size={20} color="#6b7280" />
                  </TouchableOpacity>
                </View>
              </View>
            )}

            <View style={styles.formGroup}>
              <Text style={styles.label}>Title</Text>
              <TextInput
                style={styles.input}
                placeholder="Prompt title"
                value={newPromptTitle}
                onChangeText={setNewPromptTitle}
                autoFocus
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Content</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Write your prompt in markdown...&#10;&#10;Use **bold**, *italic*, `code`, and more!&#10;Template variables: {{variable_name}}"
                value={newPromptContent}
                onChangeText={setNewPromptContent}
                multiline
                textAlignVertical="top"
              />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButtonCancel}
                onPress={() => setShowNewPromptModal(false)}
              >
                <Text style={styles.modalButtonCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalButtonCreate}
                onPress={createPrompt}
              >
                <Text style={styles.modalButtonCreateText}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

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
  emptyButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 16,
  },
  emptyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    overflow: 'hidden',
  },
  picker: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#fff',
  },
  pickerText: {
    fontSize: 16,
    color: '#374151',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  textArea: {
    height: 150,
    fontFamily: 'monospace',
    fontSize: 14,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 8,
  },
  modalButtonCancel: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  modalButtonCancelText: {
    color: '#6b7280',
    fontSize: 16,
    fontWeight: '600',
  },
  modalButtonCreate: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  modalButtonCreateText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
