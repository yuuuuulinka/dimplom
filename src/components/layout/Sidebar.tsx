import React from 'react';
import { UserCircle } from 'lucide-react';

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

interface SidebarProps {
  navigationItems: NavigationItem[];
  activeSection: string;
  onNavigate: (section: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ navigationItems, activeSection, onNavigate }) => {
  return (
    <aside className="fixed inset-y-0 left-0 w-64 hidden lg:block bg-white border-r z-20 pt-16">
      <div className="h-full overflow-y-auto py-4 px-2">
        <nav className="space-y-1">
          {navigationItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                activeSection === item.id
                  ? 'bg-purple-100 text-purple-800'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <span className="mr-3">{item.icon}</span>
              <span className="truncate">{item.label}</span>
            </button>
          ))}
          
          <hr className="my-4 border-gray-200" />
          
          <button
            onClick={() => onNavigate('profile')}
            className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
              activeSection === 'profile'
                ? 'bg-purple-100 text-purple-800'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            <span className="mr-3">
              <UserCircle size={20} />
            </span>
            <span className="truncate">Профіль</span>
          </button>
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;