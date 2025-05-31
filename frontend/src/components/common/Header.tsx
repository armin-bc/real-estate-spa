import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/context/ThemeContext';
import { Sun, Moon, Globe } from 'lucide-react';

const Header: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { theme, toggleTheme } = useTheme();

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'en' ? 'de' : 'en');
  };

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <Link to="/" className="text-xl font-bold text-primary-600">
            RealEstate Pro
          </Link>
          
          <nav className="flex items-center space-x-6">
            <Link to="/" className="text-gray-700 dark:text-gray-300 hover:text-primary-600">
              {t('navigation.home')}
            </Link>
            <Link to="/results" className="text-gray-700 dark:text-gray-300 hover:text-primary-600">
              {t('navigation.results')}
            </Link>
            <Link to="/about" className="text-gray-700 dark:text-gray-300 hover:text-primary-600">
              {t('navigation.about')}
            </Link>
            
            <button onClick={toggleLanguage} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
              <Globe size={20} />
            </button>
            
            <button onClick={toggleTheme} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
