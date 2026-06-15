'use client';

import Image from 'next/image';
import { useLanguage } from '../lib/LanguageContext';

const universities = [
  {
    logo: '/images/universities/adiyaman-university.png',
    name: 'Adıyaman University',
    city: 'Adıyaman',
    programs: '100+ Programs',
    languages: 'English, Turkish',
  },
  {
    logo: '/images/universities/ankara-yildirim-beyazit-university.svg',
    name: 'Ankara Yıldırım Beyazıt University',
    city: 'Ankara',
    programs: '160+ Programs',
    languages: 'English, Turkish',
  },
  {
    logo: '/images/universities/burdur-mehmet-akif-ersoy-university.png',
    name: 'Burdur Mehmet Akif Ersoy University',
    city: 'Burdur',
    programs: '90+ Programs',
    languages: 'English, Turkish',
  },
  {
    logo: '/images/universities/kirikkale-university.svg',
    name: 'Kırıkkale University',
    city: 'Kırıkkale',
    programs: '110+ Programs',
    languages: 'English, Turkish',
  },
  {
    logo: '/images/universities/duzce-university.svg',
    name: 'Düzce University',
    city: 'Düzce',
    programs: '95+ Programs',
    languages: 'English, Turkish',
  },
  {
    logo: '/images/universities/zonguldak-bulent-ecevit-university.png',
    name: 'Zonguldak Bülent Ecevit University',
    city: 'Zonguldak',
    programs: '120+ Programs',
    languages: 'English, Turkish',
  },
  {
    logo: '/images/universities/kastamonu-university.jpg',
    name: 'Kastamonu University',
    city: 'Kastamonu',
    programs: '80+ Programs',
    languages: 'English, Turkish',
  },
  {
    logo: '/images/universities/usak-university.png',
    name: 'Uşak University',
    city: 'Uşak',
    programs: '85+ Programs',
    languages: 'English, Turkish',
  },
  {
    logo: '/images/universities/izmir-katip-celebi-university.png',
    name: 'İzmir Katip Çelebi University',
    city: 'İzmir',
    programs: '130+ Programs',
    languages: 'English, Turkish',
  },
  {
    logo: '/images/universities/mersin-university.svg',
    name: 'Mersin University',
    city: 'Mersin',
    programs: '100+ Programs',
    languages: 'English, Turkish',
  },
  {
    logo: '/images/universities/ondokuz-mayis-university.png',
    name: 'Ondokuz Mayıs University',
    city: 'Samsun',
    programs: '140+ Programs',
    languages: 'English, Turkish',
  },
  {
    logo: '/images/universities/anadolu-university.svg',
    name: 'Anadolu University',
    city: 'Eskişehir',
    programs: '180+ Programs',
    languages: 'English, Turkish',
  },
];

export default function Universities() {
  const { t } = useLanguage();

  return (
    <section className="section" id="universities">
      <div className="container">
        <div className="section-header">
          <span className="section-label">{t('universities.label')}</span>
          <h2>{t('universities.title')}</h2>
          <p>{t('universities.description')}</p>
        </div>

        <div className="universities-grid">
          {universities.map((uni, idx) => (
            <article key={uni.name || idx} className="university-card">
              <div className="university-logo">
                <Image
                  src={uni.logo}
                  alt={`${t('universities.logoAltPrefix')} ${uni.name}`}
                  width={280}
                  height={98}
                  priority={false}
                />
              </div>

              <div className="university-content">
                <h3>{uni.name}</h3>
                <p className="university-meta">{uni.city} · {uni.languages}</p>
                <div className="university-details">
                  <span>{uni.programs}</span>
                  <span>{t('universities.fastSupport')}</span>
                </div>
                <a href={`/apply?uni=${encodeURIComponent(uni.name)}`} className="button button-primary button-full-width">
                  {t('universities.apply')}
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
