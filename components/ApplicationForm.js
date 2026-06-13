'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useLanguage } from '../lib/LanguageContext';
import { translations } from '../lib/translations';

const universities = [
  'Adiyaman University',
  'Ankara Yildirim Beyazit Universitesi',
  'Burdur University',
  'Kirikkale University',
  'Duzce University',
  'Zonguldak University',
  'Kastamonu University',
  'Usak University',
  'Izmir University',
  'Mersin University',
  'Samsun University',
  'Eskisehir Anadolu University',
];

const PROGRAMS = [
  'Agriculture',
  'Architecture',
  'Arts',
  'Business',
  'Computer Science',
  'Engineering',
  'Law',
  'Medicine',
  'Nursing',
  'Pharmacy',
  'Other',
].sort();

const COUNTRIES = [
  'Afghanistan','Albania','Algeria','Andorra','Angola','Argentina','Armenia','Australia','Austria','Azerbaijan',
  'Bahamas','Bahrain','Bangladesh','Barbados','Belarus','Belgium','Belize','Benin','Bhutan','Bolivia',
  'Bosnia and Herzegovina','Botswana','Brazil','Brunei','Bulgaria','Burkina Faso','Burundi','Cambodia','Cameroon','Canada',
  'Cape Verde','Central African Republic','Chad','Chile','China','Colombia','Comoros','Congo','Costa Rica','Croatia',
  'Cuba','Cyprus','Czech Republic','Denmark','Djibouti','Dominica','Dominican Republic','Ecuador','Egypt','El Salvador',
  'Equatorial Guinea','Eritrea','Estonia','Eswatini','Ethiopia','Fiji','Finland','France','Gabon','Gambia','Georgia','Germany',
  'Ghana','Greece','Grenada','Guatemala','Guinea','Guinea-Bissau','Guyana','Haiti','Honduras','Hungary','Iceland','India',
  'Indonesia','Iran','Iraq','Ireland','Israel','Italy','Jamaica','Japan','Jordan','Kazakhstan','Kenya','Kuwait','Kyrgyzstan',
  'Laos','Latvia','Lebanon','Lesotho','Liberia','Libya','Liechtenstein','Lithuania','Luxembourg','Macao','Madagascar',
  'Malawi','Malaysia','Maldives','Mali','Malta','Marshall Islands','Mauritania','Mauritius','Mexico','Moldova','Monaco',
  'Mongolia','Montenegro','Morocco','Mozambique','Myanmar','Namibia','Nauru','Nepal','Netherlands','New Zealand','Nicaragua',
  'Niger','Nigeria','North Korea','North Macedonia','Norway','Oman','Pakistan','Palau','Panama','Papua New Guinea','Paraguay',
  'Peru','Philippines','Poland','Portugal','Qatar','Romania','Russia','Rwanda','Saint Kitts and Nevis','Saint Lucia','Samoa',
  'San Marino','Saudi Arabia','Senegal','Serbia','Seychelles','Sierra Leone','Singapore','Slovakia','Slovenia','Solomon Islands',
  'Somalia','South Africa','South Korea','South Sudan','Spain','Sri Lanka','Sudan','Suriname','Sweden','Switzerland','Syria',
  'Taiwan','Tajikistan','Tanzania','Thailand','Timor-Leste','Togo','Tonga','Trinidad and Tobago','Tunisia','Turkey','Turkmenistan',
  'Tuvalu','Uganda','Ukraine','United Arab Emirates','United Kingdom','United States','Uruguay','Uzbekistan','Vanuatu','Vatican City',
  'Venezuela','Vietnam','Yemen','Zambia','Zimbabwe',
].sort();


