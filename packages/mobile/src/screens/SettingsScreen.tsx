import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import { authService } from '@promptzy/shared';
import Icon from 'react-native-vector-icons/Ionicons';

export default function SettingsScreen({ navigation }: any) {
  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await authService.signOut();
              navigation.replace('Login');
            } catch (error) {
              Alert.alert('Error', 'Failed to sign out');
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <TouchableOpacity style={styles.settingItem}>
          <Icon name="person-outline" size={24} color="#3b82f6" />
          <Text style={styles.settingText}>Profile</Text>
          <Icon name="chevron-forward" size={20} color="#9ca3af" />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferences</Text>
        <TouchableOpacity style={styles.settingItem}>
          <Icon name="moon-outline" size={24} color="#3b82f6" />
          <Text style={styles.settingText}>Dark Mode</Text>
          <Icon name="chevron-forward" size={20} color="#9ca3af" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.settingItem}>
          <Icon name="text-outline" size={24} color="#3b82f6" />
          <Text style={styles.settingText}>Font Settings</Text>
          <Icon name="chevron-forward" size={20} color="#9ca3af" />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data</Text>
        <TouchableOpacity style={styles.settingItem}>
          <Icon name="cloud-upload-outline" size={24} color="#3b82f6" />
          <Text style={styles.settingText}>Backup</Text>
          <Icon name="chevron-forward" size={20} color="#9ca3af" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.settingItem}>
          <Icon name="download-outline" size={24} color="#3b82f6" />
          <Text style={styles.settingText}>Export Data</Text>
          <Icon name="chevron-forward" size={20} color="#9ca3af" />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <TouchableOpacity
          style={[styles.settingItem, styles.dangerItem]}
          onPress={handleSignOut}
        >
          <Icon name="log-out-outline" size={24} color="#ef4444" />
          <Text style={[styles.settingText, styles.dangerText]}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.version}>Version 1.0.0</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  section: {
    marginTop: 24,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e5e7eb',
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9ca3af',
    textTransform: 'uppercase',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f9fafb',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  settingText: {
    flex: 1,
    fontSize: 16,
    marginLeft: 12,
  },
  dangerItem: {
    borderBottomWidth: 0,
  },
  dangerText: {
    color: '#ef4444',
  },
  version: {
    textAlign: 'center',
    color: '#9ca3af',
    fontSize: 12,
    marginTop: 32,
    marginBottom: 64,
  },
});