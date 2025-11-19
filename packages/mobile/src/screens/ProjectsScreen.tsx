import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Alert,
  TextInput,
  Modal,
  SafeAreaView,
  Platform,
} from 'react-native';
import { projectService } from '@promptzy/shared';
import Icon from 'react-native-vector-icons/Ionicons';

export default function ProjectsScreen({ navigation }: any) {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const data = await projectService.getAll();
      setProjects(data);
    } catch (error) {
      console.error('Failed to load projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const createProject = async () => {
    if (!newProjectName.trim()) {
      Alert.alert('Error', 'Please enter a project name');
      return;
    }

    try {
      await projectService.create({
        name: newProjectName,
        color: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
      });
      setNewProjectName('');
      setShowModal(false);
      await loadProjects();
    } catch (error) {
      Alert.alert('Error', 'Failed to create project');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Projects</Text>
          <TouchableOpacity onPress={() => setShowModal(true)} style={styles.addButton}>
            <Icon name="add" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <FlatList
          data={projects}
          keyExtractor={(item: any) => item.id}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={loadProjects} />
          }
          contentContainerStyle={styles.listContent}
          renderItem={({ item }: any) => (
            <TouchableOpacity style={styles.projectCard}>
              <View
                style={[styles.colorDot, { backgroundColor: item.color }]}
              />
              <View style={styles.projectInfo}>
                <Text style={styles.projectName}>{item.name}</Text>
                <Text style={styles.projectMeta}>
                  Created {new Date(item.created_at).toLocaleDateString()}
                </Text>
              </View>
              <Icon name="chevron-forward" size={20} color="#9ca3af" />
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Icon name="folder-outline" size={64} color="#d1d5db" />
              <Text style={styles.emptyText}>No projects yet</Text>
              <TouchableOpacity
                style={styles.createButton}
                onPress={() => setShowModal(true)}
              >
                <Text style={styles.createButtonText}>Create Project</Text>
              </TouchableOpacity>
            </View>
          }
        />

        <Modal
          visible={showModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Create New Project</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Project name"
                placeholderTextColor="#9ca3af"
                value={newProjectName}
                onChangeText={setNewProjectName}
                autoFocus
              />
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.modalButtonCancel}
                  onPress={() => setShowModal(false)}
                >
                  <Text style={styles.modalButtonCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalButtonCreate}
                  onPress={createProject}
                >
                  <Text style={styles.modalButtonCreateText}>Create</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

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
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  addButton: {
    backgroundColor: '#3b82f6',
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  listContent: {
    padding: 16,
  },
  projectCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f3f4f6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 16,
  },
  projectInfo: {
    flex: 1,
  },
  projectName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  projectMeta: {
    fontSize: 12,
    color: '#6b7280',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 24,
  },
  createButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 20,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 24,
    color: '#111827',
    backgroundColor: '#f9fafb',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  modalButtonCancel: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  modalButtonCancelText: {
    color: '#6b7280',
    fontSize: 16,
    fontWeight: '500',
  },
  modalButtonCreate: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  modalButtonCreateText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});