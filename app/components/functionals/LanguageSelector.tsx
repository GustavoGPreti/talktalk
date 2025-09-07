import { CountryFlag } from '@/app/components/countryFlags';
import { Input } from "@heroui/react";
import { useEffect, useRef, useState } from 'react';
import linguagens from '@/app/locales/languages.json';
import { ChevronDown } from 'lucide-react';

interface LanguageSelectorProps {
  selectedLanguage: {
    label: string;
    value: string;
    flag: string;
  };
  onLanguageChange: (value: string) => void;
}

export function LanguageSelector({ selectedLanguage, onLanguageChange }: LanguageSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState('');
  const [selectedIndex, setSelectedIndex] = useState<number>();
  const inputRef = useRef<HTMLInputElement>(null);
  const filteredLanguages = filter.length > 0
    ? linguagens.filter((idioma) => 
        idioma.label.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(
          filter.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        ))
    : linguagens;

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
    setSelectedIndex(undefined);
  }, [isOpen]);

  useEffect(() => {
    if (selectedIndex !== undefined && selectedIndex >= filteredLanguages.length) {
      setSelectedIndex(undefined);
    }
  }, [filteredLanguages, selectedIndex]);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative z-10 w-full rounded-md p-2 bg-[--chat-bg-buttons-secondary] px-4 py-2 pr-8 text-left focus:outline-none sm:text-sm flex gap-2 items-center"
      >
        <CountryFlag flag={selectedLanguage.flag} />
        {selectedLanguage.label}
        <ChevronDown />
      </button>

      <div
        className={`absolute z-20 w-full rounded-md bg-white dark:bg-[var(--chat-bg-buttons)] shadow-lg ${
          isOpen ? 'block' : 'hidden'
        }`}
        style={{ zIndex: 100 }}
      >
        {isOpen && (
          <div onClick={(e) => e.stopPropagation()}>
            <Input
              type="text"
              className="p-4"
              placeholder="Pesquise uma língua..."              onChange={(e) => {
                setFilter(e.target.value);
              }}
              ref={inputRef}
              onKeyDown={(e) => {
                if (filteredLanguages.length === 0) return;
                
                if (e.key === 'ArrowDown') {
                  e.preventDefault();
                  const nextIndex = selectedIndex === undefined ? 0 : ((selectedIndex + 1) % filteredLanguages.length);
                  setSelectedIndex(nextIndex);
                  const list = document.querySelector('.custom-scrollbars');
                  const item = list?.children[nextIndex] as HTMLElement;
                  if (item) {
                    item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                  }
                } else if (e.key === 'ArrowUp') {
                  e.preventDefault();
                  const prevIndex = selectedIndex === undefined ? filteredLanguages.length - 1 : 
                    ((selectedIndex - 1 + filteredLanguages.length) % filteredLanguages.length);
                  setSelectedIndex(prevIndex);
                  const list = document.querySelector('.custom-scrollbars');
                  const item = list?.children[prevIndex] as HTMLElement;
                  if (item) {
                    item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                  }
                } else if (e.key === 'Enter') {
                  if (selectedIndex !== undefined && filteredLanguages[selectedIndex]) {
                    onLanguageChange(filteredLanguages[selectedIndex].value);
                    setIsOpen(false);
                    setFilter("");
                  } else if (filteredLanguages.length > 0) {
                    onLanguageChange(filteredLanguages[0].value);
                    setIsOpen(false);
                    setFilter("");
                  }
                }
              }}
            />
            <ul className="py-1 h-[17rem] overflow-y-scroll custom-scrollbars text-small text-gray-700">
              {filteredLanguages.map((idioma, index) => (
                <li key={idioma.value}>
                  <button
                    onClick={() => {
                      onLanguageChange(idioma.value);
                      setIsOpen(false);
                      setFilter("");
                    }}
                    className={`block w-full px-4 py-2 hover:bg-gray-600 ${
                      index === selectedIndex ? 'bg-zinc-600 text-white' : ''
                    }`}
                  >
                    <div className="flex items-center">
                      <CountryFlag flag={idioma.flag} />
                      <span className="ml-2 text-default-800">{idioma.label}</span>
                      <p className="ml-2 text-tiny text-default-600">{idioma.description}</p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      {isOpen && <div className="fixed inset-0" onClick={() => setIsOpen(false)} style={{ zIndex: 99 }} />}
    </div>
  );
}