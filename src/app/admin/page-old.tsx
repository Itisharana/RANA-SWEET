"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
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
  items: { name: string; price: number; quantity: number }[];
  totalAmount: number;
  status: string;
  createdAt: string;
}

export default function AdminPage() {
  const router = useRouter();
  const [sweets, setSweets] = useState<Sweet[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"sweets" | "orders">("sweets");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSweet, setEditingSweet] = useState<Sweet | null>(null);
  const [restockSweet, setRestockSweet] = useState<Sweet | null>(null);
  const [restockQuantity, setRestockQuantity] = useState("");

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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="font-display text-xl font-bold text-[#8B4513]">
              Admin Dashboard
            </h1>
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl p-6 shadow-lg border"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                <Package className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Sweets</p>
                <p className="text-2xl font-bold">{sweets.length}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl p-6 shadow-lg border"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Stock</p>
                <p className="text-2xl font-bold">{totalStock}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl p-6 shadow-lg border"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">₹{totalRevenue}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl p-6 shadow-lg border"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Orders</p>
                <p className="text-2xl font-bold">{orders.length}</p>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="flex gap-4 mb-6">
          <Button
            variant={activeTab === "sweets" ? "default" : "outline"}
            onClick={() => setActiveTab("sweets")}
            className={activeTab === "sweets" ? "gradient-saffron" : ""}
          >
            Manage Sweets
          </Button>
          <Button
            variant={activeTab === "orders" ? "default" : "outline"}
            onClick={() => setActiveTab("orders")}
            className={activeTab === "orders" ? "gradient-saffron" : ""}
          >
            View Orders
          </Button>
        </div>

        {activeTab === "sweets" && (
          <div className="bg-white rounded-2xl shadow-lg border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-orange-50 to-amber-50 border-b-2 border-orange-200">
                  <tr>
                    <th className="px-8 py-5 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Sweet</th>
                    <th className="px-8 py-5 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Category</th>
                    <th className="px-8 py-5 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Price</th>
                    <th className="px-8 py-5 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Stock</th>
                    <th className="px-8 py-5 text-right text-sm font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {sweets.map((sweet) => (
                    <tr key={sweet._id} className="hover:bg-orange-50/30 transition-colors">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="relative w-16 h-16 rounded-xl overflow-hidden shadow-md ring-2 ring-gray-100">
                            <Image
                              src={sweet.image}
                              alt={sweet.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div>
                            <span className="font-semibold text-gray-900 text-base">{sweet.name}</span>
                            <p className="text-sm text-gray-500 mt-0.5">{sweet.description?.substring(0, 40)}...</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <Badge variant="secondary" className="px-3 py-1.5 text-sm font-medium">{sweet.category}</Badge>
                      </td>
                      <td className="px-8 py-6">
                        <span className="font-bold text-gray-900 text-lg">₹{sweet.price}</span>
                      </td>
                      <td className="px-8 py-6">
                        <Badge
                          className={`px-3 py-1.5 text-sm font-semibold ${
                            sweet.quantity === 0
                              ? "bg-red-100 text-red-800"
                              : sweet.quantity < 20
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {sweet.quantity} units
                        </Badge>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center justify-end gap-3">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setRestockSweet(sweet);
                              setRestockQuantity("");
                            }}
                            className="h-10 w-10 hover:bg-blue-50 hover:text-blue-600"
                            title="Restock"
                          >
                            <RefreshCw className="w-5 h-5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditModal(sweet)}
                            className="h-10 w-10 hover:bg-green-50 hover:text-green-600"
                            title="Edit"
                          >
                            <Edit2 className="w-5 h-5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(sweet._id)}
                            className="h-10 w-10 text-red-600 hover:bg-red-50 hover:text-red-700"
                            title="Delete"
                          >
                            <Trash2 className="w-5 h-5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "orders" && (
          <div className="space-y-4">
            {orders.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl shadow-lg">
                <p className="text-muted-foreground">No orders yet</p>
              </div>
            ) : (
              orders.map((order) => (
                <motion.div
                  key={order._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-xl p-6 shadow-lg border"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="font-semibold">
                        Order #{order._id.slice(-8).toUpperCase()}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <Badge
                      className={
                        order.status === "delivered"
                          ? "bg-green-100 text-green-800"
                          : order.status === "cancelled"
                          ? "bg-red-100 text-red-800"
                          : "bg-blue-100 text-blue-800"
                      }
                    >
                      {order.status}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    {order.items.map((item, i) => (
                      <div key={i} className="flex justify-between text-sm">
                        <span>
                          {item.name} × {item.quantity}
                        </span>
                        <span>₹{item.price * item.quantity}</span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t mt-4 pt-4 flex justify-between font-semibold">
                    <span>Total</span>
                    <span className="text-primary">₹{order.totalAmount}</span>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        )}
      </main>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingSweet ? "Edit Sweet" : "Add New Sweet"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
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
              />
            </div>
            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1 gradient-saffron">
                {editingSweet ? "Update" : "Add Sweet"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!restockSweet} onOpenChange={() => setRestockSweet(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Restock {restockSweet?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Current stock: {restockSweet?.quantity}
            </p>
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
            <div className="flex gap-2">
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
                Restock
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}