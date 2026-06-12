'use client';

export default function WhatsAppButton() {
  return (
    <a
      href="https://api.whatsapp.com/send?phone=905515227371&text=Hello%20Horizon%20Team"
      target="_blank"
      rel="noopener noreferrer"
      className="floating-button"
      title="Chat with us on WhatsApp"
      aria-label="Chat with us on WhatsApp"
    >
      💬
    </a>
  );
}
