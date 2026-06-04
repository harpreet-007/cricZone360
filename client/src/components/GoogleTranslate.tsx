'use client';

import { useEffect, useMemo, useState } from 'react';
import { Check, ChevronDown, Languages, Search } from 'lucide-react';
import { logClientWarning } from '@/lib/clientError';

declare global {
  interface Window {
    googleTranslateElementInit?: () => void;
    google?: {
      translate?: {
        TranslateElement?: new (
          options: Record<string, unknown>,
          elementId: string
        ) => unknown;
      };
    };
  }
}

const languages = [
  ['en', 'English'],
  ['hi', 'हिन्दी'],
  ['bn', 'বাংলা'],
  ['ta', 'தமிழ்'],
  ['te', 'తెలుగు'],
  ['mr', 'मराठी'],
  ['gu', 'ગુજરાતી'],
  ['kn', 'ಕನ್ನಡ'],
  ['ml', 'മലയാളം'],
  ['pa', 'ਪੰਜਾਬੀ'],
  ['ur', 'اردو'],
  ['ar', 'العربية'],
  ['zh-CN', '简体中文'],
  ['zh-TW', '繁體中文'],
  ['fr', 'Français'],
  ['de', 'Deutsch'],
  ['es', 'Español'],
  ['pt', 'Português'],
  ['ru', 'Русский'],
  ['ja', '日本語'],
  ['ko', '한국어'],
  ['it', 'Italiano'],
  ['nl', 'Nederlands'],
  ['tr', 'Türkçe'],
  ['id', 'Bahasa Indonesia'],
  ['ms', 'Bahasa Melayu'],
  ['th', 'ไทย'],
  ['vi', 'Tiếng Việt'],
  ['fa', 'فارسی'],
  ['ne', 'नेपाली'],
  ['si', 'සිංහල'],
  ['af', 'Afrikaans'],
  ['sq', 'Albanian'],
  ['am', 'Amharic'],
  ['hy', 'Armenian'],
  ['az', 'Azerbaijani'],
  ['eu', 'Basque'],
  ['be', 'Belarusian'],
  ['bs', 'Bosnian'],
  ['bg', 'Bulgarian'],
  ['ca', 'Catalan'],
  ['ceb', 'Cebuano'],
  ['co', 'Corsican'],
  ['hr', 'Croatian'],
  ['cs', 'Czech'],
  ['da', 'Danish'],
  ['eo', 'Esperanto'],
  ['et', 'Estonian'],
  ['fi', 'Finnish'],
  ['fy', 'Frisian'],
  ['gl', 'Galician'],
  ['ka', 'Georgian'],
  ['el', 'Greek'],
  ['ht', 'Haitian Creole'],
  ['ha', 'Hausa'],
  ['haw', 'Hawaiian'],
  ['he', 'Hebrew'],
  ['hmn', 'Hmong'],
  ['hu', 'Hungarian'],
  ['is', 'Icelandic'],
  ['ig', 'Igbo'],
  ['ga', 'Irish'],
  ['jw', 'Javanese'],
  ['kk', 'Kazakh'],
  ['km', 'Khmer'],
  ['ku', 'Kurdish'],
  ['ky', 'Kyrgyz'],
  ['lo', 'Lao'],
  ['la', 'Latin'],
  ['lv', 'Latvian'],
  ['lt', 'Lithuanian'],
  ['lb', 'Luxembourgish'],
  ['mk', 'Macedonian'],
  ['mg', 'Malagasy'],
  ['mt', 'Maltese'],
  ['mi', 'Maori'],
  ['mn', 'Mongolian'],
  ['my', 'Myanmar'],
  ['no', 'Norwegian'],
  ['ps', 'Pashto'],
  ['pl', 'Polish'],
  ['ro', 'Romanian'],
  ['sm', 'Samoan'],
  ['gd', 'Scots Gaelic'],
  ['sr', 'Serbian'],
  ['st', 'Sesotho'],
  ['sn', 'Shona'],
  ['sd', 'Sindhi'],
  ['sk', 'Slovak'],
  ['sl', 'Slovenian'],
  ['so', 'Somali'],
  ['su', 'Sundanese'],
  ['sw', 'Swahili'],
  ['sv', 'Swedish'],
  ['tg', 'Tajik'],
  ['uk', 'Ukrainian'],
  ['uz', 'Uzbek'],
  ['cy', 'Welsh'],
  ['xh', 'Xhosa'],
  ['yi', 'Yiddish'],
  ['yo', 'Yoruba'],
  ['zu', 'Zulu'],
] as const;

