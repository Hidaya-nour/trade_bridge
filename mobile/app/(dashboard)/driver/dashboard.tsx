import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Switch,
  Pressable,
  ScrollView,
  Linking,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ScreenWrapper from "@/components/layout/ScreenWrapper";

export default function DriverDashboard() {
  const [isOnline, setIsOnline] = useState(false);

  // Sample data - replace with actual data
  const activeDelivery = {
    pickup: "123 Main St, Addis Ababa",
    dropoff: "456 Elm St, Addis Ababa",
    distance: "5.2 km",
    eta: "15 min",
    status: "Heading to pickup",
  };

  const newRequest = {
    pickup: "789 Oak St, Addis Ababa",
    dropoff: "101 Pine St, Addis Ababa",
    distance: "3.8 km",
    eta: "10 min",
  };

  const earnings = 250.0;
  const deliveriesCompleted = 8;

  const handleCall = (type: "supplier" | "customer") => {
    const phoneNumber = type === "supplier" ? "+251911123456" : "+251922654321"; // Sample numbers
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const handleMessage = () => {
    Alert.alert("Message", "Open chat with customer");
  };

  const handleOpenMaps = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(activeDelivery.dropoff)}`;
    Linking.openURL(url);
  };

  const handleAction = (action: string) => {
    Alert.alert("Action", `${action} pressed`);
  };

  return (
    <ScreenWrapper title="Driver Dashboard">
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Top Section */}
        <View style={styles.topSection}>
          <View style={styles.statusContainer}>
            <Text style={styles.statusText}>
              You are {isOnline ? "Online" : "Offline"}
            </Text>
            <Switch
              value={isOnline}
              onValueChange={setIsOnline}
              trackColor={{ false: "#767577", true: "#81b0ff" }}
              thumbColor={isOnline ? "#f5dd4b" : "#f4f3f4"}
            />
          </View>
        </View>

        {/* Main Section - Active Delivery */}
        <View style={styles.mainSection}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Active Delivery</Text>
            <View style={styles.locationContainer}>
              <Ionicons name="location" size={20} color="#10b981" />
              <Text style={styles.locationText}>{activeDelivery.pickup}</Text>
            </View>
            <View style={styles.arrowContainer}>
              <Ionicons name="arrow-down" size={16} color="#6b7280" />
            </View>
            <View style={styles.locationContainer}>
              <Ionicons name="location" size={20} color="#ef4444" />
              <Text style={styles.locationText}>{activeDelivery.dropoff}</Text>
            </View>
            <View style={styles.detailsContainer}>
              <Text style={styles.detailText}>
                Distance: {activeDelivery.distance}
              </Text>
              <Text style={styles.detailText}>ETA: {activeDelivery.eta}</Text>
            </View>
            <Text style={styles.statusBadge}>{activeDelivery.status}</Text>
            <View style={styles.buttonContainer}>
              <Pressable
                style={[styles.actionButton, styles.secondaryButton]}
                onPress={() => handleAction("Mark as Picked Up")}
              >
                <Text style={styles.buttonText}>Mark as Picked Up</Text>
              </Pressable>
              <Pressable
                style={[styles.actionButton, styles.primaryButton]}
                onPress={() => handleAction("Mark as Delivered")}
              >
                <Text style={styles.buttonText}>Mark as Delivered</Text>
              </Pressable>
            </View>
          </View>
        </View>

        {/* Navigation */}
        <View style={styles.navigationSection}>
          <Pressable style={styles.mapsButton} onPress={handleOpenMaps}>
            <Ionicons name="map" size={24} color="#ffffff" />
            <Text style={styles.mapsButtonText}>Open in Maps</Text>
          </Pressable>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsContainer}>
            <Pressable
              style={styles.quickActionButton}
              onPress={() => handleCall("supplier")}
            >
              <Ionicons name="call" size={24} color="#10b981" />
              <Text style={styles.quickActionText}>Call Supplier</Text>
            </Pressable>
            <Pressable
              style={styles.quickActionButton}
              onPress={() => handleCall("customer")}
            >
              <Ionicons name="call" size={24} color="#3b82f6" />
              <Text style={styles.quickActionText}>Call Customer</Text>
            </Pressable>
            <Pressable style={styles.quickActionButton} onPress={handleMessage}>
              <Ionicons name="chatbubble" size={24} color="#8b5cf6" />
              <Text style={styles.quickActionText}>Message</Text>
            </Pressable>
          </View>
        </View>

        {/* Secondary Section - New Request */}
        {newRequest && (
          <View style={styles.secondarySection}>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>New Delivery Request</Text>
              <View style={styles.locationContainer}>
                <Ionicons name="location" size={20} color="#10b981" />
                <Text style={styles.locationText}>{newRequest.pickup}</Text>
              </View>
              <View style={styles.arrowContainer}>
                <Ionicons name="arrow-down" size={16} color="#6b7280" />
              </View>
              <View style={styles.locationContainer}>
                <Ionicons name="location" size={20} color="#ef4444" />
                <Text style={styles.locationText}>{newRequest.dropoff}</Text>
              </View>
              <View style={styles.detailsContainer}>
                <Text style={styles.detailText}>
                  Distance: {newRequest.distance}
                </Text>
                <Text style={styles.detailText}>ETA: {newRequest.eta}</Text>
              </View>
              <View style={styles.buttonContainer}>
                <Pressable
                  style={[styles.actionButton, styles.rejectButton]}
                  onPress={() => handleAction("Reject")}
                >
                  <Text style={styles.buttonText}>Reject</Text>
                </Pressable>
                <Pressable
                  style={[styles.actionButton, styles.acceptButton]}
                  onPress={() => handleAction("Accept")}
                >
                  <Text style={styles.buttonText}>Accept</Text>
                </Pressable>
              </View>
            </View>
          </View>
        )}

        {/* Bottom Section */}
        <View style={styles.bottomSection}>
          <View style={styles.summaryContainer}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Today's Earnings</Text>
              <Text style={styles.summaryValue}>${earnings.toFixed(2)}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Deliveries Completed</Text>
              <Text style={styles.summaryValue}>{deliveriesCompleted}</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  contentContainer: {
    padding: 16,
  },
  topSection: {
    marginBottom: 20,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
  },
  mainSection: {
    marginBottom: 20,
  },
  card: {
    backgroundColor: "#ffffff",
    padding: 20,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 16,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  locationText: {
    fontSize: 16,
    color: "#374151",
    marginLeft: 8,
    flex: 1,
  },
  arrowContainer: {
    alignItems: "center",
    marginVertical: 8,
  },
  detailsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  detailText: {
    fontSize: 14,
    color: "#6b7280",
  },
  statusBadge: {
    backgroundColor: "#fef3c7",
    color: "#d97706",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    fontSize: 14,
    fontWeight: "600",
    alignSelf: "flex-start",
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  actionButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginHorizontal: 4,
  },
  primaryButton: {
    backgroundColor: "#10b981",
  },
  secondaryButton: {
    backgroundColor: "#3b82f6",
  },
  rejectButton: {
    backgroundColor: "#ef4444",
  },
  acceptButton: {
    backgroundColor: "#10b981",
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  navigationSection: {
    marginBottom: 20,
  },
  mapsButton: {
    backgroundColor: "#1f2937",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  mapsButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  quickActionsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 12,
  },
  quickActionsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  quickActionButton: {
    alignItems: "center",
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    flex: 1,
    marginHorizontal: 4,
  },
  quickActionText: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 4,
    fontWeight: "500",
  },
  secondarySection: {
    marginBottom: 20,
  },
  bottomSection: {
    marginTop: 20,
  },
  summaryContainer: {
    backgroundColor: "#ffffff",
    padding: 20,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  summaryItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 16,
    color: "#6b7280",
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1f2937",
  },
});