export default function ApplicationForm() {
  const { t, language } = useLanguage();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [countrySearch, setCountrySearch] = useState('');
  const [programSearch, setProgramSearch] = useState('');
  const [facultySearch, setFacultySearch] = useState('');
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [showProgramDropdown, setShowProgramDropdown] = useState(false);
  const [showFacultyDropdown, setShowFacultyDropdown] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState('');
  const [recaptchaVerified, setRecaptchaVerified] = useState(false);
  const [formState, setFormState] = useState({
    full_name: '',
    email: '',
    phone: '',
    mother_name: '',
    father_name: '',
    address: '',
    country: '',
    program: '',
    faculty: '',
    university: '',
    message: '',
    passport: null,
    transcript: null,
    diploma: null,
    exam_sheet: null,
    id_card: null,
    photo: null,
  });
  const RECAPTCHA_SITE_KEY = '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI';

  const filteredCountries = COUNTRIES.filter(c => 
    c.toLowerCase().includes(countrySearch.toLowerCase())
  );

  const filteredPrograms = PROGRAMS.filter(p => 
    p.toLowerCase().includes(programSearch.toLowerCase())
  );

  const facultyOptions = Object.entries(translations[language]?.faculties || {}).map(([key, label]) => ({
    key,
    label,
  }));

  const filteredFaculties = facultyOptions.filter((faculty) =>
    faculty.label.toLowerCase().includes(facultySearch.toLowerCase())
  );

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const uniParam = params.get('uni');
    if (uniParam) {
      try {
        const decoded = decodeURIComponent(uniParam);
        setFormState((prev) => ({ ...prev, university: decoded }));
      } catch (err) {
        console.warn('Failed to decode uni param, using raw value', uniParam, err);
        setFormState((prev) => ({ ...prev, university: uniParam }));
      }
    }
  }, []);

  useEffect(() => {
    const renderRecaptcha = () => {
      const el = document.getElementById('recaptcha-widget');
      if (!el) return;

      if (window.grecaptcha && window.grecaptcha.render && !el.dataset.rendered) {
        window.grecaptcha.render(el, {
          sitekey: RECAPTCHA_SITE_KEY,
          callback: handleRecaptchaChange,
        });
        el.dataset.rendered = 'true';
      } else if (!window.grecaptcha) {
        setTimeout(renderRecaptcha, 300);
      }
    };

    renderRecaptcha();
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  }

  function handleCountrySelect(country) {
    setFormState((prev) => ({ ...prev, country }));
    setCountrySearch(country);
    setShowCountryDropdown(false);
  }

  function handleProgramSelect(program) {
    setFormState((prev) => ({ ...prev, program }));
    setProgramSearch(program);
    setShowProgramDropdown(false);
  }

  function handleFacultySelect(faculty) {
    setFormState((prev) => ({ ...prev, faculty }));
    setFacultySearch(faculty);
    setShowFacultyDropdown(false);
  }

  function handleCountryBlur() {
    setTimeout(() => setShowCountryDropdown(false), 200);
  }

  function handleProgramBlur() {
    setTimeout(() => setShowProgramDropdown(false), 200);
  }

  function handleFacultyBlur() {
    setTimeout(() => setShowFacultyDropdown(false), 200);
  }

  function handleRecaptchaChange(token) {
    setRecaptchaToken(token || '');
    setRecaptchaVerified(Boolean(token));
  }

  function handleCloseSuccessModal() {
    setShowSuccessModal(false);
    if (window.grecaptcha && typeof window.grecaptcha.reset === 'function') {
      window.grecaptcha.reset();
    }
    setFormState({
      full_name: '',
      email: '',
      phone: '',
      mother_name: '',
      father_name: '',
      address: '',
      country: '',
      program: '',
      university: (() => {
        const raw = new URLSearchParams(window.location.search).get('uni') || '';
        try {
          return raw ? decodeURIComponent(raw) : '';
        } catch (err) {
          return raw;
        }
      })(),
      message: '',
      passport: null,
      transcript: null,
      diploma: null,
      exam_sheet: null,
      id_card: null,
      photo: null,
    });
    router.refresh();
  }

  function handleFileChange(event, documentType) {
    const file = event.target.files[0] || null;
    setFormState((prev) => ({ ...prev, [documentType]: file }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const getErrorMessage = (error) => {
      if (!error) return 'Unknown error';
      if (typeof error === 'string') return error;
      if (typeof error === 'object') {
        return error.message || error.error || error.msg || JSON.stringify(error);
      }
      return String(error);
    };

    if (!recaptchaVerified) {
      setErrorMessage('Please verify that you are not a robot.');
      return;
    }

    const { full_name, email, phone, mother_name, father_name, address, country, program, university, message, passport, transcript, diploma, exam_sheet, id_card, photo } = formState;
    if (!full_name || !email || !phone) {
      setErrorMessage('Please complete full name, email, and phone.');
      return;
    }

    setLoading(true);

    try {
      // Send application data + files to server endpoint (FormData for multipart file upload)
      const formData = new FormData();
      formData.append('full_name', full_name);
      formData.append('email', email);
      formData.append('phone', phone);
      formData.append('mother_name', mother_name);
      formData.append('father_name', father_name);
      formData.append('address', address);
      formData.append('country', country);
      formData.append('program', program);
      formData.append('university', university);
      formData.append('message', message);

      // Append files
      const documentTypes = ['passport', 'transcript', 'diploma', 'exam_sheet', 'id_card', 'photo'];
      const documents = { passport, transcript, diploma, exam_sheet, id_card, photo };
      for (const docType of documentTypes) {
        if (documents[docType]) {
          formData.append(docType, documents[docType]);
        }
      }

      const res = await fetch('/api/submit', {
        method: 'POST',
        body: formData,
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result?.error || 'Server error saving application');
      }

      setSuccessMessage(t('form.success'));
      setShowSuccessModal(true);
      setRecaptchaVerified(false);
      setRecaptchaToken('');
      if (window.grecaptcha && typeof window.grecaptcha.reset === 'function') {
        window.grecaptcha.reset();
      }
      setFormState({
        full_name: '',
        email: '',
        phone: '',
        mother_name: '',
        father_name: '',
        address: '',
        country: '',
        program: '',
        faculty: '',
        university: decodeURIComponent(new URLSearchParams(window.location.search).get('uni') || ''),
        message: '',
        passport: null,
        transcript: null,
        diploma: null,
        exam_sheet: null,
        id_card: null,
        photo: null,
      });
      event.target.reset();
      router.refresh();
    } catch (error) {
      console.error('Application submit error:', error);
      const errorMessageText =
        (typeof error === 'string' && error) ||
        (error && typeof error === 'object' && 'message' in error && error.message) ||
        (error && typeof error === 'object' && 'error' in error && error.error) ||
        'Unable to submit application right now. Please try again later.';
      setErrorMessage(errorMessageText);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <form className="form-grid application-form" onSubmit={handleSubmit}>
        <input type="hidden" name="university" value={formState.university} />

        <div>
          <label className="form-label">
            Full Name <span className="form-required">*</span>
          </label>
          <input
            name="full_name"
            type="text"
            value={formState.full_name}
            onChange={handleChange}
            placeholder="Your full name"
            className="form-input"
            required
          />
        </div>

        <div>
          <label className="form-label">
            {t('form.email')} <span className="form-required">*</span>
          </label>
          <input
            name="email"
            type="email"
            value={formState.email}
            onChange={handleChange}
            placeholder="you@example.com"
            className="form-input"
            required
          />
        </div>

        <div>
          <label className="form-label">
            {t('form.phone')} <span className="form-required">*</span>
          </label>
          <input
            name="phone"
            type="tel"
            value={formState.phone}
            onChange={handleChange}
            placeholder="+90 5XX XXX XXXX"
            className="form-input"
            required
          />
        </div>

        <div>
          <label className="form-label">Mother Name</label>
          <input
            name="mother_name"
            type="text"
            value={formState.mother_name}
            onChange={handleChange}
            placeholder="Mother's name"
            className="form-input"
          />
        </div>

        <div>
          <label className="form-label">Father Name</label>
          <input
            name="father_name"
            type="text"
            value={formState.father_name}
            onChange={handleChange}
            placeholder="Father's name"
            className="form-input"
          />
        </div>

        <div className="full-row">
          <label className="form-label">Full Address</label>
          <textarea
            name="address"
            rows="3"
            value={formState.address}
            onChange={handleChange}
            placeholder="Enter your full address"
            className="form-textarea"
          />
        </div>

        <div>
          <label className="form-label">{t('form.country')}</label>
          <div className="searchable-select">
            <input
              type="text"
              name="country"
              placeholder="Search country..."
              value={countrySearch}
              onChange={(e) => {
                const value = e.target.value;
                setCountrySearch(value);
                setFormState((prev) => ({ ...prev, country: value }));
                setShowCountryDropdown(true);
              }}
              onFocus={() => setShowCountryDropdown(true)}
              onBlur={handleCountryBlur}
              className="form-input search-input"
            />
            {showCountryDropdown && (
              <div className="dropdown-list">
                {filteredCountries.length > 0 ? (
                  filteredCountries.map((country) => (
                    <div
                      key={country}
                      className={`dropdown-item ${formState.country === country ? 'selected' : ''}`}
                      onMouseDown={() => handleCountrySelect(country)}
                    >
                      {country}
                    </div>
                  ))
                ) : (
                  <div className="dropdown-item disabled">No countries found</div>
                )}
              </div>
            )}
          </div>
        </div>

        <div>
          <label className="form-label">{t('form.program')}</label>
          <div className="searchable-select">
            <input
              type="text"
              name="program"
              placeholder="Search program..."
              value={programSearch}
              onChange={(e) => {
                const value = e.target.value;
                setProgramSearch(value);
                setFormState((prev) => ({ ...prev, program: value }));
                setShowProgramDropdown(true);
              }}
              onFocus={() => setShowProgramDropdown(true)}
              onBlur={handleProgramBlur}
              className="form-input search-input"
            />
            {showProgramDropdown && (
              <div className="dropdown-list">
                {filteredPrograms.length > 0 ? (
                  filteredPrograms.map((program) => (
                    <div
                      key={program}
                      className={`dropdown-item ${formState.program === program ? 'selected' : ''}`}
                      onMouseDown={() => handleProgramSelect(program)}
                    >
                      {program}
                    </div>
                  ))
                ) : (
                  <div className="dropdown-item disabled">No programs found</div>
                )}
              </div>
            )}
          </div>
        </div>

        <div>
          <label className="form-label">{t('form.faculty')}</label>
          <div className="searchable-select">
            <input
              type="text"
              name="faculty"
              placeholder={t('form.selectFaculty')}
              value={facultySearch}
              onChange={(e) => {
                const value = e.target.value;
                setFacultySearch(value);
                setFormState((prev) => ({ ...prev, faculty: value }));
                setShowFacultyDropdown(true);
              }}
              onFocus={() => setShowFacultyDropdown(true)}
              onBlur={handleFacultyBlur}
              className="form-input search-input"
            />
            {showFacultyDropdown && (
              <div className="dropdown-list">
                {filteredFaculties.length > 0 ? (
                  filteredFaculties.map(({ key, label }) => (
                    <div
                      key={key}
                      className={`dropdown-item ${formState.faculty === label ? 'selected' : ''}`}
                      onMouseDown={() => handleFacultySelect(label)}
                    >
                      {label}
                    </div>
                  ))
                ) : (
                  <div className="dropdown-item disabled">No faculties found</div>
                )}
              </div>
            )}
          </div>
        </div>

        <div>
          <label className="form-label">{t('form.university')}</label>
          <input
            name="university"
            type="text"
            value={formState.university}
            onChange={handleChange}
            placeholder="Selected university"
            className="form-input"
          />
        </div>

        <div style={{ gridColumn: '1 / -1' }}>
          <label className="form-label">{t('form.message')}</label>
          <textarea
            name="message"
            rows="4"
            value={formState.message}
            onChange={handleChange}
            placeholder="Tell us more about your application"
            className="form-textarea"
          />
        </div>

        <div style={{ gridColumn: '1 / -1' }}>
          <label className="form-label">{t('form.documents')}</label>
          <div className="file-upload-grid">
            {[
              { key: 'passport', labelKey: 'form.passport' },
              { key: 'transcript', labelKey: 'form.transcript' },
              { key: 'diploma', labelKey: 'form.diploma' },
              { key: 'exam_sheet', labelKey: 'form.examSheet' },
              { key: 'id_card', labelText: 'ID Card / Tazkira' },
              { key: 'photo', labelText: 'Personal Photo' },
            ].map(({ key, labelKey, labelText }) => {
              const selected = Boolean(formState[key]);
              return (
                <div
                  key={key}
                  className={`file-upload ${selected ? 'selected' : ''}`}
                  onClick={(e) => e.currentTarget.querySelector('input').click()}
                >
                  <span className="file-upload-icon">📄</span>
                  <span className="file-upload-text">{labelText || t(labelKey)}</span>
                  {selected && <span className="file-name">{formState[key].name}</span>}
                  <input
                    type="file"
                    accept="application/pdf,image/*"
                    onChange={(e) => handleFileChange(e, key)}
                    style={{ display: 'none' }}
                  />
                </div>
              );
            })}
          </div>
        </div>

        <div className="full-row">
          <div id="recaptcha-widget" style={{ marginBottom: '1rem' }} />
        </div>

        {errorMessage && (
          <div style={{
            gridColumn: '1 / -1',
            padding: '1rem',
            background: '#fee',
            color: '#c33',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1rem'
          }}>
            {errorMessage}
          </div>
        )}

        <div className="full-row form-submit-row">
          <button
            type="submit"
            className="button button-primary button-large button-full-width"
            disabled={loading || !recaptchaVerified}
          >
            {loading ? t('form.submitting') : t('form.submit')}
          </button>
        </div>
      </form>

      {showSuccessModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: 'var(--radius-lg)',
            padding: '2rem',
            maxWidth: '500px',
            width: '90%',
            textAlign: 'center',
            boxShadow: 'var(--shadow-lg)'
          }}>
            <div style={{
              fontSize: '3rem',
              marginBottom: '1rem',
              color: 'var(--secondary)'
            }}>
              ✓
            </div>
            <h2 style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>{t('form.successTitle')}</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>{t('form.successMsg')}</p>

            <div style={{ background: 'var(--bg-light)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem' }}>
              <p style={{ margin: '0.5rem 0' }}>
                Your application and supporting documents have been received successfully. Our admissions team will review your submission and contact you soon.
              </p>
            </div>

            <div style={{ marginBottom: '1rem', textAlign: 'left' }}>
              <p style={{ fontWeight: '600', marginBottom: '0.5rem' }}>📧 Email</p>
              <a
                href="mailto:horizon@horizon-edu.net?subject=Education%20Consultation%20Request"
                style={{ color: 'var(--secondary)' }}
              >
                horizon@horizon-edu.net
              </a>
            </div>

            <div style={{ marginBottom: '1rem', textAlign: 'left' }}>
              <p style={{ fontWeight: '600', marginBottom: '0.5rem' }}>💬 WhatsApp / Phone</p>
              <a
                href="https://api.whatsapp.com/send?phone=905515227371&text=Hello%20Horizon%20Team"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: 'var(--secondary)' }}
              >
                +90 (551) 522-7371
              </a>
            </div>

            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              Please check your email regularly for updates.
            </p>

            <button
              onClick={handleCloseSuccessModal}
              className="button button-primary button-large"
              style={{ width: '100%' }}
            >
              {t('form.close') || 'Close'}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
