// pages/factory/Agents.tsx

import React, { useState, useEffect } from "react";
import {
  Search,
  Filter,
  Plus,
  Star,
  AlertCircle,
  ChevronDown,
  Download,
  Upload,
  MoreVertical,
  Clock,
  MapPin,
  FileText,
  TrendingUp,
} from "lucide-react";

interface Agent {
  id: string;
  businessName: string;
  contactPerson: string;
  email: string;
  phone: string;
  territory: string;
  contractNumber: string;
  contractStart: string;
  contractEnd: string;
  contractDocument: string;
  earlyAccessDays: number;
  priorityLevel: 1 | 2 | 3 | 4 | 5;
  specialDiscount: number;
  commissionRate: number;
  paymentTerms: string;
  status: "active" | "inactive" | "pending" | "expired";
  performance: {
    lastOrder: string;
    orderCount: number;
    totalValue: number;
    fulfillmentRate: number;
    rating: number;
  };
}

interface EarlyAccessProduct {
  id: string;
  name: string;
  category: string;
  releaseDate: string;
  image: string;
  agentPrice: number;
  regularPrice: number;
}

const AgentsPage: React.FC = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showContractModal, setShowContractModal] = useState(false);
  const [earlyAccessProducts, setEarlyAccessProducts] = useState<
    EarlyAccessProduct[]
  >([
    {
      id: "1",
      name: "Premium Soda",
      category: "Beverages",
      releaseDate: "2025-12-15",
      image: "/products/soda.jpg",
      agentPrice: 45.0,
      regularPrice: 55.0,
    },
    {
      id: "2",
      name: "Energy Drink",
      category: "Beverages",
      releaseDate: "2025-12-20",
      image: "/products/energy.jpg",
      agentPrice: 38.0,
      regularPrice: 48.0,
    },
  ]);

  // Mock data - replace with API call
  useEffect(() => {
    const fetchAgents = async () => {
      try {
        // Simulate API call
        setTimeout(() => {
          setAgents(mockAgents);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error("Error fetching agents:", error);
        setLoading(false);
      }
    };
    fetchAgents();
  }, []);

  const filteredAgents = agents.filter((agent) => {
    const matchesSearch =
      agent.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.territory.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || agent.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const expiringAgents = agents.filter((agent) => {
    const daysUntilExpiry = Math.ceil(
      (new Date(agent.contractEnd).getTime() - new Date().getTime()) /
        (1000 * 3600 * 24),
    );
    return (
      daysUntilExpiry <= 30 && daysUntilExpiry > 0 && agent.status === "active"
    );
  });

  const handleAddAgent = () => {
    setShowAddModal(true);
  };

  const handleViewContract = (agent: Agent) => {
    setSelectedAgent(agent);
    setShowContractModal(true);
  };

  const handleRenewContract = async (agentId: string) => {
    try {
      // API call to renew contract
      console.log("Renewing contract for agent:", agentId);
      // Update local state
    } catch (error) {
      console.error("Error renewing contract:", error);
    }
  };

  const handleGrantEarlyAccess = async (productId: string) => {
    try {
      // API call to grant early access
      console.log("Granting early access for product:", productId);
    } catch (error) {
      console.error("Error granting early access:", error);
    }
  };

  const getStatusBadge = (status: Agent["status"]) => {
    const styles = {
      active: "bg-green-100 text-green-800",
      inactive: "bg-gray-100 text-gray-800",
      pending: "bg-yellow-100 text-yellow-800",
      expired: "bg-red-100 text-red-800",
    };
    return styles[status];
  };

  const getPriorityBadge = (level: number) => {
    const colors = [
      "bg-purple-600",
      "bg-blue-600",
      "bg-indigo-600",
      "bg-gray-600",
      "bg-gray-400",
    ];
    return (
      <span
        className={`${colors[level - 1]} text-white text-xs px-2 py-1 rounded-full`}
      >
        P{level}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-2">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Agents Management
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Manage your contracted distributors and their privileges
          </p>
        </div>
        <button
          onClick={handleAddAgent}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add New Agent
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <p className="text-sm text-gray-600">Total Agents</p>
          <p className="text-2xl font-bold">{agents.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <p className="text-sm text-gray-600">Active Contracts</p>
          <p className="text-2xl font-bold">
            {agents.filter((a) => a.status === "active").length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-yellow-200">
          <p className="text-sm text-gray-600">Expiring Soon</p>
          <p className="text-2xl font-bold text-yellow-600">
            {expiringAgents.length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <p className="text-sm text-gray-600">Avg. Performance</p>
          <p className="text-2xl font-bold">94%</p>
        </div>
      </div>

      {/* Expiring Soon Alert */}
      {expiringAgents.length > 0 && (
        <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-yellow-400 mr-2" />
            <p className="text-sm text-yellow-700">
              {expiringAgents.length} agent contract(s) expiring within 30 days
            </p>
          </div>
        </div>
      )}

      {/* Search and Filter */}
      <div className="bg-white p-4 rounded-lg shadow-sm border mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search agents by name or territory..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <select
              className="px-4 py-2 border rounded-lg"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="expired">Expired</option>
              <option value="inactive">Inactive</option>
            </select>
            <button className="px-4 py-2 border rounded-lg flex items-center">
              <Filter className="w-4 h-4 mr-2" />
              More Filters
            </button>
            <button className="px-4 py-2 border rounded-lg">
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Agents List */}
      <div className="bg-white rounded-lg shadow-sm border mb-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Agent
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Territory
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Contract
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Privileges
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Performance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredAgents.map((agent) => (
                <tr key={agent.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                        <Star className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">{agent.businessName}</p>
                        <p className="text-sm text-gray-600">
                          {agent.contactPerson}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 text-gray-400 mr-1" />
                      <span>{agent.territory}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-medium">
                        {agent.contractNumber}
                      </p>
                      <p className="text-xs text-gray-600">
                        Until:{" "}
                        {new Date(agent.contractEnd).toLocaleDateString()}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      {getPriorityBadge(agent.priorityLevel)}
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                        EA+{agent.earlyAccessDays}
                      </span>
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                        {agent.specialDiscount}% off
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="flex items-center mb-1">
                        <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                        <span className="text-sm font-medium">
                          {agent.performance.fulfillmentRate}%
                        </span>
                      </div>
                      <p className="text-xs text-gray-600">
                        {agent.performance.orderCount} orders
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${getStatusBadge(agent.status)}`}
                    >
                      {agent.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleViewContract(agent)}
                        className="p-1 hover:bg-gray-100 rounded"
                        title="View Contract"
                      >
                        <FileText className="w-4 h-4 text-gray-600" />
                      </button>
                      <button
                        onClick={() => handleRenewContract(agent.id)}
                        className="p-1 hover:bg-gray-100 rounded"
                        title="Renew Contract"
                      >
                        <Clock className="w-4 h-4 text-gray-600" />
                      </button>
                      <button className="p-1 hover:bg-gray-100 rounded">
                        <MoreVertical className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Early Access Products Section */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Early Access Products</h2>
          <button className="text-blue-600 text-sm hover:underline">
            Manage All
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {earlyAccessProducts.map((product) => (
            <div key={product.id} className="border rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium">{product.name}</h3>
                  <p className="text-sm text-gray-600">{product.category}</p>
                </div>
                <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">
                  Early Access
                </span>
              </div>
              <div className="mt-3">
                <p className="text-sm">
                  Release: {new Date(product.releaseDate).toLocaleDateString()}
                </p>
                <div className="flex items-center mt-2">
                  <span className="text-lg font-bold text-blue-600">
                    ETB {product.agentPrice}
                  </span>
                  <span className="text-sm text-gray-400 line-through ml-2">
                    ETB {product.regularPrice}
                  </span>
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <button className="flex-1 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">
                  Grant Access
                </button>
                <button className="px-3 py-1 border rounded text-sm hover:bg-gray-50">
                  Edit
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Agent Modal */}
      {showAddModal && <AddAgentModal onClose={() => setShowAddModal(false)} />}

      {/* View Contract Modal */}
      {showContractModal && selectedAgent && (
        <ContractModal
          agent={selectedAgent}
          onClose={() => setShowContractModal(false)}
        />
      )}
    </div>
  );
};

// Add Agent Modal Component
const AddAgentModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [formData, setFormData] = useState({
    businessName: "",
    contactPerson: "",
    email: "",
    phone: "",
    territory: "",
    contractNumber: "",
    contractStart: "",
    contractEnd: "",
    earlyAccessDays: 7,
    priorityLevel: 3,
    specialDiscount: 5,
    paymentTerms: "Net 30",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // API call to add agent
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold">Add New Agent</h2>
        </div>
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">
                Business Name
              </label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 border rounded-lg"
                value={formData.businessName}
                onChange={(e) =>
                  setFormData({ ...formData, businessName: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Contact Person
              </label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 border rounded-lg"
                value={formData.contactPerson}
                onChange={(e) =>
                  setFormData({ ...formData, contactPerson: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                required
                className="w-full px-3 py-2 border rounded-lg"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Phone</label>
              <input
                type="tel"
                required
                className="w-full px-3 py-2 border rounded-lg"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Territory
              </label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 border rounded-lg"
                value={formData.territory}
                onChange={(e) =>
                  setFormData({ ...formData, territory: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Contract Number
              </label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 border rounded-lg"
                value={formData.contractNumber}
                onChange={(e) =>
                  setFormData({ ...formData, contractNumber: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Contract Start
              </label>
              <input
                type="date"
                required
                className="w-full px-3 py-2 border rounded-lg"
                value={formData.contractStart}
                onChange={(e) =>
                  setFormData({ ...formData, contractStart: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Contract End
              </label>
              <input
                type="date"
                required
                className="w-full px-3 py-2 border rounded-lg"
                value={formData.contractEnd}
                onChange={(e) =>
                  setFormData({ ...formData, contractEnd: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Contract Document
              </label>
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Early Access (Days)
              </label>
              <input
                type="number"
                min="0"
                max="30"
                className="w-full px-3 py-2 border rounded-lg"
                value={formData.earlyAccessDays}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    earlyAccessDays: parseInt(e.target.value),
                  })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Priority Level
              </label>
              <select
                className="w-full px-3 py-2 border rounded-lg"
                value={formData.priorityLevel}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    priorityLevel: parseInt(e.target.value) as
                      | 1
                      | 2
                      | 3
                      | 4
                      | 5,
                  })
                }
              >
                <option value="1">Level 1 (Highest)</option>
                <option value="2">Level 2</option>
                <option value="3">Level 3</option>
                <option value="4">Level 4</option>
                <option value="5">Level 5</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Special Discount (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                className="w-full px-3 py-2 border rounded-lg"
                value={formData.specialDiscount}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    specialDiscount: parseInt(e.target.value),
                  })
                }
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">
                Payment Terms
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border rounded-lg"
                value={formData.paymentTerms}
                onChange={(e) =>
                  setFormData({ ...formData, paymentTerms: e.target.value })
                }
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Add Agent
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Contract Modal Component
const ContractModal: React.FC<{ agent: Agent; onClose: () => void }> = ({
  agent,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold">
            Contract Details - {agent.businessName}
          </h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Contract Number</p>
                <p className="font-medium">{agent.contractNumber}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <span
                  className={`px-2 py-1 text-xs rounded-full ${getStatusBadge(agent.status)}`}
                >
                  {agent.status}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Start Date</p>
                <p>{new Date(agent.contractStart).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">End Date</p>
                <p>{new Date(agent.contractEnd).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Territory</p>
                <p>{agent.territory}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Payment Terms</p>
                <p>{agent.paymentTerms}</p>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-medium mb-2">Privileges</h3>
              <div className="flex flex-wrap gap-2">
                <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
                  Priority Level {agent.priorityLevel}
                </span>
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                  Early Access: {agent.earlyAccessDays} days
                </span>
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                  {agent.specialDiscount}% Special Discount
                </span>
                <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm">
                  Commission: {agent.commissionRate}%
                </span>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-medium mb-2">Contract Document</h3>
              <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                <FileText className="w-5 h-5 text-gray-600 mr-2" />
                <span className="flex-1">
                  signed_contract_{agent.contractNumber}.pdf
                </span>
                <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-medium mb-2">Performance Summary</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-gray-50 rounded">
                  <p className="text-sm text-gray-600">Orders</p>
                  <p className="text-xl font-bold">
                    {agent.performance.orderCount}
                  </p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded">
                  <p className="text-sm text-gray-600">Total Value</p>
                  <p className="text-xl font-bold">
                    ETB {agent.performance.totalValue.toLocaleString()}
                  </p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded">
                  <p className="text-sm text-gray-600">Fulfillment</p>
                  <p className="text-xl font-bold">
                    {agent.performance.fulfillmentRate}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="p-6 border-t flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-lg hover:bg-gray-50"
          >
            Close
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Renew Contract
          </button>
        </div>
      </div>
    </div>
  );
};

// Mock data
const mockAgents: Agent[] = [
  {
    id: "1",
    businessName: "ABC Trading PLC",
    contactPerson: "Tesfaye Alemu",
    email: "tesfaye@abctrading.com",
    phone: "+251911234567",
    territory: "Addis Ababa",
    contractNumber: "CT-2025-001",
    contractStart: "2025-01-01",
    contractEnd: "2025-12-31",
    contractDocument: "/contracts/ct-2025-001.pdf",
    earlyAccessDays: 7,
    priorityLevel: 1,
    specialDiscount: 10,
    commissionRate: 5,
    paymentTerms: "Net 30",
    status: "active",
    performance: {
      lastOrder: "2025-03-10",
      orderCount: 45,
      totalValue: 1250000,
      fulfillmentRate: 98,
      rating: 4.8,
    },
  },
  {
    id: "2",
    businessName: "XYZ Distributors",
    contactPerson: "Sara Hailu",
    email: "sara@xyzdist.com",
    phone: "+251922345678",
    territory: "Oromia",
    contractNumber: "CT-2025-002",
    contractStart: "2025-02-01",
    contractEnd: "2025-09-30",
    contractDocument: "/contracts/ct-2025-002.pdf",
    earlyAccessDays: 5,
    priorityLevel: 2,
    specialDiscount: 7,
    commissionRate: 4,
    paymentTerms: "Net 15",
    status: "active",
    performance: {
      lastOrder: "2025-03-12",
      orderCount: 32,
      totalValue: 890000,
      fulfillmentRate: 95,
      rating: 4.5,
    },
  },
  {
    id: "3",
    businessName: "Fresh Supply",
    contactPerson: "Abebe Kebede",
    email: "abebe@freshsupply.com",
    phone: "+251933456789",
    territory: "Dire Dawa",
    contractNumber: "CT-2024-089",
    contractStart: "2024-06-01",
    contractEnd: "2025-03-28",
    contractDocument: "/contracts/ct-2024-089.pdf",
    earlyAccessDays: 3,
    priorityLevel: 3,
    specialDiscount: 5,
    commissionRate: 3,
    paymentTerms: "Net 7",
    status: "active",
    performance: {
      lastOrder: "2025-03-11",
      orderCount: 28,
      totalValue: 450000,
      fulfillmentRate: 92,
      rating: 4.2,
    },
  },
];

// Helper function (duplicated from component for modal use)
const getStatusBadge = (status: Agent["status"]) => {
  const styles = {
    active: "bg-green-100 text-green-800",
    inactive: "bg-gray-100 text-gray-800",
    pending: "bg-yellow-100 text-yellow-800",
    expired: "bg-red-100 text-red-800",
  };
  return styles[status];
};

export default AgentsPage;
