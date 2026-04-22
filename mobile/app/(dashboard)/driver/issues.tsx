import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import ScreenWrapper from "@/components/layout/ScreenWrapper";
import deliveryService from "@/features/driver-deliveries/delivery.service";
import { type DriverDelivery } from "@/features/driver-deliveries/delivery.types";
import {
  DRIVER_ISSUE_CATEGORY_LABELS,
  DRIVER_ISSUE_CATEGORY_OPTIONS,
  DRIVER_ISSUE_CONCERNED_PARTY_LABELS,
  DRIVER_ISSUE_CONCERNED_PARTY_OPTIONS,
  DRIVER_ISSUE_SUBTYPE_OPTIONS,
  DRIVER_ISSUE_URGENCY_LABELS,
  DRIVER_ISSUE_URGENCY_OPTIONS,
  type DriverIssueCategoryValue,
  type DriverIssueConcernedPartyValue,
  type DriverIssueUrgencyValue,
} from "@/features/driver-issues/driver-issue.config";
import driverIssueService from "@/features/driver-issues/driver-issue.service";
import { useRoleShell } from "@/navigation/RoleShellContext";
import { useScrollDirection } from "@/hooks/useScrollDirection";

type DriverIssueReport = {
  id: string;
  delivery_id?: string | null;
  category: DriverIssueCategoryValue;
  sub_type: string;
  location: string;
  urgency: DriverIssueUrgencyValue;
  description?: string | null;
  concerned_party?: DriverIssueConcernedPartyValue | null;
  created_at: string;
};

const emptyForm = {
  deliveryId: "",
  category: "",
  subType: "",
  location: "",
  urgency: "",
  description: "",
  concernedParty: "",
};

function SelectionField({
  label,
  value,
  placeholder,
  onPress,
  error,
}: {
  label: string;
  value?: string;
  placeholder: string;
  onPress: () => void;
  error?: string;
}) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Pressable
        style={[styles.selectorButton, error ? styles.selectorButtonError : null]}
        onPress={onPress}
      >
        <Text style={value ? styles.selectorValue : styles.selectorPlaceholder}>
          {value || placeholder}
        </Text>
        <Ionicons name="chevron-down-outline" size={18} color="#64748b" />
      </Pressable>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

