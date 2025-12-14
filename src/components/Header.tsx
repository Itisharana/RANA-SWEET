"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, User, Menu, X, Search, LogOut, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { getCart, getUser, logout, CartItem, User as UserType } from "@/lib/store";

interface HeaderProps {
  onSearch?: (query: string, filters?: { minPrice?: number; maxPrice?: number; category?: string }) => void;
  onCartClick?: () => void;
  sweets?: Array<{ name: string }>;
}

export function Header({ onSearch, onCartClick, sweets = [] }: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [priceRange, setPriceRange] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [user, setUser] = useState<UserType | null>(null);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCart(getCart());
    setUser(getUser());

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsScrolled(currentScrollY > 10);
    };

    const handleStorageChange = () => {
      setCart(getCart());
      setUser(getUser());
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowRecommendations(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("cartUpdated", handleStorageChange);
    document.addEventListener("mousedown", handleClickOutside);
    
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("cartUpdated", handleStorageChange);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (searchQuery.trim() && sweets.length > 0) {
      const filtered = sweets
        .map(s => s.name)
        .filter(name => name.toLowerCase().includes(searchQuery.toLowerCase()))
        .sort()
        .slice(0, 5);
      setRecommendations(filtered);
      setShowRecommendations(filtered.length > 0);
    } else {
      setRecommendations([]);
      setShowRecommendations(false);
    }
  }, [searchQuery, sweets]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    let minPrice, maxPrice;
    
    if (priceRange) {
      const [min, max] = priceRange.split("-").map(Number);
      minPrice = min;
      maxPrice = max;
    }
    
    const filters = {
      minPrice,
      maxPrice,
      category: selectedCategory || undefined,
    };
    onSearch?.(searchQuery, filters);
    setShowRecommendations(false);
  };

  const handleRecommendationClick = (name: string) => {
    setSearchQuery(name);
    setShowRecommendations(false);
    const filters = {
      minPrice: priceRange ? Number(priceRange.split("-")[0]) : undefined,
      maxPrice: priceRange ? Number(priceRange.split("-")[1]) : undefined,
      category: selectedCategory || undefined,
    };
    onSearch?.(name, filters);
  };

  const handleLogout = () => {
    logout();
    setUser(null);
    setCart([]);
    window.location.href = "/";
  };

  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/95 backdrop-blur-md shadow-lg"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          <Link href="/" className="flex items-center gap-2">
            <motion.div
              whileHover={{ rotate: 10 }}
              className="w-10 h-10 md:w-12 md:h-12 gradient-saffron rounded-full flex items-center justify-center text-2xl"
            >
              🍬
            </motion.div>
            <div className="hidden sm:block">
              <h1 className="font-display text-xl md:text-2xl font-bold text-[#8B4513]">
                Rana Sweets
              </h1>
              <p className="text-xs text-primary font-semibold -mt-1">Himachal Ka Swad</p>
            </div>
          </Link>

          <form
            onSubmit={handleSearch}
            className="hidden md:flex items-center flex-1 max-w-2xl mx-8 gap-2"
          >
            <div className="relative flex-1" ref={searchRef}>
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
              <Input
                type="text"
                placeholder="Search sweets, snacks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery && setShowRecommendations(true)}
                className="pl-10 bg-secondary/50 border-none focus-visible:ring-primary"
              />
              <AnimatePresence>
                {showRecommendations && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full mt-1 left-0 right-0 bg-white border rounded-md shadow-lg z-50 max-h-60 overflow-auto"
                  >
                    {recommendations.map((name, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleRecommendationClick(name)}
                        className="w-full text-left px-4 py-2 hover:bg-secondary/50 transition-colors border-b last:border-b-0"
                      >
                        {name}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <select
              value={priceRange}
              onChange={(e) => setPriceRange(e.target.value)}
              className="h-10 px-3 rounded-md bg-secondary/50 border-none focus-visible:ring-primary text-sm"
            >
              <option value="">All Prices</option>
              <option value="0-100">₹0 - ₹100</option>
              <option value="100-200">₹100 - ₹200</option>
              <option value="200-300">₹200 - ₹300</option>
              <option value="300-500">₹300 - ₹500</option>
              <option value="500-999999">₹500+</option>
            </select>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="h-10 px-3 rounded-md bg-secondary/50 border-none focus-visible:ring-primary text-sm"
            >
              <option value="">All Categories</option>
              <option value="Sweet">Sweet</option>
              <option value="Snack">Snack</option>
              <option value="Namkeen">Namkeen</option>
              <option value="Dessert">Dessert</option>
            </select>
            <Button type="submit" size="sm" className="gradient-saffron text-white">
              <Search className="w-4 h-4" />
            </Button>
          </form>

          <div className="flex items-center gap-2 md:gap-4">
            {user ? (
              <>
                {user.role === "admin" && (
                  <Link href="/admin">
                    <Button variant="ghost" size="sm" className="hidden md:flex gap-2">
                      <Shield className="w-4 h-4" />
                      Admin
                    </Button>
                  </Link>
                )}
                <Link href="/orders">
                  <Button variant="ghost" size="sm" className="hidden md:flex gap-2">
                    <User className="w-4 h-4" />
                    {user.name}
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="hidden md:flex gap-2"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </>
            ) : (
              <Link href="/auth">
                <Button variant="ghost" size="sm" className="hidden md:flex gap-2">
                  <User className="w-4 h-4" />
                  Login
                </Button>
              </Link>
            )}

            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={onCartClick}
              data-cart-button
            >
              <ShoppingCart className="w-5 h-5" />
              {cartItemCount > 0 && (
                <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center gradient-saffron border-none text-xs">
                  {cartItemCount}
                </Badge>
              )}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        <form
          onSubmit={handleSearch}
          className="md:hidden pb-3 space-y-2"
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
            <Input
              type="text"
              placeholder="Search sweets, snacks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-secondary/50 border-none"
            />
            <AnimatePresence>
              {showRecommendations && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full mt-1 left-0 right-0 bg-white border rounded-md shadow-lg z-50 max-h-60 overflow-auto"
                >
                  {recommendations.map((name, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleRecommendationClick(name)}
                      className="w-full text-left px-4 py-2 hover:bg-secondary/50 transition-colors border-b last:border-b-0"
                    >
                      {name}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <div className="flex gap-2">
            <select
              value={priceRange}
              onChange={(e) => setPriceRange(e.target.value)}
              className="flex-1 h-10 px-3 rounded-md bg-secondary/50 border-none text-sm"
            >
              <option value="">All Prices</option>
              <option value="0-100">₹0 - ₹100</option>
              <option value="100-200">₹100 - ₹200</option>
              <option value="200-300">₹200 - ₹300</option>
              <option value="300-500">₹300 - ₹500</option>
              <option value="500-999999">₹500+</option>
            </select>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="flex-1 h-10 px-3 rounded-md bg-secondary/50 border-none text-sm"
            >
              <option value="">All</option>
              <option value="Sweet">Sweet</option>
              <option value="Snack">Snack</option>
              <option value="Namkeen">Namkeen</option>
              <option value="Dessert">Dessert</option>
            </select>
            <Button type="submit" size="sm" className="gradient-saffron text-white">
              <Search className="w-4 h-4" />
            </Button>
          </div>
        </form>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t"
          >
            <div className="px-4 py-4 space-y-2">
              {user ? (
                <>
                  <div className="px-4 py-2 text-sm font-medium text-muted-foreground">
                    Welcome, {user.name}
                  </div>
                  {user.role === "admin" && (
                    <Link href="/admin" className="block">
                      <Button variant="ghost" className="w-full justify-start gap-2">
                        <Shield className="w-4 h-4" />
                        Admin Dashboard
                      </Button>
                    </Link>
                  )}
                  <Link href="/orders" className="block">
                    <Button variant="ghost" className="w-full justify-start gap-2">
                      <User className="w-4 h-4" />
                      My Orders
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-2"
                    onClick={handleLogout}
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </Button>
                </>
              ) : (
                <Link href="/auth" className="block">
                  <Button variant="ghost" className="w-full justify-start gap-2">
                    <User className="w-4 h-4" />
                    Login / Register
                  </Button>
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}