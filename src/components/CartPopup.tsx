"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { ShoppingBag, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface CartPopupProps {
  isOpen: boolean;
  onClose: () => void;
  itemName: string;
  itemImage: string;
  cartCount: number;
}

export function CartPopup({ isOpen, onClose, itemName, itemImage, cartCount }: CartPopupProps) {
  const router = useRouter();

  const handleViewCart = () => {
    onClose();
    const cartDrawerButton = document.querySelector('[data-cart-button]') as HTMLElement;
    if (cartDrawerButton) {
      cartDrawerButton.click();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-md"
        >
          <div className="bg-white rounded-2xl shadow-2xl border-2 border-orange-200 p-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-50 to-amber-50 opacity-50" />
            
            <button
              onClick={onClose}
              className="absolute top-3 right-3 z-10 p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="relative flex items-center gap-4">
              <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 ring-2 ring-orange-200">
                <Image
                  src={itemImage}
                  alt={itemName}
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm text-green-700 font-semibold mb-1 flex items-center gap-1">
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", delay: 0.1 }}
                  >
                    ✓
                  </motion.span>
                  Added to cart
                </p>
                <p className="font-semibold text-gray-900 truncate">{itemName}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {cartCount} {cartCount === 1 ? 'item' : 'items'} in cart
                </p>
              </div>

              <Button
                onClick={handleViewCart}
                size="sm"
                className="gradient-saffron flex-shrink-0 font-semibold"
              >
                <ShoppingBag className="w-4 h-4 mr-1" />
                View Cart
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}