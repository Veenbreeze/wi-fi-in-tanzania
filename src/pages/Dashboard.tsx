import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Users,
  Wifi,
  DollarSign,
  Clock,
  MapPin,
  Ticket,
  BarChart3,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeSessions: 0,
    totalRevenue: 0,
    totalHotspots: 0,
  });
  const [recentSessions, setRecentSessions] = useState<any[]>([]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    checkAuth();
    fetchDashboardData();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      toast.error("Please sign in to access the dashboard");
      navigate("/auth");
      return;
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("user_id", session.user.id)
      .single();

    setIsAdmin(profile?.role === "admin");
  };

  const fetchDashboardData = async () => {
    try {
      // Fetch sessions
      const { data: sessions } = await supabase
        .from("sessions")
        .select("*, hotspots(name, location)")
        .order("start_time", { ascending: false })
        .limit(5);

      setRecentSessions(sessions || []);

      // Fetch active sessions count
      const { count: activeCount } = await supabase
        .from("sessions")
        .select("*", { count: "exact", head: true })
        .eq("is_active", true);

      // Fetch orders
      const { data: orders } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);

      setRecentOrders(orders || []);

      // Calculate total revenue
      const { data: allOrders } = await supabase
        .from("orders")
        .select("amount")
        .eq("status", "completed");

      const totalRevenue = allOrders?.reduce((sum, order) => sum + Number(order.amount), 0) || 0;

      // Fetch hotspots count
      const { count: hotspotsCount } = await supabase
        .from("hotspots")
        .select("*", { count: "exact", head: true });

      // Fetch profiles count
      const { count: usersCount } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });

      setStats({
        totalUsers: usersCount || 0,
        activeSessions: activeCount || 0,
        totalRevenue,
        totalHotspots: hotspotsCount || 0,
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: <Users className="h-6 w-6" />,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "Active Sessions",
      value: stats.activeSessions,
      icon: <Wifi className="h-6 w-6" />,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      title: "Total Revenue",
      value: `${stats.totalRevenue.toLocaleString()} TZS`,
      icon: <DollarSign className="h-6 w-6" />,
      color: "text-gold",
      bgColor: "bg-gold/10",
    },
    {
      title: "Hotspots",
      value: stats.totalHotspots,
      icon: <MapPin className="h-6 w-6" />,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center h-screen">
          <p className="text-xl text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

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
              <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
              <p className="text-xl text-muted-foreground">
                {isAdmin ? "Admin Overview" : "Your Wi-Fi Activity"}
              </p>
            </div>
            {isAdmin && (
              <div className="flex gap-4">
                <Button
                  onClick={() => navigate("/hotspots")}
                  variant="outline"
                >
                  <MapPin className="mr-2 h-4 w-4" />
                  Manage Hotspots
                </Button>
                <Button
                  onClick={() => navigate("/vouchers")}
                  className="bg-gradient-primary text-primary-foreground hover:opacity-90"
                >
                  <Ticket className="mr-2 h-4 w-4" />
                  Generate Vouchers
                </Button>
              </div>
            )}
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {statCards.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="p-6 hover:shadow-elegant transition-all duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                      <div className={stat.color}>{stat.icon}</div>
                    </div>
                  </div>
                  <h3 className="text-sm text-muted-foreground mb-1">
                    {stat.title}
                  </h3>
                  <p className="text-3xl font-bold">{stat.value}</p>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Sessions */}
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-6 flex items-center">
                <Clock className="mr-2 h-6 w-6 text-primary" />
                Recent Sessions
              </h2>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Hotspot</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Expires</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentSessions.map((session) => (
                      <TableRow key={session.id}>
                        <TableCell>
                          {session.hotspots?.name || "Unknown"}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              session.is_active
                                ? "bg-accent/10 text-accent"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {session.is_active ? "Active" : "Expired"}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(session.expiry_time).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>

            {/* Recent Orders */}
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-6 flex items-center">
                <BarChart3 className="mr-2 h-6 w-6 text-gold" />
                Recent Orders
              </h2>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Phone</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell>{order.phone}</TableCell>
                        <TableCell className="font-semibold">
                          {Number(order.amount).toLocaleString()} TZS
                        </TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              order.status === "completed"
                                ? "bg-accent/10 text-accent"
                                : order.status === "pending"
                                ? "bg-gold/10 text-gold"
                                : "bg-destructive/10 text-destructive"
                            }`}
                          >
                            {order.status}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;