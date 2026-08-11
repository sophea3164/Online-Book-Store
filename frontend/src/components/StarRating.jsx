export default function StarRating({ rating = 0, count, size = '1rem' }) {
    return (
        <div className="stars" style={{ fontSize: size }}>
            {[1, 2, 3, 4, 5].map(s => (
                <span key={s} className={`star ${s <= Math.round(rating) ? '' : 'empty'}`}>★</span>
            ))}
            {count !== undefined && (
                <span style={{ color: '#6b7280', fontSize: '.8rem', marginLeft: '.25rem' }}>({count})</span>
            )}
        </div>
    );
}
