import React, { useState } from 'react';
import { Search, AlertTriangle, CheckCircle2, ShieldAlert, Navigation } from 'lucide-react';
import { getMatchingFacilities, updateReferral, type FacilityMatchResult } from '../api/client';

interface SmartFacilityMatchingProps {
  referralId: number;
  currentHospitalId: number | null;
  onFacilitySelected: () => void;
  disabled?: boolean;
}

export const SmartFacilityMatching: React.FC<SmartFacilityMatchingProps> = ({ 
  referralId, 
  currentHospitalId,
  onFacilitySelected,
  disabled = false
}) => {
  const [matches, setMatches] = useState<FacilityMatchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectingId, setSelectingId] = useState<number | null>(null);

  const handleFindMatches = async () => {
    setIsExpanded(true);
    setLoading(true);
    setError(null);
    try {
      const response = await getMatchingFacilities(referralId);
      setMatches(response.matches);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch facility matches');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectFacility = async (hospitalId: number) => {
    setSelectingId(hospitalId);
    try {
      await updateReferral(referralId, { receiving_hospital_id: hospitalId });
      onFacilitySelected();
    } catch (err: any) {
      alert(err.message || 'Failed to select facility');
    } finally {
      setSelectingId(null);
    }
  };

  return (
    <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground flex items-center space-x-2">
            <Search className="w-5 h-5 text-blue-500" />
            <span>Smart Facility Matching</span>
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Find the best facility based on specialty, services, capacity, and equipment.
          </p>
        </div>
        {!isExpanded && !disabled && (
          <button 
            onClick={handleFindMatches}
            className="px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50 rounded-lg font-medium transition-colors"
          >
            Find Matches
          </button>
        )}
      </div>

      {isExpanded && (
        <div className="mt-6 space-y-4">
          {loading && (
            <div className="p-8 text-center text-muted-foreground animate-pulse">
              Analyzing facilities...
            </div>
          )}
          
          {error && (
            <div className="p-4 bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400 rounded-lg">
              {error}
            </div>
          )}
          
          {!loading && !error && matches.length === 0 && (
            <div className="p-8 text-center text-muted-foreground border border-dashed rounded-lg">
              No matching facilities found.
            </div>
          )}

          {!loading && !error && matches.length > 0 && (
            <div className="space-y-4">
              {matches.map((match) => (
                <div 
                  key={match.hospital_id} 
                  className={`border rounded-lg p-4 transition-all ${
                    currentHospitalId === match.hospital_id 
                      ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/10' 
                      : 'border-border hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-semibold text-lg text-foreground">{match.hospital_name}</h3>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          match.match_level === 'High Match' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                          match.match_level === 'Moderate Match' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                          'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                        }`}>
                          {match.match_level} ({match.score} pts)
                        </span>
                      </div>
                      
                      {match.city && (
                        <p className="text-sm text-muted-foreground flex items-center space-x-1 mb-3">
                          <Navigation className="w-3.5 h-3.5" />
                          <span>{match.city}</span>
                        </p>
                      )}

                      <div className="flex flex-wrap gap-2 mb-3">
                        <div className="flex items-center space-x-1 text-xs">
                          {match.specialty_match ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <AlertTriangle className="w-4 h-4 text-orange-500" />}
                          <span className="text-muted-foreground">Specialty</span>
                        </div>
                        <div className="flex items-center space-x-1 text-xs">
                          {match.beds_available > 0 ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <ShieldAlert className="w-4 h-4 text-red-500" />}
                          <span className="text-muted-foreground">Beds: {match.beds_available}</span>
                        </div>
                        <div className="flex items-center space-x-1 text-xs">
                          {match.icu_available > 0 ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <ShieldAlert className="w-4 h-4 text-red-500" />}
                          <span className="text-muted-foreground">ICU: {match.icu_available}</span>
                        </div>
                        <div className="flex items-center space-x-1 text-xs">
                          <span className="text-muted-foreground ml-1">Data: {match.data_freshness_text}</span>
                        </div>
                      </div>

                      {match.warnings.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {match.warnings.map((w, i) => (
                            <p key={i} className="text-xs text-orange-600 dark:text-orange-400 flex items-center space-x-1">
                              <AlertTriangle className="w-3 h-3" />
                              <span>{w}</span>
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <div className="shrink-0 flex items-center">
                      {currentHospitalId === match.hospital_id ? (
                        <span className="px-4 py-2 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-lg font-medium text-sm flex items-center space-x-2">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Selected</span>
                        </span>
                      ) : (
                        <button
                          onClick={() => handleSelectFacility(match.hospital_id)}
                          disabled={selectingId === match.hospital_id || disabled}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm transition-colors disabled:opacity-50"
                        >
                          {selectingId === match.hospital_id ? 'Selecting...' : 'Select Facility'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <div className="flex justify-end pt-2">
            <button 
              onClick={() => setIsExpanded(false)}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Hide Matches
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
