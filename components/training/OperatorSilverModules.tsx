/**
 * Operator Silver Wings Training Modules
 * World-class training for operators managing Cloud infrastructure
 * Advanced technical content with hands-on system administration
 */

import { Server, Shield, Users, Database, Zap, GitBranch, Award } from 'lucide-react';

export const operatorSilverModules = [
  {
    id: 'operator-welcome',
    number: 1,
    title: 'Welcome to Cloud Operations',
    subtitle: 'From Contributor to Operator',
    icon: <Server className="h-6 w-6" />,
    duration: '20 min',
    content: (
      <div className="space-y-6">
        {/* Hero Opening */}
        <div className="border-l-4 border-[var(--metal-silver)] bg-gradient-to-r from-gray-400/10 to-transparent p-6">
          <h3 className="text-2xl font-bold mb-3" style={{color: 'var(--metal-silver)'}}>
            ⚙️ You're About to Manage the Infrastructure
          </h3>
          <p className="text-lg opacity-90 leading-relaxed">
            Contributors submit work. Operators run the infrastructure that evaluates it. 
            This is a significant responsibility—you'll be managing Cloud instances, 
            coordinating resources, and ensuring the system runs smoothly for everyone.
          </p>
        </div>

        {/* Prerequisites Check */}
        <div className="cloud-card p-6">
          <h4 className="font-bold mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5" style={{color: 'var(--hydrogen-beta)'}} />
            Prerequisites: What You Should Know
          </h4>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <span className="text-green-400 font-bold">✓</span>
              <div>
                <strong>Completed Copper Wings</strong> - You understand PoC basics, submission process, and SYNTH
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-green-400 font-bold">✓</span>
              <div>
                <strong>Submitted 3+ Qualifying PoCs</strong> - You've experienced the system as a contributor
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-green-400 font-bold">✓</span>
              <div>
                <strong>Basic Technical Literacy</strong> - Comfortable with cloud concepts, APIs, and system monitoring
              </div>
            </div>
          </div>
          <p className="text-xs opacity-70 mt-4 bg-amber-500/10 border border-amber-500/30 p-3 rounded">
            ⚠️ <strong>Not ready yet?</strong> Complete Contributor Copper Wings first, then submit a few PoCs 
            to understand the contributor experience before managing operations.
          </p>
        </div>

        {/* What Operators Do */}
        <div>
          <h4 className="text-xl font-bold mb-4">What Operators Do</h4>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="cloud-card p-5 border-l-4 border-blue-500">
              <div className="flex items-center gap-3 mb-3">
                <Server className="w-6 h-6 text-blue-400" />
                <div className="font-bold text-blue-400">Cloud Management</div>
              </div>
              <ul className="text-sm space-y-2 opacity-90">
                <li>• Provision and configure Cloud instances</li>
                <li>• Monitor system health and performance</li>
                <li>• Manage resource allocation (SYNTH)</li>
                <li>• Handle scaling and optimization</li>
              </ul>
            </div>

            <div className="cloud-card p-5 border-l-4 border-purple-500">
              <div className="flex items-center gap-3 mb-3">
                <Users className="w-6 h-6 text-purple-400" />
                <div className="font-bold text-purple-400">Community Coordination</div>
              </div>
              <ul className="text-sm space-y-2 opacity-90">
                <li>• Support contributors with questions</li>
                <li>• Share system updates and broadcasts</li>
                <li>• Facilitate WorkChat collaboration</li>
                <li>• Onboard new contributors</li>
              </ul>
            </div>

            <div className="cloud-card p-5 border-l-4 border-green-500">
              <div className="flex items-center gap-3 mb-3">
                <Shield className="w-6 h-6 text-green-400" />
                <div className="font-bold text-green-400">Quality Assurance</div>
              </div>
              <ul className="text-sm space-y-2 opacity-90">
                <li>• Review edge cases and anomalies</li>
                <li>• Ensure evaluation accuracy</li>
                <li>• Maintain system integrity</li>
                <li>• Report bugs and improvements</li>
              </ul>
            </div>

            <div className="cloud-card p-5 border-l-4 border-amber-500">
              <div className="flex items-center gap-3 mb-3">
                <Database className="w-6 h-6" style={{color: 'var(--hydrogen-amber)'}} />
                <div className="font-bold" style={{color: 'var(--hydrogen-amber)'}}>Data & Analytics</div>
              </div>
              <ul className="text-sm space-y-2 opacity-90">
                <li>• Track PoC trends and patterns</li>
                <li>• Monitor SYNTH distribution</li>
                <li>• Analyze system performance metrics</li>
                <li>• Generate ecosystem reports</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Operator vs Contributor */}
        <div>
          <h4 className="text-xl font-bold mb-4">How Operators Differ from Contributors</h4>
          
          <div className="cloud-card p-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <div className="text-center mb-3">
                  <div className="inline-block w-16 h-16 rounded-full bg-[var(--metal-copper)]/20 flex items-center justify-center mb-2">
                    <span className="text-3xl">🪙</span>
                  </div>
                  <div className="font-bold" style={{color: 'var(--metal-copper)'}}>Contributors</div>
                </div>
                <ul className="text-sm space-y-2 opacity-90">
                  <li>• Focus on creating content</li>
                  <li>• Submit PoCs for evaluation</li>
                  <li>• Earn SYNTH through contributions</li>
                  <li>• Use the Cloud as consumers</li>
                </ul>
              </div>

              <div>
                <div className="text-center mb-3">
                  <div className="inline-block w-16 h-16 rounded-full bg-[var(--metal-silver)]/20 flex items-center justify-center mb-2">
                    <span className="text-3xl">🛡️</span>
                  </div>
                  <div className="font-bold" style={{color: 'var(--metal-silver)'}}>Operators</div>
                </div>
                <ul className="text-sm space-y-2 opacity-90">
                  <li>• Focus on infrastructure management</li>
                  <li>• Evaluate and support submissions</li>
                  <li>• Earn SYNTH through operations</li>
                  <li>• Manage the Cloud for everyone</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Operator Privileges & Responsibilities */}
        <div className="border-2 border-[var(--metal-silver)] bg-gray-400/5 p-6 rounded-lg">
          <h4 className="font-bold mb-4 text-lg" style={{color: 'var(--metal-silver)'}}>
            Operator Privileges & Responsibilities
          </h4>
          
          <div className="space-y-4">
            <div>
              <div className="font-semibold text-green-400 mb-2">✅ What You Get</div>
              <ul className="text-sm space-y-1 opacity-90 ml-4">
                <li>• <strong>Paywall Bypass:</strong> Free access to all submission and evaluation features</li>
                <li>• <strong>Dashboard Access:</strong> Operator cockpit with advanced tools</li>
                <li>• <strong>Cloud Management:</strong> Create and configure Enterprise Cloud instances</li>
                <li>• <strong>Broadcast System:</strong> Send announcements to contributors</li>
                <li>• <strong>Priority Support:</strong> Direct line to core development team</li>
              </ul>
            </div>

            <div>
              <div className="font-semibold text-amber-400 mb-2">⚠️ What's Expected</div>
              <ul className="text-sm space-y-1 opacity-90 ml-4">
                <li>• <strong>Availability:</strong> Respond to critical issues within 24 hours</li>
                <li>• <strong>Integrity:</strong> Maintain system fairness and transparency</li>
                <li>• <strong>Communication:</strong> Keep contributors informed about system status</li>
                <li>• <strong>Learning:</strong> Stay updated on platform changes and improvements</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Your Silver Wings Journey */}
        <div>
          <h4 className="text-xl font-bold mb-4">Your Silver Wings Learning Path</h4>
          
          <div className="space-y-2 text-sm">
            {[
              { num: 1, title: 'Welcome to Cloud Operations', duration: '20 min', color: 'blue' },
              { num: 2, title: 'Enterprise Cloud Architecture', duration: '30 min', color: 'purple' },
              { num: 3, title: 'SynthScan™ MRI Deep Dive', duration: '40 min', color: 'green' },
              { num: 4, title: 'Managing Cloud Instances', duration: '35 min', color: 'amber' },
              { num: 5, title: 'Community Coordination', duration: '25 min', color: 'red' },
              { num: 6, title: 'Monitoring & Analytics', duration: '30 min', color: 'indigo' },
              { num: 7, title: 'Earning Your Silver Wings', duration: '20 min', color: 'silver' },
            ].map((module) => (
              <div key={module.num} className="cloud-card p-3 flex items-center gap-3 border-l-4" style={{borderColor: `var(--${module.color === 'silver' ? 'metal-silver' : `hydrogen-${module.color === 'amber' ? 'amber' : module.color === 'blue' ? 'beta' : module.color === 'purple' ? 'gamma' : 'alpha'}`})`}}>
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center font-bold flex-shrink-0">
                  {module.num}
                </div>
                <div className="flex-1">
                  <div className="font-semibold">{module.title}</div>
                </div>
                <div className="text-xs opacity-70">{module.duration}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Ready Check */}
        <div className="bg-gradient-to-r from-green-500/10 to-transparent border-l-4 border-green-500 p-6">
          <h4 className="font-bold mb-2 text-green-400">🎯 Ready to Begin?</h4>
          <p className="text-sm opacity-90">
            This track is <strong>technical and hands-on</strong>. You'll learn Cloud architecture, 
            system administration, and community management. By the end, you'll be equipped to run 
            your own Enterprise Cloud instance and support the Syntheverse ecosystem.
          </p>
        </div>
      </div>
    ),
    keyTakeaways: [
      'Operators manage Cloud infrastructure and support contributors',
      'Requires Copper Wings completion and 3+ qualifying PoCs',
      'Operators get paywall bypass and advanced dashboard access',
      '7 modules covering Cloud management, monitoring, and coordination',
    ],
  },

  {
    id: 'cloud-architecture',
    number: 2,
    title: 'Enterprise Cloud Architecture',
    subtitle: 'Understanding the Technical Infrastructure',
    icon: <Server className="h-6 w-6" />,
    duration: '30 min',
    content: (
      <div className="space-y-6">
        {/* Opening */}
        <div className="border-l-4 border-[var(--hydrogen-beta)] bg-gradient-to-r from-blue-500/10 to-transparent p-6">
          <h3 className="text-2xl font-bold mb-3" style={{color: 'var(--hydrogen-beta)'}}>
            🏗️ The Cloud You'll Be Managing
          </h3>
          <p className="text-lg opacity-90 leading-relaxed">
            Syntheverse runs on a distributed Cloud architecture. As an operator, you need to understand 
            how the pieces fit together—from submission intake to blockchain registration.
          </p>
        </div>

        {/* System Architecture Overview */}
        <div>
          <h4 className="text-xl font-bold mb-4">System Architecture Overview</h4>
          
          <div className="cloud-card p-6 mb-4">
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">📥</span>
                </div>
                <div>
                  <div className="font-semibold mb-1 text-green-400">Layer 1: Submission Interface</div>
                  <div className="text-sm opacity-80">
                    Next.js frontend → Supabase database → Stripe payment processing. 
                    Contributors submit PoCs via web interface. $500 submission fee processed.
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">🔬</span>
                </div>
                <div>
                  <div className="font-semibold mb-1 text-purple-400">Layer 2: SynthScan™ MRI Evaluation</div>
                  <div className="text-sm opacity-80">
                    Groq AI (llama-3.3-70b-versatile) → 745-line system prompt → JSON structured output. 
                    Evaluates across 4 dimensions. ~10 minutes per submission.
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">📊</span>
                </div>
                <div>
                  <div className="font-semibold mb-1 text-blue-400">Layer 3: Data Processing & Storage</div>
                  <div className="text-sm opacity-80">
                    PostgreSQL (Supabase) → Vector embeddings for redundancy detection → 
                    Drizzle ORM for type-safe queries. All scores and feedback stored permanently.
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">⛓️</span>
                </div>
                <div>
                  <div className="font-semibold mb-1" style={{color: 'var(--hydrogen-amber)'}}>Layer 4: Blockchain Registration</div>
                  <div className="text-sm opacity-80">
                    Base Mainnet (L2) → ERC-20 token contract → Immutable on-chain anchoring. 
                    Qualified PoCs (4,000+) get free registration (launches March 20, 2026).
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enterprise Cloud Instances */}
        <div>
          <h4 className="text-xl font-bold mb-4">Enterprise Cloud Instances</h4>
          
          <p className="mb-4 opacity-90 leading-relaxed">
            Operators can create <strong>Enterprise Cloud instances</strong>—isolated evaluation environments 
            for teams, research groups, or organizations. Each instance has its own:
          </p>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="cloud-card p-5 border-l-4 border-blue-500">
              <div className="font-semibold text-blue-400 mb-3">📦 Isolated Resources</div>
              <ul className="text-sm space-y-2 opacity-90">
                <li>• Dedicated submission queue</li>
                <li>• Private PoC archive</li>
                <li>• Custom evaluation parameters</li>
                <li>• Independent SYNTH allocation</li>
              </ul>
            </div>

            <div className="cloud-card p-5 border-l-4 border-purple-500">
              <div className="font-semibold text-purple-400 mb-3">⚙️ Configuration Options</div>
              <ul className="text-sm space-y-2 opacity-90">
                <li>• Custom scoring thresholds</li>
                <li>• Team-specific system prompts</li>
                <li>• Access control policies</li>
                <li>• Usage analytics dashboards</li>
              </ul>
            </div>
          </div>

          <div className="mt-4 bg-amber-500/10 border border-amber-500/30 p-4 rounded text-sm">
            💡 <strong>Use Case Example:</strong> A research lab creates an Enterprise Cloud instance 
            for their team of 20 scientists. They configure custom alignment criteria focused on 
            quantum computing. All submissions are private to their instance, with shared SYNTH pool.
          </div>
        </div>

        {/* Technical Stack */}
        <div className="border-2 border-[var(--hydrogen-beta)] bg-blue-500/5 p-6 rounded-lg">
          <h4 className="font-bold mb-4 text-lg">🛠️ Technical Stack You'll Work With</h4>
          
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div>
              <div className="font-semibold mb-2" style={{color: 'var(--hydrogen-beta)'}}>Frontend</div>
              <ul className="space-y-1 opacity-80">
                <li>• Next.js 14 (App Router)</li>
                <li>• TypeScript 5</li>
                <li>• Tailwind CSS</li>
                <li>• React Three Fiber</li>
              </ul>
            </div>
            
            <div>
              <div className="font-semibold mb-2 text-purple-400">Backend</div>
              <ul className="space-y-1 opacity-80">
                <li>• Supabase (Auth + DB)</li>
                <li>• PostgreSQL</li>
                <li>• Drizzle ORM</li>
                <li>• Upstash Redis</li>
              </ul>
            </div>
            
            <div>
              <div className="font-semibold mb-2 text-green-400">AI & Blockchain</div>
              <ul className="space-y-1 opacity-80">
                <li>• Groq API (Llama 3.3)</li>
                <li>• Base Mainnet (L2)</li>
                <li>• Stripe (Payments)</li>
                <li>• Vector Embeddings</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Data Flow Diagram */}
        <div>
          <h4 className="text-xl font-bold mb-4">PoC Submission Data Flow</h4>
          
          <div className="cloud-card p-6">
            <div className="font-mono text-xs space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-green-400">1.</span>
                <span>Contributor submits PoC → <strong className="text-green-400">POST /api/contributions</strong></span>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <span className="text-blue-400">2.</span>
                <span>Stripe processes $500 → <strong className="text-blue-400">Payment Confirmed</strong></span>
              </div>
              <div className="flex items-center gap-2 ml-8">
                <span className="text-purple-400">3.</span>
                <span>Queue evaluation job → <strong className="text-purple-400">POST /api/poc/evaluate</strong></span>
              </div>
              <div className="flex items-center gap-2 ml-12">
                <span className="text-amber-400">4.</span>
                <span>SynthScan™ MRI analyzes → <strong style={{color: 'var(--hydrogen-amber)'}}>Groq API call</strong></span>
              </div>
              <div className="flex items-center gap-2 ml-16">
                <span className="text-red-400">5.</span>
                <span>Save scores to DB → <strong className="text-red-400">UPDATE contributions SET...</strong></span>
              </div>
              <div className="flex items-center gap-2 ml-20">
                <span className="text-indigo-400">6.</span>
                <span>If qualified (4,000+) → <strong className="text-indigo-400">POST /api/blockchain/register</strong></span>
              </div>
              <div className="flex items-center gap-2 ml-24">
                <span className="text-green-400">7.</span>
                <span>Blockchain anchoring → <strong className="text-green-400">Base Mainnet transaction</strong></span>
              </div>
            </div>
          </div>
        </div>

        {/* Key Operator Insights */}
        <div className="bg-gradient-to-r from-[var(--metal-silver)]/10 to-transparent border-l-4 border-[var(--metal-silver)] p-6">
          <h4 className="font-bold mb-3" style={{color: 'var(--metal-silver)'}}>
            🔑 Key Operator Insights
          </h4>
          <ul className="text-sm space-y-2 opacity-90">
            <li>• <strong>Groq Rate Limits:</strong> 100,000 tokens/day. Each evaluation uses ~16,000 tokens. Monitor usage!</li>
            <li>• <strong>Vector Redundancy:</strong> System automatically detects duplicate contributions via embeddings</li>
            <li>• <strong>Blockchain Delay:</strong> Registration disabled until March 20, 2026 per legal compliance</li>
            <li>• <strong>Paywall Bypass:</strong> Operators don't pay submission fees—use this for testing!</li>
          </ul>
        </div>

        {/* Next Steps */}
        <div className="bg-gradient-to-r from-green-500/10 to-transparent border-l-4 border-green-500 p-6">
          <h4 className="font-bold mb-2 text-green-400">🎉 You Understand the Architecture!</h4>
          <p className="text-sm opacity-90">
            You now know the <strong>4 layers</strong> (Submission → Evaluation → Storage → Blockchain), 
            the <strong>technical stack</strong>, and the <strong>data flow</strong>. Next, we'll dive deep 
            into SynthScan™ MRI—the AI evaluation engine you'll be managing.
          </p>
        </div>
      </div>
    ),
    keyTakeaways: [
      '4 architectural layers: Submission → Evaluation → Storage → Blockchain',
      'Enterprise Cloud instances allow isolated team environments',
      'Tech stack: Next.js + Supabase + Groq + Base Mainnet',
      'Groq rate limits are critical: 100K tokens/day, ~16K per evaluation',
    ],
  },

  // Modules 3-7 would continue with similar depth...
  // For brevity, I'll create placeholder structures that you can expand:

  {
    id: 'synthscan-deep-dive',
    number: 3,
    title: 'SynthScan™ MRI Deep Dive',
    subtitle: 'Mastering the Evaluation Engine',
    icon: <Zap className="h-6 w-6" />,
    duration: '40 min',
    content: (<div className="text-center p-12 opacity-50">Module 3 content: System prompt architecture, scoring dimensions, redundancy detection, edge case handling...</div>),
    keyTakeaways: [
      '745-line system prompt defines evaluation criteria',
      'Four dimensions scored 0-2,500 each (max 10,000 total)',
      'Vector embeddings detect redundancy automatically',
      'Operators can tune thresholds for Enterprise Clouds',
    ],
  },

  {
    id: 'managing-clouds',
    number: 4,
    title: 'Managing Cloud Instances',
    subtitle: 'Hands-On Cloud Operations',
    icon: <Database className="h-6 w-6" />,
    duration: '35 min',
    content: (<div className="text-center p-12 opacity-50">Module 4 content: Creating instances, configuring access, monitoring health, resource allocation...</div>),
    keyTakeaways: [
      'Create Enterprise Cloud instances via Operator Dashboard',
      'Configure access controls and custom parameters',
      'Monitor health metrics and usage analytics',
      'Allocate SYNTH resources for instance operations',
    ],
  },

  {
    id: 'community-coordination',
    number: 5,
    title: 'Community Coordination',
    subtitle: 'Supporting Contributors & Teams',
    icon: <Users className="h-6 w-6" />,
    duration: '25 min',
    content: (<div className="text-center p-12 opacity-50">Module 5 content: WorkChat moderation, broadcast system, contributor support, onboarding assistance...</div>),
    keyTakeaways: [
      'Use Operator Broadcast System to share updates',
      'Moderate WorkChat rooms and facilitate collaboration',
      'Provide technical support for contributor questions',
      'Guide new users through onboarding tracks',
    ],
  },

  {
    id: 'monitoring-analytics',
    number: 6,
    title: 'Monitoring & Analytics',
    subtitle: 'Data-Driven Operations',
    icon: <GitBranch className="h-6 w-6" />,
    duration: '30 min',
    content: (<div className="text-center p-12 opacity-50">Module 6 content: Dashboard analytics, SQL queries, performance metrics, trend analysis...</div>),
    keyTakeaways: [
      'Use Operator Dashboard analytics for system health',
      'Run SQL queries for custom reports (via Supabase)',
      'Monitor Groq API usage to avoid rate limits',
      'Track PoC trends and SYNTH distribution patterns',
    ],
  },

  {
    id: 'earning-silver-wings',
    number: 7,
    title: 'Earning Your Silver Wings',
    subtitle: 'Certified Cloud Operator',
    icon: <Award className="h-6 w-6" />,
    duration: '20 min',
    content: (
      <div className="space-y-6">
        {/* Victory */}
        <div className="border-l-4 border-[var(--metal-silver)] bg-gradient-to-r from-gray-400/10 to-transparent p-6">
          <h3 className="text-2xl font-bold mb-3" style={{color: 'var(--metal-silver)'}}>
            🛡️ You're Ready to Operate the Cloud
          </h3>
          <p className="text-lg opacity-90 leading-relaxed">
            You've mastered the architecture, the evaluation engine, Cloud management, community coordination, 
            and analytics. You're now equipped to run Enterprise Cloud instances and support the ecosystem.
          </p>
        </div>

        {/* Silver Wings Certificate */}
        <div className="border-4 border-[var(--metal-silver)] bg-gradient-to-br from-gray-400/20 to-transparent p-8 rounded-lg text-center">
          <div className="text-6xl mb-4">🛡️</div>
          <h3 className="text-3xl font-bold mb-2" style={{color: 'var(--metal-silver)'}}>
            Operator Silver Wings
          </h3>
          <div className="text-sm opacity-70 mb-4">Certified Enterprise Cloud Operator</div>
          <div className="inline-block bg-black/50 px-6 py-3 rounded-lg border border-[var(--metal-silver)]">
            <div className="text-xs opacity-70 mb-1">Authorized to Manage Infrastructure</div>
            <div className="font-bold text-lg">Ready to Operate</div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="cloud-card p-6">
          <h4 className="font-bold mb-4">Your Next Steps as an Operator</h4>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <span className="text-2xl">1️⃣</span>
              <div>
                <strong>Request Operator Status</strong> - Contact the core team to activate your operator permissions
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">2️⃣</span>
              <div>
                <strong>Create Your First Cloud Instance</strong> - Practice with a test environment
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">3️⃣</span>
              <div>
                <strong>Support Contributors</strong> - Answer questions in WorkChat and help onboard new users
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">4️⃣</span>
              <div>
                <strong>Consider Gold Wings</strong> - Explore the Creator track to learn full reality worldbuilding
              </div>
            </div>
          </div>
        </div>

        {/* Final Message */}
        <div className="bg-gradient-to-r from-[var(--metal-silver)]/10 to-transparent border-l-4 border-[var(--metal-silver)] p-6">
          <h4 className="font-bold mb-3" style={{color: 'var(--metal-silver)'}}>
            🚀 Welcome to Operations, Operator
          </h4>
          <p className="text-sm opacity-90 leading-relaxed">
            You're no longer just contributing—you're managing the infrastructure that makes 
            contributions possible. Your work enables others to succeed. <strong>Welcome to the Silver tier.</strong>
          </p>
        </div>
      </div>
    ),
    keyTakeaways: [
      'Completed all 7 modules of Operator Silver Wings',
      'Ready to manage Enterprise Cloud instances',
      'Equipped to support contributors and coordinate community',
      'Can advance to Creator Gold Wings when ready',
    ],
  },
];

