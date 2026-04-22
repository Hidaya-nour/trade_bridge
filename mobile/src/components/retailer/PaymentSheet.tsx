import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import BottomSheetModal from "@/components/retailer/BottomSheetModal";

export type MobilePaymentMethod = "app_payment" | "mobile_banking";

export interface PaymentSheetSubmitPayload {
  method: MobilePaymentMethod;
  notes?: string;
  payment_details?: {
    transactionId?: string;
    transferDate?: string;
    mobileProvider?: string;
    phoneNumber?: string;
  };
}

interface PaymentSheetProps {
  visible: boolean;
  amount: number;
  orderLabel: string;
  onClose: () => void;
  onSubmit: (payload: PaymentSheetSubmitPayload) => Promise<void> | void;
  submitting?: boolean;
}

export default function PaymentSheet({
  visible,
  amount,
  orderLabel,
  onClose,
  onSubmit,
  submitting = false,
}: PaymentSheetProps) {
  const [method, setMethod] = useState<MobilePaymentMethod>("app_payment");
  const [transactionId, setTransactionId] = useState("");
  const [transferDate, setTransferDate] = useState("");
  const [mobileProvider, setMobileProvider] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (visible) {
      setMethod("app_payment");
      setTransactionId("");
      setTransferDate("");
      setMobileProvider("");
      setPhoneNumber("");
      setNotes("");
    }
  }, [visible]);

  return (
    <BottomSheetModal
      visible={visible}
      title="Complete payment"
      subtitle={`Submit payment for ${orderLabel}.`}
      onClose={onClose}
    >
      <View style={styles.amountCard}>
        <Text style={styles.amountLabel}>Amount due</Text>
        <Text style={styles.amountValue}>${amount.toFixed(2)}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Payment method</Text>
        <View style={styles.methodRow}>
          <Pressable
            style={[styles.methodCard, method === "app_payment" && styles.methodCardActive]}
            onPress={() => setMethod("app_payment")}
          >
            <Ionicons name="card-outline" size={18} color="#1d4ed8" />
            <Text style={styles.methodTitle}>App Payment</Text>
            <Text style={styles.methodText}>Open secure checkout</Text>
          </Pressable>
          <Pressable
            style={[styles.methodCard, method === "mobile_banking" && styles.methodCardActive]}
            onPress={() => setMethod("mobile_banking")}
          >
            <Ionicons name="phone-portrait-outline" size={18} color="#1d4ed8" />
            <Text style={styles.methodTitle}>Mobile Banking</Text>
            <Text style={styles.methodText}>Submit transfer details</Text>
          </Pressable>
        </View>
      </View>

      {method === "mobile_banking" ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Transfer details</Text>
          <TextInput
            style={styles.input}
            placeholder="Transaction ID"
            value={transactionId}
            onChangeText={setTransactionId}
          />
          <TextInput
            style={styles.input}
            placeholder="Transfer date (YYYY-MM-DD)"
            value={transferDate}
            onChangeText={setTransferDate}
          />
          <TextInput
            style={styles.input}
            placeholder="Mobile provider"
            value={mobileProvider}
            onChangeText={setMobileProvider}
          />
          <TextInput
            style={styles.input}
            placeholder="Phone number"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
          />
        </View>
      ) : (
        <View style={styles.infoCard}>
          <Ionicons name="information-circle-outline" size={18} color="#1d4ed8" />
          <Text style={styles.infoText}>
            You will be redirected to the in-app online checkout flow to complete payment securely.
          </Text>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notes</Text>
        <TextInput
          style={[styles.input, styles.notesInput]}
          placeholder="Optional payment note"
          value={notes}
          onChangeText={setNotes}
          multiline
        />
      </View>

      <View style={styles.footer}>
        <Pressable style={styles.cancelButton} onPress={onClose}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </Pressable>
        <Pressable
          style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
          disabled={submitting}
          onPress={() =>
            void onSubmit({
              method,
              notes,
              payment_details:
                method === "mobile_banking"
                  ? {
                      transactionId,
                      transferDate,
                      mobileProvider,
                      phoneNumber,
                    }
                  : undefined,
            })
          }
        >
          <Text style={styles.submitButtonText}>
            {submitting ? "Submitting..." : method === "app_payment" ? "Continue" : "Submit"}
          </Text>
        </Pressable>
      </View>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  amountCard: {
    borderRadius: 18,
    backgroundColor: "#eff6ff",
    padding: 16,
    gap: 6,
  },
  amountLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#1e40af",
  },
  amountValue: {
    fontSize: 24,
    fontWeight: "800",
    color: "#0f172a",
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0f172a",
  },
  methodRow: {
    flexDirection: "row",
    gap: 12,
  },
  methodCard: {
    flex: 1,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#dbe3ef",
    backgroundColor: "#ffffff",
    padding: 14,
    gap: 6,
  },
  methodCardActive: {
    borderColor: "#93c5fd",
    backgroundColor: "#eff6ff",
  },
  methodTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#0f172a",
  },
  methodText: {
    fontSize: 12,
    color: "#64748b",
  },
  input: {
    minHeight: 48,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#dbe3ef",
    backgroundColor: "#ffffff",
    paddingHorizontal: 14,
    fontSize: 14,
    color: "#0f172a",
  },
  notesInput: {
    minHeight: 92,
    paddingTop: 12,
    textAlignVertical: "top",
  },
  infoCard: {
    flexDirection: "row",
    gap: 10,
    borderRadius: 18,
    backgroundColor: "#eff6ff",
    padding: 14,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
    color: "#1e40af",
  },
  footer: {
    flexDirection: "row",
    gap: 12,
    paddingTop: 4,
  },
  cancelButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#334155",
  },
  submitButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1d4ed8",
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#ffffff",
  },
});
