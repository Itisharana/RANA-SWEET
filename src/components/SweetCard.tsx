"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Plus, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { addToCart } from "@/lib/store";

interface Sweet {
  _id: string;
  name: string;
  category: string;
  price: number;
  quantity: number;
  description?: string;
  image: string;
}

interface SweetCardProps {
  sweet: Sweet;
  index: number;
}

export function SweetCard({ sweet, index }: SweetCardProps) {
  const [isAdded, setIsAdded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleAddToCart = () => {
    addToCart({
      _id: sweet._id,
      name: sweet.name,
      price: sweet.price,
      quantity: 1,
      image: sweet.image,
    });
    setIsAdded(true);
    window.dispatchEvent(new Event("cartUpdated"));
    
    window.dispatchEvent(
      new CustomEvent("itemAddedToCart", {
        detail: {
          name: sweet.name,
          image: sweet.image,
        },
      })
    );

    setTimeout(() => setIsAdded(false), 1500);
  };

  const isOutOfStock = sweet.quantity === 0;

  const categoryColors: Record<string, string> = {
    Sweet: "bg-amber-100 text-amber-800",
    Snack: "bg-green-100 text-green-800",
    Namkeen: "bg-orange-100 text-orange-800",
    Dessert: "bg-pink-100 text-pink-800",
  };

  const fallbackImage = `https://images.unsplash.com/photo-1601303859498-b07bba7beab1?w=400`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      whileHover={{ y: -5 }}
      className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-border/50"
    >
      <div className="relative aspect-square overflow-hidden">
        <Image
          src={imageError ? fallbackImage : sweet.image}
          alt={sweet.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
          className="object-cover group-hover:scale-110 transition-transform duration-500"
          onError={() => setImageError(true)}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <Badge
          className={`absolute top-3 left-3 ${categoryColors[sweet.category] || "bg-gray-100 text-gray-800"}`}
        >
          {sweet.category}
        </Badge>
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="text-white font-semibold text-lg">Out of Stock</span>
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-display text-lg font-semibold truncate mb-1">
          {sweet.name}
        </h3>
        {sweet.description && (
          <p className="text-muted-foreground text-sm line-clamp-2 mb-3">
            {sweet.description}
          </p>
        )}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-2xl font-bold text-primary">₹{sweet.price}</span>
            <span className="text-muted-foreground text-xs ml-1">/piece</span>
          </div>
          <Button
            size="sm"
            className={`rounded-full transition-all duration-300 ${
              isAdded
                ? "bg-green-500 hover:bg-green-600"
                : "gradient-saffron hover:opacity-90"
            }`}
            disabled={isOutOfStock}
            onClick={handleAddToCart}
          >
            {isAdded ? (
              <>
                <Check className="w-4 h-4 mr-1" />
                Added
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-1" />
                Add
              </>
            )}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}