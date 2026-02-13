import React, { useState } from "react";
import { Partnerships } from "@/components/shared/Partnerships";
import { Store } from "lucide-react";

// Define proper types for agents
interface FactoryAgent {
  id: number;
  name: string;
  type: "agent";
  category: string[];
  location: string;
  region: string;
  established: string;
  verified: boolean;
  tier: "new" | "silver" | "gold" | "platinum" | "bronze"; // Allow all tier types
  rating: number;
  totalOrders: number;
  totalValue: number;
  avgOrderValue: number;
  onTimeDelivery: number;
  qualityRating: number;
  communicationRating: number;
  responseTime: string;
  leadTime: string;
  paymentTerms: string;
  creditLimit: number;
  creditUsed: number;
  contractStart: string;
  contractEnd?: string;
  contractStatus: "active" | "expiring" | "expired" | "negotiating" | "pending";
  categories: string[];
  contactPerson: string;
  contactPhone: string;
  contactEmail: string;
  lastOrderDate: string;
  nextDeliveryDate?: string;
  issues?: number;
  notes?: string;
  agentId: number;
  agentName: string;
  agentRegion: string;
  agentStatus: "active" | "inactive" | "pending";
}

// Mock data for factory's distributors
const distributorPartners = [
  {
    id: 101,
    name: "Adama Wholesalers",
    type: "distributor" as const,
    category: ["Groceries", "Beverages", "Construction"],
    location: "Adama",
    region: "Oromia",
    established: "2018",
    verified: true,
    tier: "platinum" as const,
    rating: 4.8,
    totalOrders: 156,
    totalValue: 4250000,
    avgOrderValue: 27244,
    onTimeDelivery: 98.2,
    qualityRating: 4.7,
    communicationRating: 4.9,
    responseTime: "< 1 hour",
    leadTime: "2-3 days",
    paymentTerms: "Net 30",
    creditLimit: 2000000,
    creditUsed: 850000,
    contractStart: "2024-01-01",
    contractEnd: "2026-12-31",
    contractStatus: "active" as const,
    products: 45,
    categories: ["Groceries", "Beverages", "Construction"],
    contactPerson: "Abebe Kebede",
    contactPhone: "+251 22 456 7890",
    contactEmail: "abebe@adama-wholesalers.com",
    lastOrderDate: "2026-02-10",
    nextDeliveryDate: "2026-02-18",
    issues: 0,
  },
  {
    id: 102,
    name: "Mekelle Distributors",
    type: "distributor" as const,
    category: ["Construction", "Steel"],
    location: "Mekelle",
    region: "Tigray",
    established: "2019",
    verified: true,
    tier: "gold" as const,
    rating: 4.6,
    totalOrders: 98,
    totalValue: 2150000,
    avgOrderValue: 21939,
    onTimeDelivery: 97.1,
    qualityRating: 4.5,
    communicationRating: 4.6,
    responseTime: "< 2 hours",
    leadTime: "4-6 days",
    paymentTerms: "Net 30",
    creditLimit: 1000000,
    creditUsed: 450000,
    contractStart: "2024-03-15",
    contractEnd: "2026-03-14",
    contractStatus: "active" as const,
    products: 28,
    categories: ["Construction", "Steel"],
    contactPerson: "Mulugeta Assefa",
    contactPhone: "+251 34 567 8901",
    contactEmail: "mulugeta@mekelle-dist.com",
    lastOrderDate: "2026-02-08",
    issues: 0,
  },
];

// Mock agents for factory - use consistent types
const factoryAgents: FactoryAgent[] = [
  {
    id: 1001,
    name: "Tesfaye Mulugeta",
    type: "agent",
    category: ["Sales"],
    location: "Addis Ababa",
    region: "Central",
    established: "2025",
    verified: true,
    tier: "new",
    rating: 0,
    totalOrders: 12,
    totalValue: 350000,
    avgOrderValue: 29167,
    onTimeDelivery: 100,
    qualityRating: 0,
    communicationRating: 4.5,
    responseTime: "< 30 minutes",
    leadTime: "N/A",
    paymentTerms: "Commission",
    creditLimit: 0,
    creditUsed: 0,
    contractStart: "2025-01-15",
    contractEnd: undefined,
    contractStatus: "pending",
    categories: ["All Products"],
    contactPerson: "Tesfaye Mulugeta",
    contactPhone: "+251 91 234 5678",
    contactEmail: "tesfaye.m@mugher.com",
    lastOrderDate: "2026-02-05",
    agentId: 1001,
    agentName: "Tesfaye Mulugeta",
    agentRegion: "Addis Ababa",
    agentStatus: "pending",
    issues: 0,
  },
  {
    id: 1002,
    name: "Hirut Desta",
    type: "agent",
    category: ["Sales"],
    location: "Adama",
    region: "Oromia",
    established: "2024",
    verified: true,
    tier: "silver",
    rating: 4.5,
    totalOrders: 45,
    totalValue: 1250000,
    avgOrderValue: 27778,
    onTimeDelivery: 97.5,
    qualityRating: 4.3,
    communicationRating: 4.8,
    responseTime: "< 1 hour",
    leadTime: "N/A",
    paymentTerms: "Commission",
    creditLimit: 0,
    creditUsed: 0,
    contractStart: "2024-06-01",
    contractEnd: "2026-05-31",
    contractStatus: "active",
    categories: ["All Products"],
    contactPerson: "Hirut Desta",
    contactPhone: "+251 92 345 6789",
    contactEmail: "hirut.d@mugher.com",
    lastOrderDate: "2026-02-09",
    agentId: 1002,
    agentName: "Hirut Desta",
    agentRegion: "Adama",
    agentStatus: "active",
    issues: 0,
  },
];

const FactoryDistributorPartnersPage: React.FC = () => {
  const [agents, setAgents] = useState<FactoryAgent[]>(factoryAgents);

  const handleApproveAgent = (agentId: number) => {
    setAgents((prev) =>
      prev.map((agent) =>
        agent.id === agentId
          ? {
              ...agent,
              agentStatus: "active" as const,
              contractStatus: "active" as const,
              tier: agent.tier, // Keep the original tier
            }
          : agent,
      ),
    );
  };

  const handleRejectAgent = (agentId: number) => {
    setAgents((prev) =>
      prev.map((agent) =>
        agent.id === agentId
          ? {
              ...agent,
              agentStatus: "inactive" as const,
              contractStatus: "expired" as const,
              tier: agent.tier, // Keep the original tier
            }
          : agent,
      ),
    );
  };

  return (
    <Partnerships
      config={{
        role: "factory",
        title: "Distributor Partners",
        description:
          "Manage your distributor relationships, sales agents, and performance",
        partnerType: "Distributor",
        partnerPath: "/distributors",
        icon: Store,
        showAgents: true,
        showCredit: true,
        showContracts: true,
      }}
      partners={distributorPartners}
      agents={agents}
      onAddPartner={() => console.log("Add distributor")}
      onEditPartner={(id) => console.log("Edit", id)}
      onViewPartner={(id) => console.log("View", id)}
      onContactPartner={(id) => console.log("Contact", id)}
      onApproveAgent={handleApproveAgent}
      onRejectAgent={handleRejectAgent}
    />
  );
};

export default FactoryDistributorPartnersPage;
