"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Plus,
  Edit2,
  Trash2,
  Package,
  DollarSign,
  ShoppingCart,
  Users,
  RefreshCw,
  X,
  Search,
  TrendingUp,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getToken, getUser } from "@/lib/store";
import { toast } from "sonner";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface Sweet {
  _id: string;
  name: string;
  category: string;
  price: number;
  quantity: number;
  description?: string;
  image: string;
}

interface Order {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    address?: string;
  };
  items: { name: string; price: number; quantity: number }[];
  totalAmount: number;
  status: string;
  deliveryAddress: string;
  paymentMethod: string;
  createdAt: string;
}

export default function AdminPage() {
  const router = useRouter();
  const [sweets, setSweets] = useState<Sweet[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"sweets" | "orders" | "insights">("sweets");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSweet, setEditingSweet] = useState<Sweet | null>(null);
  const [restockSweet, setRestockSweet] = useState<Sweet | null>(null);
  const [restockQuantity, setRestockQuantity] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const [formData, setFormData] = useState({
    name: "",
    category: "Sweet",
    price: "",
    quantity: "",
    description: "",
    image: "",
  });

  useEffect(() => {
    const user = getUser();
    if (!user || user.role !== "admin") {
      router.push("/auth");
      return;
    }

    fetchData();
  }, [router]);

  const fetchData = async () => {
    try {
      const token = getToken();
      const [sweetsRes, ordersRes] = await Promise.all([
        fetch("/api/sweets"),
        fetch("/api/orders", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (sweetsRes.ok) {
        const sweetsData = await sweetsRes.json();
        setSweets(sweetsData);
      }

      if (ordersRes.ok) {
        const ordersData = await ordersRes.json();
        setOrders(ordersData);
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = getToken();

    try {
      const url = editingSweet
        ? `/api/sweets/${editingSweet._id}`
        : "/api/sweets";
      const method = editingSweet ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          quantity: parseInt(formData.quantity),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save sweet");
      }

      toast.success(editingSweet ? "Sweet updated!" : "Sweet added!");
      setIsModalOpen(false);
      resetForm();
      fetchData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this sweet?")) return;

    const token = getToken();
    try {
      const res = await fetch(`/api/sweets/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete");
      }

      toast.success("Sweet deleted!");
      fetchData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete");
    }
  };

  const handleRestock = async () => {
    if (!restockSweet || !restockQuantity) return;

    const token = getToken();
    try {
      const res = await fetch(`/api/sweets/${restockSweet._id}/restock`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ quantity: parseInt(restockQuantity) }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to restock");
      }

      toast.success("Stock updated!");
      setRestockSweet(null);
      setRestockQuantity("");
      fetchData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to restock");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      category: "Sweet",
      price: "",
      quantity: "",
      description: "",
      image: "",
    });
    setEditingSweet(null);
  };

  const openEditModal = (sweet: Sweet) => {
    setEditingSweet(sweet);
    setFormData({
      name: sweet.name,
      category: sweet.category,
      price: sweet.price.toString(),
      quantity: sweet.quantity.toString(),
      description: sweet.description || "",
      image: sweet.image,
    });
    setIsModalOpen(true);
  };

  const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const totalStock = sweets.reduce((sum, s) => sum + s.quantity, 0);

  const categories = ["All", "Sweet", "Snack", "Namkeen", "Dessert"];

  const filteredSweets = sweets.filter((sweet) => {
    const matchesSearch = 
      sweet.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sweet.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || sweet.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Analytics calculations
  const getMostOrderedItems = () => {
    const itemCounts: { [key: string]: { name: string; quantity: number; revenue: number } } = {};
    
    orders.forEach((order) => {
      order.items.forEach((item) => {
        if (!itemCounts[item.name]) {
          itemCounts[item.name] = { name: item.name, quantity: 0, revenue: 0 };
        }
        itemCounts[item.name].quantity += item.quantity;
        itemCounts[item.name].revenue += item.price * item.quantity;
      });
    });

    return Object.values(itemCounts)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10);
  };

  const getInventoryData = () => {
    return sweets
      .map((sweet) => ({
        name: sweet.name.length > 15 ? sweet.name.substring(0, 15) + '...' : sweet.name,
        stock: sweet.quantity,
        category: sweet.category,
      }))
      .sort((a, b) => b.stock - a.stock)
      .slice(0, 10);
  };

  const getDemandAnalysis = () => {
    const itemData: { [key: string]: { ordered: number; stock: number } } = {};
    
    orders.forEach((order) => {
      order.items.forEach((item) => {
        if (!itemData[item.name]) {
          itemData[item.name] = { ordered: 0, stock: 0 };
        }
        itemData[item.name].ordered += item.quantity;
      });
    });

    sweets.forEach((sweet) => {
      if (!itemData[sweet.name]) {
        itemData[sweet.name] = { ordered: 0, stock: sweet.quantity };
      } else {
        itemData[sweet.name].stock = sweet.quantity;
      }
    });

    return Object.entries(itemData)
      .map(([name, data]) => ({
        name: name.length > 15 ? name.substring(0, 15) + '...' : name,
        ordered: data.ordered,
        stock: data.stock,
        demand: data.ordered > 0 ? (data.ordered / (data.stock + data.ordered)) * 100 : 0,
      }))
      .sort((a, b) => b.demand - a.demand)
      .slice(0, 10);
  };

  const getCategoryDistribution = () => {
    const categoryCounts: { [key: string]: number } = {};
    
    sweets.forEach((sweet) => {
      categoryCounts[sweet.category] = (categoryCounts[sweet.category] || 0) + 1;
    });

    return Object.entries(categoryCounts).map(([name, value]) => ({ name, value }));
  };

  const COLORS = ['#f97316', '#3b82f6', '#10b981', '#8b5cf6', '#ef4444', '#f59e0b'];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pattern-indian">
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="font-display text-xl font-bold text-[#8B4513]">
                Admin Dashboard
              </h1>
              <p className="text-xs text-muted-foreground">Manage your sweets inventory & orders</p>
            </div>
          </div>
          <Button
            onClick={() => {
              resetForm();
              setIsModalOpen(true);
            }}
            className="gradient-saffron"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Sweet
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -5 }}
            className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 shadow-xl text-white"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Package className="w-7 h-7" />
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold">{sweets.length}</p>
              </div>
            </div>
            <p className="text-orange-100 text-sm font-medium">Total Sweets</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            whileHover={{ y: -5 }}
            className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 shadow-xl text-white"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <ShoppingCart className="w-7 h-7" />
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold">{totalStock}</p>
              </div>
            </div>
            <p className="text-blue-100 text-sm font-medium">Total Stock</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            whileHover={{ y: -5 }}
            className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 shadow-xl text-white"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <DollarSign className="w-7 h-7" />
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold">₹{totalRevenue}</p>
              </div>
            </div>
            <p className="text-green-100 text-sm font-medium">Total Revenue</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            whileHover={{ y: -5 }}
            className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 shadow-xl text-white"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Users className="w-7 h-7" />
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold">{orders.length}</p>
              </div>
            </div>
            <p className="text-purple-100 text-sm font-medium">Total Orders</p>
          </motion.div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <Button
            variant={activeTab === "sweets" ? "default" : "outline"}
            onClick={() => setActiveTab("sweets")}
            className={activeTab === "sweets" ? "gradient-saffron" : ""}
          >
            <Package className="w-4 h-4 mr-2" />
            Manage Sweets ({sweets.length})
          </Button>
          <Button
            variant={activeTab === "orders" ? "default" : "outline"}
            onClick={() => setActiveTab("orders")}
            className={activeTab === "orders" ? "gradient-saffron" : ""}
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            View Orders ({orders.length})
          </Button>
          <Button
            variant={activeTab === "insights" ? "default" : "outline"}
            onClick={() => setActiveTab("insights")}
            className={activeTab === "insights" ? "gradient-saffron" : ""}
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            Insights
          </Button>
        </div>

        {activeTab === "sweets" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <div className="bg-white rounded-2xl p-6 shadow-lg border">
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search sweets by name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <Button
                      key={category}
                      variant={selectedCategory === category ? "default" : "outline"}
                      size="sm"
                      className={`rounded-full ${
                        selectedCategory === category
                          ? "gradient-saffron text-white border-none"
                          : ""
                      }`}
                      onClick={() => setSelectedCategory(category)}
                    >
                      {category}
                    </Button>
                  ))}
                </div>
              </div>

              {filteredSweets.length === 0 ? (
                <div className="text-center py-20">
                  <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No sweets found</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredSweets.map((sweet, index) => (
                    <motion.div
                      key={sweet._id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ y: -5 }}
                      className="bg-gradient-to-br from-white to-orange-50/30 rounded-2xl overflow-hidden shadow-lg border-2 border-orange-100 group"
                    >
                      <div className="relative aspect-square overflow-hidden">
                        <Image
                          src={sweet.image}
                          alt={sweet.name}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <Badge
                          className="absolute top-3 left-3 bg-white/90 text-gray-800 backdrop-blur-sm"
                        >
                          {sweet.category}
                        </Badge>
                        <Badge
                          className={`absolute top-3 right-3 ${
                            sweet.quantity === 0
                              ? "bg-red-500"
                              : sweet.quantity < 20
                              ? "bg-yellow-500"
                              : "bg-green-500"
                          }`}
                        >
                          {sweet.quantity} units
                        </Badge>
                      </div>

                      <div className="p-5">
                        <h3 className="font-display text-lg font-bold text-gray-900 mb-2 truncate">
                          {sweet.name}
                        </h3>
                        {sweet.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                            {sweet.description}
                          </p>
                        )}
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-2xl font-bold text-primary">₹{sweet.price}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => {
                              setRestockSweet(sweet);
                              setRestockQuantity("");
                            }}
                            className="h-9 w-9 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300"
                            title="Restock"
                          >
                            <RefreshCw className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => openEditModal(sweet)}
                            className="h-9 w-9 hover:bg-green-50 hover:text-green-600 hover:border-green-300"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleDelete(sweet._id)}
                            className="h-9 w-9 text-red-600 hover:bg-red-50 hover:border-red-300"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === "orders" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            {orders.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl shadow-lg">
                <ShoppingCart className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No orders yet</p>
              </div>
            ) : (
              orders.map((order) => (
                <motion.div
                  key={order._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.01 }}
                  className="bg-white rounded-2xl p-6 shadow-lg border-2 border-orange-100"
                >
                  <div className="flex items-center justify-between mb-6 pb-4 border-b">
                    <div>
                      <p className="font-bold text-xl text-primary">
                        Order #{order._id.slice(-8).toUpperCase()}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <Badge
                      className={`text-sm px-3 py-1 ${
                        order.status === "delivered"
                          ? "bg-green-100 text-green-800"
                          : order.status === "cancelled"
                          ? "bg-red-100 text-red-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {order.status}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="space-y-3">
                      <h3 className="font-bold text-sm uppercase text-muted-foreground">Customer Details</h3>
                      <div className="bg-orange-50/50 rounded-xl p-4 space-y-2">
                        <div className="flex items-start">
                          <Users className="w-4 h-4 mr-2 mt-0.5 text-primary" />
                          <div>
                            <p className="text-xs text-muted-foreground">Name</p>
                            <p className="font-semibold">{order.userId?.name || 'N/A'}</p>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <Package className="w-4 h-4 mr-2 mt-0.5 text-primary" />
                          <div>
                            <p className="text-xs text-muted-foreground">Email</p>
                            <p className="font-medium text-sm">{order.userId?.email || 'N/A'}</p>
                          </div>
                        </div>
                        {order.userId?.phone && (
                          <div className="flex items-start">
                            <ShoppingCart className="w-4 h-4 mr-2 mt-0.5 text-primary" />
                            <div>
                              <p className="text-xs text-muted-foreground">Phone</p>
                              <p className="font-medium">{order.userId.phone}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h3 className="font-bold text-sm uppercase text-muted-foreground">Delivery Details</h3>
                      <div className="bg-blue-50/50 rounded-xl p-4 space-y-2">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Delivery Address</p>
                          <p className="font-medium text-sm">{order.deliveryAddress}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Payment Method</p>
                          <p className="font-semibold">{order.paymentMethod}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="font-bold text-sm uppercase text-muted-foreground">Order Items</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-2 px-3 text-sm font-semibold text-muted-foreground">Item</th>
                            <th className="text-center py-2 px-3 text-sm font-semibold text-muted-foreground">Qty</th>
                            <th className="text-right py-2 px-3 text-sm font-semibold text-muted-foreground">Price</th>
                            <th className="text-right py-2 px-3 text-sm font-semibold text-muted-foreground">Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {order.items.map((item, i) => (
                            <tr key={i} className="border-b last:border-0">
                              <td className="py-3 px-3 font-medium">{item.name}</td>
                              <td className="py-3 px-3 text-center">{item.quantity}</td>
                              <td className="py-3 px-3 text-right">₹{item.price}</td>
                              <td className="py-3 px-3 text-right font-semibold">₹{item.price * item.quantity}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="border-t mt-6 pt-4 flex justify-between items-center bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-4">
                    <span className="font-bold text-lg">Total Amount</span>
                    <span className="text-2xl font-bold text-primary">₹{order.totalAmount}</span>
                  </div>
                </motion.div>
              ))
            )}
          </motion.div>
        )}

        {activeTab === "insights" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-8"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl p-6 shadow-lg border-2 border-orange-100"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
                    <BarChart3 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-display text-xl font-bold text-gray-900">Most Ordered Items</h3>
                    <p className="text-sm text-muted-foreground">Top 10 best sellers</p>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={getMostOrderedItems()}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="name" 
                      angle={-45} 
                      textAnchor="end" 
                      height={100}
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '8px', border: '1px solid #f97316' }}
                    />
                    <Bar dataKey="quantity" fill="#f97316" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-2xl p-6 shadow-lg border-2 border-blue-100"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                    <Package className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-display text-xl font-bold text-gray-900">Inventory Levels</h3>
                    <p className="text-sm text-muted-foreground">Current stock status</p>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={getInventoryData()}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="name" 
                      angle={-45} 
                      textAnchor="end" 
                      height={100}
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '8px', border: '1px solid #3b82f6' }}
                    />
                    <Bar dataKey="stock" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </motion.div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-2xl p-6 shadow-lg border-2 border-green-100"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-display text-xl font-bold text-gray-900">High Demand Items</h3>
                    <p className="text-sm text-muted-foreground">Items with highest demand ratio</p>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={getDemandAnalysis()}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="name" 
                      angle={-45} 
                      textAnchor="end" 
                      height={100}
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '8px', border: '1px solid #10b981' }}
                      formatter={(value: number) => `${value.toFixed(1)}%`}
                    />
                    <Legend />
                    <Bar dataKey="ordered" fill="#10b981" name="Ordered" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="stock" fill="#60a5fa" name="In Stock" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-2xl p-6 shadow-lg border-2 border-purple-100"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                    <Package className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-display text-xl font-bold text-gray-900">Category Distribution</h3>
                    <p className="text-sm text-muted-foreground">Inventory by category</p>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={350}>
                  <PieChart>
                    <Pie
                      data={getCategoryDistribution()}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {getCategoryDistribution().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-2xl p-6 shadow-lg border-2 border-amber-100"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-display text-xl font-bold text-gray-900">Revenue by Item</h3>
                  <p className="text-sm text-muted-foreground">Top revenue generating items</p>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={getMostOrderedItems()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="name" 
                    angle={-45} 
                    textAnchor="end" 
                    height={100}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: '1px solid #f59e0b' }}
                    formatter={(value: number) => `₹${value}`}
                  />
                  <Bar dataKey="revenue" fill="#f59e0b" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
          </motion.div>
        )}
      </main>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-display">
              {editingSweet ? "Edit Sweet" : "Add New Sweet"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Sweet">Sweet</SelectItem>
                  <SelectItem value="Snack">Snack</SelectItem>
                  <SelectItem value="Namkeen">Namkeen</SelectItem>
                  <SelectItem value="Dessert">Dessert</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price">Price (₹)</Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="0"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="image">Image URL</Label>
              <Input
                id="image"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1 gradient-saffron">
                {editingSweet ? "Update Sweet" : "Add Sweet"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!restockSweet} onOpenChange={() => setRestockSweet(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-display">Restock {restockSweet?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="p-4 bg-orange-50 rounded-xl">
              <p className="text-sm text-muted-foreground mb-1">Current stock</p>
              <p className="text-3xl font-bold text-primary">{restockSweet?.quantity} units</p>
            </div>
            <div>
              <Label htmlFor="restock">Add Quantity</Label>
              <Input
                id="restock"
                type="number"
                min="1"
                value={restockQuantity}
                onChange={(e) => setRestockQuantity(e.target.value)}
                placeholder="Enter quantity to add"
              />
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setRestockSweet(null)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleRestock}
                className="flex-1 gradient-saffron"
                disabled={!restockQuantity}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Restock
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}