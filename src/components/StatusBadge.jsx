export default function StatusBadge({ status, submittedLabel = 'Đã nộp' }) {
  const map = {
    Approved:   'bg-green-100 text-green-700',
    Rejected:   'bg-red-100 text-red-700',
    Submitted:  'bg-yellow-100 text-yellow-700',
    InProgress: 'bg-blue-100 text-blue-700',
    NotStarted: 'bg-gray-100 text-gray-700',
  }
  
  const label = {
    Approved:   'Đã phê duyệt',
    Rejected:   'Bị từ chối',
    Submitted:  submittedLabel,
    InProgress: 'Đang thực hiện',
    NotStarted: 'Chưa bắt đầu',
  }

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${map[status] || 'bg-gray-100 text-gray-600'}`}>
      {label[status] || status}
    </span>
  )
}
