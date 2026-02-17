import { Product } from './product.model';
import RefreshToken from './RefreshToken.model';
import { User } from './user.model';

// This function must be called AFTER all models are imported
export const setupAssociations = () => {
  console.log('🔗 Setting up associations...');
  
  // User has many RefreshTokens
  User.hasMany(RefreshToken, {
    foreignKey: 'user_id',
    as: 'refreshTokens',
    onDelete: 'CASCADE'
  });

  // RefreshToken belongs to User
  RefreshToken.belongsTo(User, {
    foreignKey: 'user_id',
    as: 'user'
  });

  // User - Product (Supplier)
  User.hasMany(Product, {
    foreignKey: 'supplier_id',
    as: 'products',
    onDelete: 'CASCADE'
  });
  Product.belongsTo(User, {
    foreignKey: 'supplier_id',
    as: 'supplier'
  });

  console.log('✅ Associations defined successfully');
};