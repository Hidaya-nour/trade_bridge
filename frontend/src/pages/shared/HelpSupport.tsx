import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  HelpCircle,
  Search,
  FileText,
  MessageSquare,
  Phone,
  Mail,
  ChevronRight,
  ExternalLink,
  PlayCircle,
  BookOpen,
  Users,
  Shield,
  CreditCard,
  Truck,
  Package,
  Store,
  Star,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Clock,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
  SelectItem,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

// FAQ categories
const faqCategories = [
  { id: "all", name: "All Questions", icon: HelpCircle },
  { id: "orders", name: "Orders & Payments", icon: Package },
  { id: "shipping", name: "Shipping & Delivery", icon: Truck },
  { id: "suppliers", name: "Suppliers & Products", icon: Store },
  { id: "account", name: "Account & Security", icon: Shield },
  { id: "returns", name: "Returns & Refunds", icon: Clock },
];

// FAQ items
const faqItems = [
  {
    id: "1",
    category: "orders",
    question: "How do I place a bulk order?",
    answer:
      "To place a bulk order, browse products, add items to your cart, specify quantities above the minimum order amount, and proceed to checkout. You can order from multiple suppliers in one checkout process.",
  },
  {
    id: "2",
    category: "orders",
    question: "What payment methods are accepted?",
    answer:
      "We accept Cash on Delivery, Credit (30-day terms for verified businesses), Cheque, Mobile Banking (Telebirr, M-Pesa), and Online Payments via Chapa. Credit terms are available based on your order history and verification status.",
  },
  {
    id: "3",
    category: "orders",
    question: "How do I track my order?",
    answer:
      "You can track your order from the 'My Orders' page. Click on any order to see its current status, tracking number, and estimated delivery date. Shipped orders include real-time tracking updates.",
  },
  {
    id: "4",
    category: "shipping",
    question: "What are the shipping costs?",
    answer:
      "Shipping costs vary by supplier, distance, and order size. Each product displays the shipping cost before checkout. Some suppliers offer free shipping for orders above certain thresholds.",
  },
  {
    id: "5",
    category: "shipping",
    question: "How long does delivery take?",
    answer:
      "Delivery times depend on the supplier's location and your delivery address. Typical delivery times range from 1-5 business days within Ethiopia. You'll see estimated delivery dates at checkout.",
  },
  {
    id: "6",
    category: "suppliers",
    question: "How are suppliers verified?",
    answer:
      "Suppliers go through a verification process including business license verification, TIN validation, and physical address confirmation. Verified suppliers display a ✓ badge on their profile and products.",
  },
  {
    id: "7",
    category: "suppliers",
    question: "How does the supplier recommendation work?",
    answer:
      "Our ML-powered recommendation system analyzes your order history, preferences, and supplier performance metrics (price, delivery time, quality rating) to suggest the best suppliers for your needs.",
  },
  {
    id: "8",
    category: "account",
    question: "How do I reset my password?",
    answer:
      "Click 'Forgot Password' on the login page. Enter your registered email address, and we'll send you a password reset link. The link expires in 24 hours.",
  },
  {
    id: "9",
    category: "account",
    question: "How do I update my business information?",
    answer:
      "Go to Settings → Business Info. You can update your business name, address, TIN number, and other details. Changes to verification information may require re-verification.",
  },
  {
    id: "10",
    category: "returns",
    question: "What is your return policy?",
    answer:
      "Returns are accepted within 7 days of delivery for defective or incorrect items. Contact the supplier directly through our messaging system to initiate a return. Refunds are processed within 5-7 business days.",
  },
  {
    id: "11",
    category: "returns",
    question: "How do I get a refund?",
    answer:
      "Once your return is approved by the supplier, refunds are processed to your original payment method. Credit payments are refunded as credit to your account. Cash on Delivery refunds are processed via mobile banking.",
  },
];

// Guide categories
const guides = [
  {
    id: 1,
    title: "Getting Started with TradeBridge",
    description: "Learn the basics of buying on TradeBridge",
    category: "Beginner",
    readTime: "5 min",
    icon: PlayCircle,
  },
  {
    id: 2,
    title: "How to Compare Suppliers",
    description: "Use our comparison tool to find the best supplier",
    category: "Features",
    readTime: "3 min",
    icon: TrendingUp,
  },
  {
    id: 3,
    title: "Understanding Credit Terms",
    description: "How credit works for verified businesses",
    category: "Payments",
    readTime: "4 min",
    icon: CreditCard,
  },
  {
    id: 4,
    title: "Writing Effective Reviews",
    description: "Help other buyers with your feedback",
    category: "Community",
    readTime: "2 min",
    icon: Star,
  },
];

const HelpSupportPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const filteredFaqs = faqItems.filter((faq) => {
    if (selectedCategory !== "all" && faq.category !== selectedCategory)
      return false;
    if (searchQuery) {
      return (
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return true;
  });

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log("Contact form submitted:", contactForm);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto">
        <div className="flex justify-center mb-4">
          <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center">
            <HelpCircle className="h-8 w-8 text-primary" />
          </div>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">
          How can we help you?
        </h1>
        <p className="text-muted-foreground mt-2">
          Search our help center, browse guides, or contact our support team
        </p>
      </div>

      {/* Search Bar */}
      <Card className="max-w-2xl mx-auto">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search for answers, guides, or topics..."
              className="pl-10 py-6 text-lg"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Quick Links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6 text-center">
            <MessageSquare className="h-8 w-8 mx-auto mb-3 text-primary" />
            <h3 className="font-semibold">Live Chat</h3>
            <p className="text-xs text-muted-foreground mt-1">24/7 Support</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6 text-center">
            <Phone className="h-8 w-8 mx-auto mb-3 text-primary" />
            <h3 className="font-semibold">Call Us</h3>
            <p className="text-xs text-muted-foreground mt-1">
              +251 11 123 4567
            </p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6 text-center">
            <Mail className="h-8 w-8 mx-auto mb-3 text-primary" />
            <h3 className="font-semibold">Email</h3>
            <p className="text-xs text-muted-foreground mt-1">
              support@tradebridge.com
            </p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6 text-center">
            <FileText className="h-8 w-8 mx-auto mb-3 text-primary" />
            <h3 className="font-semibold">Documentation</h3>
            <p className="text-xs text-muted-foreground mt-1">User Guides</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="faq" className="w-full">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="faq">FAQ</TabsTrigger>
          <TabsTrigger value="guides">Guides & Tutorials</TabsTrigger>
          <TabsTrigger value="contact">Contact Support</TabsTrigger>
        </TabsList>

        {/* FAQ Tab */}
        <TabsContent value="faq" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Categories Sidebar */}
            <Card className="md:col-span-1">
              <CardContent className="p-4">
                <div className="space-y-1">
                  {faqCategories.map((category) => {
                    const Icon = category.icon;
                    return (
                      <Button
                        key={category.id}
                        variant={
                          selectedCategory === category.id
                            ? "secondary"
                            : "ghost"
                        }
                        className="w-full justify-start"
                        onClick={() => setSelectedCategory(category.id)}
                      >
                        <Icon className="h-4 w-4 mr-2" />
                        {category.name}
                      </Button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* FAQ Items */}
            <Card className="md:col-span-3">
              <CardHeader>
                <CardTitle>
                  {faqCategories.find((c) => c.id === selectedCategory)?.name ||
                    "Frequently Asked Questions"}
                </CardTitle>
                <CardDescription>
                  {filteredFaqs.length} answers found
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px] pr-4">
                  <Accordion type="single" collapsible className="w-full">
                    {filteredFaqs.map((faq) => (
                      <AccordionItem key={faq.id} value={faq.id}>
                        <AccordionTrigger className="text-left">
                          {faq.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground">
                          {faq.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Guides Tab */}
        <TabsContent value="guides" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {guides.map((guide) => {
              const Icon = guide.icon;
              return (
                <Card
                  key={guide.id}
                  className="hover:shadow-lg transition-shadow"
                >
                  <CardContent className="p-6">
                    <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-2">{guide.title}</h3>
                    <p className="text-xs text-muted-foreground mb-4">
                      {guide.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">{guide.category}</Badge>
                      <span className="text-xs text-muted-foreground">
                        {guide.readTime} read
                      </span>
                    </div>
                    <Button variant="link" className="mt-4 p-0 h-auto">
                      Read Guide
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <BookOpen className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">TradeBridge Documentation</h3>
                    <p className="text-sm text-muted-foreground">
                      Access our complete user documentation and API guides
                    </p>
                  </div>
                </div>
                <Button variant="outline">
                  View All Guides
                  <ExternalLink className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contact Support Tab */}
        <TabsContent value="contact" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Contact Form */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Send us a message</CardTitle>
                <CardDescription>
                  Fill out the form below and we'll get back to you within 24
                  hours
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        placeholder="Enter your name"
                        value={contactForm.name}
                        onChange={(e) =>
                          setContactForm({
                            ...contactForm,
                            name: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        value={contactForm.email}
                        onChange={(e) =>
                          setContactForm({
                            ...contactForm,
                            email: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Select
                      value={contactForm.subject}
                      onValueChange={(value) =>
                        setContactForm({ ...contactForm, subject: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a topic" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="order">Order Issue</SelectItem>
                        <SelectItem value="payment">Payment Problem</SelectItem>
                        <SelectItem value="shipping">
                          Shipping & Delivery
                        </SelectItem>
                        <SelectItem value="account">
                          Account & Security
                        </SelectItem>
                        <SelectItem value="supplier">
                          Supplier Question
                        </SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      placeholder="Describe your issue or question in detail..."
                      rows={6}
                      value={contactForm.message}
                      onChange={(e) =>
                        setContactForm({
                          ...contactForm,
                          message: e.target.value,
                        })
                      }
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Submit Request
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Contact Info */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Phone className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Phone Support</p>
                      <p className="text-sm text-muted-foreground">
                        +251 11 123 4567
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Mon-Fri, 8:00 - 17:00
                      </p>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Email Support</p>
                      <p className="text-sm text-muted-foreground">
                        support@tradebridge.com
                      </p>
                      <p className="text-xs text-muted-foreground">
                        24/7 response within 24h
                      </p>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-start gap-3">
                    <MessageSquare className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Live Chat</p>
                      <p className="text-sm text-muted-foreground">
                        Available 24/7
                      </p>
                      <Button variant="link" className="p-0 h-auto text-xs">
                        Start chat
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Support Hours</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Monday - Friday
                      </span>
                      <span className="font-medium">8:00 - 20:00</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Saturday</span>
                      <span className="font-medium">9:00 - 18:00</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Sunday</span>
                      <span className="font-medium">Closed</span>
                    </div>
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                      <p className="text-xs text-blue-700">
                        <AlertCircle className="h-3 w-3 inline mr-1" />
                        Emergency support available 24/7 for payment issues
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HelpSupportPage;
