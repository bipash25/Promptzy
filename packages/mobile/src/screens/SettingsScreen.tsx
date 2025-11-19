import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  SafeAreaView,
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
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Settings</Text>
        </View>

        <ScrollView style={styles.content}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account</Text>
            <TouchableOpacity style={styles.settingItem}>
              <View style={[styles.iconContainer, { backgroundColor: '#eff6ff' }]}>
                <Icon name="person-outline" size={20} color="#3b82f6" />
              </View>
              <Text style={styles.settingText}>Profile</Text>
              <Icon name="chevron-forward" size={20} color="#9ca3af" />
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Preferences</Text>
            <TouchableOpacity style={styles.settingItem}>
              <View style={[styles.iconContainer, { backgroundColor: '#f3e8ff' }]}>
                <Icon name="moon-outline" size={20} color="#8b5cf6" />
              </View>
              <Text style={styles.settingText}>Dark Mode</Text>
              <Icon name="chevron-forward" size={20} color="#9ca3af" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.settingItem}>
              <View style={[styles.iconContainer, { backgroundColor: '#ecfdf5' }]}>
                <Icon name="text-outline" size={20} color="#10b981" />
              </View>
              <Text style={styles.settingText}>Font Settings</Text>
              <Icon name="chevron-forward" size={20} color="#9ca3af" />
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Data</Text>
            <TouchableOpacity style={styles.settingItem}>
              <View style={[styles.iconContainer, { backgroundColor: '#fff7ed' }]}>
                <Icon name="cloud-upload-outline" size={20} color="#f97316" />
              </View>
              <Text style={styles.settingText}>Backup</Text>
              <Icon name="chevron-forward" size={20} color="#9ca3af" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.settingItem}>
              <View style={[styles.iconContainer, { backgroundColor: '#f0f9ff' }]}>
                <Icon name="download-outline" size={20} color="#0ea5e9" />
              </View>
              <Text style={styles.settingText}>Export Data</Text>
              <Icon name="chevron-forward" size={20} color="#9ca3af" />
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <TouchableOpacity
              style={[styles.settingItem, styles.dangerItem]}
              onPress={handleSignOut}
            >
              <View style={[styles.iconContainer, { backgroundColor: '#fef2f2' }]}>
                <Icon name="log-out-outline" size={20} color="#ef4444" />
              </View>
              <Text style={[styles.settingText, styles.dangerText]}>Sign Out</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.version}>Version 1.0.0</Text>
        </ScrollView>
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
  content: {
    flex: 1,
  },
  section: {
    marginTop: 24,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#f3f4f6',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f9fafb',
    letterSpacing: 0.5,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingText: {
    flex: 1,
    fontSize: 16,
    color: '#1f2937',
    fontWeight: '500',
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
    fontSize: 13,
    marginTop: 32,
    marginBottom: 64,
  },
});