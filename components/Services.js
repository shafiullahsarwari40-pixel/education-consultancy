'use client';

import { useLanguage } from '../lib/LanguageContext';

export default function Services() {
  const { t } = useLanguage();
  const services = [
    {
      title: t('services.service1'),
      description: t('services.service1Desc'),
      icon: '🎯'
    },
    {
      title: t('services.service2'),
      description: t('services.service2Desc'),
      icon: '📄'
    },
    {
      title: t('services.service3'),
      description: t('services.service3Desc'),
      icon: '💎'
    },
    {
      title: t('services.service4'),
      description: t('services.service4Desc'),
      icon: '✈️'
    },
    {
      title: t('services.service5'),
      description: t('services.service5Desc'),
      icon: '🏠'
    },
    {
      title: t('services.service6'),
      description: t('services.service6Desc'),
      icon: '🏡'
    },
    {
      title: t('services.service7'),
      description: t('services.service7Desc'),
      icon: '🚗'
    },
    {
      title: t('services.service8'),
      description: t('services.service8Desc'),
      icon: '🗣️'
    },
    {
      title: t('services.service9'),
      description: t('services.service9Desc'),
      icon: '⚕️'
    },
    {
      title: t('services.service10'),
      description: t('services.service10Desc'),
      icon: '💬'
    },
  ];

  return (
    <section className="section" id="services">
      <div className="container">
        <div className="section-header">
          <span className="section-label">What We Offer</span>
          <h2>Comprehensive Student Services</h2>
          <p>From application to arrival, Horizon supports students step by step with professional guidance and reliable assistance.</p>
        </div>

        <div className="cards-grid">
          {services.map((service, index) => (
            <div key={index} className="card">
              <div className="card-icon">{service.icon}</div>
              <h3>{service.title}</h3>
              <p>{service.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
