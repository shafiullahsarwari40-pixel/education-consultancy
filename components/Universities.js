'use client';

import Image from 'next/image';
import { useState } from 'react';

export default function Universities() {
  const [activeFilter, setActiveFilter] = useState('all');

  const universities = [
    { name: 'Istanbul Medipol University', city: 'Istanbul', programs: '180+', languages: 'EN, TR', degrees: 'BA, MA, PhD' },
    { name: 'Bahçeşehir University', city: 'Istanbul', programs: '150+', languages: 'EN, TR', degrees: 'BA, MA, PhD' },
    { name: 'Istanbul Bilgi University', city: 'Istanbul', programs: '140+', languages: 'EN, TR', degrees: 'BA, MA, PhD' },
    { name: 'Istanbul Okan University', city: 'Istanbul', programs: '130+', languages: 'EN, TR', degrees: 'BA, MA, PhD' },
    { name: 'Altınbaş University', city: 'Istanbul', programs: '120+', languages: 'EN, TR', degrees: 'BA, MA, PhD' },
    { name: 'Istinye University', city: 'Istanbul', programs: '115+', languages: 'EN, TR', degrees: 'BA, MA, PhD' },
    { name: 'Başkent University', city: 'Ankara', programs: '160+', languages: 'EN, TR', degrees: 'BA, MA, PhD' },
    { name: 'Yaşar University', city: 'Izmir', programs: '125+', languages: 'EN, TR', degrees: 'BA, MA, PhD' },
    { name: 'Antalya Bilim University', city: 'Antalya', programs: '95+', languages: 'EN, TR', degrees: 'BA, MA' },
    { name: 'Istanbul Gelişim University', city: 'Istanbul', programs: '140+', languages: 'EN, TR', degrees: 'BA, MA, PhD' },
  ];

  const cities = ['all', 'Istanbul', 'Ankara', 'Izmir', 'Antalya'];

  const filtered = activeFilter === 'all'
    ? universities
    : universities.filter(uni => uni.city === activeFilter);

  return (
    <section className="section" id="universities">
      <div className="container">
        <div className="section-header">
          <span className="section-label">Our University Options</span>
          <h2>Turkish Universities Students Can Apply To</h2>
          <p>Quality universities across Turkey offering diverse programs taught in English.</p>
        </div>

        <div className="university-hero">
          <div className="section-image">
            <Image
              src="/images/university-campus-1.webp"
              alt="University campus with modern buildings and students"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
          <div className="section-image">
            <Image
              src="/images/university-campus-2.webp"
              alt="Students walking across a university campus"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        </div>

        <div style={{ marginBottom: '2rem', display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          {cities.map((city) => (
            <button
              key={city}
              onClick={() => setActiveFilter(city)}
              className={`button ${activeFilter === city ? 'button-primary' : 'button-outline'} button-small`}
            >
              {city.charAt(0).toUpperCase() + city.slice(1)}
            </button>
          ))}
        </div>

        <div className="cards-grid">
          {filtered.map((uni, index) => (
            <div key={index} className="card">
              <div style={{
                background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                height: '120px',
                borderRadius: '0.75rem',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '2rem'
              }}>
                🏫
              </div>
              <h3>{uni.name}</h3>
              <div style={{ marginBottom: '1rem' }}>
                <p style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}><strong>📍 Location:</strong> {uni.city}</p>
                <p style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}><strong>📚 Programs:</strong> {uni.programs}</p>
                <p style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}><strong>🌐 Languages:</strong> {uni.languages}</p>
                <p style={{ fontSize: '0.875rem', marginBottom: '0' }}><strong>🎓 Degrees:</strong> {uni.degrees}</p>
              </div>
              <a href={`/apply?uni=${encodeURIComponent(uni.name)}`} className="button button-secondary button-small">
                Ask About This
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
