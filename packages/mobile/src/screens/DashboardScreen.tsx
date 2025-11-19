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
  Dimensions,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { promptService, projectService } from '@promptzy/shared';
import Icon from 'react-native-vector-icons/Ionicons';

const { width, height } = Dimensions.get('window');
const isSmallScreen = width < 380;

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
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>My Prompts</Text>
          <Text style={styles.headerSubtitle}>
            {filteredPrompts.length} {filteredPrompts.length === 1 ? 'prompt' : 'prompts'}
          </Text>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Icon name="search" size={isSmallScreen ? 18 : 20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search prompts..."
          placeholderTextColor="#9ca3af"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Icon name="close-circle" size={20} color="#9ca3af" />
          </TouchableOpacity>
        )}
      </View>

      {/* Prompts List */}
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
            activeOpacity={0.7}
          >
            <View style={styles.promptHeader}>
              <Text style={styles.promptTitle} numberOfLines={2}>
                {item.title}
              </Text>
              {item.favorite && (
                <Icon name="star" size={isSmallScreen ? 16 : 18} color="#f59e0b" />
              )}
            </View>
            <Text style={styles.promptContent} numberOfLines={isSmallScreen ? 2 : 3}>
              {item.content}
            </Text>
            <View style={styles.promptFooter}>
              <View style={styles.promptStats}>
                <Icon name="text-outline" size={12} color="#9ca3af" />
                <Text style={styles.promptMeta}>{item.word_count}w</Text>
              </View>
              <Text style={styles.promptMeta}>
                {new Date(item.updated_at).toLocaleDateString()}
              </Text>
            </View>
            {item.tags && item.tags.length > 0 && (
              <View style={styles.tagsContainer}>
                {item.tags.slice(0, 2).map((tag: string, index: number) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            )}
          </TouchableOpacity>
        )}
        contentContainerStyle={filteredPrompts.length === 0 ? styles.emptyListContainer : styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
              <Icon name="document-text-outline" size={isSmallScreen ? 56 : 72} color="#d1d5db" />
            </View>
            <Text style={styles.emptyText}>No prompts yet</Text>
            <Text style={styles.emptySubtext}>
              Tap the + button below to create your first prompt
            </Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={openNewPromptModal}
              activeOpacity={0.8}
            >
              <Icon name="add" size={20} color="#fff" style={{ marginRight: 8 }} />
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

      {/* New Prompt Modal - Improved */}
      <Modal
        visible={showNewPromptModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowNewPromptModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setShowNewPromptModal(false)}
          />
          <View style={[styles.modalContent, { maxHeight: height * 0.9 }]}>
            <View style={styles.modalHandle} />
            
            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Create New Prompt</Text>
                <TouchableOpacity
                  onPress={() => setShowNewPromptModal(false)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Icon name="close" size={24} color="#6b7280" />
                </TouchableOpacity>
              </View>

              {/* Project selector */}
              {projects.length > 0 && (
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Project (optional)</Text>
                  <TouchableOpacity
                    style={styles.picker}
                    onPress={() => {
                      Alert.alert(
                        'Select Project',
                        'Choose a project for this prompt',
                        [
                          {
                            text: 'No Project (Inbox)',
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
                    activeOpacity={0.7}
                  >
                    <Text style={styles.pickerText} numberOfLines={1}>
                      {selectedProjectId
                        ? projects.find((p) => p.id === selectedProjectId)?.name || 'No Project'
                        : 'No Project (Inbox)'}
                    </Text>
                    <Icon name="chevron-down" size={20} color="#6b7280" />
                  </TouchableOpacity>
                </View>
              )}

              <View style={styles.formGroup}>
                <Text style={styles.label}>Title *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., Blog Post Writer"
                  placeholderTextColor="#9ca3af"
                  value={newPromptTitle}
                  onChangeText={setNewPromptTitle}
                  autoFocus
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Content</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Write your prompt in markdown...

Use **bold**, *italic*, `code`
Template variables: {{variable_name}}"
                  placeholderTextColor="#9ca3af"
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
                  activeOpacity={0.7}
                >
                  <Text style={styles.modalButtonCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.modalButtonCreate,
                    !newPromptTitle.trim() && styles.modalButtonDisabled,
                  ]}
                  onPress={createPrompt}
                  disabled={!newPromptTitle.trim()}
                  activeOpacity={0.8}
                >
                  <Text style={styles.modalButtonCreateText}>Create</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
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
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: isSmallScreen ? 22 : 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 2,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 14,
    paddingVertical: isSmallScreen ? 10 : 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: isSmallScreen ? 15 : 16,
    color: '#1f2937',
  },
  listContainer: {
    paddingBottom: 100,
  },
  emptyListContainer: {
    flexGrow: 1,
  },
  promptCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 12,
    padding: isSmallScreen ? 14 : 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  promptHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  promptTitle: {
    flex: 1,
    fontSize: isSmallScreen ? 16 : 18,
    fontWeight: '600',
    color: '#1f2937',
    marginRight: 8,
    lineHeight: isSmallScreen ? 22 : 24,
  },
  promptContent: {
    fontSize: isSmallScreen ? 13 : 14,
    color: '#6b7280',
    marginBottom: 12,
    lineHeight: isSmallScreen ? 18 : 20,
  },
  promptFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  promptStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  promptMeta: {
    fontSize: isSmallScreen ? 11 : 12,
    color: '#9ca3af',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  tag: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 11,
    color: '#3b82f6',
    fontWeight: '500',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 64,
  },
  emptyIconContainer: {
    width: isSmallScreen ? 100 : 120,
    height: isSmallScreen ? 100 : 120,
    borderRadius: 60,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyText: {
    fontSize: isSmallScreen ? 20 : 22,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: isSmallScreen ? 13 : 14,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3b82f6',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  emptyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  fab: {
    position: 'absolute',
    bottom: isSmallScreen ? 20 : 24,
    right: isSmallScreen ? 20 : 24,
    width: isSmallScreen ? 54 : 60,
    height: isSmallScreen ? 54 : 60,
    borderRadius: isSmallScreen ? 27 : 30,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: isSmallScreen ? 20 : 24,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 34 : 24,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#d1d5db',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: isSmallScreen ? 20 : 22,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  picker: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
  },
  pickerText: {
    flex: 1,
    fontSize: isSmallScreen ? 15 : 16,
    color: '#374151',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: isSmallScreen ? 15 : 16,
    backgroundColor: '#fff',
    color: '#1f2937',
  },
  textArea: {
    height: isSmallScreen ? 120 : 150,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: isSmallScreen ? 13 : 14,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  modalButtonCancel: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center',
  },
  modalButtonCancelText: {
    color: '#6b7280',
    fontSize: 16,
    fontWeight: '600',
  },
  modalButtonCreate: {
    flex: 1,
    backgroundColor: '#3b82f6',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  modalButtonDisabled: {
    backgroundColor: '#93c5fd',
    opacity: 0.6,
    elevation: 0,
  },
  modalButtonCreateText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
