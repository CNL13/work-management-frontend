export default function SkeletonLoader({ count = 3 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="glass-card" style={{ padding: '1.5rem', borderRadius: '1.5rem', display: 'flex', flexDirection: 'column', minHeight: '240px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', marginBottom: '1rem' }}>
             <div className="skeleton" style={{ height: '24px', width: '60%', borderRadius: '4px' }}></div>
             <div className="skeleton" style={{ height: '24px', width: '80px', borderRadius: '9999px' }}></div>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <div className="skeleton" style={{ height: '14px', width: '100%', borderRadius: '4px' }}></div>
            <div className="skeleton" style={{ height: '14px', width: '90%', borderRadius: '4px' }}></div>
            <div className="skeleton" style={{ height: '14px', width: '40%', borderRadius: '4px' }}></div>
          </div>

          <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ padding: '0.875rem 0', borderTop: '1px solid rgba(0, 0, 0, 0.04)', display: 'flex', alignItems: 'center' }}>
               <div className="skeleton" style={{ height: '16px', width: '100px', borderRadius: '4px' }}></div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
               <div className="skeleton" style={{ width: '40px', height: '24px', borderRadius: '6px' }}></div>
               <div className="skeleton" style={{ width: '50px', height: '24px', borderRadius: '6px' }}></div>
            </div>
          </div>
        </div>
      ))}
    </>
  )
}
