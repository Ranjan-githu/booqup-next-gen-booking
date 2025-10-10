import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Store, User } from "lucide-react";

const Auth = () => {
  const [isOwner, setIsOwner] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        // Check user role
        const { data: roles } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", data.user.id);

        const isShopOwner = roles?.some((r) => r.role === "owner");
        
        toast({
          title: "Welcome back!",
          description: "You've successfully logged in.",
        });

        navigate(isShopOwner ? "/owner" : "/dashboard");
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              phone: phone,
            },
            emailRedirectTo: `${window.location.origin}/`,
          },
        });

        if (error) throw error;

        // Add owner role if registering as owner
        if (isOwner && data.user) {
          await supabase.from("user_roles").insert({
            user_id: data.user.id,
            role: "owner",
          });
        }

        toast({
          title: "Account created!",
          description: isOwner
            ? "Welcome! You can now create your shop."
            : "Welcome! You can now start booking appointments.",
        });

        navigate(isOwner ? "/owner" : "/dashboard");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 gradient-dark" />

      {/* Customer Section */}
      <div
        className={`relative z-10 flex-1 flex items-center justify-center transition-all duration-500 ${
          isOwner ? "md:w-[30%]" : "md:w-[70%]"
        }`}
      >
        <div className="w-full max-w-md px-8 space-y-8 animate-fade-in">
          <div className="text-center space-y-2">
            <User className="w-16 h-16 text-primary mx-auto mb-4" />
            <h2 className="text-3xl font-bold">
              {isLogin ? "Welcome Back" : "Join Booqup"}
            </h2>
            <p className="text-muted-foreground">
              {isLogin ? "Sign in to your account" : "Create your customer account"}
            </p>
          </div>

          <form onSubmit={handleAuth} className="glass-strong p-8 rounded-2xl space-y-6">
            {!isLogin && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required={!isLogin}
                    className="glass"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+1234567890"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="glass"
                  />
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="glass"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="glass"
              />
            </div>

            <Button
              type="submit"
              className="w-full gradient-primary hover:scale-105 transition-all"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Please wait
                </>
              ) : isLogin ? (
                "Sign In"
              ) : (
                "Create Account"
              )}
            </Button>

            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </button>
          </form>
        </div>
      </div>

      {/* Owner Section */}
      <div
        className={`relative z-10 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border-l border-border/50 transition-all duration-500 ${
          isOwner ? "md:w-[70%]" : "md:w-[30%]"
        }`}
      >
        <button
          onClick={() => setIsOwner(!isOwner)}
          className="w-full h-full flex items-center justify-center p-8 hover:bg-primary/10 transition-all"
        >
          <div className="text-center space-y-4">
            <Store className="w-20 h-20 text-primary mx-auto" />
            <h3 className="text-2xl font-bold">
              {isOwner ? "Shop Owner Login" : "Login as Owner"}
            </h3>
            <p className="text-muted-foreground max-w-sm mx-auto">
              {isOwner
                ? "Manage your shop, bookings, and analytics"
                : "Click here to access shop owner portal"}
            </p>
          </div>
        </button>
      </div>
    </div>
  );
};

export default Auth;