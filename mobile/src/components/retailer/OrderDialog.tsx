import { type ReactNode } from "react";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import BottomSheetModal from "@/components/retailer/BottomSheetModal";
import { type RetailerAddress } from "../../features/address/address.service";

export interface OrderDialogProps {
  visible: boolean;
  title: string;
  subtitle?: string;
  itemCount?: number;
  totalAmount?: number;
  deliveryAddress: string;
  onDeliveryAddressChange: (value: string) => void;
  notes: string;
  onNotesChange: (value: string) => void;
  requestCredit: boolean;
  onRequestCreditChange: (value: boolean) => void;
  savedAddresses?: RetailerAddress[];
  selectedAddressId?: string;
  onSelectAddress?: (id: string) => void;
  confirmLabel?: string;
  onClose: () => void;
  onConfirm: () => void;
  isSubmitting?: boolean;
}

const formatAddress = (address: RetailerAddress) => {
  const parts = [
    address.common_name,
    address.subcity,
    address.city,
    address.region,
  ]
    .map((value) => String(value || "").trim())
    .filter(Boolean);

  return parts
    .filter((value, index, all) => all.indexOf(value) === index)
    .join(", ");
};

export default function OrderDialog({
  visible,
  title,
  subtitle,
  itemCount,
  totalAmount,
  deliveryAddress,
  onDeliveryAddressChange,
  notes,
  onNotesChange,
  requestCredit,
  onRequestCreditChange,
  savedAddresses,
  selectedAddressId,
  onSelectAddress,
  confirmLabel = "Place Order",
  onClose,
  onConfirm,
  isSubmitting = false,
}: OrderDialogProps) {
  return (
    <BottomSheetModal visible={visible} title={title} subtitle={subtitle} onClose={onClose}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {(itemCount !== undefined || totalAmount !== undefined) && (
          <View style={styles.summaryLine}>
            {itemCount !== undefined ? (
              <Text style={styles.summaryText}>{itemCount} item{itemCount === 1 ? "" : "s"}</Text>
            ) : null}
            {totalAmount !== undefined ? (
              <Text style={styles.summaryText}>
                {typeof totalAmount === "number"
                  ? totalAmount.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })
                  : totalAmount}
              </Text>
            ) : null}
          </View>
        )}

        {Array.isArray(savedAddresses) && savedAddresses.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Saved locations</Text>
            <View style={styles.addressList}>
              {savedAddresses.map((address) => {
                const formatted = formatAddress(address);
                const selected = selectedAddressId === address.id;
                return (
                  <Pressable
                    key={address.id}
                    style={[styles.addressItem, selected && styles.addressItemSelected]}
                    onPress={() => onSelectAddress?.(address.id)}
                  >
                    <View style={styles.addressLabel}>
                      <Text style={styles.addressText}>{formatted || "Saved location"}</Text>
                    </View>
                    <Ionicons
                      name={selected ? "checkmark-circle" : "ellipse-outline"}
                      size={18}
                      color={selected ? "#1d4ed8" : "#94a3b8"}
                    />
                  </Pressable>
                );
              })}
            </View>
          </View>
        ) : null}

        <View style={styles.section}>
          <View style={styles.labelRow}>
            <Text style={styles.sectionTitle}>Delivery address</Text>
          </View>
          <TextInput
            style={styles.textInput}
            placeholder="City, subcity, street, landmark…"
            value={deliveryAddress}
            onChangeText={onDeliveryAddressChange}
            multiline
          />
        </View>

        <View style={styles.section}>
          <View style={styles.labelRow}>
            <Text style={styles.sectionTitle}>Order notes</Text>
          </View>
          <TextInput
            style={styles.textInput}
            placeholder="Optional note for supplier"
            value={notes}
            onChangeText={onNotesChange}
            multiline
          />
        </View>

        <Pressable style={styles.checkboxRow} onPress={() => onRequestCreditChange(!requestCredit)}>
          <Ionicons
            name={requestCredit ? "checkbox" : "square-outline"}
            size={20}
            color={requestCredit ? "#1d4ed8" : "#94a3b8"}
          />
          <Text style={styles.checkboxText}>Request credit (pay later after supplier approval)</Text>
        </Pressable>

        <View style={styles.footerRow}>
          <Pressable style={styles.cancelButton} onPress={onClose} disabled={isSubmitting}>
            <Text style={styles.cancelLabel}>Cancel</Text>
          </Pressable>
          <Pressable style={styles.confirmButton} onPress={onConfirm} disabled={isSubmitting}>
            <Text style={styles.confirmLabel}>{isSubmitting ? "Placing..." : confirmLabel}</Text>
          </Pressable>
        </View>
      </ScrollView>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 14,
    paddingBottom: 18,
  },
  summaryLine: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
  },
  summaryText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0f172a",
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#475569",
  },
  addressList: {
    gap: 10,
  },
  addressItem: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 14,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#ffffff",
  },
  addressItemSelected: {
    borderColor: "#1d4ed8",
    backgroundColor: "#eff6ff",
  },
  addressText: {
    fontSize: 13,
    color: "#0f172a",
  },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  textInput: {
    minHeight: 60,
    padding: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 14,
    backgroundColor: "#ffffff",
    textAlignVertical: "top",
    color: "#0f172a",
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 12,
  },
  checkboxText: {
    fontSize: 13,
    color: "#334155",
    flex: 1,
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
  },
  cancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: "#f1f5f9",
  },
  cancelLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#475569",
  },
  confirmButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: "#1d4ed8",
  },
  confirmLabel: {
    fontSize: 13,
    fontWeight: "800",
    color: "#ffffff",
  },
});
