interface Record {
  id: string
  amount: number
  type: 'INCOME' | 'EXPENSE'
  category: string
  date: string
  description?: string
  createdBy: { fullName: string }
}

export default function RecentActivity({ records }: { records: Record[] }) {
  function formatCurrency(amount: number) {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
      <h2 className="text-white font-semibold mb-4">Recent Activity</h2>
      <div className="space-y-1">
        {records.map((record) => (
          <div
            key={record.id}
            className="flex items-center justify-between py-3 border-b border-gray-800 last:border-0"
          >
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm
                ${record.type === 'INCOME' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                {record.type === 'INCOME' ? '↑' : '↓'}
              </div>
              <div>
                <p className="text-white text-sm font-medium">{record.category}</p>
                <p className="text-gray-500 text-xs">
                  {record.description || '—'} · {new Date(record.date).toLocaleDateString('en-IN')}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className={`text-sm font-semibold ${record.type === 'INCOME' ? 'text-emerald-400' : 'text-red-400'}`}>
                {record.type === 'INCOME' ? '+' : '-'}{formatCurrency(record.amount)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
