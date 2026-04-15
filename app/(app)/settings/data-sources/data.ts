export type DataSourceStatus = 'connected' | 'partial' | 'missing'

export interface DataSourceTile {
  id: string
  name: string
  status: DataSourceStatus
  statusLabelOverride?: string
  lastSync: string
  recordsIndexed: string
  knownGaps: string
  icon: 'database' | 'activity' | 'badge' | 'map' | 'lock'
}

export const DATA_SOURCE_TILES: DataSourceTile[] = [
  {
    id: 'cms-medicare-utilization',
    name: 'CMS Medicare Utilization',
    status: 'connected',
    lastSync: 'Today 04:30 UTC',
    recordsIndexed: '1.2M NPIs',
    knownGaps: '2023 Q4 late filings still propagating.',
    icon: 'database',
  },
  {
    id: 'cms-transparency-in-coverage',
    name: 'CMS Transparency in Coverage',
    status: 'connected',
    lastSync: 'Today 04:30 UTC',
    recordsIndexed: '340M negotiated rate rows',
    knownGaps: '12% MRF parse failures (malformed payer files).',
    icon: 'activity',
  },
  {
    id: 'npi-registry',
    name: 'NPI Registry',
    status: 'connected',
    lastSync: 'Today 06:00 UTC',
    recordsIndexed: '7.2M NPIs',
    knownGaps: 'None.',
    icon: 'badge',
  },
  {
    id: 'state-licensing',
    name: 'State Licensing Databases',
    status: 'partial',
    statusLabelOverride: 'Partial (28/50)',
    lastSync: 'Varies by state',
    recordsIndexed: '28 states automated',
    knownGaps: '22 states require manual extraction.',
    icon: 'map',
  },
  {
    id: 'mso-ipa-directory',
    name: 'MSO / IPA Directory',
    status: 'missing',
    statusLabelOverride: 'Paid — pending',
    lastSync: 'Pending authorisation from Sam',
    recordsIndexed: 'Composite of 4 paid feeds',
    knownGaps: 'No unified source — paid subscription required.',
    icon: 'lock',
  },
]
