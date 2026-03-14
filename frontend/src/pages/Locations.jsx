export default function Locations() {
  const locations = [
    { id: 1, name: 'Rack A1', code: 'RA1', warehouse: 'Central Warehouse' },
    { id: 2, name: 'Main Hall', code: 'MH1', warehouse: 'Central Warehouse' }
  ];

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-semibold text-white font-poppins tracking-tight">Internal Locations</h2>
          <p className="text-gray-400 text-sm mt-1">Configure bin spaces and shelving routes</p>
        </div>
      </div>

      <div className="theme-card p-0 !border-0 overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-[#141B3A] border-b border-white/5 uppercase text-xs">
            <tr>
              <th className="px-6 py-4 font-semibold text-gray-300">Location Name</th>
              <th className="px-6 py-4 font-semibold text-gray-300">Short Code</th>
              <th className="px-6 py-4 font-semibold text-gray-300">Parent Warehouse</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {locations.map((l) => (
              <tr key={l.id} className="hover:bg-[#232C63] transition-colors duration-150">
                <td className="px-6 py-5 text-white">{l.name}</td>
                <td className="px-6 py-5 text-gray-300">{l.code}</td>
                <td className="px-6 py-5 text-gray-300">{l.warehouse}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
