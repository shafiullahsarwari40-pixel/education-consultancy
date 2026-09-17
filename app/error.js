'use client';

import Link from 'next/link';
import styles from './recovery.module.css';

export default function ErrorPage({ reset }) {
  return (
    <main id="main-content" className={styles.page}>
      <Link className={styles.brand} href="/" aria-label="Horizon home">HORIZON<span>EDUCATIONAL CONSULTANCY</span></Link>
      <div className={styles.content}>
        <span className={styles.eyebrow}>We couldn’t load this page</span>
        <h1>Let’s try<br />that again.</h1>
        <p>There was a temporary problem loading this page. You can retry, return home, or reach our team for help.</p>
        <div className={styles.actions}>
          <button className={styles.primary} type="button" onClick={() => reset()}>Try again <span aria-hidden="true">↻</span></button>
          <Link className={styles.secondary} href="/">Return home</Link>
        </div>
        <a className={styles.support} dir="ltr" href="mailto:horizon@horizon-edu.net">horizon@horizon-edu.net</a>
      </div>
      <span className={styles.bottom}>Your journey matters. We’re here to help.</span>
    </main>
  );
}
