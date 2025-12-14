"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Minus, Trash2, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getCart,
  updateCartQuantity,
  removeFromCart,
  getCartTotal,
  CartItem,
  getUser,
} from "@/lib/store";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const user = getUser();

  useEffect(() => {
    if (isOpen) {
      setCart(getCart());
    }
  }, [isOpen]);

  const handleUpdateQuantity = (id: string, quantity: number) => {
    const updatedCart = updateCartQuantity(id, quantity);
    setCart(updatedCart);
    window.dispatchEvent(new Event("cartUpdated"));
  };

  const handleRemove = (id: string) => {
    const updatedCart = removeFromCart(id);
    setCart(updatedCart);
    window.dispatchEvent(new Event("cartUpdated"));
  };

  const total = getCartTotal(cart);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white z-50 shadow-2xl flex flex-col"
          >
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="font-display text-xl font-semibold flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-primary" />
                Your Cart
              </h2>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            {cart.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                <div className="w-24 h-24 rounded-full bg-secondary flex items-center justify-center mb-4">
                  <ShoppingBag className="w-12 h-12 text-muted-foreground" />
                </div>
                <h3 className="font-display text-lg font-semibold mb-2">
                  Your cart is empty
                </h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Add some delicious sweets to get started!
                </p>
                <Button onClick={onClose} className="gradient-saffron">
                  Browse Sweets
                </Button>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {cart.map((item) => (
                    <motion.div
                      key={item._id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                      className="flex gap-4 p-3 bg-secondary/30 rounded-xl"
                    >
                      <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          sizes="80px"
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate">{item.name}</h4>
                        <p className="text-primary font-semibold">
                          ₹{item.price}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="w-7 h-7"
                            onClick={() =>
                              handleUpdateQuantity(item._id, item.quantity - 1)
                            }
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="w-8 text-center font-medium">
                            {item.quantity}
                          </span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="w-7 h-7"
                            onClick={() =>
                              handleUpdateQuantity(item._id, item.quantity + 1)
                            }
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="w-7 h-7 ml-auto text-destructive hover:text-destructive"
                            onClick={() => handleRemove(item._id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="p-4 border-t bg-secondary/20">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-muted-foreground">Total</span>
                    <span className="font-display text-2xl font-bold text-primary">
                      ₹{total}
                    </span>
                  </div>
                  {user ? (
                    <Link href="/checkout" onClick={onClose}>
                      <Button className="w-full gradient-saffron text-white font-semibold py-6">
                        Proceed to Checkout
                      </Button>
                    </Link>
                  ) : (
                    <Link href="/auth" onClick={onClose}>
                      <Button className="w-full gradient-saffron text-white font-semibold py-6">
                        Login to Checkout
                      </Button>
                    </Link>
                  )}
                </div>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}