import { forwardRef } from 'react';
import DatePicker, { registerLocale } from 'react-datepicker';
import { nl } from 'date-fns/locale';
import 'react-datepicker/dist/react-datepicker.css';
import './DateTimePicker.css';

// Register Dutch locale
registerLocale('nl', nl);

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
    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 cursor-pointer bg-white"
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
  placeholderText = 'Selecteer datum en tijd',
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
      locale="nl"
      placeholderText={placeholderText}
      customInput={<CustomInput />}
      className={className}
      calendarClassName="rounded-lg shadow-lg border border-gray-200"
      wrapperClassName="w-full"
    />
  );
}
