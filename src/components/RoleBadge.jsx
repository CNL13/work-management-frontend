export default function RoleBadge({ role }) {
  if (role === 'Admin') return (
    <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-semibold">
      🛡️ Admin
    </span>
  )
  if (role === 'Manager') return (
    <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs font-semibold">
      👑 Trưởng phòng
    </span>
  )
  return (
    <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs font-semibold">
      👤 Nhân viên
    </span>
  )
}
