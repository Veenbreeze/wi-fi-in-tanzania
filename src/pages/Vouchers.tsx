/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Ticket, Copy, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const Vouchers = () => {
  const navigate = useNavigate();
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    quantity: 1,
    duration_hours: 24,
    validity_days: 30,
  });

  useEffect(() => {
    checkAuth();
    fetchVouchers();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      toast.error("Please sign in to access this page");
      navigate("/auth");
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("user_id", session.user.id)
      .single();

    if (profile?.role !== "admin") {
      toast.error("Admin access required");
      navigate("/dashboard");
    }
  };

  const fetchVouchers = async () => {
    const { data, error } = await supabase
      .from("vouchers")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to fetch vouchers");
    } else {
      setVouchers(data || []);
    }
  };

  const generateCode = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "";
    for (let i = 0; i < 12; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
      if ((i + 1) % 4 === 0 && i < 11) code += "-";
    }
    return code;
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + formData.validity_days);

      const vouchersToCreate = [];
      for (let i = 0; i < formData.quantity; i++) {
        vouchersToCreate.push({
          code: generateCode(),
          duration_minutes: formData.duration_hours * 60,
          expires_at: expiresAt.toISOString(),
        });
      }

      const { error } = await supabase
        .from("vouchers")
        .insert(vouchersToCreate);

      if (error) throw error;

      toast.success(`Generated ${formData.quantity} voucher(s) successfully`);
      setIsDialogOpen(false);
      setFormData({ quantity: 1, duration_hours: 24, validity_days: 30 });
      fetchVouchers();
    } catch (error: any) {
      toast.error(error.message || "Failed to generate vouchers");
    }
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Voucher code copied to clipboard");
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
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold mb-2">Generate Vouchers</h1>
              <p className="text-xl text-muted-foreground">
                Create Wi-Fi access vouchers for distribution
              </p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-primary text-primary-foreground hover:opacity-90">
                  <Plus className="mr-2 h-4 w-4" />
                  Generate Vouchers
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Generate New Vouchers</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleGenerate} className="space-y-4">
                  <div>
                    <Label htmlFor="quantity">Number of Vouchers</Label>
                    <Input
                      id="quantity"
                      type="number"
                      min="1"
                      max="100"
                      value={formData.quantity}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          quantity: parseInt(e.target.value),
                        })
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="duration">Duration (Hours)</Label>
                    <Input
                      id="duration"
                      type="number"
                      min="1"
                      value={formData.duration_hours}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          duration_hours: parseInt(e.target.value),
                        })
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="validity">Validity Period (Days)</Label>
                    <Input
                      id="validity"
                      type="number"
                      min="1"
                      value={formData.validity_days}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          validity_days: parseInt(e.target.value),
                        })
                      }
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-gradient-primary text-primary-foreground hover:opacity-90"
                  >
                    Generate Vouchers
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <Card className="p-6">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Expires</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vouchers.map((voucher) => (
                    <TableRow key={voucher.id}>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Ticket className="h-4 w-4 text-primary" />
                          <span className="font-mono font-semibold">
                            {voucher.code}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {Math.floor(voucher.duration_minutes / 60)} hours
                      </TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            voucher.used
                              ? "bg-muted text-muted-foreground"
                              : new Date(voucher.expires_at) < new Date()
                              ? "bg-destructive/10 text-destructive"
                              : "bg-accent/10 text-accent"
                          }`}
                        >
                          {voucher.used
                            ? "Used"
                            : new Date(voucher.expires_at) < new Date()
                            ? "Expired"
                            : "Active"}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(voucher.expires_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(voucher.code)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Vouchers;