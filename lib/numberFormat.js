export const DIGIT_SETS = {
  arab: ['\u0660','\u0661','\u0662','\u0663','\u0664','\u0665','\u0666','\u0667','\u0668','\u0669'],
  persian: ['\u06F0','\u06F1','\u06F2','\u06F3','\u06F4','\u06F5','\u06F6','\u06F7','\u06F8','\u06F9'],
};

export function localizeDigits(input, lang) {
  if (!input || typeof input !== 'string') return input;

  // Determine digit set by language
  // Arabic (ar) -> Arabic-Indic (U+0660..)
  // Persian/Farsi (fa), Urdu (ur), Pashto (ps) -> Extended Arabic-Indic (U+06F0..)
  const langKey = (lang || '').toLowerCase();
  let digits = null;
  if (langKey === 'ar') digits = DIGIT_SETS.arab;
  if (langKey === 'fa' || langKey === 'ur' || langKey === 'ps') digits = DIGIT_SETS.persian;

  if (!digits) return input;

  return input.replace(/\d/g, (d) => digits[Number(d)]);
}

export default localizeDigits;
