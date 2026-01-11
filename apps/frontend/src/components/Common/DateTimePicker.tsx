import { forwardRef } from 'react';
import DatePicker, { registerLocale } from 'react-datepicker';
import { enGB } from 'date-fns/locale';
import 'react-datepicker/dist/react-datepicker.css';
import './DateTimePicker.css';

// Register English (GB) locale
registerLocale('en-GB', enGB);

interface DateTimePickerProps {
  selected: Date | null;
  onChange: (date: Date | null) => void;
  showTimeSelect?: boolean;
  timeFormat?: string;
  timeIntervals?: number;
  dateFormat?: string;
  placeholderText?: string;
  className?: string;
}

// Custom input component for styling
const CustomInput = forwardRef<HTMLInputElement, any>(({ value, onClick, placeholder }, ref) => (
  <input
    type="text"
    value={value}
    onClick={onClick}
    ref={ref}
    placeholder={placeholder}
    readOnly
    className="w-full px-4 py-2.5 border-2 border-accent-primary/30 rounded-lg focus:ring-2 focus:ring-accent-primary focus:border-accent-primary cursor-pointer bg-bg-secondary text-text-primary placeholder-text-secondary font-body transition-all hover:border-accent-primary/50 hover:bg-bg-tertiary"
  />
));

CustomInput.displayName = 'CustomInput';

export function DateTimePicker({
  selected,
  onChange,
  showTimeSelect = true,
  timeFormat = 'HH:mm',
  timeIntervals = 15,
  dateFormat = 'dd-MM-yyyy HH:mm',
  placeholderText = 'Select date and time',
  className = '',
}: DateTimePickerProps) {
  return (
    <DatePicker
      selected={selected}
      onChange={onChange}
      showTimeSelect={showTimeSelect}
      timeFormat={timeFormat}
      timeIntervals={timeIntervals}
      dateFormat={dateFormat}
      locale="en-GB"
      placeholderText={placeholderText}
      customInput={<CustomInput />}
      className={className}
      calendarClassName="rounded-lg shadow-ocean-lg border-2 border-accent-primary/30 bg-secondary"
      wrapperClassName="w-full"
    />
  );
}
