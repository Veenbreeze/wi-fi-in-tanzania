import { useState } from "react";
import { motion } from "framer-motion";
import { Ticket, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";

const Voucher = () => {
  const navigate = useNavigate();
  const [voucherCode, setVoucherCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRedeem = async () => {
    if (!voucherCode.trim()) {
      toast.error("Please enter a voucher code");
      return;
    }

    setLoading(true);

    try {
      // Check if voucher exists and is valid
      const { data: voucher, error: voucherError } = await supabase
        .from("vouchers")
        .select("*")
        .eq("code", voucherCode.toUpperCase())
        .eq("used", false)
        .gte("expires_at", new Date().toISOString())
        .single();

      if (voucherError || !voucher) {
        throw new Error("Invalid or expired voucher code");
      }

      const { data: session } = await supabase.auth.getSession();
      const userId = session.session?.user?.id || null;

      // Mark voucher as used
      const { error: updateError } = await supabase
        .from("vouchers")
        .update({ used: true })
        .eq("id", voucher.id);

      if (updateError) throw updateError;

      // Create session (you would need to select a hotspot)
      const expiryTime = new Date();
      expiryTime.setMinutes(expiryTime.getMinutes() + voucher.duration_minutes);

      const { error: sessionError } = await supabase.from("sessions").insert({
        user_id: userId,
        voucher_id: voucher.id,
        expiry_time: expiryTime.toISOString(),
        is_active: true,
      });

      if (sessionError) throw sessionError;

      toast.success("Voucher redeemed successfully! You are now connected.");
      navigate("/success", { state: { expiryTime: expiryTime.toISOString() } });
    } catch (error: any) {
      toast.error(error.message || "Failed to redeem voucher");
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
          className="max-w-md mx-auto"
        >
          <div className="text-center mb-8">
            <div className="inline-flex p-4 rounded-full bg-gradient-primary text-primary-foreground mb-4">
              <Ticket className="h-12 w-12" />
            </div>
            <h1 className="text-4xl font-bold mb-4">Redeem Voucher</h1>
            <p className="text-xl text-muted-foreground">
              Enter your voucher code to get instant Wi-Fi access
            </p>
          </div>

          <Card className="p-8 shadow-elegant">
            <div className="space-y-6">
              <div>
                <Label htmlFor="voucher">Voucher Code</Label>
                <Input
                  id="voucher"
                  type="text"
                  placeholder="Enter code (e.g., WIFI123ABC)"
                  value={voucherCode}
                  onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                  className="text-lg text-center font-mono"
                />
              </div>

              <Button
                className="w-full bg-gradient-primary text-primary-foreground hover:opacity-90"
                onClick={handleRedeem}
                disabled={loading}
              >
                {loading ? "Redeeming..." : "Redeem Voucher"}
              </Button>

              <div className="text-center text-sm text-muted-foreground">
                <p>Don't have a voucher?</p>
                <button
                  onClick={() => navigate("/purchase")}
                  className="text-primary hover:underline mt-2"
                >
                  Purchase Wi-Fi access instead
                </button>
              </div>
            </div>
          </Card>

          <div className="mt-8 p-6 bg-muted/50 rounded-lg">
            <h3 className="font-semibold mb-2">How to use vouchers:</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Enter your voucher code exactly as provided</li>
              <li>• Codes are case-insensitive</li>
              <li>• Each voucher can only be used once</li>
              <li>• Check expiration date before redeeming</li>
            </ul>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Voucher;