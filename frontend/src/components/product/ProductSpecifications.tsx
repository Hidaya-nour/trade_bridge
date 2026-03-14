import React from "react";

import { Badge } from "@/components/ui/badge";

interface ProductSpecificationsProps {
  specifications?: Record<string, any> | string | null;
  emptyMessage?: string;
}

const parseSpecifications = (
  specs: ProductSpecificationsProps["specifications"],
): Record<string, any> => {
  if (!specs) return {};
  if (typeof specs === "object") return specs;
  if (typeof specs === "string") {
    try {
      return JSON.parse(specs);
    } catch (error) {
      console.error("Failed to parse specifications:", error);
      return {};
    }
  }
  return {};
};

const formatLabel = (value: string): string =>
  value
    .replace(/_/g, " ")
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase())
    .trim();

const SpecificationRow: React.FC<{ label: string; value: any }> = ({
  label,
  value,
}) => {
  const renderValue = () => {
    if (value === null || value === undefined) return "N/A";

    if (typeof value === "boolean") {
      return value ? "Yes" : "No";
    }

    if (Array.isArray(value)) {
      return (
        <div className="flex flex-wrap gap-1">
          {value.map((item, i) => (
            <Badge key={i} variant="secondary" className="text-xs">
              {String(item)}
            </Badge>
          ))}
        </div>
      );
    }

    if (typeof value === "object") {
      return (
        <div className="space-y-1">
          {Object.entries(value).map(([k, v]) => (
            <div key={k} className="text-xs">
              <span className="font-medium">{formatLabel(k)}:</span>{" "}
              {String(v)}
            </div>
          ))}
        </div>
      );
    }

    return <span>{String(value)}</span>;
  };

  return (
    <div className="grid grid-cols-3 gap-4 py-2 border-b last:border-0 hover:bg-muted/50 transition-colors">
      <span className="text-sm font-medium text-muted-foreground">
        {formatLabel(label)}
      </span>
      <div className="text-sm col-span-2">{renderValue()}</div>
    </div>
  );
};

export const ProductSpecifications: React.FC<ProductSpecificationsProps> = ({
  specifications,
  emptyMessage = "No specifications available for this product.",
}) => {
  const parsed = parseSpecifications(specifications);

  if (!specifications || Object.keys(parsed).length === 0) {
    return <p className="text-sm text-muted-foreground">{emptyMessage}</p>;
  }

  return (
    <div className="space-y-6">
      {Object.entries(parsed).map(([key, value]) => {
        if (
          typeof value === "object" &&
          value !== null &&
          !Array.isArray(value)
        ) {
          return (
            <div key={key}>
              <h4 className="text-sm font-medium text-muted-foreground mb-3 capitalize">
                {formatLabel(key)}
              </h4>
              <div className="space-y-3">
                {Object.entries(value).map(([subKey, subValue]) => (
                  <SpecificationRow
                    key={subKey}
                    label={subKey}
                    value={subValue}
                  />
                ))}
              </div>
            </div>
          );
        }

        return <SpecificationRow key={key} label={key} value={value} />;
      })}
    </div>
  );
};
