import Link from 'next/link';
import styles from './recovery.module.css';

export default function NotFound() {
  return (
    <main id="main-content" className={styles.page}>
      <Link className={styles.brand} href="/" aria-label="Horizon home">HORIZON<span>EDUCATIONAL CONSULTANCY</span></Link>
      <div className={styles.content}>
        <span className={styles.eyebrow}>404 · A small detour</span>
        <h1>Your next chapter<br />is still ahead.</h1>
        <p>This page may have moved, or the link may be incomplete. Let’s get you back to planning your future in Türkiye.</p>
        <div className={styles.actions}>
          <Link className={styles.primary} href="/">Back to Horizon <span aria-hidden="true">↗</span></Link>
          <Link className={styles.secondary} href="/#contact">Speak with an advisor</Link>
        </div>
        <nav className={styles.links} aria-label="Helpful pages">
          <Link href="/apply">Start an application</Link>
          <Link href="/student/dashboard">Student portal</Link>
        </nav>
      </div>
      <span className={styles.bottom}>A clearer path to university in Türkiye.</span>
    </main>
  );
}
