import type { AEOSTenant } from '@/types/aeos'

export const TENANTS: AEOSTenant[] = [
  {
    id: 'kengarff_automotive',
    display_name: 'Ken Garff Automotive',
    industry: 'Automotive · Service & Sales',
    region: ['US-West'],
    default_skills_focus: ['auto_diag', 'auto_repair', 'cx_triage', 'compliance'],
    default_landing_decision_id: 'dec_kg_brake_001',
  },
  {
    id: 'vipsigma_sports_betting',
    display_name: 'VIPSigma Sports Betting',
    industry: 'Gaming · Sportsbook',
    region: ['US-NV', 'EU-MT'],
    default_skills_focus: ['sportsbook', 'cx_triage', 'compliance'],
  },
  {
    id: 'artgroup',
    display_name: 'ARTGROUP',
    industry: 'Compliance · Regulatory Advisory',
    region: ['EU-DE', 'EU-FR'],
    default_skills_focus: ['compliance', 'hr_people'],
  },
  {
    id: 'loop_tv',
    display_name: 'Loop TV',
    industry: 'Media · Venue Operations',
    region: ['US', 'APAC'],
    default_skills_focus: ['events_ops', 'field_service', 'cx_triage'],
  },
]
