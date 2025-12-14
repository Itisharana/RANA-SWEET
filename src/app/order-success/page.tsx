"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle2, Package, ArrowRight, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import Confetti from "react-confetti";

export const dynamic = 'force-dynamic';

function OrderSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showConfetti, setShowConfetti] = useState(true);
  const orderId = searchParams.get("orderId") || "N/A";
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    
    const timer = setTimeout(() => {
      setShowConfetti(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-background pattern-indian flex items-center justify-center p-4">
      {showConfetti && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={500}
          gravity={0.3}
        />
      )}

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl w-full"
      >
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 border border-border/50 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ 
              type: "spring", 
              stiffness: 260, 
              damping: 20,
              delay: 0.2 
            }}
            className="mb-6"
          >
            <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto shadow-lg">
              <CheckCircle2 className="w-16 h-16 text-white" strokeWidth={2.5} />
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="font-display text-4xl md:text-5xl font-bold text-gray-900 mb-4"
          >
            Order Placed! 🎉
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-lg text-muted-foreground mb-8"
          >
            Thank you for your order! Your delicious sweets are being prepared with love.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl p-6 mb-8 border border-orange-100"
          >
            <div className="flex items-center justify-center gap-3 mb-3">
              <Package className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-lg">Order Details</h3>
            </div>
            <p className="text-sm text-muted-foreground">Order ID: <span className="font-mono font-semibold text-gray-900">{orderId}</span></p>
            <p className="text-sm text-muted-foreground mt-2">
              You will receive a confirmation email shortly with order details and tracking information.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="space-y-4"
          >
            <Button
              size="lg"
              className="w-full gradient-saffron text-white font-semibold text-lg py-6"
              onClick={() => router.push("/orders")}
            >
              View Order Details
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>

            <Button
              size="lg"
              variant="outline"
              className="w-full text-lg py-6"
              onClick={() => router.push("/")}
            >
              <Home className="w-5 h-5 mr-2" />
              Continue Shopping
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="mt-8 pt-8 border-t"
          >
            <p className="text-sm text-muted-foreground">
              Need help? Contact us at <span className="font-semibold text-primary">support@ranasweets.com</span>
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background pattern-indian flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        </div>
      </div>
    }>
      <OrderSuccessContent />
    </Suspense>
  );
}