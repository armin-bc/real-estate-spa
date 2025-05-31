import React from 'react';
import { useTranslation } from 'react-i18next';

const About: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        {t('navigation.about')}
      </h1>
      
      <div className="card">
        <p className="text-gray-600 dark:text-gray-300">
          About page content coming soon...
        </p>
      </div>
    </div>
  );
};

export default About;
