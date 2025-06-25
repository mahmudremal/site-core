import React from 'react';
import TableEditor from './TableEditor';

export default function Editor() {
  return (
    <div className="xpo_mx-auto xpo_p-8 xpo_space-y-8">
      <h1 className="xpo_text-3xl xpo_font-bold xpo_mb-6">Hunts Data Admin</h1>

      <TableEditor endpoint="species" fields={['id', 'name']} />
      <TableEditor endpoint="weapons" fields={['id', 'name']} />
      <TableEditor endpoint="states" fields={['id', 'name', 'abbreviation']} />
      <TableEditor endpoint="bag_types" fields={['id', 'name', 'species_id']} />
      <TableEditor endpoint="gmu" fields={['id', 'name', 'code', 'total_sqmi', 'public_sqmi', 'public_ratio', 'state_id']} />
      <TableEditor endpoint="documents" fields={['id', 'code', 'total_quota']} />
      <TableEditor endpoint="applications" fields={['id', 'document_id', 'is_resident', 'quota']} />
      <TableEditor endpoint="odds" fields={['id', 'application_id', 'odds', 'type']} />
      <TableEditor endpoint="hunts" fields={['id', 'app_year', 'user_odds', 'harvest_rate', 'season_type', 'start_date', 'end_date', 'hunters_per_sqmi', 'weapon_id', 'bag_type_id', 'gmu_id', 'document_id']} />
    </div>
  );
}
