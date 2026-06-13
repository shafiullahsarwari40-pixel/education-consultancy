'use client';

import Image from 'next/image';

const universities = [
  {
    slug: 'adiyaman-university',
    name: 'Adıyaman University',
    city: 'Adıyaman',
    programs: '100+ Programs',
    languages: 'English, Turkish',
  },
  {
    slug: 'ankara-yildirim-beyazit-university',
    name: 'Ankara Yıldırım Beyazıt University',
    city: 'Ankara',
    programs: '160+ Programs',
    languages: 'English, Turkish',
  },
  {
    slug: 'burdur-mehmet-akif-ersoy-university',
    name: 'Burdur Mehmet Akif Ersoy University',
    city: 'Burdur',
    programs: '90+ Programs',
    languages: 'English, Turkish',
  },
  {
    slug: 'kirikkale-university',
    name: 'Kırıkkale University',
    city: 'Kırıkkale',
    programs: '110+ Programs',
    languages: 'English, Turkish',
  },
  {
    slug: 'duzce-university',
    name: 'Düzce University',
    city: 'Düzce',
    programs: '95+ Programs',
    languages: 'English, Turkish',
  },
  {
    slug: 'zonguldak-bulent-ecevit-university',
    name: 'Zonguldak Bülent Ecevit University',
    city: 'Zonguldak',
    programs: '120+ Programs',
    languages: 'English, Turkish',
  },
  {
    slug: 'kastamonu-university',
    name: 'Kastamonu University',
    city: 'Kastamonu',
    programs: '80+ Programs',
    languages: 'English, Turkish',
  },
  {
    slug: 'usak-university',
    name: 'Uşak University',
    city: 'Uşak',
    programs: '85+ Programs',
    languages: 'English, Turkish',
  },
  {
    slug: 'izmir-katip-celebi-university',
    name: 'İzmir Katip Çelebi University',
    city: 'İzmir',
    programs: '130+ Programs',
    languages: 'English, Turkish',
  },
  {
    slug: 'mersin-university',
    name: 'Mersin University',
    city: 'Mersin',
    programs: '100+ Programs',
    languages: 'English, Turkish',
  },
  {
    slug: 'ondokuz-mayis-university',
    name: 'Ondokuz Mayıs University',
    city: 'Samsun',
    programs: '140+ Programs',
    languages: 'English, Turkish',
  },
  {
    slug: 'anadolu-university',
    name: 'Anadolu University',
    city: 'Eskişehir',
    programs: '180+ Programs',
    languages: 'English, Turkish',
  },
];

export default function Universities() {
  return (
    <section className="section" id="universities">
      <div className="container">
        <div className="section-header">
          <span className="section-label">Featured Partner Universities</span>
          <h2>Premium Turkish University Placement Partners</h2>
          <p>Study abroad with trusted Turkish universities offering English-friendly programs, modern campuses, and strong international support.</p>
        </div>

        <div className="universities-grid">
          {universities.map((uni) => (
            <article key={uni.slug} className="university-card">
              <div className="university-logo">
                <Image
                  src={`/images/universities/${uni.slug}.svg`}
                  alt={`${uni.name} logo`}
                  width={280}
                  height={98}
                />
              </div>

              <div className="university-content">
                <h3>{uni.name}</h3>
                <p className="university-meta">{uni.city} · {uni.languages}</p>
                <div className="university-details">
                  <span>{uni.programs}</span>
                  <span>Fast admission support</span>
                </div>
                <a href={`/apply?uni=${encodeURIComponent(uni.name)}`} className="button button-primary button-full-width">
                  Apply Now
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
