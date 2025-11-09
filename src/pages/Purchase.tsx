import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Wifi, CreditCard, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";

const Purchase = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<any>(null);
  const [hotspots, setHotspots] = useState<any[]>([]);
  const [selectedHotspot, setSelectedHotspot] = useState("");

  const packages = [
    {
      name: "Daily Pass",
      duration: "24 Hours",
      price: "2,000",
      minutes: 1440,
    },
    {
      name: "3-Day Pass",
      duration: "72 Hours",
      price: "5,000",
      minutes: 4320,
    },
    {
      name: "Weekly Pass",
      duration: "7 Days",
      price: "10,000",
      minutes: 10080,
    },
  ];

  useEffect(() => {
    if (location.state?.selectedPackage) {
      setSelectedPackage(location.state.selectedPackage);
    }

    fetchHotspots();
  }, [location]);

  const fetchHotspots = async () => {
    const { data, error } = await supabase
      .from("hotspots")
      .select("*")
      .eq("is_active", true);

    if (error) {
      console.error("Error fetching hotspots:", error);
    } else {
      setHotspots(data || []);
      if (data && data.length > 0) {
        setSelectedHotspot(data[0].id);
      }
    }
  };

  const handlePurchase = async () => {
    if (!selectedPackage || !phone || !selectedHotspot) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);

    try {
      const { data: session } = await supabase.auth.getSession();
      const userId = session.session?.user?.id || null;

      // Create order
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: userId,
          phone,
          amount: parseFloat(selectedPackage.price.replace(",", "")),
          duration_minutes: selectedPackage.minutes,
          status: "completed",
          transaction_id: `MPESA${Date.now()}`,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create session
      const expiryTime = new Date();
      expiryTime.setMinutes(expiryTime.getMinutes() + selectedPackage.minutes);

      const { error: sessionError } = await supabase.from("sessions").insert({
        user_id: userId,
        hotspot_id: selectedHotspot,
        order_id: order.id,
        expiry_time: expiryTime.toISOString(),
        is_active: true,
      });

      if (sessionError) throw sessionError;

      toast.success("Payment successful! You are now connected.");
      navigate("/success", { state: { expiryTime: expiryTime.toISOString() } });
    } catch (error: any) {
      toast.error(error.message || "Payment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Purchase Wi-Fi Access</h1>
            <p className="text-xl text-muted-foreground">
              Select a package and complete your payment
            </p>
          </div>

          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Package Selection */}
            <div>
              <h2 className="text-2xl font-bold mb-6">Select Package</h2>
              <div className="space-y-4">
                {packages.map((pkg, index) => (
                  <Card
                    key={index}
                    className={`p-6 cursor-pointer transition-all duration-300 ${
                      selectedPackage?.name === pkg.name
                        ? "border-2 border-primary shadow-elegant"
                        : "hover:border-primary/50"
                    }`}
                    onClick={() => setSelectedPackage(pkg)}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-xl font-bold">{pkg.name}</h3>
                        <p className="text-muted-foreground">{pkg.duration}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                          {pkg.price}
                        </p>
                        <p className="text-sm text-muted-foreground">TZS</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Payment Form */}
            <div>
              <h2 className="text-2xl font-bold mb-6">Payment Details</h2>
              <Card className="p-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="hotspot">Select Hotspot</Label>
                    <select
                      id="hotspot"
                      className="w-full p-2 border rounded-lg"
                      value={selectedHotspot}
                      onChange={(e) => setSelectedHotspot(e.target.value)}
                    >
                      {hotspots.map((hotspot) => (
                        <option key={hotspot.id} value={hotspot.id}>
                          {hotspot.name} - {hotspot.location}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="phone">M-Pesa Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="0712345678"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>

                  {selectedPackage && (
                    <div className="bg-muted p-4 rounded-lg">
                      <div className="flex justify-between mb-2">
                        <span>Package:</span>
                        <span className="font-semibold">
                          {selectedPackage.name}
                        </span>
                      </div>
                      <div className="flex justify-between mb-2">
                        <span>Duration:</span>
                        <span className="font-semibold">
                          {selectedPackage.duration}
                        </span>
                      </div>
                      <div className="flex justify-between text-xl font-bold mt-4 pt-4 border-t">
                        <span>Total:</span>
                        <span className="bg-gradient-primary bg-clip-text text-transparent">
                          {selectedPackage.price} TZS
                        </span>
                      </div>
                    </div>
                  )}

                  <Button
                    className="w-full bg-gradient-primary text-primary-foreground hover:opacity-90"
                    onClick={handlePurchase}
                    disabled={loading || !selectedPackage}
                  >
                    <CreditCard className="mr-2 h-5 w-5" />
                    {loading ? "Processing..." : "Pay with M-Pesa"}
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Purchase;