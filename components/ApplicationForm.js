'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useLanguage } from '../lib/LanguageContext';
import { translations } from '../lib/translations';

const universities = [
  'Adıyaman University',
  'Ankara Yıldırım Beyazıt University',
  'Burdur Mehmet Akif Ersoy University',
  'Kırıkkale University',
  'Düzce University',
  'Zonguldak Bülent Ecevit University',
  'Kastamonu University',
  'Uşak University',
  'İzmir Katip Çelebi University',
  'Mersin University',
  'Ondokuz Mayıs University',
  'Anadolu University',
  'Karabük University',
];

const PROGRAMS = [
  'Bachelor',
  'Master',
  'PhD',
];

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
  const [universitySearch, setUniversitySearch] = useState('');
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [showProgramDropdown, setShowProgramDropdown] = useState(false);
  const [showFacultyDropdown, setShowFacultyDropdown] = useState(false);
  const [showUniversityDropdown, setShowUniversityDropdown] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [fileSizeError, setFileSizeError] = useState('');
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
  const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
  const MAX_TOTAL_UPLOAD_BYTES = 50 * 1024 * 1024;

  const formatBytes = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    return `${(kb / 1024).toFixed(1)} MB`;
  };

  const getTotalFileSize = (files) =>
    Object.values(files).reduce((total, file) => total + (file?.size || 0), 0);

  const getDocumentFiles = () => ({
    passport: formState.passport,
    transcript: formState.transcript,
    diploma: formState.diploma,
    exam_sheet: formState.exam_sheet,
    id_card: formState.id_card,
    photo: formState.photo,
  });

  const uploadDocumentFile = async (applicationId, docType, file) => {
    if (!file) return null;
    if (!supabase) {
      throw new Error('Upload client is not configured.');
    }

    const timestamp = Date.now();
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const filePath = `applications/${applicationId}/${docType}-${timestamp}-${safeName}`;

    const { error: uploadError } = await supabase.storage
      .from('application-uploads')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      throw new Error(`Upload failed for ${docType}: ${uploadError.message}`);
    }

    const { data: publicUrlData, error: urlError } = await supabase.storage
      .from('application-uploads')
      .getPublicUrl(filePath);

    if (urlError || !publicUrlData?.publicUrl) {
      throw new Error(`Failed to generate public URL for ${docType}`);
    }

    return publicUrlData.publicUrl;
  };

  const filteredCountries = COUNTRIES.filter(c => 
    c.toLowerCase().includes(countrySearch.toLowerCase())
  );

  const filteredPrograms = PROGRAMS.filter(p => 
    p.toLowerCase().includes(programSearch.toLowerCase())
  );

  const filteredUniversities = universities.filter(u => 
    u.toLowerCase().includes(universitySearch.toLowerCase())
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
    (async () => {
      if (!supabase) {
        setAuthLoading(false);
        return;
      }
      const { data } = await supabase.auth.getSession();
      setSession(data?.session ?? null);
      setAuthLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (session?.user?.email) {
      setFormState((prev) => ({
        ...prev,
        email: prev.email || session.user.email,
      }));
    }
  }, [session]);

  useEffect(() => {
    // No reCAPTCHA required for application submission.
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

  function handleUniversitySelect(university) {
    setFormState((prev) => ({ ...prev, university }));
    setUniversitySearch(university);
    setShowUniversityDropdown(false);
  }

  function handleUniversityBlur() {
    setTimeout(() => setShowUniversityDropdown(false), 200);
  }

  function handleCloseSuccessModal() {
    setShowSuccessModal(false);
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
    const existingFiles = { ...formState, [documentType]: file };
    const totalSize = getTotalFileSize({
      passport: existingFiles.passport,
      transcript: existingFiles.transcript,
      diploma: existingFiles.diploma,
      exam_sheet: existingFiles.exam_sheet,
      id_card: existingFiles.id_card,
      photo: existingFiles.photo,
    });

    if (file && file.size > MAX_FILE_SIZE_BYTES) {
      setFileSizeError(`File ${file.name} is too large (${formatBytes(file.size)}). Maximum file size is ${formatBytes(MAX_FILE_SIZE_BYTES)}.`);
      return;
    }

    if (totalSize > MAX_TOTAL_UPLOAD_BYTES) {
      setFileSizeError(`Total uploaded documents exceed ${formatBytes(MAX_TOTAL_UPLOAD_BYTES)}. Remove some files or upload smaller scans.`);
      return;
    }

    setFileSizeError('');
    setFormState((prev) => ({ ...prev, [documentType]: file }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!session) {
      setErrorMessage('Please sign in before submitting your application.');
      return;
    }

    const getErrorMessage = (error) => {
      if (!error) return 'Unknown error';
      if (typeof error === 'string') return error;
      if (typeof error === 'object') {
        return error.message || error.error || error.msg || JSON.stringify(error);
      }
      return String(error);
    };

    const { full_name, email, phone, mother_name, father_name, address, country, program, university, message, passport, transcript, diploma, exam_sheet, id_card, photo } = formState;
    if (!full_name || !email || !phone) {
      setErrorMessage('Please complete full name, email, and phone.');
      return;
    }

    if (fileSizeError) {
      setErrorMessage(fileSizeError);
      return;
    }

    const totalSize = getTotalFileSize({ passport, transcript, diploma, exam_sheet, id_card, photo });
    if (totalSize > MAX_TOTAL_UPLOAD_BYTES) {
      setErrorMessage(`Attachments are too large. Maximum total upload size is ${formatBytes(MAX_TOTAL_UPLOAD_BYTES)}.`);
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
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: formData,
      });

      const text = await res.text();
      let result;
      if (text) {
        try {
          result = JSON.parse(text);
        } catch (jsonError) {
          const normalized = text.replace(/\s+/g, ' ').trim();
          if (/request entity too large|413/i.test(normalized)) {
            throw new Error('Upload is too large. Please reduce attachment sizes and try again.');
          }
          throw new Error(text || 'Unexpected server response');
        }
      }

      if (!res.ok) {
        throw new Error(result?.error || 'Server error saving application');
      }

      setSuccessMessage(t('form.success'));
      setShowSuccessModal(true);
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
      
      // Delay redirect by 3 seconds to let user see success message
      setTimeout(() => {
        router.push('/student/dashboard');
      }, 3000);
      return;
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

  if (authLoading) {
    return <div>{t('form.loadingAuthStatus')}</div>;
  }

  if (!session) {
    return (
      <div className="application-login-prompt" style={{ padding: '2rem', border: '1px solid #ddd', borderRadius: '1rem', background: '#fafafa' }}>
        <h2>{t('form.loginRequiredTitle')}</h2>
        <p>{t('form.loginRequiredDescription')}</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: 360 }}>
          <Link href="/student/login" className="button button-primary button-large">
            {t('form.studentLogin')}
          </Link>
          <Link href="/student/signup" className="button button-secondary button-large">
            {t('form.createStudentAccount')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <div style={{ marginBottom: '1rem', padding: '1rem', background: '#f5f8ff', borderRadius: '0.75rem' }}>
        <p style={{ margin: 0 }}>{t('form.signedInAs')} <strong>{session.user.email}</strong></p>
        <p style={{ margin: '0.5rem 0 0 0' }}>
          {t('form.afterSubmissionInfo')} <Link href="/student/dashboard">{t('form.yourStudentDashboard')}</Link>.
        </p>
      </div>
      <form className="form-grid application-form" onSubmit={handleSubmit}>
        <input type="hidden" name="university" value={formState.university} />

        <div>
          <label className="form-label">
            {t('form.firstName')} <span className="form-required">*</span>
          </label>
          <input
            name="full_name"
            type="text"
            value={formState.full_name}
            onChange={handleChange}
            placeholder={t('form.firstNamePlaceholder')}
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
            placeholder={t('form.emailPlaceholder')}
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
            placeholder={t('form.phonePlaceholder')}
            className="form-input"
            required
          />
        </div>

        <div>
          <label className="form-label">{t('form.motherName')}</label>
          <input
            name="mother_name"
            type="text"
            value={formState.mother_name}
            onChange={handleChange}
            placeholder={t('form.motherNamePlaceholder')}
            className="form-input"
          />
        </div>

        <div>
          <label className="form-label">{t('form.fatherName')}</label>
          <input
            name="father_name"
            type="text"
            value={formState.father_name}
            onChange={handleChange}
            placeholder={t('form.fatherNamePlaceholder')}
            className="form-input"
          />
        </div>

        <div className="full-row">
          <label className="form-label">{t('form.address')}</label>
          <textarea
            name="address"
            rows="3"
            value={formState.address}
            onChange={handleChange}
            placeholder={t('form.addressPlaceholder')}
            className="form-textarea"
          />
        </div>

        <div>
          <label className="form-label">{t('form.country')}</label>
          <div className="searchable-select">
            <input
              type="text"
              name="country"
              placeholder={t('form.searchCountryPlaceholder')}
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
                  <div className="dropdown-item disabled">{t('form.noCountriesFound')}</div>
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
              placeholder={t('form.searchProgramPlaceholder')}
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
                  <div className="dropdown-item disabled">{t('form.noProgramsFound')}</div>
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
                  <div className="dropdown-item disabled">{t('form.noFacultiesFound')}</div>
                )}
              </div>
            )}
          </div>
        </div>

        <div>
          <label className="form-label">{t('form.university')}</label>
          <div className="searchable-select">
            <input
              type="text"
              name="university"
              placeholder={t('form.searchUniversityPlaceholder')}
              value={universitySearch}
              onChange={(e) => {
                const value = e.target.value;
                setUniversitySearch(value);
                setFormState((prev) => ({ ...prev, university: value }));
                setShowUniversityDropdown(true);
              }}
              onFocus={() => setShowUniversityDropdown(true)}
              onBlur={handleUniversityBlur}
              className="form-input search-input"
            />
            {showUniversityDropdown && (
              <div className="dropdown-list">
                {filteredUniversities.length > 0 ? (
                  filteredUniversities.map((university) => (
                    <div
                      key={university}
                      className={`dropdown-item ${formState.university === university ? 'selected' : ''}`}
                      onMouseDown={() => handleUniversitySelect(university)}
                    >
                      {university}
                    </div>
                  ))
                ) : (
                  <div className="dropdown-item disabled">{t('form.noUniversitiesFound')}</div>
                )}
              </div>
            )}
          </div>
        </div>

        <div style={{ gridColumn: '1 / -1' }}>
          <label className="form-label">{t('form.message')}</label>
          <textarea
            name="message"
            rows="4"
            value={formState.message}
            onChange={handleChange}
            placeholder={t('form.messagePlaceholder')}
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
              { key: 'id_card', labelText: t('form.idCard') },
              { key: 'photo', labelText: t('form.photo') },
            ].map(({ key, labelKey, labelText }) => {
              const selected = Boolean(formState[key]);
              const label = labelText || (labelKey ? t(labelKey) : '');
              const inputId = `file-input-${key}`;

              return (
                <div
                  key={key}
                  className={`file-upload-card ${selected ? 'selected' : ''}`}
                  onClick={() => document.getElementById(inputId)?.click()}
                >
                  <div className="card-top">
                    <div className="file-upload-icon">📄</div>
                    <div className="file-upload-title">{label}</div>
                  </div>

                  <div className="card-body">
                    {selected ? (
                      <div className="file-preview">{formState[key].name}</div>
                    ) : (
                      <div className="file-placeholder">{t('form.noFile')}</div>
                    )}
                  </div>

                  <div className="card-footer">
                    <button
                      type="button"
                      className="button button-outline upload-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        document.getElementById(inputId)?.click();
                      }}
                    >
                      {selected ? t('form.change') : t('form.upload')}
                    </button>
                    {selected && (
                      <button
                        type="button"
                        className="button button-secondary remove-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          setFormState((prev) => ({ ...prev, [key]: null }));
                        }}
                      >
                        {t('form.remove')}
                      </button>
                    )}
                  </div>

                  <input
                    id={inputId}
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
        {fileSizeError && !errorMessage && (
          <div style={{
            gridColumn: '1 / -1',
            padding: '1rem',
            background: '#fff4e5',
            color: '#8a4f00',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1rem'
          }}>
            {fileSizeError}
          </div>
        )}

        <div className="full-row form-submit-row">
          <button
            type="submit"
            className="button button-primary button-large button-full-width"
            disabled={loading || Boolean(fileSizeError)}
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
                {t('form.afterSubmitInfo')}
              </p>
            </div>

            <div style={{ marginBottom: '1rem', textAlign: 'left' }}>
              <p style={{ fontWeight: '600', marginBottom: '0.5rem' }}>📧 {t('form.emailLabel')}</p>
              <a
                href="mailto:horizon@horizon-edu.net?subject=Education%20Consultation%20Request"
                style={{ color: 'var(--secondary)' }}
              >
                horizon@horizon-edu.net
              </a>
            </div>

            <div style={{ marginBottom: '1rem', textAlign: 'left' }}>
              <p style={{ fontWeight: '600', marginBottom: '0.5rem' }}>💬 {t('form.phone')}</p>
              <a
                href="https://api.whatsapp.com/send?phone=905515227371&text=Hello%20Horizon%20Team"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: 'var(--secondary)' }}
              >
                +90 (551) 522-7371
              </a>
              <div style={{ marginTop: '0.5rem' }}>
                <a
                  href="https://t.me/horizonedu"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'var(--secondary)' }}
                >
                  {t('form.telegramLinkText')}
                </a>
              </div>
            </div>

            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              {t('form.emailNote')}
            </p>

            <div style={{ display: 'flex', gap: '1rem', flexDirection: 'column' }}>
              <button
                onClick={() => {
                  setShowSuccessModal(false);
                  router.push('/student/result');
                }}
                className="button button-primary button-large"
                style={{ width: '100%' }}
              >
                {t('nav.seeResult')}
              </button>
              <button
                onClick={handleCloseSuccessModal}
                className="button button-secondary button-large"
                style={{ width: '100%' }}
              >
                {t('form.close') || 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
