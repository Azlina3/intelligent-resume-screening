import React, { useState, useEffect, useRef } from 'react';

interface TimePickerProps {
  value: string;
  onChange: (time: string) => void;
}

const TimePicker: React.FC<TimePickerProps> = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [hour, setHour] = useState('10');
  const [minute, setMinute] = useState('00');
  const [period, setPeriod] = useState('AM');

  useEffect(() => {
    if (value) {
      const match = value.match(/(\d+):(\d+)\s+(AM|PM)/i);
      if (match) {
        setHour(match[1].padStart(2, '0'));
        setMinute(match[2].padStart(2, '0'));
        setPeriod(match[3].toUpperCase());
      }
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleApply = (e: React.MouseEvent) => {
    e.preventDefault();
    onChange(`${hour}:${minute} ${period}`);
    setIsOpen(false);
  };

  const hours = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
  const minutes = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));
  const periods = ['AM', 'PM'];

  const ScrollColumn = ({ items, selected, onChange }: { items: string[], selected: string, onChange: (v: string) => void }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

    useEffect(() => {
      const idx = items.indexOf(selected);
      if (idx !== -1 && itemRefs.current[idx] && containerRef.current) {
        const container = containerRef.current;
        const item = itemRefs.current[idx];
        if (item) {
          container.scrollTop = item.offsetTop - container.clientHeight / 2 + item.clientHeight / 2;
        }
      }
    }, [selected, items]);

    return (
      <div 
        ref={containerRef}
        className="h-48 overflow-y-auto flex-1 relative hide-scrollbar scroll-smooth"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <div className="h-[76px]"></div>
        {items.map((item, i) => (
          <div
            key={item}
            ref={(el) => { itemRefs.current[i] = el; }}
            className={`h-10 flex items-center justify-center cursor-pointer transition-colors ${
              selected === item ? 'text-[#1d4ed8] font-bold text-xl' : 'text-slate-400 hover:text-slate-600 text-base'
            }`}
            onClick={() => onChange(item)}
          >
            {item}
          </div>
        ))}
        <div className="h-[76px]"></div>
      </div>
    );
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsOpen(true)}
        placeholder="HH:MM AM/PM"
        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1d4ed8]/20 focus:border-[#1d4ed8] transition-colors"
      />
      
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 p-5 bg-white border border-slate-200 shadow-xl rounded-2xl z-50 w-[280px] font-sans">
          <div className="text-left font-serif font-bold text-slate-800 mb-4 text-lg">Select Time</div>
          
          <div className="flex h-48 relative rounded-xl bg-slate-50 border border-slate-100 overflow-hidden" style={{ maskImage: 'linear-gradient(to bottom, transparent, black 30%, black 70%, transparent)' }}>
            <div className="absolute top-1/2 left-0 right-0 h-10 -mt-5 border-y-2 border-blue-100 bg-white shadow-sm pointer-events-none z-0"></div>
            
            <div className="flex-1 flex z-10">
              <ScrollColumn items={hours} selected={hour} onChange={setHour} />
              <div className="flex items-center justify-center font-bold text-xl text-slate-800 w-4 pb-1 z-20 pointer-events-none">:</div>
              <ScrollColumn items={minutes} selected={minute} onChange={setMinute} />
              <ScrollColumn items={periods} selected={period} onChange={setPeriod} />
            </div>
          </div>
          
          <div className="mt-5 flex justify-end">
            <button 
              onClick={handleApply}
              className="bg-[#0f172a] text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors shadow-sm w-full"
            >
              Confirm Selection
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimePicker;
