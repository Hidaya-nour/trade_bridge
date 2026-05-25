import React, { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View, ScrollView, Image, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import BottomSheetModal from "@/components/retailer/BottomSheetModal";
import { SupplierPaymentMethodConfig } from "../../features/orders/order.types";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";

export type PaymentMethod = "app_payment" | "mobile_banking" | "credit" | "cod";

export interface PaymentSheetSubmitPayload {
  method: PaymentMethod;
  notes?: string;
  payment_details?: {
    mobileProvider?: string;
    phoneNumber?: string;
  };
  proofFile?: any; // To handle uploaded receipt image/document info
}

interface PaymentSheetProps {
  visible: boolean;
  amount: number;
  orderLabel: string;
  onClose: () => void;
  onSubmit: (payload: PaymentSheetSubmitPayload) => Promise<void> | void;
  submitting?: boolean;
  supplierPaymentMethods?: SupplierPaymentMethodConfig[];
}

const isSupplierMobileMethodType = (type: string) => type === "mobile_money" || type === "mobile_banking";
const isSupplierAppMethodType = (type: string) => type === "credit_card" || type === "chapa";
const isSupplierCodType = (type: string) => type === "cod" || type === "cash_on_delivery";

export default function PaymentSheet({
  visible,
  amount,
  orderLabel,
  onClose,
  onSubmit,
  submitting = false,
  supplierPaymentMethods = [],
}: PaymentSheetProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>("app_payment");
  const [mobileProvider, setMobileProvider] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedFile, setSelectedFile] = useState<{ name: string; uri: string; type?: string } | null>(null);

  // Ensure we always have an iterable array, even if the backend returns undefined
  const safeMethods = supplierPaymentMethods || [];

  const hasAppConfiguration = false; // Disabled as per user request

  const hasMobileConfiguration = useMemo(() => {
    // Never show mobile banking forms blindly if there are no provider details to build the inputs.
    return safeMethods.some(
      (m) => m && isSupplierMobileMethodType(m.method_type) && m.provider_name && m.provider_name.trim() !== ""
    );
  }, [safeMethods]);

  const hasCreditConfiguration = useMemo(() => {
    return safeMethods.some((m) => m && m.method_type === "credit");
  }, [safeMethods]);
  const hasCodConfiguration = useMemo(() => {
    return safeMethods.some((m) => m && isSupplierCodType(m.method_type));
  }, [safeMethods]);
  const hasAnyPaymentMethod = hasAppConfiguration || hasMobileConfiguration || hasCreditConfiguration || hasCodConfiguration;

  const currentSupplierDetails = useMemo(() => {
    if (!supplierPaymentMethods.length) return [];
    return supplierPaymentMethods.filter((item) =>
      selectedMethod === "app_payment"
        ? isSupplierAppMethodType(item.method_type)
        : selectedMethod === "credit"
          ? item.method_type === "credit"
          : selectedMethod === "cod"
            ? isSupplierCodType(item.method_type)
            : isSupplierMobileMethodType(item.method_type)
    );
  }, [supplierPaymentMethods, selectedMethod]);

  // 2. Automatically select the first available payment method tab when the sheet opens
  useEffect(() => {
    if (visible) {
      if (hasAppConfiguration) {
        setSelectedMethod("app_payment");
      } else if (hasMobileConfiguration) {
        setSelectedMethod("mobile_banking");
      } else if (hasCreditConfiguration) {
        setSelectedMethod("credit");
      } else if (hasCodConfiguration) {
        setSelectedMethod("cod");
      }
    }
  }, [visible, hasAppConfiguration, hasMobileConfiguration, hasCreditConfiguration, hasCodConfiguration]);

  // 4. Collect unique list of provider options for the dynamic selector chips
  const providerOptions = useMemo(() => {
    if (selectedMethod !== "mobile_banking" || !hasMobileConfiguration) return [];

    const sorted = [...currentSupplierDetails].sort(
      (a, b) => Number(Boolean(b.is_primary)) - Number(Boolean(a.is_primary))
    );
    const uniqueNames = new Set<string>();
    return sorted
      .map((m) => m.provider_name?.trim())
      .filter((name): name is string => Boolean(name))
      .filter((name) => {
        const key = name.toLowerCase();
        if (uniqueNames.has(key)) return false;
        uniqueNames.add(key);
        return true;
      });
  }, [selectedMethod, hasMobileConfiguration, currentSupplierDetails]);

  // Handle dialog state initialization / resets
  useEffect(() => {
    if (visible) {
      setNotes("");
      setMobileProvider("");
      setPhoneNumber("");
      setSelectedFile(null);
    }
  }, [visible]);

  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["image/*", "application/pdf"],
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (result.canceled) return;

      const file = result.assets[0];

      // Determine a safe MIME type — avoid application/octet-stream which multer rejects
      let mimeType = file.mimeType || "";
      if (!["image/jpeg", "image/png", "image/webp", "application/pdf"].includes(mimeType)) {
        if (file.name?.toLowerCase().endsWith(".pdf")) mimeType = "application/pdf";
        else if (file.name?.toLowerCase().endsWith(".png")) mimeType = "image/png";
        else if (file.name?.toLowerCase().endsWith(".webp")) mimeType = "image/webp";
        else mimeType = "image/jpeg";
      }
      setSelectedFile({
        name: file.name,
        uri: file.uri,
        type: mimeType,
      });
    } catch (error) {
      console.log("Document picker error:", error);
    }
  };

  const handleTakePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please allow access to your camera to take photos.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 0.8,
      });

      if (result.canceled) return;

      const asset = result.assets[0];
      setSelectedFile({
        name: asset.fileName || `photo_${Date.now()}.jpg`,
        uri: asset.uri,
        type: asset.mimeType || "image/jpeg",
      });
    } catch (error) {
      console.log("Camera error:", error);
    }
  };

  const handlePickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please allow access to your photo library to pick images.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        quality: 0.8,
      });

      if (result.canceled) return;

      const asset = result.assets[0];
      setSelectedFile({
        name: asset.fileName || `image_${Date.now()}.jpg`,
        uri: asset.uri,
        type: asset.mimeType || "image/jpeg",
      });
    } catch (error) {
      console.log("Image library error:", error);
    }
  };

  const showUploadOptions = () => {
    Alert.alert(
      "Upload Payment Proof",
      "Select an option to upload your receipt:",
      [
        { text: "Take Photo", onPress: handleTakePhoto },
        { text: "Choose Photo", onPress: handlePickImage },
        { text: "Choose Document (PDF)", onPress: handlePickDocument },
        { text: "Cancel", style: "cancel" }
      ]
    );
  };

  const handleFormSubmit = () => {
    if (!hasAnyPaymentMethod) return;

    if (selectedMethod === "mobile_banking") {
      if (!mobileProvider) {
        Alert.alert("Validation Error", "Please select a mobile provider");
        return;
      }
      if (!phoneNumber.trim()) {
        Alert.alert("Validation Error", "Please enter your sender phone number");
        return;
      }
      if (!selectedFile) {
        Alert.alert("Validation Error", "Please upload a transfer receipt proof");
        return;
      }
    }

    onSubmit({
      method: selectedMethod,
      notes,
      payment_details: selectedMethod === "mobile_banking" ? { mobileProvider, phoneNumber } : undefined,
      proofFile: selectedFile,
    });
  };

  return (
    <BottomSheetModal visible={visible} title="Complete payment" subtitle={`For ${orderLabel}`} onClose={onClose}>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>

        {/* Amount Box */}
        <View style={styles.amountCard}>
          <Text style={styles.amountLabel}>Amount due</Text>
          <Text style={styles.amountValue}>ETB {amount.toFixed(2)}</Text>
        </View>

        {/* Tab Selection Row */}
        <Text style={styles.sectionTitle}>Select Payment Method</Text>
        {!hasAnyPaymentMethod ? (
          <View style={styles.infoBox}>
            <Ionicons name="alert-circle-outline" size={18} color="#b45309" />
            <Text style={styles.warningText}>
              This supplier has not enabled a payment method for this order.
            </Text>
          </View>
        ) : (
          <View style={styles.tabContainer}>
            {/* Only show App Pay if configured by distributor */}
            {hasAppConfiguration && (
              <Pressable
                style={[styles.tabButton, selectedMethod === "app_payment" && styles.tabButtonActive]}
                onPress={() => setSelectedMethod("app_payment")}
              >
                <Ionicons name="card-outline" size={20} color={selectedMethod === "app_payment" ? "#1d4ed8" : "#64748b"} />
                <Text style={[styles.tabLabel, selectedMethod === "app_payment" && styles.tabLabelActive]}>App Pay</Text>
              </Pressable>
            )}

            {/* Only show Mobile Banking if configured by distributor */}
            {hasMobileConfiguration && (
              <Pressable
                style={[styles.tabButton, selectedMethod === "mobile_banking" && styles.tabButtonActive]}
                onPress={() => setSelectedMethod("mobile_banking")}
              >
                <Ionicons name="phone-portrait-outline" size={20} color={selectedMethod === "mobile_banking" ? "#1d4ed8" : "#64748b"} />
                <Text style={[styles.tabLabel, selectedMethod === "mobile_banking" && styles.tabLabelActive]}>Banking</Text>
              </Pressable>
            )}

            {/* Only show Credit if configured by distributor */}
            {hasCreditConfiguration && (
              <Pressable
                style={[styles.tabButton, selectedMethod === "credit" && styles.tabButtonActive]}
                onPress={() => setSelectedMethod("credit")}
              >
                <Ionicons name="time-outline" size={20} color={selectedMethod === "credit" ? "#1d4ed8" : "#64748b"} />
                <Text style={[styles.tabLabel, selectedMethod === "credit" && styles.tabLabelActive]}>Credit</Text>
              </Pressable>
            )}
            {hasCodConfiguration && (
              <Pressable
                style={[styles.tabButton, selectedMethod === "cod" && styles.tabButtonActive]}
                onPress={() => setSelectedMethod("cod")}
              >
                <Ionicons name="cash-outline" size={20} color={selectedMethod === "cod" ? "#1d4ed8" : "#64748b"} />
                <Text style={[styles.tabLabel, selectedMethod === "cod" && styles.tabLabelActive]}>Cash on delivery</Text>
              </Pressable>
            )}
          </View>
        )}

        {/* Supplier Target Account Configurations View Area */}
        {currentSupplierDetails.length > 0 && selectedMethod !== "app_payment" && (
          <View style={styles.supplierDetailsBox}>
            <Text style={styles.boxTitle}>Supplier Target Account Info:</Text>
            {currentSupplierDetails.map((account) => (
              <View key={account.id} style={styles.accountItem}>
                <Text style={styles.accountHeader}>
                  {account.provider_name} {account.is_primary && "(Primary)"}
                </Text>
                <Text style={styles.accountSubtext}>
                  {account.account_display || account.account_holder_name}
                </Text>
                {account.credit_limit && (
                  <Text style={styles.creditMetaText}>
                    Limit: ETB {account.credit_limit.toLocaleString()} · Due: {account.credit_due_days} days
                  </Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Conditional Content Inputs Blocks */}
        {selectedMethod === "app_payment" && (
          <View style={styles.infoBox}>
            <Ionicons name="information-circle-outline" size={18} color="#1e40af" />
            <Text style={styles.infoText}>You will continue to the secure integrated checkout portal page.</Text>
          </View>
        )}

        {selectedMethod === "cod" && (
          <View style={styles.infoBox}>
            <Ionicons name="checkmark-done-outline" size={18} color="#166534" />
            <Text style={styles.infoText}>Cash on delivery selected. The supplier will collect payment when the order is delivered.</Text>
          </View>
        )}

        {selectedMethod === "mobile_banking" && (
          <View style={styles.formGroup}>
            {providerOptions.length > 0 && (
              <>
                <Text style={styles.inputLabel}>Mobile Provider Selector</Text>
                <View style={styles.pickerAlternative}>
                  {providerOptions.map((prov) => (
                    <Pressable
                      key={prov}
                      style={[styles.chip, mobileProvider === prov && styles.chipActive]}
                      onPress={() => setMobileProvider(prov)}
                    >
                      <Text style={[styles.chipText, mobileProvider === prov && styles.chipTextActive]}>{prov}</Text>
                    </Pressable>
                  ))}
                </View>
              </>
            )}

            <Text style={styles.inputLabel}>Sender Phone Number</Text>
            <TextInput style={styles.input} placeholder="+251..." keyboardType="phone-pad" value={phoneNumber} onChangeText={setPhoneNumber} />

            <Text style={styles.inputLabel}>Upload Transfer Receipt Proof</Text>
            <Pressable style={styles.uploadArea} onPress={showUploadOptions}>
              <Ionicons name="cloud-upload-outline" size={24} color="#64748b" />
              <Text style={styles.uploadText}>
                {selectedFile ? "Change payment proof" : "Tap to upload receipt photo/document"}
              </Text>
            </Pressable>

            {selectedFile && (
              <View style={styles.previewContainer}>
                {selectedFile.type?.startsWith("image/") || selectedFile.name.match(/\.(jpg|jpeg|png|gif|webp|heic)$/i) ? (
                  <Image source={{ uri: selectedFile.uri }} style={styles.previewImage} />
                ) : (
                  <View style={styles.filePlaceholder}>
                    <Ionicons name="document-text-outline" size={32} color="#1d4ed8" />
                    <Text style={styles.filePlaceholderText} numberOfLines={1}>{selectedFile.name}</Text>
                  </View>
                )}
                <View style={styles.previewInfo}>
                  <Text style={styles.previewName} numberOfLines={1}>{selectedFile.name}</Text>
                  <Pressable onPress={() => setSelectedFile(null)}>
                    <Text style={styles.removeText}>Remove</Text>
                  </Pressable>
                </View>
              </View>
            )}
          </View>
        )}

        {/* Notes Input Field shared across states */}
        <Text style={styles.inputLabel}>Notes</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Optional notes for reference..."
          multiline
          value={notes}
          onChangeText={setNotes}
        />

        {/* Bottom Action Footer */}
        <View style={styles.footerRow}>
          <Pressable style={styles.cancelBtn} onPress={onClose}>
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </Pressable>
          <Pressable
            style={[styles.submitBtn, (submitting || !hasAnyPaymentMethod) && { opacity: 0.5 }]}
            onPress={handleFormSubmit}
            disabled={submitting || !hasAnyPaymentMethod}
          >
            <Text style={styles.submitBtnText}>
              {submitting ? "Processing..." : selectedMethod === "app_payment" ? "Continue" : "Submit"}
            </Text>
          </Pressable>
        </View>

      </ScrollView>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  scrollContainer: { gap: 16, paddingBottom: 32 },
  amountCard: { padding: 16, backgroundColor: "#eff6ff", borderRadius: 16 },
  amountLabel: { fontSize: 12, color: "#1e40af", fontWeight: "600" },
  amountValue: { fontSize: 24, fontWeight: "800", marginTop: 4, color: "#1e293b" },
  sectionTitle: { fontSize: 14, fontWeight: "700", color: "#1e293b", marginTop: 8 },
  tabContainer: { flexDirection: "row", gap: 8 },
  tabButton: { flex: 1, padding: 12, borderWidth: 1, borderColor: "#cbd5e1", borderRadius: 12, alignItems: "center", gap: 4 },
  tabButtonActive: { borderColor: "#3b82f6", backgroundColor: "#eff6ff" },
  tabLabel: { fontSize: 12, color: "#64748b", fontWeight: "600" },
  tabLabelActive: { color: "#1d4ed8" },
  supplierDetailsBox: { padding: 12, backgroundColor: "#f8fafc", borderRadius: 12, borderWidth: 1, borderColor: "#e2e8f0" },
  boxTitle: { fontSize: 12, fontWeight: "700", color: "#475569", marginBottom: 6 },
  accountItem: { paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: "#f1f5f9" },
  accountHeader: { fontSize: 13, fontWeight: "700", color: "#1e293b" },
  accountSubtext: { fontSize: 12, color: "#64748b" },
  creditMetaText: { fontSize: 11, color: "#059669", fontWeight: "600", marginTop: 2 },
  infoBox: { flexDirection: "row", padding: 12, backgroundColor: "#f0f9ff", borderRadius: 12, gap: 8, alignItems: "center" },
  infoText: { fontSize: 12, color: "#0369a1", flex: 1 },
  warningText: { fontSize: 12, color: "#92400e", flex: 1 },
  formGroup: { gap: 10 },
  inputLabel: { fontSize: 13, fontWeight: "600", color: "#475569" },
  input: { borderWidth: 1, borderColor: "#cbd5e1", padding: 12, borderRadius: 12, fontSize: 14, backgroundColor: "#fff" },
  textArea: { height: 80, textAlignVertical: "top" },
  pickerAlternative: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  chip: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20, borderWidth: 1, borderColor: "#cbd5e1" },
  chipActive: { backgroundColor: "#1d4ed8", borderColor: "#1d4ed8" },
  chipText: { fontSize: 12, color: "#475569" },
  chipTextActive: { color: "#fff", fontWeight: "600" },
  uploadArea: { padding: 20, borderStyle: "dashed", borderWidth: 1, borderColor: "#94a3b8", borderRadius: 12, alignItems: "center", gap: 6, backgroundColor: "#f8fafc" },
  uploadText: { fontSize: 12, color: "#64748b" },
  footerRow: { flexDirection: "row", gap: 12, marginTop: 12 },
  cancelBtn: { flex: 1, padding: 14, borderWidth: 1, borderColor: "#cbd5e1", borderRadius: 12, alignItems: "center" },
  cancelBtnText: { fontWeight: "600", color: "#475569" },
  submitBtn: { flex: 1, padding: 14, backgroundColor: "#1d4ed8", borderRadius: 12, alignItems: "center" },
  submitBtnText: { fontWeight: "600", color: "#fff" },
  previewContainer: {
    marginTop: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    backgroundColor: "#f8fafc",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  previewImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: "#e2e8f0",
  },
  filePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: "#eff6ff",
    justifyContent: "center",
    alignItems: "center",
    padding: 4,
  },
  filePlaceholderText: {
    fontSize: 8,
    color: "#1e40af",
    textAlign: "center",
    marginTop: 2,
  },
  previewInfo: {
    flex: 1,
    gap: 4,
  },
  previewName: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1e293b",
  },
  removeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#dc2626",
  },
});
