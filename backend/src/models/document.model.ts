import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import { IDocument } from '../types/document.types';
import { User } from './user.model';

interface DocumentCreationAttributes extends Optional<IDocument, 'id' | 'cloudinary_public_id' | 'cloudinary_resource_type' | 'cloudinary_format' | 'cloudinary_version' | 'file_secure_url' | 'original_file_name' | 'file_size' | 'issued_date' | 'expiry_date' | 'verified_by' | 'rejection_reason' | 'uploaded_at' | 'reviewed_at' | 'updated_at' | 'deleted_at'> {}

export class Document extends Model<IDocument, DocumentCreationAttributes> implements IDocument {
  public id!: string;
  public user_id!: string;
  public document_type!: IDocument['document_type'];
  public cloudinary_public_id?: string;
  public cloudinary_resource_type?: IDocument['cloudinary_resource_type'];
  public cloudinary_format?: string;
  public cloudinary_version?: string;
  public file_secure_url?: string;
  public original_file_name?: string;
  public file_size?: number;
  public issued_date?: Date | null;
  public expiry_date?: Date | null;
  public verification_status!: IDocument['verification_status'];
  public verified_by?: string | null;
  public rejection_reason?: string | null;
  public uploaded_at?: Date;
  public reviewed_at?: Date | null;
  public updated_at?: Date | null;
  public deleted_at?: Date | null;

  public readonly user?: User;
}

Document.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'users', key: 'id' }
    },
    document_type: {
      type: DataTypes.ENUM('id_card','business_license','tax_certificate','other'),
      allowNull: false
    },
    cloudinary_public_id: { type: DataTypes.STRING(255), allowNull: true },
    cloudinary_resource_type: { type: DataTypes.ENUM('image','raw','video'), allowNull: true },
    cloudinary_format: { type: DataTypes.STRING(50), allowNull: true },
    cloudinary_version: { type: DataTypes.STRING(50), allowNull: true },
    file_secure_url: { type: DataTypes.STRING(500), allowNull: true },
    original_file_name: { type: DataTypes.STRING(255), allowNull: true },
    file_size: { type: DataTypes.INTEGER, allowNull: true },
    issued_date: { type: DataTypes.DATE, allowNull: true },
    expiry_date: { type: DataTypes.DATE, allowNull: true },
    verification_status: { type: DataTypes.ENUM('pending','verified','rejected'), allowNull: false, defaultValue: 'pending' },
    verified_by: { type: DataTypes.UUID, allowNull: true },
    rejection_reason: { type: DataTypes.TEXT, allowNull: true },
    uploaded_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    reviewed_at: { type: DataTypes.DATE, allowNull: true },
    updated_at: { type: DataTypes.DATE, allowNull: true },
    deleted_at: { type: DataTypes.DATE, allowNull: true }
  },
  {
    sequelize,
    modelName: 'Document',
    tableName: 'documents',
    timestamps: false,
    paranoid: false
  }
);

export default Document;