function SelectionModal({
  visible,
  title,
  options,
  onClose,
  onSelect,
}: {
  visible: boolean;
  title: string;
  options: { value: string; label: string }[];
  onClose: () => void;
  onSelect: (value: string) => void;
}) {
  return (
    <Modal transparent animationType="slide" visible={visible} onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <Pressable style={styles.modalBackdrop} onPress={onClose} />
        <View style={styles.modalCard}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            <Pressable onPress={onClose}>
              <Ionicons name="close-outline" size={24} color="#0f172a" />
            </Pressable>
          </View>
          <ScrollView style={styles.modalList}>
            {options.map((option) => (
              <Pressable
                key={option.value}
                style={styles.modalOption}
                onPress={() => {
                  onSelect(option.value);
                  onClose();
                }}
              >
                <Text style={styles.modalOptionText}>{option.label}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

export default function DriverIssuesScreen() {
  const { setTabBarVisible } = useRoleShell();
  const { deliveryId } = useLocalSearchParams<{ deliveryId?: string }>();
  const [deliveries, setDeliveries] = useState<DriverDelivery[]>([]);
  const [reports, setReports] = useState<DriverIssueReport[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [sheet, setSheet] = useState<
    "delivery" | "category" | "subType" | "urgency" | "concernedParty" | null
  >(null);
  const { onScroll } = useScrollDirection({
    onDirectionChange: (direction) => setTabBarVisible(direction === "up"),
  });

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);

      try {
        const [deliveryRows, reportRows] = await Promise.all([
          deliveryService.getMyDeliveries(),
          driverIssueService.getMyReports(8),
        ]);

        setDeliveries(deliveryRows);
        setReports(reportRows as DriverIssueReport[]);
      } catch (error: any) {
        Alert.alert(
          "Could not load issue reporting",
          error?.response?.data?.message ||
            "We could not load your deliveries and recent reports.",
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    if (deliveryId) {
      setForm((current) => ({ ...current, deliveryId }));
    }
  }, [deliveryId]);

  const selectedDelivery = useMemo(
    () => deliveries.find((delivery) => delivery.id === form.deliveryId) ?? null,
    [deliveries, form.deliveryId],
  );

  const selectedCategory = form.category as DriverIssueCategoryValue | "";
  const subTypeOptions = selectedCategory
    ? DRIVER_ISSUE_SUBTYPE_OPTIONS[selectedCategory].map((option) => ({
        value: option,
        label: option,
      }))
    : [];

  const deliveryOptions = [
    { value: "", label: "General issue" },
    ...deliveries.map((delivery) => ({
      value: delivery.id,
      label: `${delivery.orderCode} - ${delivery.destination}`,
    })),
  ];

  const updateField = (field: keyof typeof emptyForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => {
      if (!current[field]) {
        return current;
      }

      const next = { ...current };
      delete next[field];
      return next;
    });
  };

  const handleCategorySelect = (value: string) => {
    setForm((current) => ({
      ...current,
      category: value,
      subType: "",
    }));
    setErrors((current) => {
      const next = { ...current };
      delete next.category;
      delete next.subType;
      return next;
    });
  };

  const validate = () => {
    const nextErrors: Record<string, string> = {};

    if (!form.category) nextErrors.category = "Choose an issue category.";
    if (!form.subType.trim()) nextErrors.subType = "Choose or enter a sub-type.";
    if (!form.location.trim()) nextErrors.location = "Enter where the issue happened.";
    if (!form.urgency) nextErrors.urgency = "Choose an urgency level.";

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const useCurrentLocation = async () => {
    setIsLocating(true);

    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== "granted") {
        Alert.alert(
          "Location permission needed",
          "Allow location access to fill the issue location automatically.",
        );
        return;
      }

      const current = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      updateField(
        "location",
        `Lat ${current.coords.latitude.toFixed(5)}, Lng ${current.coords.longitude.toFixed(5)}`,
      );
    } catch {
      Alert.alert(
        "Location unavailable",
        "We could not read your current location right now.",
      );
    } finally {
      setIsLocating(false);
    }
  };

  const handleSubmit = async () => {
    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await driverIssueService.create({
        delivery_id: form.deliveryId || undefined,
        category: form.category,
        sub_type: form.subType.trim(),
        location: form.location.trim(),
        urgency: form.urgency,
        description: form.description.trim() || undefined,
        concerned_party: form.concernedParty || undefined,
      });

      const report = response?.data?.report as DriverIssueReport | undefined;
      if (report) {
        setReports((current) => [report, ...current].slice(0, 8));
      }

      setForm({
        ...emptyForm,
        deliveryId: form.deliveryId,
      });
      Alert.alert("Issue submitted", "Your report has been recorded.");
    } catch (error: any) {
      Alert.alert(
        "Submission failed",
        error?.response?.data?.message ||
          "We could not submit the issue report right now.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScreenWrapper title="Report Issue" subtitle="Structured driver support">
      <ScrollView
        contentContainerStyle={styles.container}
        onScroll={onScroll}
        scrollEventThrottle={16}
      >
        <View style={styles.heroCard}>
          <Text style={styles.heroEyebrow}>Driver Support</Text>
          <Text style={styles.heroTitle}>Capture the issue clearly</Text>
          <Text style={styles.heroSubtitle}>
            Report route, vehicle, delivery, customer, payment, and system issues
            with the right context for fast follow-up.
          </Text>
          {selectedDelivery ? (
            <View style={styles.contextCard}>
              <Text style={styles.contextLabel}>Linked delivery</Text>
              <Text style={styles.contextTitle}>{selectedDelivery.orderCode}</Text>
              <Text style={styles.contextSubtitle}>
                {selectedDelivery.destination}
              </Text>
            </View>
          ) : null}
        </View>

        {isLoading ? (
          <View style={styles.emptyState}>
            <ActivityIndicator size="small" color="#2563eb" />
            <Text style={styles.emptyTitle}>Loading issue tools</Text>
            <Text style={styles.emptySubtitle}>
              Fetching delivery context and recent issue reports.
            </Text>
          </View>
        ) : (
          <>
            <View style={styles.formCard}>
              <SelectionField
                label="Related delivery"
                value={selectedDelivery ? `${selectedDelivery.orderCode}` : ""}
                placeholder="General issue"
                onPress={() => setSheet("delivery")}
              />

              <SelectionField
                label="Issue category"
                value={
                  form.category
                    ? DRIVER_ISSUE_CATEGORY_LABELS[
                        form.category as DriverIssueCategoryValue
                      ]
                    : ""
                }
                placeholder="Select a category"
                onPress={() => setSheet("category")}
                error={errors.category}
              />

              {selectedCategory === "other" ? (
                <View style={styles.fieldWrap}>
                  <Text style={styles.fieldLabel}>Sub-issue detail</Text>
                  <TextInput
                    style={[styles.textInput, errors.subType ? styles.inputError : null]}
                    placeholder="Describe the issue type"
                    placeholderTextColor="#94a3b8"
                    value={form.subType}
                    onChangeText={(value) => updateField("subType", value)}
                  />
                  {errors.subType ? (
                    <Text style={styles.errorText}>{errors.subType}</Text>
                  ) : null}
                </View>
              ) : (
                <SelectionField
                  label="Sub-issue type"
                  value={form.subType}
                  placeholder="Select a sub-type"
                  onPress={() => setSheet("subType")}
                  error={errors.subType}
                />
              )}

              <SelectionField
                label="Urgency level"
                value={
                  form.urgency
                    ? DRIVER_ISSUE_URGENCY_LABELS[
                        form.urgency as DriverIssueUrgencyValue
                      ]
                    : ""
                }
                placeholder="Choose urgency"
                onPress={() => setSheet("urgency")}
                error={errors.urgency}
              />

              <View style={styles.fieldWrap}>
                <Text style={styles.fieldLabel}>Location of issue</Text>
                <TextInput
                  style={[styles.textInput, errors.location ? styles.inputError : null]}
                  placeholder="Warehouse gate, roadside stop, customer address..."
                  placeholderTextColor="#94a3b8"
                  value={form.location}
                  onChangeText={(value) => updateField("location", value)}
                />
                {errors.location ? (
                  <Text style={styles.errorText}>{errors.location}</Text>
                ) : null}
                <Pressable
                  style={styles.helperButton}
                  onPress={useCurrentLocation}
                  disabled={isLocating}
                >
                  {isLocating ? (
                    <ActivityIndicator size="small" color="#2563eb" />
                  ) : (
                    <Ionicons name="locate-outline" size={16} color="#2563eb" />
                  )}
                  <Text style={styles.helperButtonText}>Use current location</Text>
                </Pressable>
              </View>

              <SelectionField
                label="Concerned party"
                value={
                  form.concernedParty
                    ? DRIVER_ISSUE_CONCERNED_PARTY_LABELS[
                        form.concernedParty as DriverIssueConcernedPartyValue
                      ]
                    : ""
                }
                placeholder="Select a party"
                onPress={() => setSheet("concernedParty")}
              />

              <View style={styles.fieldWrap}>
                <Text style={styles.fieldLabel}>Additional description</Text>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  placeholder="Add details that dispatch or support should know."
                  placeholderTextColor="#94a3b8"
                  multiline
                  textAlignVertical="top"
                  value={form.description}
                  onChangeText={(value) => updateField("description", value)}
                />
              </View>

              <View style={styles.buttonRow}>
                <Pressable
                  style={[styles.primaryButton, isSubmitting && styles.buttonDisabled]}
                  onPress={handleSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <Ionicons name="alert-circle-outline" size={16} color="#ffffff" />
                  )}
                  <Text style={styles.primaryButtonText}>Submit report</Text>
                </Pressable>

                <Pressable
                  style={styles.secondaryButton}
                  onPress={() => {
                    setForm({
                      ...emptyForm,
                      deliveryId: form.deliveryId,
                    });
                    setErrors({});
                  }}
                  disabled={isSubmitting}
                >
                  <Text style={styles.secondaryButtonText}>Reset fields</Text>
                </Pressable>
              </View>
            </View>

            <View style={styles.reportsCard}>
              <Text style={styles.reportsTitle}>Recent reports</Text>
              {reports.length ? (
                reports.map((report) => (
                  <View key={report.id} style={styles.reportItem}>
                    <View style={styles.reportBadgeRow}>
                      <Text style={styles.reportBadge}>
                        {DRIVER_ISSUE_CATEGORY_LABELS[report.category]}
                      </Text>
                      <Text style={[styles.reportBadge, styles.reportBadgeUrgency]}>
                        {DRIVER_ISSUE_URGENCY_LABELS[report.urgency]}
                      </Text>
                    </View>
                    <Text style={styles.reportTitle}>{report.sub_type}</Text>
                    <Text style={styles.reportMeta}>{report.location}</Text>
                    {report.concerned_party ? (
                      <Text style={styles.reportMeta}>
                        Concerned party:{" "}
                        {
                          DRIVER_ISSUE_CONCERNED_PARTY_LABELS[
                            report.concerned_party
                          ]
                        }
                      </Text>
                    ) : null}
                    {report.description ? (
                      <Text style={styles.reportDescription}>
                        {report.description}
                      </Text>
                    ) : null}
                    <Text style={styles.reportTimestamp}>
                      {new Date(report.created_at).toLocaleString()}
                    </Text>
                  </View>
                ))
              ) : (
                <View style={styles.emptyStateCompact}>
                  <Text style={styles.emptyTitle}>No reports yet</Text>
                  <Text style={styles.emptySubtitle}>
                    Submitted driver issues will appear here.
                  </Text>
                </View>
              )}
            </View>
          </>
        )}
      </ScrollView>

      <SelectionModal
        visible={sheet === "delivery"}
        title="Related delivery"
        options={deliveryOptions.map((option) => ({
          value: option.value,
          label: option.label,
        }))}
        onClose={() => setSheet(null)}
        onSelect={(value) => updateField("deliveryId", value)}
      />
      <SelectionModal
        visible={sheet === "category"}
        title="Issue category"
        options={DRIVER_ISSUE_CATEGORY_OPTIONS.map((option) => ({
          value: option.value,
          label: option.label,
        }))}
        onClose={() => setSheet(null)}
        onSelect={handleCategorySelect}
      />
      <SelectionModal
        visible={sheet === "subType"}
        title="Sub-issue type"
        options={subTypeOptions}
        onClose={() => setSheet(null)}
        onSelect={(value) => updateField("subType", value)}
      />
      <SelectionModal
        visible={sheet === "urgency"}
        title="Urgency level"
        options={DRIVER_ISSUE_URGENCY_OPTIONS.map((option) => ({
          value: option.value,
          label: option.label,
        }))}
        onClose={() => setSheet(null)}
        onSelect={(value) => updateField("urgency", value)}
      />
      <SelectionModal
        visible={sheet === "concernedParty"}
        title="Concerned party"
        options={[
          { value: "", label: "Not specified" },
          ...DRIVER_ISSUE_CONCERNED_PARTY_OPTIONS.map((option) => ({
            value: option.value,
            label: option.label,
          })),
        ]}
        onClose={() => setSheet(null)}
        onSelect={(value) => updateField("concernedParty", value)}
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 40,
    gap: 16,
  },
  heroCard: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    gap: 10,
  },
  heroEyebrow: {
    color: "#c2410c",
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1.2,
  },
  heroTitle: {
    color: "#0f172a",
    fontSize: 24,
    fontWeight: "800",
  },
  heroSubtitle: {
    color: "#475569",
    fontSize: 13,
    lineHeight: 20,
  },
  contextCard: {
    marginTop: 6,
    backgroundColor: "#eff6ff",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#bfdbfe",
  },
  contextLabel: {
    color: "#1d4ed8",
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  contextTitle: {
    marginTop: 4,
    color: "#0f172a",
    fontSize: 18,
    fontWeight: "800",
  },
  contextSubtitle: {
    marginTop: 4,
    color: "#475569",
    fontSize: 13,
  },
  formCard: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    gap: 14,
  },
  fieldWrap: {
    gap: 7,
  },
  fieldLabel: {
    color: "#0f172a",
    fontSize: 13,
    fontWeight: "700",
  },
  selectorButton: {
    minHeight: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    backgroundColor: "#f8fafc",
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  selectorButtonError: {
    borderColor: "#fda4af",
  },
  selectorValue: {
    flex: 1,
    color: "#0f172a",
    fontSize: 14,
    fontWeight: "600",
  },
  selectorPlaceholder: {
    flex: 1,
    color: "#94a3b8",
    fontSize: 14,
  },
  textInput: {
    minHeight: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    backgroundColor: "#f8fafc",
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: "#0f172a",
    fontSize: 14,
  },
  textArea: {
    minHeight: 120,
  },
  inputError: {
    borderColor: "#fda4af",
  },
  helperButton: {
    marginTop: 4,
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#eff6ff",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  helperButtonText: {
    color: "#2563eb",
    fontSize: 13,
    fontWeight: "700",
  },
  errorText: {
    color: "#dc2626",
    fontSize: 12,
  },
  buttonRow: {
    gap: 10,
    marginTop: 4,
  },
  primaryButton: {
    backgroundColor: "#ea580c",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  primaryButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "800",
  },
  secondaryButton: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryButtonText: {
    color: "#334155",
    fontSize: 14,
    fontWeight: "700",
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  reportsCard: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    gap: 12,
  },
  reportsTitle: {
    color: "#0f172a",
    fontSize: 18,
    fontWeight: "800",
  },
  reportItem: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    backgroundColor: "#f8fafc",
    padding: 14,
    gap: 6,
  },
  reportBadgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  reportBadge: {
    overflow: "hidden",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: "#ffffff",
    color: "#334155",
    fontSize: 11,
    fontWeight: "700",
  },
  reportBadgeUrgency: {
    backgroundColor: "#fff1f2",
    color: "#be123c",
  },
  reportTitle: {
    color: "#0f172a",
    fontSize: 15,
    fontWeight: "800",
  },
  reportMeta: {
    color: "#475569",
    fontSize: 12,
    lineHeight: 18,
  },
  reportDescription: {
    color: "#334155",
    fontSize: 13,
    lineHeight: 19,
  },
  reportTimestamp: {
    marginTop: 2,
    color: "#94a3b8",
    fontSize: 11,
  },
  emptyState: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 20,
    alignItems: "center",
    gap: 8,
  },
  emptyStateCompact: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderStyle: "dashed",
    padding: 18,
    alignItems: "center",
  },
  emptyTitle: {
    color: "#0f172a",
    fontSize: 16,
    fontWeight: "800",
  },
  emptySubtitle: {
    color: "#64748b",
    fontSize: 12,
    textAlign: "center",
    lineHeight: 18,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(15, 23, 42, 0.28)",
  },
  modalBackdrop: {
    flex: 1,
  },
  modalCard: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 28,
    maxHeight: "70%",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  modalTitle: {
    color: "#0f172a",
    fontSize: 18,
    fontWeight: "800",
  },
  modalList: {
    flexGrow: 0,
  },
  modalOption: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  modalOptionText: {
    color: "#0f172a",
    fontSize: 15,
    fontWeight: "600",
  },
});
