interface Props {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function TextArea({ value, onChange, placeholder }: Props) {
  return (
    <textarea
      className="w-full p-3 border border-gray-700 bg-black/30 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
      rows={6}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}