import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  BookOpen, 
  ClipboardList, 
  Calendar, 
  MessageCircle,
  CheckCircle,
  Settings
} from "lucide-react";

interface User {
  id: number;
  name: string;
  pace: number;
}

const navigationItems = [
  {
    name: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    name: "Units",
    href: "/units",
    icon: BookOpen,
  },
  {
    name: "Assignments & CATs",
    href: "/assignments",
    icon: ClipboardList,
  },
  {
    name: "Daily Study Plan",
    href: "/study-plan",
    icon: Calendar,
  },
  {
    name: "AI Chat",
    href: "/ai-chat",
    icon: MessageCircle,
  },
];

export default function Sidebar() {
  const [location, setLocation] = useLocation();
  const [pace, setPace] = useState([40]);

  const { data: user } = useQuery<User>({
    queryKey: ["/api/user"],
  });

  const handlePaceChange = async (newPace: number[]) => {
    setPace(newPace);
    // Update pace on the backend
    try {
      await fetch("/api/user/pace", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pace: newPace[0] }),
      });
    } catch (error) {
      console.error("Failed to update pace:", error);
    }
  };

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-warm-beige border-r border-soft-golden/20 shadow-soft slide-in-left">
      {/* Logo and Title */}
      <div className="p-6 border-b border-soft-golden/20">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-soft-golden rounded-xl flex items-center justify-center">
            <CheckCircle className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-charcoal">StudyCompanion</h1>
            <p className="text-xs text-soft-black/60">Lightweight</p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="px-4 py-6 space-y-2">
        {navigationItems.map((item) => {
          const isActive = location === item.href;
          const Icon = item.icon;
          
          return (
            <button
              key={item.name}
              onClick={() => setLocation(item.href)}
              className={cn(
                "nav-item w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-charcoal transition-all",
                isActive && "active"
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium text-sm">{item.name}</span>
            </button>
          );
        })}
      </nav>

      {/* AI Pace Selector */}
      <div className="px-6 py-4 border-t border-soft-golden/20 mt-auto absolute bottom-0 left-0 right-0">
        <div className="text-sm font-medium text-charcoal mb-3">Learning Pace</div>
        <div className="space-y-3">
          <Slider
            value={pace}
            onValueChange={handlePaceChange}
            max={80}
            min={1}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-soft-black/60">
            <span>Relaxed</span>
            <Badge variant="outline" className="text-xs px-2 py-0">
              {pace[0]}
            </Badge>
            <span>Intensive</span>
          </div>
        </div>
        <p className="text-xs text-soft-black/50 mt-2">
          Adjusts study plan intensity and break recommendations
        </p>
      </div>
    </div>
  );
}
