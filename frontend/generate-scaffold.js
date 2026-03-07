const fs = require('fs');
const path = require('path');
const resources = [
    'address', 'audit-log', 'cart', 'delivery', 'dispute',
    'document', 'driver-location', 'factory-agent', 'feedback',
    'inventory-movement', 'login-attempt', 'message', 'payment',
    'promotion', 'supplier-payment-method'
];

const servicesDir = path.join(__dirname, 'src', 'services');
const storesDir = path.join(__dirname, 'src', 'stores');

const toCamelCase = (str) => {
    return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
};

// Helper to convert kebab-case to PascalCase
const toPascalCase = (str) => {
    const camel = toCamelCase(str);
    return camel.charAt(0).toUpperCase() + camel.slice(1);
};

const generateServiceContent = (resource) => {
    const PascalCase = toPascalCase(resource);
    return `import api from './api';

class ${PascalCase}Service {
  async getAll(params?: any) {
    const response = await api.get('/${resource}s', { params });
    return response.data;
  }

  async getById(id: string) {
    const response = await api.get(\`/${resource}s/\${id}\`);
    return response.data;
  }

  async create(data: any) {
    const response = await api.post('/${resource}s', data);
    return response.data;
  }

  async update(id: string, data: any) {
    const response = await api.put(\`/${resource}s/\${id}\`, data);
    return response.data;
  }

  async delete(id: string) {
    const response = await api.delete(\`/${resource}s/\${id}\`);
    return response.data;
  }
}

export default new ${PascalCase}Service();
`;
};

const generateStoreContent = (resource) => {
    const camelCase = toCamelCase(resource);
    const PascalCase = toPascalCase(resource);
    return `import { create } from 'zustand';
import ${camelCase}Service from '@/services/${resource}.service';

interface ${PascalCase}State {
  items: any[];
  currentItem: any | null;
  isLoading: boolean;
  error: string | null;
  
  fetchAll: (params?: any) => Promise<void>;
  fetchById: (id: string) => Promise<any | null>;
  create: (data: any) => Promise<any | null>;
  update: (id: string, data: any) => Promise<any | null>;
  delete: (id: string) => Promise<boolean>;
  clearError: () => void;
}

export const use${PascalCase}Store = create<${PascalCase}State>((set, get) => ({
  items: [],
  currentItem: null,
  isLoading: false,
  error: null,

  fetchAll: async (params?: any) => {
    set({ isLoading: true, error: null });
    try {
      const response = await ${camelCase}Service.getAll(params);
      set({ items: response.data || response, isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to fetch items',
        isLoading: false,
      });
    }
  },

  fetchById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await ${camelCase}Service.getById(id);
      set({ currentItem: response.data || response, isLoading: false });
      return response.data || response;
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to fetch item',
        isLoading: false,
      });
      return null;
    }
  },

  create: async (data: any) => {
    set({ isLoading: true, error: null });
    try {
      const response = await ${camelCase}Service.create(data);
      // Optional: Refresh list
      // await get().fetchAll();
      set({ isLoading: false });
      return response.data || response;
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to create item',
        isLoading: false,
      });
      return null;
    }
  },

  update: async (id: string, data: any) => {
    set({ isLoading: true, error: null });
    try {
      const response = await ${camelCase}Service.update(id, data);
      
      const items = get().items.map(p => 
        p.id === id ? (response.data || response) : p
      );
      
      set({ items, currentItem: response.data || response, isLoading: false });
      return response.data || response;
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to update item',
        isLoading: false,
      });
      return null;
    }
  },

  delete: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await ${camelCase}Service.delete(id);
      
      const items = get().items.filter(p => p.id !== id);
      set({ items, isLoading: false });
      return true;
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to delete item',
        isLoading: false,
      });
      return false;
    }
  },

  clearError: () => set({ error: null }),
}));
`;
};

// Ensure directories exist
if (!fs.existsSync(servicesDir)) fs.mkdirSync(servicesDir, { recursive: true });
if (!fs.existsSync(storesDir)) fs.mkdirSync(storesDir, { recursive: true });

resources.forEach(resource => {
    const serviceFile = path.join(servicesDir, `${resource}.service.ts`);
    const storeFile = path.join(storesDir, `${resource}.store.ts`);

    if (!fs.existsSync(serviceFile)) {
        fs.writeFileSync(serviceFile, generateServiceContent(resource));
        console.log(`Created ${serviceFile}`);
    } else {
        console.log(`Skipping ${serviceFile} (already exists)`);
    }

    if (!fs.existsSync(storeFile)) {
        fs.writeFileSync(storeFile, generateStoreContent(resource));
        console.log(`Created ${storeFile}`);
    } else {
        console.log(`Skipping ${storeFile} (already exists)`);
    }
});

console.log('Done generating boilerplate files!');
