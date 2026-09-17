'use client';

import Link from 'next/link';
import { useLanguage } from '../lib/LanguageContext';
import '../app/language-notice.css';

const noticeCopy = {
  en: {
    text: 'This page is currently available in English. Our advisors can help with your questions.',
    link: 'Talk to an advisor',
  },
  tr: {
    text: 'Bu sayfa şu anda İngilizce olarak sunulmaktadır. Danışmanlarımız sorularınız konusunda yardımcı olabilir.',
    link: 'Bir danışmanla görüşün',
  },
  fa: {
    text: 'این صفحه در حال حاضر به زبان انگلیسی در دسترس است. مشاوران ما می‌توانند در پاسخ به پرسش‌های شما کمک کنند.',
    link: 'با یک مشاور صحبت کنید',
  },
  ps: {
    text: 'دا پاڼه اوس په انګلیسي ژبه وړاندې کېږي. زموږ مشاورین ستاسو د پوښتنو په ځوابولو کې مرسته کولی شي.',
    link: 'له یوه مشاور سره خبرې وکړئ',
  },
  ur: {
    text: 'یہ صفحہ فی الحال انگریزی میں دستیاب ہے۔ ہمارے مشیر آپ کے سوالات کے جوابات میں مدد کر سکتے ہیں۔',
    link: 'کسی مشیر سے بات کریں',
  },
  hi: {
    text: 'यह पृष्ठ फ़िलहाल अंग्रेज़ी में उपलब्ध है। हमारे सलाहकार आपके सवालों के जवाब देने में मदद कर सकते हैं।',
    link: 'सलाहकार से बात करें',
  },
  ar: {
    text: 'هذه الصفحة متاحة حاليًا باللغة الإنجليزية. يمكن لمستشارينا مساعدتك في الإجابة عن أسئلتك.',
    link: 'تحدث مع مستشار',
  },
  fr: {
    text: 'Cette page est actuellement disponible en anglais. Nos conseillers peuvent vous aider à répondre à vos questions.',
    link: 'Parler à un conseiller',
  },
};

const RTL_LANGUAGES = ['fa', 'ps', 'ur', 'ar'];

export default function EnglishContentNotice({ tone = 'light' }) {
  const { language } = useLanguage();
  if (language === 'en') return null;

  const copy = noticeCopy[language] || noticeCopy.en;

  return (
    <aside
      role="note"
      className={`horizon-language-notice${tone === 'dark' ? ' horizon-language-notice--dark' : ''}`}
      lang={language}
      dir={RTL_LANGUAGES.includes(language) ? 'rtl' : 'ltr'}
    >
      <span>{copy.text}</span>
      <Link href="/#contact">{copy.link}<span aria-hidden="true"> ↗</span></Link>
    </aside>
  );
}
