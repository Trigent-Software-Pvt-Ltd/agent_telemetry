import type { AEOSTenantId, CoverageManifest, CoverageManifestEntry } from '@/types/aeos'
import { mockHex } from '@/lib/aeos/prng'
import { mulberry32, AEOS_SEED } from '@/lib/aeos/prng'

const VENDORS_OBSERVED: CoverageManifestEntry[] = [
  // Hyperscalers
  { layer: 'hyperscaler', vendor: 'AWS Bedrock', status: 'observed' },
  { layer: 'hyperscaler', vendor: 'Azure OpenAI', status: 'observed' },
  { layer: 'hyperscaler', vendor: 'Google Vertex AI', status: 'observed' },
  { layer: 'hyperscaler', vendor: 'Oracle GenAI', status: 'planned', note: 'Adapter scheduled Q3' },
  { layer: 'hyperscaler', vendor: 'IBM watsonx', status: 'gap', note: 'Out of scope until tenant request' },

  // Frontier model labs
  { layer: 'model_lab', vendor: 'Anthropic', status: 'observed' },
  { layer: 'model_lab', vendor: 'OpenAI', status: 'observed' },
  { layer: 'model_lab', vendor: 'Google (Gemini)', status: 'observed' },
  { layer: 'model_lab', vendor: 'Mistral', status: 'observed' },
  { layer: 'model_lab', vendor: 'Meta (Llama via partner-host)', status: 'observed' },
  { layer: 'model_lab', vendor: 'Cohere', status: 'planned' },
  { layer: 'model_lab', vendor: 'AI21', status: 'gap' },
  { layer: 'model_lab', vendor: 'xAI', status: 'planned' },
  { layer: 'model_lab', vendor: 'DeepSeek', status: 'gap' },
  { layer: 'model_lab', vendor: 'Qwen', status: 'gap' },

  // Enterprise agent platforms
  { layer: 'agent_platform', vendor: 'Salesforce Agentforce', status: 'observed' },
  { layer: 'agent_platform', vendor: 'Microsoft Copilot Studio', status: 'observed' },
  { layer: 'agent_platform', vendor: 'ServiceNow Now Assist', status: 'observed' },
  { layer: 'agent_platform', vendor: 'Pega GenAI', status: 'observed' },
  { layer: 'agent_platform', vendor: 'Uniphore BAC', status: 'observed' },
  { layer: 'agent_platform', vendor: 'SAP Joule', status: 'planned' },
  { layer: 'agent_platform', vendor: 'Workday Illuminate', status: 'gap' },
  { layer: 'agent_platform', vendor: 'Oracle Digital Assistant', status: 'planned' },

  // Tool surfaces
  { layer: 'tool_surface', vendor: 'Pinecone (vector store)', status: 'observed' },
  { layer: 'tool_surface', vendor: 'Weaviate (vector store)', status: 'observed' },
  { layer: 'tool_surface', vendor: 'Qdrant (vector store)', status: 'observed' },
  { layer: 'tool_surface', vendor: 'Neo4j (knowledge graph)', status: 'observed' },
  { layer: 'tool_surface', vendor: 'TigerGraph (knowledge graph)', status: 'planned' },
  { layer: 'tool_surface', vendor: 'LlamaCloud (RAG)', status: 'observed' },
  { layer: 'tool_surface', vendor: 'Vectara (RAG)', status: 'observed' },
  { layer: 'tool_surface', vendor: 'MCP Servers', status: 'observed' },
  { layer: 'tool_surface', vendor: 'Function-call APIs', status: 'observed' },
  { layer: 'tool_surface', vendor: 'Playwright (browser automation)', status: 'observed' },
  { layer: 'tool_surface', vendor: 'E2B (code sandbox)', status: 'observed' },
  { layer: 'tool_surface', vendor: 'Snowflake (enterprise data)', status: 'observed' },
]

export function getCoverageManifest(tenantId: AEOSTenantId): CoverageManifest {
  const observed = VENDORS_OBSERVED.filter(v => v.status === 'observed').length
  const gaps = VENDORS_OBSERVED.filter(v => v.status === 'gap').length
  const planned = VENDORS_OBSERVED.filter(v => v.status === 'planned').length
  // Tenant-stable signature seed
  const seed = AEOS_SEED + tenantId.length * 7
  const rand = mulberry32(seed)
  return {
    tenant_id: tenantId,
    observed_count: observed,
    gap_count: gaps,
    planned_count: planned,
    vendors: VENDORS_OBSERVED,
    signed_at: '2026-04-25T18:42:11.000Z',
    signature_pair: {
      fuzebox: { algorithm: 'ed25519', key_id: 'fuzebox-kms-primary', signature: mockHex(rand, 128) },
      rpotential: { algorithm: 'hmac-sha256', key_id: 'rpotential-witness-1', signature: mockHex(rand, 64) },
      signed_at: '2026-04-25T18:42:11.000Z',
    },
  }
}
