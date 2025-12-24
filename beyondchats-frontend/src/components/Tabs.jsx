export default function Tabs({ active, onChange }) {
  return (
    <div className="flex gap-8 border-b border-gray-700 mb-4">
      {["original", "updated"].map((tab) => (
        <button
          key={tab}
          onClick={() => onChange(tab)}
          className={`pb-2 capitalize transition ${
            active === tab
              ? "border-b-2 border-blue-500 text-blue-400 font-semibold"
              : "text-gray-400 hover:text-gray-200"
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}

