import { useState } from "react";
import { Settings, X } from "lucide-react";
import { Link } from "wouter";

export function FloatingAdminButton() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isExpanded && (
        <div className="mb-3 animate-in slide-in-from-bottom-2 duration-200">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 p-3 min-w-48">
            <div className="space-y-2">
              <Link href="/admin">
                <button className="w-full text-left px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md transition-colors">
                  Admin Panel
                </button>
              </Link>
              <button 
                onClick={() => window.location.reload()}
                className="w-full text-left px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md transition-colors"
              >
                Refresh Data
              </button>
            </div>
          </div>
        </div>
      )}
      
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`
          w-14 h-14 rounded-full shadow-lg transition-all duration-300
          ${isExpanded 
            ? 'bg-red-500 hover:bg-red-600 rotate-180' 
            : 'bg-primary hover:bg-primary/90 hover:scale-110 animate-float'
          }
          text-white flex items-center justify-center
          group
        `}
        aria-label="Admin actions"
      >
        {isExpanded ? (
          <X className="w-6 h-6" />
        ) : (
          <Settings className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
        )}
      </button>
    </div>
  );
}