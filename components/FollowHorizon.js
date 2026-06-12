'use client';

export default function FollowHorizon() {
  return (
    <section className="section follow-horizon">
      <div className="container follow-horizon-inner">
        <div className="follow-horizon-copy">
          <span className="section-label">Follow Horizon</span>
          <h2>Stay Connected on Social Media</h2>
          <p>
            Follow our journey for the latest admission updates, study tips, and fast support directly through Instagram, Facebook, and our WhatsApp channel.
          </p>
        </div>

        <div className="follow-horizon-actions">
          <a
            className="button social-button social-instagram"
            href="https://www.instagram.com/heceducons"
            target="_blank"
            rel="noopener noreferrer"
          >
            Instagram
          </a>
          <a
            className="button social-button social-facebook"
            href="https://www.facebook.com/profile.php?id=61590645456268"
            target="_blank"
            rel="noopener noreferrer"
          >
            Facebook
          </a>
          <a
            className="button social-button social-whatsapp"
            href="https://whatsapp.com/channel/0029VbClkJs5q08dSxjVU32R"
            target="_blank"
            rel="noopener noreferrer"
          >
            WhatsApp Channel
          </a>
        </div>
      </div>
    </section>
  );
}
