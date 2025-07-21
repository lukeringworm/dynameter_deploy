import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ADIndexCard } from "../components/ADIndexCard";
import { CategoryCard } from "../components/CategoryCard";
import { NewsCard } from "../components/NewsCard";
import { ADChart } from "../components/ADChart";
import { CategoryDetailsModal } from "../components/CategoryDetailsModal";
import { MilestoneSummary } from "../components/MilestoneSummary";
import { NewsSection } from "../components/NewsSection";
import { ThemeToggle } from "../components/theme-toggle";
import { FloatingAdminButton } from "../components/FloatingAdminButton";
import { ChartLine, Menu, X, Settings, Wifi, WifiOff } from "lucide-react";
import type { ADIndexData } from "@shared/schema";
import { Link } from "wouter";

export default function Dashboard() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { data: adData, isLoading, error, dataUpdatedAt } = useQuery<ADIndexData>({
    queryKey: ["/api/score"],
    refetchInterval: 30000, // Auto-refresh every 30 seconds
  });

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMobileMenuOpen(false);
  };

  const handleViewDetails = (categoryKey: string) => {
    setSelectedCategory(categoryKey);
  };

  const handleCloseModal = () => {
    setSelectedCategory(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading American Dynamism data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !adData) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-4">Failed to load dashboard data</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const categories = [
    {
      name: "Defense Tech",
      score: adData.categories.defense,
      change: 3.2,
      icon: "shield",
      color: "blue",
      key: "defense"
    },
    {
      name: "Manufacturing",
      score: adData.categories.manufacturing,
      change: 1.8,
      icon: "factory",
      color: "orange",
      key: "manufacturing"
    },
    {
      name: "Energy",
      score: adData.categories.energy,
      change: -0.5,
      icon: "zap",
      color: "green",
      key: "energy"
    },
    {
      name: "Workforce",
      score: adData.categories.workforce,
      change: 2.1,
      icon: "users",
      color: "purple",
      key: "workforce"
    },
    {
      name: "Tech Policy",
      score: adData.categories.techPolicy,
      change: 1.3,
      icon: "gavel",
      color: "indigo",
      key: "techPolicy"
    },
    {
      name: "Supply Chain",
      score: adData.categories.supplyChain,
      change: -1.2,
      icon: "truck",
      color: "red",
      key: "supplyChain"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 font-sans transition-colors relative">
      {/* Animated Starfield Background */}
      <div className="starfield">
        <div className="star"></div>
        <div className="star"></div>
        <div className="star"></div>
        <div className="star"></div>
        <div className="star"></div>
        <div className="star"></div>
        <div className="star"></div>
        <div className="star"></div>
        <div className="star"></div>
        <div className="star"></div>
        <div className="star"></div>
        <div className="star"></div>
        <div className="star"></div>
        <div className="star"></div>
        <div className="star"></div>
        <div className="star"></div>
        <div className="star"></div>
        <div className="star"></div>
        <div className="star"></div>
        <div className="star"></div>
      </div>
      
      {/* Patriotic animated background for light mode */}
      <div className="patriotic-bg"></div>
      <div className="patriotic-stars">
        <div className="patriotic-star"></div>
        <div className="patriotic-star"></div>
        <div className="patriotic-star"></div>
        <div className="patriotic-star"></div>
        <div className="patriotic-star"></div>
        <div className="patriotic-star"></div>
        <div className="patriotic-star"></div>
        <div className="patriotic-star"></div>
        <div className="patriotic-star"></div>
        <div className="patriotic-star"></div>
      </div>
      <div className="eagle-silhouette"></div>
      
      {/* Gradient overlay for subtle depth effect */}
      <div className="fixed inset-0 bg-gradient-radial pointer-events-none z-0"></div>
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 shadow-sm border-b border-slate-200 dark:border-slate-700 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <ChartLine className="text-primary text-2xl mr-3" />
              <h1 className="text-xl font-bold text-secondary dark:text-white">American Dynamism Tracker</h1>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a 
                href="#hero" 
                onClick={(e) => { e.preventDefault(); scrollToSection('hero'); }}
                className="text-neutral dark:text-slate-300 hover:text-secondary dark:hover:text-white transition-colors cursor-pointer"
              >
                Dashboard
              </a>
              <a 
                href="#trends" 
                onClick={(e) => { e.preventDefault(); scrollToSection('trends'); }}
                className="text-neutral dark:text-slate-300 hover:text-secondary dark:hover:text-white transition-colors cursor-pointer"
              >
                Analytics
              </a>
              <a 
                href="#categories" 
                onClick={(e) => { e.preventDefault(); scrollToSection('categories'); }}
                className="text-neutral dark:text-slate-300 hover:text-secondary dark:hover:text-white transition-colors cursor-pointer"
              >
                Categories
              </a>
              <a 
                href="#news" 
                onClick={(e) => { e.preventDefault(); scrollToSection('news'); }}
                className="text-neutral dark:text-slate-300 hover:text-secondary dark:hover:text-white transition-colors cursor-pointer"
              >
                News
              </a>
              <Link href="/admin" className="text-neutral dark:text-slate-300 hover:text-secondary dark:hover:text-white transition-colors cursor-pointer flex items-center gap-1">
                <Settings className="w-4 h-4" />
                Admin
              </Link>
            </nav>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden text-neutral dark:text-slate-300 hover:text-secondary dark:hover:text-white transition-colors"
              >
                {mobileMenuOpen ? <X className="text-xl" /> : <Menu className="text-xl" />}
              </button>
            </div>
          </div>
        </div>
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700">
            <div className="px-4 py-3 space-y-2">
              <a 
                href="#hero" 
                onClick={(e) => { e.preventDefault(); scrollToSection('hero'); }}
                className="block px-3 py-2 text-neutral dark:text-slate-300 hover:text-secondary dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-700 rounded-md transition-colors cursor-pointer"
              >
                Dashboard
              </a>
              <a 
                href="#trends" 
                onClick={(e) => { e.preventDefault(); scrollToSection('trends'); }}
                className="block px-3 py-2 text-neutral dark:text-slate-300 hover:text-secondary dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-700 rounded-md transition-colors cursor-pointer"
              >
                Analytics
              </a>
              <a 
                href="#categories" 
                onClick={(e) => { e.preventDefault(); scrollToSection('categories'); }}
                className="block px-3 py-2 text-neutral dark:text-slate-300 hover:text-secondary dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-700 rounded-md transition-colors cursor-pointer"
              >
                Categories
              </a>
              <a 
                href="#news" 
                onClick={(e) => { e.preventDefault(); scrollToSection('news'); }}
                className="block px-3 py-2 text-neutral dark:text-slate-300 hover:text-secondary dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-700 rounded-md transition-colors cursor-pointer"
              >
                News
              </a>
              <Link href="/admin" className="block px-3 py-2 text-neutral dark:text-slate-300 hover:text-secondary dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-700 rounded-md transition-colors cursor-pointer flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Admin Panel
              </Link>
            </div>
          </div>
        )}
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Hero Section */}
        <section id="hero" className="mb-12 scroll-mt-20">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-secondary dark:text-white mb-4">American Dynamism Index</h2>
            <ADIndexCard score={adData.adIndex} weeklyChange={2.1} />
            <p className="text-neutral dark:text-slate-300 mt-4 max-w-2xl mx-auto">
              Tracking America's competitive position across defense, manufacturing, energy, workforce development, technology policy, and supply chain resilience.
            </p>
          </div>
        </section>

        {/* Milestone Summary */}
        <MilestoneSummary />

        {/* Chart Section */}
        <section id="trends" className="mb-12 scroll-mt-20">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-secondary dark:text-white mb-6">30-Day Trend</h3>
            <ADChart data={adData.trendData || []} />
          </div>
        </section>

        {/* Category Grid */}
        <section id="categories" className="mb-12 scroll-mt-20">
          <h3 className="text-2xl font-bold text-secondary dark:text-white mb-8">Category Breakdown</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => (
              <CategoryCard
                key={category.key}
                name={category.name}
                score={category.score}
                change={category.change}
                icon={category.icon}
                color={category.color}
                categoryKey={category.key}
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>
        </section>

        {/* News Section */}
        <NewsSection maxItems={8} />
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 mt-16 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-neutral dark:text-slate-300">
            <p>&copy; 2024 American Dynamism Tracker. Real-time tracking of national competitive advantages.</p>
            {/* Data freshness indicator */}
            <div className="flex items-center justify-center gap-2 mt-2 text-xs">
              <Wifi className="w-3 h-3 text-green-500" />
              <span>Last updated: {new Date(dataUpdatedAt).toLocaleTimeString()}</span>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating Admin Button */}
      <FloatingAdminButton />

      {/* Category Details Modal */}
      {selectedCategory && (
        <CategoryDetailsModal
          categoryKey={selectedCategory}
          isOpen={!!selectedCategory}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}