const hiddenElementId = 'google_translate_element_hidden';

const getSavedLanguage = () => {
  if (typeof window === 'undefined') return 'en';
  return window.localStorage.getItem('cz-language') || 'en';
};

const setTranslateCookie = (code: string) => {
  const value = `/en/${code}`;
  document.cookie = `googtrans=${value};path=/`;
  if (window.location.hostname.includes('.')) {
    document.cookie = `googtrans=${value};path=/;domain=.${window.location.hostname}`;
  }
};

const GoogleTranslate = () => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedCode, setSelectedCode] = useState('en');

  useEffect(() => {
    setSelectedCode(getSavedLanguage());

    if (!document.getElementById(hiddenElementId)) {
      const hiddenElement = document.createElement('div');
      hiddenElement.id = hiddenElementId;
      hiddenElement.className = 'google-translate-hidden';
      document.body.appendChild(hiddenElement);
    }

    window.googleTranslateElementInit = () => {
      if (!window.google?.translate?.TranslateElement) return;

      const target = document.getElementById(hiddenElementId);
      if (target && !target.childElementCount) {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: 'en',
            autoDisplay: false,
          },
          hiddenElementId
        );
      }
    };

    if (!document.querySelector('script[data-google-translate="true"]')) {
      const script = document.createElement('script');
      script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      script.dataset.googleTranslate = 'true';
      script.onerror = (error) => logClientWarning('Google Translate script failed to load', error);
      document.body.appendChild(script);
    } else {
      window.googleTranslateElementInit();
    }
  }, []);

  const selectedLabel = languages.find(([code]) => code === selectedCode)?.[1] || 'English';
  const filteredLanguages = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return languages;

    return languages.filter(([code, label]) =>
      code.toLowerCase().includes(needle) || label.toLowerCase().includes(needle)
    );
  }, [query]);

  const applyLanguage = (code: string) => {
    setSelectedCode(code);
    setOpen(false);
    setQuery('');
    window.localStorage.setItem('cz-language', code);
    setTranslateCookie(code);

    const combo = document.querySelector<HTMLSelectElement>('.goog-te-combo');
    if (combo) {
      combo.value = code;
      combo.dispatchEvent(new Event('change', { bubbles: true }));
      return;
    }

    window.location.reload();
  };

  return (
    <div className="google-language-picker notranslate relative" translate="no">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex min-w-[170px] items-center justify-between gap-2 rounded-full border border-blue-700 bg-blue-900/40 px-3 py-1.5 text-xs font-black text-white transition hover:bg-blue-800"
      >
        <span className="flex min-w-0 items-center gap-2">
          <Languages size={15} className="shrink-0 text-orange-400" />
          <span className="truncate">{selectedLabel}</span>
        </span>
        <ChevronDown size={14} className={`shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-[200] mt-2 w-72 overflow-hidden rounded-xl border border-gray-100 bg-white text-gray-900 shadow-2xl dark:border-gray-800 dark:bg-gray-900 dark:text-white">
          <div className="border-b border-gray-100 p-3 dark:border-gray-800">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search language..."
                translate="no"
                className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-9 pr-3 text-sm font-semibold outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 dark:border-gray-700 dark:bg-gray-950 dark:focus:ring-orange-950"
                autoFocus
              />
            </div>
          </div>

          <div className="max-h-72 overflow-y-auto py-2">
            {filteredLanguages.length ? (
              filteredLanguages.map(([code, label]) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => applyLanguage(code)}
                  className="notranslate flex w-full items-center justify-between px-4 py-2 text-left text-sm font-bold hover:bg-orange-50 hover:text-orange-600 dark:hover:bg-orange-950/30"
                  translate="no"
                >
                  <span>{label}</span>
                  {selectedCode === code && <Check size={15} className="text-orange-500" />}
                </button>
              ))
            ) : (
              <p className="px-4 py-6 text-center text-sm font-bold text-gray-500">No language found.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default GoogleTranslate;
