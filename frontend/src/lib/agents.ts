export type Agent = {
  key: string
  name: string
  telugu: string
  icon: string
  role: string
  llm: string
  description: string
  flows: string[]
  tavily: boolean
  tavilyLabel: string
  avatarUrl: string
}

export const ALL_AGENTS: Agent[] = [
  {
    key: 'arambha',
    name: 'Arambha',
    telugu: 'ఆరంభ',
    icon: '🎯',
    role: 'Intake & Classify',
    llm: 'llama-3.1-8b-instant',
    description: 'Classifies document type, extracts parties, jurisdiction and key terms from your input to route the request to the right pipeline.',
    flows: ['new_doc', 'redline', 'dispute'],
    tavily: false,
    tavilyLabel: '',
    avatarUrl: 'https://res.cloudinary.com/dkqbzwicr/image/upload/v1782233709/AI_orchestrator_f4ofoe.png',
  },
  {
    key: 'rachana',
    name: 'Rachana',
    telugu: 'రచన',
    icon: '✏️',
    role: 'Draft Generation',
    llm: 'llama-3.3-70b-versatile',
    description: 'Drafts the complete legal document with 5 mandatory clauses under Indian Contract Act 1872. Supports 12 document types with a 7-point internal consistency check.',
    flows: ['new_doc'],
    tavily: false,
    tavilyLabel: '',
    avatarUrl: 'https://res.cloudinary.com/dkqbzwicr/image/upload/v1782233709/rachanalegaldrafter_cnujab.png',
  },
  {
    key: 'parisheelanam',
    name: 'Parisheelanam',
    telugu: 'పరిశీలనం',
    icon: '🔍',
    role: 'Review & Score',
    llm: 'llama-3.3-70b-versatile',
    description: 'Reviews each draft for completeness and legal quality. Loops up to 3 times with Rachana until the review score reaches ≥ 75 before proceeding.',
    flows: ['new_doc'],
    tavily: false,
    tavilyLabel: '',
    avatarUrl: 'https://res.cloudinary.com/dkqbzwicr/image/upload/v1782233734/Parisheelanamlegalreviewer_cu79iv.png',
  },
  {
    key: 'jokhim',
    name: 'Jokhim',
    telugu: 'జోఖిమ్',
    icon: '🛡️',
    role: 'Risk Flagging',
    llm: 'llama-3.3-70b-versatile',
    description: 'Flags legal and business risks with severity scoring. Optionally searches Indian case law via Tavily when critical clauses are absent or ambiguous.',
    flows: ['new_doc', 'redline'],
    tavily: true,
    tavilyLabel: 'Tavily (conditional)',
    avatarUrl: 'https://res.cloudinary.com/dkqbzwicr/image/upload/v1782233729/jokhimriskguardianagent_wix8mv.png',
  },
  {
    key: 'samjoota',
    name: 'Samjoota',
    telugu: 'సమ్జూత',
    icon: '🤝',
    role: 'Negotiation',
    llm: 'llama-3.3-70b-versatile',
    description: 'Negotiates redlines with 3-axis clause severity scoring and automatic deal-breaker detection. Generates a negotiation score and diff-style suggested changes.',
    flows: ['redline'],
    tavily: false,
    tavilyLabel: '',
    avatarUrl: 'https://res.cloudinary.com/dkqbzwicr/image/upload/v1782234527/SamjootaNegotiationExpert_hyafxv.png',
  },
  {
    key: 'vivada',
    name: 'Vivada',
    telugu: 'వివాద',
    icon: '⚖️',
    role: 'Dispute Resolution',
    llm: 'llama-3.3-70b-versatile',
    description: 'Resolves disputes using 7 playbooks with damages calculation, limitation period analysis, settlement recommendations and structured evidence matrix.',
    flows: ['dispute'],
    tavily: true,
    tavilyLabel: 'Tavily (always)',
    avatarUrl: 'https://res.cloudinary.com/dkqbzwicr/image/upload/v1782235257/vivadadisputeresolver_w5ecmr.png',
  },
  {
    key: 'sahee',
    name: 'Sahee',
    telugu: 'సహీ',
    icon: '✍️',
    role: 'Sign & Deliver',
    llm: 'Tool-based',
    description: 'Seals the approved contract, generates the final PDF, stores it in the Legal Vault and initiates the e-signature workflow via Digio.',
    flows: ['new_doc', 'redline', 'dispute'],
    tavily: false,
    tavilyLabel: '',
    avatarUrl: 'https://res.cloudinary.com/dkqbzwicr/image/upload/v1782234843/SaheeSignatureSpecialist_k1hszo.png',
  },
  {
    key: 'sruthi',
    name: 'Sruthi',
    telugu: 'శ్రుతి',
    icon: '📅',
    role: 'Obligation Tracker',
    llm: 'llama-3.1-8b-instant',
    description: 'Extracts all contractual obligations and deadlines with reminder schedules, penalty estimates and 8 obligation categories across 10 document types.',
    flows: ['new_doc'],
    tavily: false,
    tavilyLabel: '',
    avatarUrl: 'https://res.cloudinary.com/dkqbzwicr/image/upload/v1782235128/sruthiobligationtracer_ogrpjb.png',
  },
]
