import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Wifi, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate, useLocation } from "react-router-dom";
import Navbar from "@/components/Navbar";

const Success = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [timeRemaining, setTimeRemaining] = useState("");
  const expiryTime = location.state?.expiryTime;

  useEffect(() => {
    if (!expiryTime) {
      navigate("/");
      return;
    }

    const updateTimer = () => {
      const now = new Date().getTime();
      const expiry = new Date(expiryTime).getTime();
      const difference = expiry - now;

      if (difference <= 0) {
        setTimeRemaining("Session expired");
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));

      if (days > 0) {
        setTimeRemaining(`${days}d ${hours}h ${minutes}m`);
      } else {
        setTimeRemaining(`${hours}h ${minutes}m`);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [expiryTime, navigate]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mx-auto text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="inline-flex p-6 rounded-full bg-accent/10 mb-8"
          >
            <CheckCircle2 className="h-24 w-24 text-accent" />
          </motion.div>

          <h1 className="text-5xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
            You're Connected!
          </h1>
          <p className="text-2xl text-muted-foreground mb-12">
            Enjoy fast, reliable Wi-Fi access
          </p>

          <Card className="p-8 mb-8 shadow-elegant">
            <div className="space-y-6">
              <div className="flex items-center justify-center space-x-4 text-xl">
                <Wifi className="h-8 w-8 text-primary" />
                <span className="font-semibold">Connection Active</span>
              </div>

              {timeRemaining && (
                <div className="bg-gradient-hero p-6 rounded-lg">
                  <div className="flex items-center justify-center space-x-3 mb-2">
                    <Clock className="h-6 w-6 text-primary" />
                    <span className="text-muted-foreground">Time Remaining:</span>
                  </div>
                  <p className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                    {timeRemaining}
                  </p>
                </div>
              )}

              <div className="text-left bg-muted/50 p-6 rounded-lg">
                <h3 className="font-semibold mb-3">Connection Tips:</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Stay connected to enjoy uninterrupted service</li>
                  <li>• Your session will automatically expire when time runs out</li>
                  <li>• You can purchase additional time anytime</li>
                  <li>• For support, contact our 24/7 helpline</li>
                </ul>
              </div>
            </div>
          </Card>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate("/")}
            >
              Return Home
            </Button>
            <Button
              size="lg"
              className="bg-gradient-primary text-primary-foreground hover:opacity-90"
              onClick={() => navigate("/purchase")}
            >
              Extend Session
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Success;