"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Package, Clock, CheckCircle, Truck, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getToken, getUser } from "@/lib/store";

interface OrderItem {
  sweetId: string;
  name: string;
  price: number;
  quantity: number;
}

interface Order {
  _id: string;
  items: OrderItem[];
  totalAmount: number;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  deliveryAddress: string;
  createdAt: string;
}

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const user = getUser();
    if (!user) {
      router.push("/auth");
      return;
    }

    const fetchOrders = async () => {
      try {
        const token = getToken();
        const res = await fetch("/api/orders", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          setOrders(data);
        }
      } catch (error) {
        console.error("Failed to fetch orders:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [router]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "confirmed":
        return <CheckCircle className="w-4 h-4" />;
      case "preparing":
        return <Package className="w-4 h-4" />;
      case "delivered":
        return <Truck className="w-4 h-4" />;
      case "cancelled":
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "confirmed":
        return "bg-blue-100 text-blue-800";
      case "preparing":
        return "bg-purple-100 text-purple-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-background pattern-indian">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link
          href="/"
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Shop
        </Link>

        <h1 className="font-display text-3xl font-bold text-[#8B4513] mb-8">
          My Orders
        </h1>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : orders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20 bg-white rounded-2xl shadow-lg"
          >
            <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-display text-xl font-semibold mb-2">
              No orders yet
            </h3>
            <p className="text-muted-foreground mb-6">
              Start shopping to see your orders here!
            </p>
            <Link href="/">
              <button className="gradient-saffron text-white px-6 py-2 rounded-full font-medium">
                Browse Sweets
              </button>
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {orders.map((order, index) => (
              <motion.div
                key={order._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl shadow-lg p-6 border border-border/50"
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground">
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
                  <Badge className={`${getStatusColor(order.status)} flex items-center gap-1`}>
                    {getStatusIcon(order.status)}
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </Badge>
                </div>

                <div className="space-y-2 mb-4">
                  {order.items.map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between text-sm py-2 border-b border-border/50 last:border-0"
                    >
                      <span>
                        {item.name} × {item.quantity}
                      </span>
                      <span className="font-medium">₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="text-sm">
                    <p className="text-muted-foreground">Payment: {order.paymentMethod}</p>
                    <p className="text-muted-foreground truncate max-w-[200px]">
                      {order.deliveryAddress}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Total</p>
                    <p className="font-display text-xl font-bold text-primary">
                      ₹{order.totalAmount}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
