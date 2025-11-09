import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Plus, Edit, Trash2 } from "lucide-react";
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

const Hotspots = () => {
  const navigate = useNavigate();
  const [hotspots, setHotspots] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingHotspot, setEditingHotspot] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    ip_or_mac: "",
  });

  useEffect(() => {
    checkAuth();
    fetchHotspots();
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

  const fetchHotspots = async () => {
    const { data, error } = await supabase
      .from("hotspots")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to fetch hotspots");
    } else {
      setHotspots(data || []);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingHotspot) {
        const { error } = await supabase
          .from("hotspots")
          .update(formData)
          .eq("id", editingHotspot.id);

        if (error) throw error;
        toast.success("Hotspot updated successfully");
      } else {
        const { error } = await supabase
          .from("hotspots")
          .insert(formData);

        if (error) throw error;
        toast.success("Hotspot created successfully");
      }

      setIsDialogOpen(false);
      setEditingHotspot(null);
      setFormData({ name: "", location: "", ip_or_mac: "" });
      fetchHotspots();
    } catch (error: any) {
      toast.error(error.message || "Failed to save hotspot");
    }
  };

  const handleEdit = (hotspot: any) => {
    setEditingHotspot(hotspot);
    setFormData({
      name: hotspot.name,
      location: hotspot.location,
      ip_or_mac: hotspot.ip_or_mac || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this hotspot?")) return;

    const { error } = await supabase
      .from("hotspots")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Failed to delete hotspot");
    } else {
      toast.success("Hotspot deleted successfully");
      fetchHotspots();
    }
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from("hotspots")
      .update({ is_active: !currentStatus })
      .eq("id", id);

    if (error) {
      toast.error("Failed to update status");
    } else {
      toast.success("Status updated successfully");
      fetchHotspots();
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
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold mb-2">Manage Hotspots</h1>
              <p className="text-xl text-muted-foreground">
                Add and manage Wi-Fi hotspot locations
              </p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  className="bg-gradient-primary text-primary-foreground hover:opacity-90"
                  onClick={() => {
                    setEditingHotspot(null);
                    setFormData({ name: "", location: "", ip_or_mac: "" });
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Hotspot
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingHotspot ? "Edit Hotspot" : "Add New Hotspot"}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Hotspot Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="e.g., City Center Hotspot"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) =>
                        setFormData({ ...formData, location: e.target.value })
                      }
                      placeholder="e.g., Dar es Salaam, Tanzania"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="ip_or_mac">IP / MAC Address (Optional)</Label>
                    <Input
                      id="ip_or_mac"
                      value={formData.ip_or_mac}
                      onChange={(e) =>
                        setFormData({ ...formData, ip_or_mac: e.target.value })
                      }
                      placeholder="e.g., 192.168.1.1"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-gradient-primary text-primary-foreground hover:opacity-90"
                  >
                    {editingHotspot ? "Update Hotspot" : "Create Hotspot"}
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
                    <TableHead>Name</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>IP/MAC</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {hotspots.map((hotspot) => (
                    <TableRow key={hotspot.id}>
                      <TableCell className="font-semibold">
                        <div className="flex items-center">
                          <MapPin className="mr-2 h-4 w-4 text-primary" />
                          {hotspot.name}
                        </div>
                      </TableCell>
                      <TableCell>{hotspot.location}</TableCell>
                      <TableCell className="font-mono text-sm">
                        {hotspot.ip_or_mac || "-"}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleStatus(hotspot.id, hotspot.is_active)}
                        >
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              hotspot.is_active
                                ? "bg-accent/10 text-accent"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {hotspot.is_active ? "Active" : "Inactive"}
                          </span>
                        </Button>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(hotspot)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(hotspot.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
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

export default Hotspots;