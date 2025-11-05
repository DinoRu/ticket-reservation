// Stats Card Component
const StatsCard = ({ icon: Icon, title, value, subtitle, color = "blue" }) => (
  <div className="bg-white rounded-lg shadow-md p-6">
    <div className="flex items-center justify-between mb-4">
      <div
        className={`w-12 h-12 bg-${color}-100 rounded-lg flex items-center justify-center`}
      >
        <Icon className={`w-6 h-6 text-${color}-600`} />
      </div>
    </div>
    <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
    <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
    {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
  </div>
);

export default StatsCard;
