import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar, Clock, Users } from "lucide-react";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 gradient-dark">
        <div className="absolute top-20 left-20 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "3s" }} />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        {/* Logo and tagline */}
        <div className="text-center space-y-6 animate-slide-up">
          <h1 className="text-7xl md:text-8xl font-bold tracking-tight">
            <span className="bg-gradient-to-r from-primary via-red-500 to-primary bg-clip-text text-transparent">
              Booqup
            </span>
          </h1>
          
          <p className="text-2xl md:text-3xl text-muted-foreground font-light max-w-2xl mx-auto">
            Book Smarter. Save Time. Skip the Queue.
          </p>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 max-w-4xl mx-auto">
            <div className="glass-strong p-6 rounded-2xl transition-all hover:scale-105 hover:glow-red">
              <Calendar className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Easy Booking</h3>
              <p className="text-sm text-muted-foreground">Book appointments in seconds</p>
            </div>
            
            <div className="glass-strong p-6 rounded-2xl transition-all hover:scale-105 hover:glow-red" style={{ animationDelay: "0.1s" }}>
              <Clock className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Real-Time Queue</h3>
              <p className="text-sm text-muted-foreground">Track your position live</p>
            </div>
            
            <div className="glass-strong p-6 rounded-2xl transition-all hover:scale-105 hover:glow-red" style={{ animationDelay: "0.2s" }}>
              <Users className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">For Everyone</h3>
              <p className="text-sm text-muted-foreground">Salons, clinics, mechanics & more</p>
            </div>
          </div>

          {/* CTA Button */}
          <div className="mt-12">
            <Button
              size="lg"
              onClick={() => navigate("/auth")}
              className="gradient-primary text-white font-semibold text-lg px-8 py-6 rounded-full hover:scale-105 transition-all glow-red group"
            >
              Get Started
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>

        {/* Footer */}
        <footer className="absolute bottom-8 text-center text-sm text-muted-foreground">
          © 2025 Booqup. All rights reserved.
        </footer>
      </div>
    </div>
  );
};

export default Landing;