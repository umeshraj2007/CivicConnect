import { useAllData } from '../utils/useData';
import { getFlagUrl } from '../utils/helpers';
import { CardSkeleton } from '../components/Skeletons';

export default function ChiefMinisters() {
  const { cmData, loading, error } = useAllData();

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="font-display text-3xl font-bold dark:text-white text-gray-900 mb-6 transition-colors">Chief Ministers of Tamil Nadu</h1>
        <div className="space-y-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    );
  }

  if (error || !cmData) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 text-center text-red-400">
        <p>Failed to load Chief Ministers data.</p>
      </div>
    );
  }

  const cms = cmData.chief_ministers_tamil_nadu;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="font-display text-4xl font-extrabold dark:text-white text-gray-900 mb-2 transition-colors">
          Chief Ministers
        </h1>
        <p className="dark:text-gray-400 text-gray-600 transition-colors transition-colors">History of Tamil Nadu's Chief Ministers and their notable decisions.</p>
      </div>

      <div className="flex flex-col space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent dark:before:via-gray-700 before:via-gray-200 before:to-transparent">
        {cms.map((cm, idx) => {
          // Extract abbreviation roughly from parenthesis if exists
          let abbr = "";
          const match = cm.party_name.match(/\(([^)]+)\)/);
          if (match) {
            abbr = match[1];
          } else if (cm.party_name.includes('Congress')) {
            abbr = "INC"; // Map congress to INC for flag
          }

          const flagUrl = getFlagUrl(abbr);

          return (
            <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              <div className="flex items-center justify-center w-10 h-10 rounded-full border dark:border-gray-500 border-gray-200 dark:bg-gray-950 bg-gray-50 dark:text-gray-500 text-gray-400 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 transition-colors">
                <span className="text-xs font-black">{idx + 1}</span>
              </div>
              
              <div className="card p-6 w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] hover:border-brand-500/50 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-display font-bold text-xl dark:text-white text-gray-900 transition-colors">{cm.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      {flagUrl && (
                        <img 
                          src={flagUrl} 
                          alt={`${abbr} Flag`} 
                          className="w-8 h-5 object-cover rounded-sm border dark:border-gray-700 border-gray-200" 
                        />
                      )}
                      <p className="text-sm font-bold text-brand-500">{cm.party_name}</p>
                    </div>
                  </div>
                  <span className="dark:bg-gray-800 bg-gray-100 dark:text-gray-300 text-gray-700 text-xs font-semibold px-2.5 py-1 rounded border dark:border-gray-700 border-gray-200 transition-colors">
                    {cm.years_in_office}
                  </span>
                </div>
                
                <div className="mt-4 pt-4 border-t dark:border-gray-800 border-gray-100 transition-colors">
                  <p className="text-sm dark:text-gray-400 text-gray-600 transition-colors">
                    <strong className="dark:text-gray-300 text-gray-950">Notable Decision: </strong> 
                    {cm.notable_decision}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
