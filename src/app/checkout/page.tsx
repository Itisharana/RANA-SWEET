"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowLeft, CreditCard, Smartphone, MapPin, Check, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { getCart, getCartTotal, clearCart, getToken, getUser, CartItem } from "@/lib/store";
import { toast } from "sonner";

export default function CheckoutPage() {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [addressDetails, setAddressDetails] = useState({
    street: "",
    city: "",
    state: "",
    pincode: "",
    landmark: "",
    phone: "",
  });

  const [paymentDetails, setPaymentDetails] = useState({
    upiId: "",
    cardNumber: "",
    expiry: "",
    cvv: "",
  });

  useEffect(() => {
    const user = getUser();
    if (!user) {
      router.push("/auth");
      return;
    }

    const cartItems = getCart();
    if (cartItems.length === 0) {
      router.push("/");
      return;
    }

    setCart(cartItems);
  }, [router]);

  const total = getCartTotal(cart);

  const handlePlaceOrder = async () => {
    if (!addressDetails.street.trim() || !addressDetails.city.trim() || !addressDetails.state.trim() || !addressDetails.pincode.trim() || !addressDetails.phone.trim()) {
      toast.error("Please fill all required address fields including phone number");
      return;
    }

    if (!/^[0-9]{10}$/.test(addressDetails.phone)) {
      toast.error("Please enter a valid 10-digit phone number");
      return;
    }

    if (paymentMethod === "UPI" && !paymentDetails.upiId.trim()) {
      toast.error("Please enter your UPI ID");
      return;
    }

    if ((paymentMethod === "Credit Card" || paymentMethod === "Debit Card") && 
        (!paymentDetails.cardNumber.trim() || !paymentDetails.expiry.trim() || !paymentDetails.cvv.trim())) {
      toast.error("Please fill all card details");
      return;
    }

    setIsLoading(true);

    try {
      const token = getToken();
      const fullAddress = `${addressDetails.street}, ${addressDetails.landmark ? addressDetails.landmark + ', ' : ''}${addressDetails.city}, ${addressDetails.state} - ${addressDetails.pincode}, Phone: ${addressDetails.phone}`;
      
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          items: cart.map((item) => ({
            sweetId: item._id,
            quantity: item.quantity,
          })),
          paymentMethod,
          deliveryAddress: fullAddress,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to place order");
      }

      const orderData = await res.json();

      clearCart();
      window.dispatchEvent(new Event("cartUpdated"));
      
      toast.success("🎉 Order placed successfully!", {
        description: "Your order has been confirmed and will be delivered soon!",
        duration: 3000,
      });
      
      setTimeout(() => {
        router.push(`/order-success?orderId=${orderData.order._id}`);
      }, 1000);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to place order");
    } finally {
      setIsLoading(false);
    }
  };

  if (cart.length === 0) {
    return null;
  }

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

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid md:grid-cols-2 gap-8"
        >
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-border/50">
              <h2 className="font-display text-xl font-semibold mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                Delivery Address
              </h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="street" className="text-sm font-medium">
                    Street Address <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="street"
                    placeholder="House/Flat no., Building name, Street"
                    value={addressDetails.street}
                    onChange={(e) => setAddressDetails({ ...addressDetails, street: e.target.value })}
                    className="mt-1.5"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="landmark" className="text-sm font-medium">
                    Landmark (Optional)
                  </Label>
                  <Input
                    id="landmark"
                    placeholder="Near park, mall, temple etc."
                    value={addressDetails.landmark}
                    onChange={(e) => setAddressDetails({ ...addressDetails, landmark: e.target.value })}
                    className="mt-1.5"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city" className="text-sm font-medium">
                      City <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="city"
                      placeholder="Mandi"
                      value={addressDetails.city}
                      onChange={(e) => setAddressDetails({ ...addressDetails, city: e.target.value })}
                      className="mt-1.5"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="state" className="text-sm font-medium">
                      State <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="state"
                      placeholder="Himachal Pradesh"
                      value={addressDetails.state}
                      onChange={(e) => setAddressDetails({ ...addressDetails, state: e.target.value })}
                      className="mt-1.5"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="pincode" className="text-sm font-medium">
                    Pincode <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="pincode"
                    placeholder="175001"
                    value={addressDetails.pincode}
                    onChange={(e) => setAddressDetails({ ...addressDetails, pincode: e.target.value })}
                    className="mt-1.5"
                    maxLength={6}
                    pattern="[0-9]{6}"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="phone" className="text-sm font-medium">
                    Phone Number <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="9876543210"
                    value={addressDetails.phone}
                    onChange={(e) => setAddressDetails({ ...addressDetails, phone: e.target.value.replace(/\D/g, '') })}
                    className="mt-1.5"
                    maxLength={10}
                    pattern="[0-9]{10}"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg border border-border/50">
              <h2 className="font-display text-xl font-semibold mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-primary" />
                Payment Method
              </h2>
              <RadioGroup
                value={paymentMethod}
                onValueChange={setPaymentMethod}
                className="space-y-3"
              >
                <div className="flex items-center space-x-3 p-4 rounded-xl border-2 border-border hover:border-primary transition-colors cursor-pointer">
                  <RadioGroupItem value="Cash" id="cod" />
                  <Label htmlFor="cod" className="flex items-center gap-3 cursor-pointer flex-1">
                    <div className="w-5 h-5 text-green-600 font-bold">₹</div>
                    <div>
                      <p className="font-medium">Cash on Delivery</p>
                      <p className="text-sm text-muted-foreground">
                        Pay when you receive your order
                      </p>
                    </div>
                  </Label>
                </div>

                <div className="flex items-center space-x-3 p-4 rounded-xl border-2 border-border hover:border-primary transition-colors cursor-pointer">
                  <RadioGroupItem value="UPI" id="upi" />
                  <Label htmlFor="upi" className="flex items-center gap-3 cursor-pointer flex-1">
                    <Smartphone className="w-5 h-5 text-purple-600" />
                    <div>
                      <p className="font-medium">UPI</p>
                      <p className="text-sm text-muted-foreground">
                        Pay with Google Pay, PhonePe, Paytm
                      </p>
                    </div>
                  </Label>
                </div>

                <div className="flex items-center space-x-3 p-4 rounded-xl border-2 border-border hover:border-primary transition-colors cursor-pointer">
                  <RadioGroupItem value="Credit Card" id="credit" />
                  <Label htmlFor="credit" className="flex items-center gap-3 cursor-pointer flex-1">
                    <CreditCard className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-medium">Credit Card</p>
                      <p className="text-sm text-muted-foreground">
                        Visa, Mastercard, American Express
                      </p>
                    </div>
                  </Label>
                </div>

                <div className="flex items-center space-x-3 p-4 rounded-xl border-2 border-border hover:border-primary transition-colors cursor-pointer">
                  <RadioGroupItem value="Debit Card" id="debit" />
                  <Label htmlFor="debit" className="flex items-center gap-3 cursor-pointer flex-1">
                    <CreditCard className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="font-medium">Debit Card</p>
                      <p className="text-sm text-muted-foreground">
                        All major bank debit cards
                      </p>
                    </div>
                  </Label>
                </div>
              </RadioGroup>

              {paymentMethod === "Cash" && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-4 bg-green-50 rounded-xl border border-green-200"
                >
                  <p className="text-sm text-green-800 font-medium">
                    ✓ You can pay in cash when your order arrives
                  </p>
                  <p className="text-xs text-green-700 mt-1">
                    Please keep exact change ready for a contactless delivery
                  </p>
                </motion.div>
              )}

              {paymentMethod === "UPI" && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-4 bg-secondary/30 rounded-xl"
                >
                  <Label htmlFor="upi-id">UPI ID <span className="text-red-500">*</span></Label>
                  <Input
                    id="upi-id"
                    placeholder="yourname@upi"
                    value={paymentDetails.upiId}
                    onChange={(e) => setPaymentDetails({ ...paymentDetails, upiId: e.target.value })}
                    className="mt-2"
                    required
                  />
                </motion.div>
              )}

              {(paymentMethod === "Credit Card" || paymentMethod === "Debit Card") && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 space-y-4 p-4 bg-secondary/30 rounded-xl"
                >
                  <div>
                    <Label htmlFor="card-number">Card Number <span className="text-red-500">*</span></Label>
                    <Input
                      id="card-number"
                      placeholder="1234 5678 9012 3456"
                      value={paymentDetails.cardNumber}
                      onChange={(e) => setPaymentDetails({ ...paymentDetails, cardNumber: e.target.value })}
                      className="mt-2"
                      maxLength={19}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="expiry">Expiry Date <span className="text-red-500">*</span></Label>
                      <Input 
                        id="expiry" 
                        placeholder="MM/YY" 
                        value={paymentDetails.expiry}
                        onChange={(e) => setPaymentDetails({ ...paymentDetails, expiry: e.target.value })}
                        className="mt-2"
                        maxLength={5}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="cvv">CVV <span className="text-red-500">*</span></Label>
                      <Input 
                        id="cvv" 
                        placeholder="123" 
                        value={paymentDetails.cvv}
                        onChange={(e) => setPaymentDetails({ ...paymentDetails, cvv: e.target.value.replace(/\D/g, '') })}
                        className="mt-2"
                        maxLength={3}
                        required
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-border/50">
              <h2 className="font-display text-xl font-semibold mb-4">
                Order Summary
              </h2>

              <div className="space-y-4 max-h-[300px] overflow-y-auto">
                {cart.map((item) => (
                  <div
                    key={item._id}
                    className="flex gap-4 p-3 bg-secondary/30 rounded-xl"
                  >
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium truncate">{item.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        ₹{item.price} × {item.quantity}
                      </p>
                    </div>
                    <div className="text-right font-semibold">
                      ₹{item.price * item.quantity}
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t mt-4 pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>₹{total}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Delivery</span>
                  <span className="text-green-600">Free</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t">
                  <span>Total</span>
                  <span className="text-primary">₹{total}</span>
                </div>
              </div>
            </div>

            <Button
              size="lg"
              className="w-full gradient-saffron text-white font-semibold py-6"
              onClick={handlePlaceOrder}
              disabled={isLoading}
            >
              {isLoading ? (
                "Processing..."
              ) : (
                <>
                  <Check className="w-5 h-5 mr-2" />
                  Place Order - ₹{total}
                </>
              )}
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}