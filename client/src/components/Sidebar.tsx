import type { UseQueryResult } from '@tanstack/react-query';
import type { FacetResponse } from '../api/types';
import FacetSection from './FacetSection';

interface SidebarProps {
  hobbiesQuery: UseQueryResult<FacetResponse>;
  nationalitiesQuery: UseQueryResult<FacetResponse>;
  selectedHobbies: string[];
  selectedNationalities: string[];
  onToggleHobby: (hobby: string) => void;
  onToggleNationality: (nationality: string) => void;
}

export default function Sidebar({
  hobbiesQuery,
  nationalitiesQuery,
  selectedHobbies,
  selectedNationalities,
  onToggleHobby,
  onToggleNationality,
}: SidebarProps) {
  return (
    <div className="space-y-6">
      <FacetSection
        title="Top hobbies"
        entries={hobbiesQuery.data?.data}
        selected={selectedHobbies}
        onToggle={onToggleHobby}
        isLoading={hobbiesQuery.isPending}
        isError={hobbiesQuery.isError}
      />
      <FacetSection
        title="Top nationalities"
        entries={nationalitiesQuery.data?.data}
        selected={selectedNationalities}
        onToggle={onToggleNationality}
        isLoading={nationalitiesQuery.isPending}
        isError={nationalitiesQuery.isError}
      />
    </div>
  );
}
