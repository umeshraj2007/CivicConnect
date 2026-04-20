import { getPartyColor, getPartyFullName } from '../utils/helpers';

export default function PartyBadge({ party, colors = {}, lookup = {}, size = 'sm' }) {
  const bg = getPartyColor(party, colors);
  const fullName = getPartyFullName(party, lookup);

  const sizeClass = size === 'lg'
    ? 'px-3 py-1 text-sm font-bold'
    : 'px-2 py-0.5 text-xs font-semibold';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full ${sizeClass} tracking-wide`}
      style={{ backgroundColor: bg + '22', color: bg, border: `1px solid ${bg}44` }}
      title={fullName}
    >
      <span
        className="inline-block w-1.5 h-1.5 rounded-full flex-shrink-0"
        style={{ backgroundColor: bg }}
      />
      {party}
    </span>
  );
}
