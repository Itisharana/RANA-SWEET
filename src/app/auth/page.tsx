"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Eye, EyeOff, Mail, Lock, User, Phone, Shield, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { saveToken, saveUser } from "@/lib/store";
import { toast } from "sonner";

export default function AuthPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isAdminLogin, setIsAdminLogin] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState({ email: "", password: "", name: "", phone: "", confirmPassword: "" });

  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [registerForm, setRegisterForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validateLoginForm = () => {
    const newErrors = { email: "", password: "", name: "", phone: "", confirmPassword: "" };
    
    if (!loginForm.email) {
      newErrors.email = "Email is required";
    } else if (!validateEmail(loginForm.email)) {
      newErrors.email = "Invalid email format";
    }
    
    if (!loginForm.password) {
      newErrors.password = "Password is required";
    } else if (loginForm.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    
    setErrors(newErrors);
    return !newErrors.email && !newErrors.password;
  };

  const validateRegisterForm = () => {
    const newErrors = { email: "", password: "", name: "", phone: "", confirmPassword: "" };
    
    if (!registerForm.name.trim()) {
      newErrors.name = "Name is required";
    }
    
    if (!registerForm.email) {
      newErrors.email = "Email is required";
    } else if (!validateEmail(registerForm.email)) {
      newErrors.email = "Invalid email format";
    }
    
    if (!registerForm.phone.trim()) {
      newErrors.phone = "Phone is required";
    }
    
    if (!registerForm.password) {
      newErrors.password = "Password is required";
    } else if (registerForm.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    
    if (!registerForm.confirmPassword) {
      newErrors.confirmPassword = "Confirm password is required";
    } else if (registerForm.password !== registerForm.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    
    setErrors(newErrors);
    return !newErrors.email && !newErrors.password && !newErrors.name && !newErrors.phone && !newErrors.confirmPassword;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateLoginForm()) {
      return;
    }
    
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginForm),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      if (isAdminLogin && data.user.role !== "admin") {
        throw new Error("This account does not have admin access");
      }

      saveToken(data.token);
      saveUser(data.user);
      
      if (rememberMe) {
        localStorage.setItem("rememberedEmail", loginForm.email);
      } else {
        localStorage.removeItem("rememberedEmail");
      }
      
      toast.success("Login successful!");
      router.push(data.user.role === "admin" ? "/admin" : "/");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Login failed";
      
      if (errorMessage.toLowerCase().includes("user not found") || 
          errorMessage.toLowerCase().includes("invalid credentials")) {
        toast.error("User is not registered. Please create an account first.");
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateRegisterForm()) {
      return;
    }
    
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: registerForm.name,
          email: registerForm.email,
          phone: registerForm.phone,
          password: registerForm.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Registration failed");
      }

      saveToken(data.token);
      saveUser(data.user);
      toast.success("Registration successful!");
      router.push("/");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pattern-indian flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
        
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-border/50">
          <div className="text-center mb-8">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 overflow-hidden bg-white shadow-md">
              <Image src="/rana-sweets-logo.svg" alt="Rana Sweets" width={80} height={80} className="object-cover w-full h-full" />
            </div>
            <h1 className="font-display text-3xl font-bold text-[#8B4513] mb-1">
              Rana Sweets
            </h1>
            <p className="text-primary font-semibold text-lg mb-2">
              Himachal Ka Swad
            </p>
            <p className="text-muted-foreground text-sm">
              {isAdminLogin ? "Admin Login" : "Welcome! Please sign in to continue"}
            </p>
          </div>

          {isAdminLogin ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="p-4 bg-amber-50 rounded-lg border border-amber-200 mb-4">
                <div className="flex items-center gap-2 text-amber-800">
                  <Shield className="w-5 h-5" />
                  <span className="font-medium">Admin Access</span>
                </div>
                <p className="text-amber-600 text-sm mt-1">
                  Only administrators can access this portal
                </p>
                <div className="mt-3 pt-3 border-t border-amber-200">
                  <p className="text-amber-800 text-xs font-semibold mb-1">Default Admin Credentials:</p>
                  <p className="text-amber-700 text-xs">Email: admin@ranasweets.com</p>
                  <p className="text-amber-700 text-xs">Password: admin123</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="admin-email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="admin-email"
                    type="email"
                    placeholder="admin@ranasweets.com"
                    value={loginForm.email}
                    onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="admin-password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="admin-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter password"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    className="pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button type="submit" className="w-full gradient-saffron" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Admin Sign In"}
              </Button>

              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => setIsAdminLogin(false)}
              >
                Back to User Login
              </Button>
            </form>
          ) : (
            <Tabs defaultValue="login" className="space-y-6">
              <TabsList className="grid grid-cols-2 w-full">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="you@example.com"
                        value={loginForm.email}
                        onChange={(e) => {
                          setLoginForm({ ...loginForm, email: e.target.value });
                          setErrors({ ...errors, email: "" });
                        }}
                        className={`pl-10 ${errors.email ? "border-red-500" : ""}`}
                        required
                      />
                    </div>
                    {errors.email && (
                      <p className="text-sm text-red-500 mt-1">{errors.email}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="login-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={loginForm.password}
                        onChange={(e) => {
                          setLoginForm({ ...loginForm, password: e.target.value });
                          setErrors({ ...errors, password: "" });
                        }}
                        className={`pl-10 pr-10 ${errors.password ? "border-red-500" : ""}`}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-sm text-red-500 mt-1">{errors.password}</p>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="remember"
                      checked={rememberMe}
                      onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                    />
                    <label
                      htmlFor="remember"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Remember me
                    </label>
                  </div>

                  <Button type="submit" className="w-full gradient-saffron" disabled={isLoading}>
                    {isLoading ? "Signing in..." : "Sign In"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="register">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="register-name">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="register-name"
                        type="text"
                        placeholder="Your full name"
                        value={registerForm.name}
                        onChange={(e) => {
                          setRegisterForm({ ...registerForm, name: e.target.value });
                          setErrors({ ...errors, name: "" });
                        }}
                        className={`pl-10 ${errors.name ? "border-red-500" : ""}`}
                        required
                      />
                    </div>
                    {errors.name && (
                      <p className="text-sm text-red-500 mt-1">{errors.name}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="register-email"
                        type="email"
                        placeholder="you@example.com"
                        value={registerForm.email}
                        onChange={(e) => {
                          setRegisterForm({ ...registerForm, email: e.target.value });
                          setErrors({ ...errors, email: "" });
                        }}
                        className={`pl-10 ${errors.email ? "border-red-500" : ""}`}
                        required
                      />
                    </div>
                    {errors.email && (
                      <p className="text-sm text-red-500 mt-1">{errors.email}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-phone">Phone</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="register-phone"
                        type="tel"
                        placeholder="+91 98765 43210"
                        value={registerForm.phone}
                        onChange={(e) => {
                          setRegisterForm({ ...registerForm, phone: e.target.value });
                          setErrors({ ...errors, phone: "" });
                        }}
                        className={`pl-10 ${errors.phone ? "border-red-500" : ""}`}
                        required
                      />
                    </div>
                    {errors.phone && (
                      <p className="text-sm text-red-500 mt-1">{errors.phone}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="register-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a password"
                        value={registerForm.password}
                        onChange={(e) => {
                          setRegisterForm({ ...registerForm, password: e.target.value });
                          setErrors({ ...errors, password: "" });
                        }}
                        className={`pl-10 pr-10 ${errors.password ? "border-red-500" : ""}`}
                        required
                        minLength={6}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-sm text-red-500 mt-1">{errors.password}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-confirm-password">Confirm Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="register-confirm-password"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm your password"
                        value={registerForm.confirmPassword}
                        onChange={(e) => {
                          setRegisterForm({ ...registerForm, confirmPassword: e.target.value });
                          setErrors({ ...errors, confirmPassword: "" });
                        }}
                        className={`pl-10 pr-10 ${errors.confirmPassword ? "border-red-500" : ""}`}
                        required
                        minLength={6}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-sm text-red-500 mt-1">{errors.confirmPassword}</p>
                    )}
                  </div>

                  <Button type="submit" className="w-full gradient-saffron" disabled={isLoading}>
                    {isLoading ? "Creating account..." : "Create Account"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          )}

          {!isAdminLogin && (
            <div className="mt-6 pt-6 border-t">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setIsAdminLogin(true)}
              >
                <Shield className="w-4 h-4 mr-2" />
                Admin Login
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}