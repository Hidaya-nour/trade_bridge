import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const BusinessMap = ({ mapRegion, setAddressForm, hasCoordinates, mapCenter }: any) => {
  return (
    <View style={styles.mapPlaceholder}>
      <Text style={styles.mapPlaceholderText}>
        Map view is not available on web. Use a native device to select a location.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  mapPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    padding: 12,
  },
  mapPlaceholderText: {
    fontSize: 13,
    color: '#6b7280',
    textAlign: 'center',
  },
});
