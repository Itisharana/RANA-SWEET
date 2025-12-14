"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Header } from "@/components/Header";
import { CartDrawer } from "@/components/CartDrawer";
import { SweetCard } from "@/components/SweetCard";
import { CartPopup } from "@/components/CartPopup";
import { Button } from "@/components/ui/button";
import { indianSweets } from "@/lib/seed-data";
import { Loader2 } from "lucide-react";
import { getUser, getCart } from "@/lib/store";

interface Sweet {
  _id: string;
  name: string;
  category: string;
  price: number;
  quantity: number;
  description?: string;
  image: string;
}

const categories = ["All", "Sweet", "Snack", "Namkeen", "Dessert"];

export default function HomePage() {
  const router = useRouter();
  const [sweets, setSweets] = useState<Sweet[]>([]);
  const [filteredSweets, setFilteredSweets] = useState<Sweet[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [priceFilters, setPriceFilters] = useState<{ minPrice?: number; maxPrice?: number; category?: string }>({});
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showCartPopup, setShowCartPopup] = useState(false);
  const [popupItemName, setPopupItemName] = useState("");
  const [popupItemImage, setPopupItemImage] = useState("");

  useEffect(() => {
    const user = getUser();
    if (!user) {
      router.push("/auth");
      return;
    }

    const fetchSweets = async () => {
      try {
        const res = await fetch("/api/sweets");
        if (res.ok) {
          const data = await res.json();
          if (data.length > 0) {
            setSweets(data);
            setFilteredSweets(data);
          } else {
            const localSweets = indianSweets.map((s, i) => ({
              ...s,
              _id: `local-${i}`,
            }));
            setSweets(localSweets);
            setFilteredSweets(localSweets);
          }
        } else {
          const localSweets = indianSweets.map((s, i) => ({
            ...s,
            _id: `local-${i}`,
          }));
          setSweets(localSweets);
          setFilteredSweets(localSweets);
        }
      } catch {
        const localSweets = indianSweets.map((s, i) => ({
          ...s,
          _id: `local-${i}`,
        }));
        setSweets(localSweets);
        setFilteredSweets(localSweets);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSweets();
  }, [router]);

  useEffect(() => {
    const handleItemAdded = (e: Event) => {
      const customEvent = e as CustomEvent;
      const { name, image } = customEvent.detail;
      setPopupItemName(name);
      setPopupItemImage(image);
      setShowCartPopup(true);
      
      setTimeout(() => {
        setShowCartPopup(false);
      }, 3000);
    };

    window.addEventListener("itemAddedToCart", handleItemAdded);
    return () => window.removeEventListener("itemAddedToCart", handleItemAdded);
  }, []);

  useEffect(() => {
    let result = sweets;

    if (selectedCategory !== "All") {
      result = result.filter((s) => s.category === selectedCategory);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(query) ||
          s.category.toLowerCase().includes(query) ||
          s.description?.toLowerCase().includes(query)
      );
    }

    if (priceFilters.minPrice !== undefined) {
      result = result.filter((s) => s.price >= priceFilters.minPrice!);
    }

    if (priceFilters.maxPrice !== undefined) {
      result = result.filter((s) => s.price <= priceFilters.maxPrice!);
    }

    if (priceFilters.category) {
      result = result.filter((s) => s.category === priceFilters.category);
    }

    setFilteredSweets(result);
  }, [selectedCategory, searchQuery, sweets, priceFilters]);

  const handleSearch = (query: string, filters?: { minPrice?: number; maxPrice?: number; category?: string }) => {
    setSearchQuery(query);
    setPriceFilters(filters || {});
    if (filters?.category) {
      setSelectedCategory(filters.category);
    }
  };

  return (
    <div className="min-h-screen bg-background pattern-indian">
      <Header onSearch={handleSearch} onCartClick={() => setIsCartOpen(true)} sweets={sweets} />
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      <CartPopup
        isOpen={showCartPopup}
        onClose={() => setShowCartPopup(false)}
        itemName={popupItemName}
        itemImage={popupItemImage}
        cartCount={getCart().length}
      />

      <section className="relative pt-24 pb-16 md:pt-32 md:pb-24 overflow-hidden">
        <div className="absolute inset-0 gradient-cream opacity-80" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold text-[#8B4513] mb-4">
              Welcome to{" "}
              <span className="text-primary">Rana Sweets</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Indulge in the finest Indian sweets & snacks, crafted with love since 1952
            </p>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="flex flex-wrap justify-center gap-4"
            >
              <Button
                size="lg"
                className="gradient-saffron text-white font-semibold px-8 py-6 text-lg"
                onClick={() => document.getElementById("sweets")?.scrollIntoView({ behavior: "smooth" })}
              >
                Explore Sweets
              </Button>
            </motion.div>
          </motion.div>
        </div>

        <div className="absolute -bottom-10 left-0 right-0 h-20 bg-gradient-to-t from-background to-transparent" />
      </section>

      <section id="sweets" className="py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-center gap-2 mb-8 md:mb-12">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                className={`rounded-full ${
                  selectedCategory === category
                    ? "gradient-saffron text-white border-none"
                    : "hover:bg-secondary"
                }`}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Button>
            ))}
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : filteredSweets.length === 0 ? (
            <div className="text-center py-20">
              <h3 className="font-display text-2xl font-semibold text-muted-foreground mb-2">
                No sweets found
              </h3>
              <p className="text-muted-foreground">
                Try adjusting your search or filter
              </p>
            </div>
          ) : (
            <motion.div
              layout
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6"
            >
              {filteredSweets.map((sweet, index) => (
                <SweetCard key={sweet._id} sweet={sweet} index={index} />
              ))}
            </motion.div>
          )}
        </div>
      </section>

      <footer className="bg-[#3D2914] text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-display text-2xl font-bold mb-4">Rana Sweets</h3>
              <p className="text-white/70">
                Crafting authentic Indian sweets with love and tradition since 1952.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact Us</h4>
              <p className="text-white/70">Indira Market, Mandi, Himachal Pradesh 175001</p>
              <p className="text-white/70">Phone: +91 98765 43210</p>
              <p className="text-white/70">Email: info@ranasweets.com</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Hours</h4>
              <p className="text-white/70">Mon - Sun: 8:00 AM - 10:00 PM</p>
              <p className="text-white/70">We deliver across Delhi NCR</p>
            </div>
          </div>
          <div className="border-t border-white/20 mt-8 pt-8 text-center text-white/50">
            <p>&copy; 2024 Rana Sweets. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}