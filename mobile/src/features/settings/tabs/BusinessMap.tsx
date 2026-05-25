import React from 'react';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { StyleSheet } from 'react-native';

export const BusinessMap = ({ mapRegion, setAddressForm, hasCoordinates, mapCenter }: any) => {
  return (
    <MapView
      provider={PROVIDER_GOOGLE}
      style={styles.map}
      region={mapRegion}
      onPress={(e) => {
        const { latitude, longitude } = e.nativeEvent.coordinate;
        setAddressForm((prev: any) => ({
          ...prev,
          latitude: latitude.toFixed(6),
          longitude: longitude.toFixed(6),
        }));
      }}
    >
      {hasCoordinates && (
        <Marker coordinate={{ latitude: mapCenter.lat, longitude: mapCenter.lng }} />
      )}
    </MapView>
  );
};

const styles = StyleSheet.create({
  map: {
    flex: 1,
  },
});
