'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { universities, universityCities } from '../lib/universities';

const STORAGE_KEY = 'horizon-university-shortlist-v1';
const normalize = (value) => value.toLocaleLowerCase('en').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/ı/g, 'i');

export default function UniversityExplorer() {
  const [query, setQuery] = useState('');
  const [city, setCity] = useState('all');
  const [sort, setSort] = useState('featured');
  const [saved, setSaved] = useState([]);
  const [showSaved, setShowSaved] = useState(false);
  const [announcement, setAnnouncement] = useState('');

  useEffect(() => {
    try {
      const stored = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '[]');
      if (Array.isArray(stored)) {
        setSaved(stored.filter((slug) => universities.some((university) => university.slug === slug)));
      }
    } catch {
      // Shortlisting still works for this visit if browser storage is unavailable.
    }
  }, []);

  const visibleUniversities = universities.filter((university) => {
    const matchesQuery = normalize(`${university.name} ${university.city} ${university.shortName}`).includes(normalize(query.trim()));
    return matchesQuery && (city === 'all' || university.city === city) && (!showSaved || saved.includes(university.slug));
  });
  if (sort === 'name') visibleUniversities.sort((a, b) => a.name.localeCompare(b.name, 'en'));
  if (sort === 'city') visibleUniversities.sort((a, b) => a.city.localeCompare(b.city, 'en'));

  function toggleSaved(university) {
    const isSaved = saved.includes(university.slug);
    const next = isSaved ? saved.filter((slug) => slug !== university.slug) : [...saved, university.slug];
    setSaved(next);
    let persisted = true;
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { persisted = false; }
    setAnnouncement(`${university.name} ${isSaved ? 'removed from' : 'added to'} your shortlist.${persisted ? '' : ' Saved for this visit only.'}`);
  }

  function resetFilters() {
    setQuery('');
    setCity('all');
    setShowSaved(false);
  }

  return (
    <section className="hu-explorer" id="explore" aria-label="Find a university">
      <div className="hu-filter-panel">
        <div className="hu-search-field">
          <label htmlFor="university-search">Find your university</label>
          <div className="hu-search-input">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 4.5 4.5" /></svg>
            <input id="university-search" type="search" placeholder="University name or city" value={query} onChange={(event) => setQuery(event.target.value)} autoComplete="off" />
          </div>
        </div>
        <div className="hu-select-field">
          <label htmlFor="university-city">Where would you like to study?</label>
          <select id="university-city" value={city} onChange={(event) => setCity(event.target.value)}>
            <option value="all">All cities</option>
            {universityCities.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </div>
        <button type="button" className={`hu-shortlist-toggle${showSaved ? ' is-active' : ''}`} aria-pressed={showSaved} onClick={() => setShowSaved(!showSaved)}>
          <svg viewBox="0 0 24 24" fill={showSaved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M6 4h12v17l-6-4-6 4V4Z" /></svg>
          My shortlist <span>{saved.length}</span>
        </button>
      </div>

      <div className="hu-results-toolbar">
        <p role="status" aria-live="polite" aria-atomic="true"><strong>{visibleUniversities.length}</strong> {visibleUniversities.length === 1 ? 'university' : 'universities'}{showSaved ? ' in your shortlist' : ' to explore'}</p>
        <div className="hu-sort-field">
          <label htmlFor="university-sort">Sort by</label>
          <select id="university-sort" aria-label="Sort universities" value={sort} onChange={(event) => setSort(event.target.value)}>
            <option value="featured">Directory order</option><option value="name">Name: A–Z</option><option value="city">City: A–Z</option>
          </select>
        </div>
      </div>
      <p className="hu-sr-only" role="status">{announcement}</p>

      {visibleUniversities.length ? (
        <div className="hu-grid">
          {visibleUniversities.map((university) => {
            const isSaved = saved.includes(university.slug);
            return (
              <article className="hu-card" key={university.slug}>
                <div className="hu-card-top">
                  <span className="hu-city"><span aria-hidden="true">◉</span> {university.city}</span>
                  <button className="hu-save" type="button" aria-pressed={isSaved} aria-label={`${isSaved ? 'Remove' : 'Save'} ${university.name}${isSaved ? ' from' : ' to'} shortlist`} onClick={() => toggleSaved(university)}>
                    <svg viewBox="0 0 24 24" fill={isSaved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M6 4h12v17l-6-4-6 4V4Z" /></svg>
                  </button>
                </div>
                <div className="hu-card-logo">
                  {university.logo ? <Image src={university.logo} alt="" width={180} height={90} unoptimized /> : <span className="hu-monogram" aria-hidden="true">{university.shortName}</span>}
                </div>
                <h2><Link href={`/universities/${university.slug}`}>{university.name}</Link></h2>
                <p>{university.introduction}</p>
                <div className="hu-card-bottom">
                  <span>Türkiye</span>
                  <Link href={`/universities/${university.slug}`} aria-label={`Explore ${university.name}`}>Explore university <span aria-hidden="true">↗</span></Link>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="hu-empty">
          <span className="hu-empty-icon" aria-hidden="true">⌕</span>
          <h2>{showSaved && saved.length === 0 ? 'Your shortlist starts here.' : 'Let’s widen the search.'}</h2>
          <p>{showSaved && saved.length === 0 ? 'Save the universities that interest you using the bookmark button on each card. Your choices stay in this browser.' : 'We couldn’t find a university matching these filters. Try another name or choose all cities.'}</p>
          <button type="button" className="hu-button hu-button-dark" onClick={resetFilters}>Explore all universities <span aria-hidden="true">→</span></button>
        </div>
      )}
      <p className="hu-directory-note">A starting point for your research. Program availability, fees and entry requirements vary by intake. Check the official sources on each profile before applying. Saved universities are stored on this device.</p>
    </section>
  );
}
