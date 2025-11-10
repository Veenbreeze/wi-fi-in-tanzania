import { motion } from "framer-motion";
import { Wifi, Clock, Shield, Zap, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";

const Index = () => {
  const navigate = useNavigate();

  const packages = [
    {
      name: "Daily Pass",
      duration: "24 Hours",
      price: "1,000",
      minutes: 1440,
      features: ["High-speed internet", "24/7 Support", "Multiple devices"],
    },
    {
      name: "3-Day Pass",
      duration: "72 Hours",
      price: "5,000",
      minutes: 4320,
      features: ["High-speed internet", "24/7 Support", "Multiple devices", "Priority access"],
      popular: true,
    },
    {
      name: "Weekly Pass",
      duration: "7 Days",
      price: "15,000",
      minutes: 10080,
      features: ["High-speed internet", "24/7 Support", "Multiple devices", "Priority access", "Best value"],
    },
  ];

  const features = [
    {
      icon: <Zap className="h-8 w-8" />,
      title: "Lightning Fast",
      description: "Experience blazing fast internet speeds up to 100 Mbps",
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: "Secure Connection",
      description: "Your data is protected with enterprise-grade encryption",
    },
    {
      icon: <Clock className="h-8 w-8" />,
      title: "24/7 Availability",
      description: "Access Wi-Fi anytime, anywhere across Tanzania",
    },
    {
      icon: <Wifi className="h-8 w-8" />,
      title: "Wide Coverage",
      description: "Connected hotspots in major cities and towns",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-hero">
        <div className="container mx-auto px-4 py-20 md:py-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="mb-6 text-5xl font-bold tracking-tight md:text-7xl bg-gradient-primary bg-clip-text text-transparent">
              Fast Wi-Fi, Everywhere
            </h1>
            <p className="mb-8 text-xl text-muted-foreground md:text-2xl max-w-3xl mx-auto">
              Stay connected across Tanzania with our reliable, high-speed Wi-Fi hotspots. 
              Purchase access instantly with M-Pesa.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-gradient-primary hover:opacity-90 text-primary-foreground shadow-elegant"
                onClick={() => navigate("/purchase")}
              >
                Get Connected <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate("/voucher")}
              >
                Redeem Voucher
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">Why Choose Us?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Experience the best Wi-Fi service in Tanzania
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="p-6 text-center hover:shadow-elegant transition-all duration-300">
                  <div className="inline-flex p-3 rounded-lg bg-gradient-primary text-primary-foreground mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Choose the plan that works best for you
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {packages.map((pkg, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card 
                  className={`p-8 relative hover:shadow-elegant transition-all duration-300 ${
                    pkg.popular ? "border-2 border-primary shadow-glow" : ""
                  }`}
                >
                  {pkg.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <span className="bg-gradient-accent text-accent-foreground px-4 py-1 rounded-full text-sm font-semibold">
                        Most Popular
                      </span>
                    </div>
                  )}
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold mb-2">{pkg.name}</h3>
                    <p className="text-muted-foreground mb-4">{pkg.duration}</p>
                    <div className="flex items-baseline justify-center">
                      <span className="text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                        {pkg.price}
                      </span>
                      <span className="text-muted-foreground ml-2">TZS</span>
                    </div>
                  </div>
                  <ul className="space-y-3 mb-8">
                    {pkg.features.map((feature, i) => (
                      <li key={i} className="flex items-center">
                        <div className="h-5 w-5 rounded-full bg-accent/10 flex items-center justify-center mr-3">
                          <div className="h-2 w-2 rounded-full bg-accent" />
                        </div>
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className={`w-full ${
                      pkg.popular
                        ? "bg-gradient-primary hover:opacity-90 text-primary-foreground"
                        : ""
                    }`}
                    variant={pkg.popular ? "default" : "outline"}
                    onClick={() => navigate("/purchase", { state: { selectedPackage: pkg } })}
                  >
                    Get Started
                  </Button>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold mb-4">Ready to Get Connected?</h2>
            <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
              Join thousands of satisfied customers enjoying fast, reliable Wi-Fi
            </p>
            <Button
              size="lg"
              variant="secondary"
              onClick={() => navigate("/purchase")}
              className="shadow-lg"
            >
              Purchase Access Now
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-card border-t">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; 2025 Tanzania Wi-Fi. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;