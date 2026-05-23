// settings/tabs/ProfileTab.tsx
import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
  StyleSheet,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';

// ---------- Types (same as web) ----------
type ProfileForm = {
  full_name: string;
  email: string;
  phone: string;
  altPhone: string;
  business_name: string;
  businessType: string;
  tin_number: string;
  vatRegistered: boolean;
  bio: string;
  avatar: string;
};

type ProfileTabProps = {
  isEditing: boolean;
  setIsEditing: React.Dispatch<React.SetStateAction<boolean>>;
  profileForm: ProfileForm;
  setProfileForm: React.Dispatch<React.SetStateAction<ProfileForm>>;
  saveMessage: string | null;
  handleProfileSave: () => Promise<void> | void;
  isLoading: boolean;
  onAvatarUpload: (file: any) => Promise<void> | void;
  avatarUploading: boolean;
  // For displaying user role and verification status (optional)
  role?: string;
  isVerified?: boolean;
};

// Helper: get initials from full name
const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

// Helper: convert image picker result to a File-like object
const convertToFile = async (result: ImagePicker.ImagePickerResult) => {
  if (result.canceled) return null;
  const asset = result.assets[0];
  const response = await fetch(asset.uri);
  const blob = await response.blob();
  const file = new File([blob], asset.fileName || 'avatar.jpg', {
    type: asset.mimeType || 'image/jpeg',
  });
  return file;
};

