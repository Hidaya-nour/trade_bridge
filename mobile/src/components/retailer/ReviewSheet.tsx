import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import BottomSheetModal from "@/components/retailer/BottomSheetModal";

interface ReviewSheetProps {
  visible: boolean;
  productName: string;
  onClose: () => void;
  onSubmit: (payload: { rating: number; review: string }) => Promise<void> | void;
  submitting?: boolean;
}

export default function ReviewSheet({
  visible,
  productName,
  onClose,
  onSubmit,
  submitting = false,
}: ReviewSheetProps) {
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState("");

  useEffect(() => {
    if (visible) {
      setRating(5);
      setReview("");
    }
  }, [visible]);

  return (
    <BottomSheetModal
      visible={visible}
      title="Rate product"
      subtitle={`Share feedback for ${productName}.`}
      onClose={onClose}
    >
      <View style={styles.starRow}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Pressable key={star} onPress={() => setRating(star)}>
            <Ionicons
              name={star <= rating ? "star" : "star-outline"}
              size={32}
              color="#f59e0b"
            />
          </Pressable>
        ))}
      </View>

      <TextInput
        style={styles.input}
        placeholder="Tell us how the product quality, packaging, or delivery went"
        value={review}
        onChangeText={setReview}
        multiline
      />

      <View style={styles.footer}>
        <Pressable style={styles.cancelButton} onPress={onClose}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </Pressable>
        <Pressable
          style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
          disabled={submitting}
          onPress={() => void onSubmit({ rating, review })}
        >
          <Text style={styles.submitButtonText}>{submitting ? "Submitting..." : "Submit"}</Text>
        </Pressable>
      </View>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  starRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 4,
  },
  input: {
    minHeight: 120,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#dbe3ef",
    backgroundColor: "#ffffff",
    paddingHorizontal: 14,
    paddingTop: 12,
    fontSize: 14,
    color: "#0f172a",
    textAlignVertical: "top",
  },
  footer: {
    flexDirection: "row",
    gap: 12,
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
