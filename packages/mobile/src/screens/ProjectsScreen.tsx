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
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Projects</Text>
        <TouchableOpacity onPress={() => setShowModal(true)}>
          <Icon name="add-circle" size={28} color="#3b82f6" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={projects}
        keyExtractor={(item: any) => item.id}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={loadProjects} />
        }
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
            <Icon name="folder-outline" size={64} color="#ccc" />
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
        animationType="slide"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create New Project</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Project name"
              value={newProjectName}
              onChangeText={setNewProjectName}
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
  projectCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  projectInfo: {
    flex: 1,
  },
  projectName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  projectMeta: {
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
    marginBottom: 24,
  },
  createButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
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
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  modalButtonCancel: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  modalButtonCancelText: {
    color: '#6b7280',
    fontSize: 16,
  },
  modalButtonCreate: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  modalButtonCreateText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});