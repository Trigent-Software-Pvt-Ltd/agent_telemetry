import type { PolicyPack } from '@/types/aeos'

export const POLICY_PACKS: PolicyPack[] = [
  {
    pack_id: 'eu_ai_act_high_risk',
    display_name: 'EU AI Act — High-Risk',
    version: '2026.04',
    jurisdiction: ['EU', 'EEA'],
    description: 'Article 14 (human oversight), Article 12 (logging), Article 13 (transparency), Article 17 (evidence), Article 10 (data governance).',
    rules: [
      {
        rule_id: 'human_in_loop_required',
        severity: 'critical',
        description: 'High/critical-risk tasks require human in the loop.',
        when_summary: 'task.risk_level ∈ {high, critical}',
        require_summary: 'execution_path includes human OR hybrid_*',
        references: ['EU AI Act Art. 14(1)', 'EU AI Act Art. 14(4)'],
        fired_last_7d: 23,
        denied_last_7d: 2,
        yaml_excerpt: `id: human_in_loop_required
severity: critical
when:
  task.risk_level: { in: [high, critical] }
require:
  execution_path: { matches: '^(human|hybrid_).*' }
references: ["EU AI Act Art. 14(1)", "EU AI Act Art. 14(4)"]`,
      },
      {
        rule_id: 'audit_log_mandatory',
        severity: 'high',
        description: 'Audit logs retained for ≥ 730 days, machine-parseable.',
        when_summary: 'all executions',
        require_summary: 'audit_record_id present; retention >= 730d',
        references: ['EU AI Act Art. 12(1)', 'EU AI Act Art. 12(3)'],
        fired_last_7d: 412,
        denied_last_7d: 0,
        yaml_excerpt: `id: audit_log_mandatory
severity: high
when: { always: true }
require:
  audit_record_id: { present: true }
  retention_days: { gte: 730 }
references: ["EU AI Act Art. 12(1)"]`,
      },
      {
        rule_id: 'explanation_interface_required',
        severity: 'high',
        description: 'Explanation interface available for high/critical outputs.',
        when_summary: 'task.risk_level ∈ {high, critical}',
        require_summary: 'controls includes explanation_interface',
        references: ['EU AI Act Art. 13'],
        fired_last_7d: 23,
        denied_last_7d: 1,
        yaml_excerpt: `id: explanation_interface_required
severity: high
when:
  task.risk_level: { in: [high, critical] }
require:
  controls: { contains: explanation_interface }
references: ["EU AI Act Art. 13"]`,
      },
      {
        rule_id: 'evidence_export_required',
        severity: 'high',
        description: 'Signed evidence bundle must be exportable on request.',
        when_summary: 'all executions in scope',
        require_summary: 'evidence_bundle.signed AND retention >= 7 years',
        references: ['EU AI Act Art. 17'],
        fired_last_7d: 47,
        denied_last_7d: 0,
        yaml_excerpt: `id: evidence_export_required
severity: high
when: { always: true }
require:
  evidence_bundle:
    signed: true
    retention_years: { gte: 7 }
references: ["EU AI Act Art. 17"]`,
      },
      {
        rule_id: 'data_residency_eu',
        severity: 'high',
        description: 'Personal data must remain in EU/EEA infrastructure.',
        when_summary: 'task.jurisdiction in {EU, EEA}',
        require_summary: 'vendor_layer.region in {EU, EEA}',
        references: ['EU AI Act Art. 10', 'GDPR Art. 44'],
        fired_last_7d: 64,
        denied_last_7d: 3,
        yaml_excerpt: `id: data_residency_eu
severity: high
when:
  task.jurisdiction: { in: [EU, EEA] }
require:
  vendor_layer.region: { in: [EU, EEA] }
references: ["EU AI Act Art. 10", "GDPR Art. 44"]`,
      },
    ],
  },
  {
    pack_id: 'gdpr',
    display_name: 'GDPR',
    version: '2026.03',
    jurisdiction: ['EU', 'EEA'],
    description: 'Purpose limitation, automated-decision rights (Art 22), PII minimisation, security, DPIA.',
    rules: [
      {
        rule_id: 'gdpr_purpose_limitation',
        severity: 'critical',
        description: 'Personal data only processed for declared purposes.',
        when_summary: 'task touches PII',
        require_summary: 'task.purpose in declared_purposes_for_skill',
        references: ['GDPR Art. 5(1)(b)'],
        fired_last_7d: 89,
        denied_last_7d: 4,
        yaml_excerpt: `id: gdpr_purpose_limitation
severity: critical
when:
  governance_tags: { contains: gdpr_sensitive }
require:
  task.purpose: { in: $declared_purposes }`,
      },
      {
        rule_id: 'gdpr_art22_override',
        severity: 'high',
        description: 'Right to obtain human intervention on automated decisions.',
        when_summary: 'fully-automated decision affects data subject',
        require_summary: 'human_override_endpoint reachable',
        references: ['GDPR Art. 22(3)'],
        fired_last_7d: 6,
        denied_last_7d: 0,
        yaml_excerpt: `id: gdpr_art22_override
severity: high`,
      },
      {
        rule_id: 'gdpr_pii_minimisation',
        severity: 'high',
        description: 'Process minimum PII required.',
        when_summary: 'all PII-touching skills',
        require_summary: 'pii_redactor in tools[]',
        references: ['GDPR Art. 5(1)(c)', 'GDPR Art. 25'],
        fired_last_7d: 124,
        denied_last_7d: 7,
        yaml_excerpt: `id: gdpr_pii_minimisation
severity: high`,
      },
      {
        rule_id: 'gdpr_security_art32',
        severity: 'high',
        description: 'Appropriate technical measures protecting personal data.',
        when_summary: 'all PII-touching skills',
        require_summary: 'transport encryption, KMS-managed keys, audit',
        references: ['GDPR Art. 32'],
        fired_last_7d: 412,
        denied_last_7d: 0,
        yaml_excerpt: `id: gdpr_security_art32
severity: high`,
      },
      {
        rule_id: 'gdpr_dpia_required',
        severity: 'medium',
        description: 'DPIA on file for high-risk processing.',
        when_summary: 'task.risk_level == high',
        require_summary: 'dpia_id resolves to active record',
        references: ['GDPR Art. 35'],
        fired_last_7d: 12,
        denied_last_7d: 1,
        yaml_excerpt: `id: gdpr_dpia_required
severity: medium`,
      },
      {
        rule_id: 'gdpr_data_residency_eu',
        severity: 'high',
        description: 'EU residency for personal data of EU subjects.',
        when_summary: 'task.jurisdiction == EU',
        require_summary: 'vendor.region in {EU, EEA}',
        references: ['GDPR Art. 44–49'],
        fired_last_7d: 64,
        denied_last_7d: 3,
        yaml_excerpt: `id: gdpr_data_residency_eu
severity: high`,
      },
    ],
  },
  {
    pack_id: 'soc2',
    display_name: 'SOC 2',
    version: '2026.02',
    jurisdiction: ['US', 'global'],
    description: 'Trust Services Criteria — security, availability, confidentiality, processing integrity, privacy.',
    rules: [
      { rule_id: 'soc2_cc6_logical_access', severity: 'high', description: 'Logical access provisioning + revocation tracked.', when_summary: 'all executions', require_summary: 'auth + role + audit', references: ['SOC 2 CC6.1', 'CC6.2'], fired_last_7d: 412, denied_last_7d: 0, yaml_excerpt: 'id: soc2_cc6_logical_access\nseverity: high' },
      { rule_id: 'soc2_cc7_anomaly_detection', severity: 'high', description: 'Anomaly detection on production telemetry.', when_summary: 'continuous', require_summary: 'anomaly_detector active', references: ['SOC 2 CC7.2'], fired_last_7d: 412, denied_last_7d: 0, yaml_excerpt: 'id: soc2_cc7_anomaly_detection' },
      { rule_id: 'soc2_cc7_incident_response', severity: 'high', description: 'Documented incident-response plan.', when_summary: 'on incident', require_summary: 'IR runbook reachable', references: ['SOC 2 CC7.3'], fired_last_7d: 1, denied_last_7d: 0, yaml_excerpt: 'id: soc2_cc7_incident_response' },
      { rule_id: 'soc2_cc8_change_mgmt', severity: 'high', description: 'Change management with approval gates.', when_summary: 'on deploy', require_summary: 'PR approved + CI green + audit', references: ['SOC 2 CC8.1'], fired_last_7d: 18, denied_last_7d: 0, yaml_excerpt: 'id: soc2_cc8_change_mgmt' },
      { rule_id: 'soc2_a1_availability', severity: 'medium', description: 'Availability SLO and reporting.', when_summary: 'continuous', require_summary: 'SLO docs + dashboards', references: ['SOC 2 A1.1'], fired_last_7d: 412, denied_last_7d: 0, yaml_excerpt: 'id: soc2_a1_availability' },
      { rule_id: 'soc2_c1_confidentiality', severity: 'high', description: 'Confidential data classification + handling.', when_summary: 'PII or confidential outputs', require_summary: 'encryption + access logging', references: ['SOC 2 C1.1'], fired_last_7d: 124, denied_last_7d: 0, yaml_excerpt: 'id: soc2_c1_confidentiality' },
      { rule_id: 'soc2_cc1_governance', severity: 'medium', description: 'Governance and ethics committee oversight.', when_summary: 'org-level', require_summary: 'governance committee minutes', references: ['SOC 2 CC1.2'], fired_last_7d: 4, denied_last_7d: 0, yaml_excerpt: 'id: soc2_cc1_governance' },
      { rule_id: 'soc2_cc6_encryption_at_rest', severity: 'high', description: 'Encryption at rest for sensitive data.', when_summary: 'all storage', require_summary: 'KMS-managed keys', references: ['SOC 2 CC6.7'], fired_last_7d: 412, denied_last_7d: 0, yaml_excerpt: 'id: soc2_cc6_encryption_at_rest' },
    ],
  },
]

export function getPolicyPack(packId: string): PolicyPack | undefined {
  return POLICY_PACKS.find(p => p.pack_id === packId)
}