const ProfileTab: React.FC<ProfileTabProps> = ({
  isEditing,
  setIsEditing,
  profileForm,
  setProfileForm,
  saveMessage,
  handleProfileSave,
  isLoading,
  onAvatarUpload,
  avatarUploading,
  role = 'retailer',
  isVerified = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Handle avatar upload using expo-image-picker
  const handleAvatarPress = async () => {
    if (!isEditing) return;

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow access to your photos to upload an avatar.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
      base64: false,
    });

    if (!result.canceled) {
      const file = await convertToFile(result);
      if (file) {
        await onAvatarUpload(file);
      }
    }
  };

  // Role label mapping
  const roleLabel = {
    admin: 'Admin account',
    retailer: 'Retailer account',
    supplier: 'Supplier account',
    driver: 'Driver account',
  }[role] || 'User account';

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Hero Card */}
      <View style={styles.heroCard}>
        <View style={styles.avatarContainer}>
          {profileForm.avatar ? (
            <Image source={{ uri: profileForm.avatar }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatarFallback}>
              <Text style={styles.avatarFallbackText}>
                {getInitials(profileForm.full_name || 'User')}
              </Text>
            </View>
          )}
        </View>
        <View style={styles.heroBody}>
          <Text style={styles.heroTitle}>{profileForm.full_name || 'User'}</Text>
          <Text style={styles.heroSubtitle}>{roleLabel}</Text>
          <View style={styles.heroBadgeRow}>
            <View style={[styles.badge, isVerified ? styles.badgeSuccess : styles.badgeMuted]}>
              <Ionicons
                name={isVerified ? 'shield-checkmark-outline' : 'shield-outline'}
                size={14}
                color={isVerified ? '#166534' : '#475569'}
              />
              <Text style={[styles.badgeText, isVerified ? styles.badgeTextSuccess : styles.badgeTextMuted]}>
                {isVerified ? 'Verified' : 'Pending verification'}
              </Text>
            </View>
          </View>
        </View>
        <TouchableOpacity
          style={[styles.editButton, isEditing && styles.editButtonActive]}
          onPress={() => setIsEditing(!isEditing)}
        >
          <Text style={[styles.editButtonText, isEditing && styles.editButtonTextActive]}>
            {isEditing ? 'Cancel' : 'Edit'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Avatar upload section (only when editing) */}
      {isEditing && (
        <View style={styles.avatarUploadSection}>
          <TouchableOpacity
            style={styles.uploadButton}
            onPress={handleAvatarPress}
            disabled={avatarUploading}
          >
            <Ionicons name="camera" size={16} color="#374151" />
            <Text style={styles.uploadButtonText}>
              {avatarUploading ? 'Uploading...' : 'Change Photo'}
            </Text>
          </TouchableOpacity>
          <Text style={styles.uploadHint}>JPG, PNG or WEBP. Max 10MB.</Text>
        </View>
      )}

      {/* Main Card - Account Details */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Account details</Text>
        <Text style={styles.sectionSubtitle}>
          Update the details other teams and support staff use to identify you.
        </Text>

        {/* Full Name */}
        <View style={styles.fieldBlock}>
          <Text style={styles.fieldLabel}>Full Name</Text>
          <TextInput
            style={[styles.input, !isEditing && styles.inputDisabled]}
            value={profileForm.full_name}
            onChangeText={(text) => setProfileForm(prev => ({ ...prev, full_name: text }))}
            editable={isEditing}
            placeholder="Full Name"
          />
        </View>

        {/* Email (non-editable) */}
        <View style={styles.fieldBlock}>
          <Text style={styles.fieldLabel}>Email Address</Text>
          <TextInput
            style={[styles.input, styles.inputDisabled]}
            value={profileForm.email}
            editable={false}
          />
        </View>

        {/* Primary Phone */}
        <View style={styles.fieldBlock}>
          <Text style={styles.fieldLabel}>Primary Phone</Text>
          <TextInput
            style={[styles.input, !isEditing && styles.inputDisabled]}
            value={profileForm.phone}
            onChangeText={(text) => setProfileForm(prev => ({ ...prev, phone: text }))}
            editable={isEditing}
            keyboardType="phone-pad"
            placeholder="Phone number"
          />
        </View>

        {/* Alternate Phone */}
        <View style={styles.fieldBlock}>
          <Text style={styles.fieldLabel}>Alternate Phone</Text>
          <TextInput
            style={[styles.input, !isEditing && styles.inputDisabled]}
            value={profileForm.altPhone}
            onChangeText={(text) => setProfileForm(prev => ({ ...prev, altPhone: text }))}
            editable={isEditing}
            keyboardType="phone-pad"
            placeholder="Alternate phone number"
          />
        </View>

        {/* Bio */}
        <View style={styles.fieldBlock}>
          <Text style={styles.fieldLabel}>Bio</Text>
          <TextInput
            style={[styles.textArea, !isEditing && styles.inputDisabled]}
            value={profileForm.bio}
            onChangeText={(text) => setProfileForm(prev => ({ ...prev, bio: text }))}
            editable={isEditing}
            multiline
            numberOfLines={4}
            placeholder="Tell us about yourself"
          />
        </View>

        {saveMessage && <Text style={styles.successText}>{saveMessage}</Text>}

        {isEditing && (
          <TouchableOpacity
            style={[styles.primaryButton, isLoading && styles.primaryButtonDisabled]}
            onPress={() => handleProfileSave()}
            disabled={isLoading}
          >
            <Text style={styles.primaryButtonText}>
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Danger Zone */}
      <View style={styles.dangerZone}>
        <Text style={styles.dangerZoneTitle}>Danger Zone</Text>
        <View style={styles.dangerZoneCard}>
          <View>
            <Text style={styles.dangerZoneHeading}>Delete Account</Text>
            <Text style={styles.dangerZoneDescription}>
              Permanently delete your account and all associated data
            </Text>
          </View>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => {
              Alert.alert(
                'Delete Account',
                'Are you absolutely sure? This action cannot be undone and will permanently delete your account and all associated data.',
                [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Yes, delete my account', style: 'destructive', onPress: () => {} }
                ]
              );
            }}
          >
            <Ionicons name="trash-bin-outline" size={16} color="white" />
            <Text style={styles.deleteButtonText}>Delete Account</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

// ---------- Styles (matching new design system) ----------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  heroCard: {
    backgroundColor: '#0f172a', // Dark slate, matching old profile
    borderRadius: 24,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 12,
  },
  avatarContainer: {
    width: 64,
    height: 64,
    borderRadius: 22,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarFallback: {
    width: 64,
    height: 64,
    borderRadius: 22,
    backgroundColor: '#dbeafe',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarFallbackText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1d4ed8',
  },
  heroBody: {
    flex: 1,
    gap: 6,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#f8fafc',
  },
  heroSubtitle: {
    fontSize: 13,
    color: '#cbd5e1',
  },
  heroBadgeRow: {
    flexDirection: 'row',
  },
  badge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  badgeSuccess: {
    backgroundColor: '#dcfce7',
  },
  badgeMuted: {
    backgroundColor: '#e2e8f0',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  badgeTextSuccess: {
    color: '#166534',
  },
  badgeTextMuted: {
    color: '#475569',
  },
  editButton: {
    minWidth: 72,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    paddingHorizontal: 14,
    paddingVertical: 10,
    alignItems: 'center',
  },
  editButtonActive: {
    backgroundColor: '#dbeafe',
  },
  editButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0f172a',
  },
  editButtonTextActive: {
    color: '#1d4ed8',
  },
  avatarUploadSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginBottom: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
  },
  uploadButtonText: {
    fontSize: 14,
    color: '#1e293b',
    fontWeight: '500',
  },
  uploadHint: {
    fontSize: 11,
    color: '#64748b',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 16,
    gap: 14,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#64748b',
    lineHeight: 20,
  },
  fieldBlock: {
    gap: 8,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
  },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 15,
    color: '#0f172a',
    backgroundColor: '#ffffff',
  },
  inputDisabled: {
    backgroundColor: '#f8fafc',
    color: '#64748b',
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 15,
    color: '#0f172a',
    backgroundColor: '#ffffff',
    textAlignVertical: 'top',
    minHeight: 100,
  },
  successText: {
    fontSize: 13,
    color: '#166534',
    fontWeight: '600',
  },
  primaryButton: {
    marginTop: 4,
    borderRadius: 16,
    backgroundColor: '#1d4ed8',
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryButtonDisabled: {
    backgroundColor: '#93c5fd',
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#ffffff',
  },
  dangerZone: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  dangerZoneTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#dc2626',
    marginBottom: 8,
  },
  dangerZoneCard: {
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 12,
    padding: 16,
    backgroundColor: '#ffffff',
  },
  dangerZoneHeading: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  dangerZoneDescription: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dc2626',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 12,
    gap: 8,
  },
  deleteButtonText: {
    fontSize: 14,
    color: '#ffffff',
  },
});

export default ProfileTab;