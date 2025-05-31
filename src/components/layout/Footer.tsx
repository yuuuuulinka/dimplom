import React from 'react';
import { Github, Twitter, Mail } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-white shadow-inner py-3 z-30 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
          {/* Left side - Brand and copyright */}
          <div className="flex items-center space-x-4">
            <h2 className="text-lg font-bold text-purple-800">GraphLearn</h2>
            <span className="text-xs text-gray-500 hidden sm:block">
              &copy; {new Date().getFullYear()} Всі права застережено.
            </span>
          </div>
          
          {/* Center - Quick links */}
          <div className="hidden md:flex items-center space-x-6">
            <a href="#" className="text-xs text-gray-600 hover:text-purple-800">Документація</a>
            <a href="#" className="text-xs text-gray-600 hover:text-purple-800">Центр допомоги</a>
            <a href="#" className="text-xs text-gray-600 hover:text-purple-800">Політика конфіденційності</a>
          </div>
          
          {/* Right side - Social links */}
          <div className="flex items-center space-x-3">
            <a href="#" className="text-gray-500 hover:text-gray-700">
              <Github size={16} />
            </a>
            <a href="#" className="text-gray-500 hover:text-gray-700">
              <Twitter size={16} />
            </a>
            <a href="#" className="text-gray-500 hover:text-gray-700">
              <Mail size={16} />
            </a>
          </div>
        </div>
        
        {/* Mobile copyright */}
        <div className="sm:hidden text-center mt-2">
          <p className="text-xs text-gray-500">
            &copy; {new Date().getFullYear()} GraphLearn. Всі права застережено.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;