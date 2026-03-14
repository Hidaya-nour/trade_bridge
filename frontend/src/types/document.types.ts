// ============================================================================
// Document Types (Aligned with backend/src/types/document.types.ts)
// ============================================================================

export type DocumentType =
  | "id_card"
  | "business_license"
  | "tax_certificate"
  | "other";

export type CloudinaryResourceType = "image" | "raw" | "video";

export type VerificationStatus = "pending" | "verified" | "rejected";

export interface Document {
  id: string;
  user_id: string;
  document_type: DocumentType;
  cloudinary_public_id?: string;
  cloudinary_resource_type?: CloudinaryResourceType;
  cloudinary_format?: string;
  cloudinary_version?: string;
  file_secure_url?: string;
  original_file_name?: string;
  file_size?: number;
  issued_date?: string | Date | null;
  expiry_date?: string | Date | null;
  verification_status: VerificationStatus;
  verified_by?: string | null;
  rejection_reason?: string | null;
  uploaded_at?: string | Date;
  reviewed_at?: string | Date | null;
  updated_at?: string | Date | null;
  deleted_at?: string | Date | null;
}
