/**
 * Contributor Copper Wings Training Modules
 * World-class onboarding for contributors earning their Copper Wings
 * Pedagogically designed for adult learners with practical exercises
 */

import { Brain, Target, Upload, Scan, Award, Rocket } from 'lucide-react';

export const contributorCopperModules = [
  {
    id: 'welcome-frontier',
    number: 1,
    title: 'Welcome to the Frontier',
    subtitle: 'Your Journey to Copper Wings Begins',
    icon: <Brain className="h-6 w-6" />,
    duration: '15 min',
    content: (
      <div className="space-y-6">
        {/* Hero Opening */}
        <div className="border-l-4 border-[var(--hydrogen-amber)] bg-gradient-to-r from-amber-500/10 to-transparent p-6">
          <h3 className="text-2xl font-bold mb-3" style={{color: 'var(--hydrogen-amber)'}}>
            🎯 You're About to Change How Work Gets Recognized
          </h3>
          <p className="text-lg opacity-90 leading-relaxed">
            Traditional systems gatekeep contributions. Syntheverse liberates them. By the end of this track, 
            you'll understand how to turn your research, creative work, or innovation into verifiable, 
            blockchain-anchored proof that no one can erase or deny.
          </p>
        </div>

        {/* What You'll Master */}
        <div className="cloud-card p-6">
          <h4 className="font-bold mb-4 flex items-center gap-2">
            <Target className="w-5 h-5" style={{color: 'var(--hydrogen-beta)'}} />
            What You'll Master in This Module
          </h4>
          <ul className="space-y-3">
            {[
              'The problem Syntheverse solves (and why it matters to you)',
              'How Proof-of-Contribution works in plain language',
              'The Cloud architecture that makes everything possible',
              'Your path from submission to recognition',
            ].map((item, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <span className="text-green-400 font-bold">✓</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* The Problem We're Solving */}
        <div>
          <h4 className="text-xl font-bold mb-4">The Problem: Gatekept Contributions</h4>
          
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div className="border border-red-500/30 bg-red-500/5 p-4 rounded-lg">
              <div className="text-red-400 font-semibold mb-2">❌ Traditional Systems</div>
              <ul className="space-y-2 text-sm opacity-80">
                <li>• Journals reject 70% of submissions</li>
                <li>• Peer review takes 6-12 months</li>
                <li>• No proof until published</li>
                <li>• Institutional bias determines merit</li>
                <li>• Your work can be stolen or disputed</li>
              </ul>
            </div>
            
            <div className="border border-green-500/30 bg-green-500/5 p-4 rounded-lg">
              <div className="text-green-400 font-semibold mb-2">✅ Syntheverse</div>
              <ul className="space-y-2 text-sm opacity-80">
                <li>• Submit anytime, evaluated in ~10 minutes</li>
                <li>• AI-powered unbiased evaluation</li>
                <li>• Instant blockchain-anchored proof</li>
                <li>• Merit measured by coherence, not politics</li>
                <li>• Immutable timestamp of your contribution</li>
              </ul>
            </div>
          </div>
        </div>

        {/* The Solution: Cloud Architecture */}
        <div>
          <h4 className="text-xl font-bold mb-4">The Solution: Holographic Hydrogen Fractal Cloud</h4>
          
          <p className="mb-4 leading-relaxed">
            Think of Syntheverse as <strong>cloud infrastructure for contributions</strong>. Just like AWS 
            hosts websites, Syntheverse hosts and validates your intellectual work using revolutionary 
            HHF-AI MRI technology.
          </p>

          <div className="cloud-card p-6">
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">1</span>
                </div>
                <div>
                  <div className="font-semibold mb-1">You Submit Your Work</div>
                  <div className="text-sm opacity-80">Upload your contribution to the Cloud (research, code, design, etc.)</div>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">2</span>
                </div>
                <div>
                  <div className="font-semibold mb-1">SynthScan™ MRI Evaluates</div>
                  <div className="text-sm opacity-80">AI scans for novelty, density, coherence, and alignment using hydrogen spin imaging</div>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">3</span>
                </div>
                <div>
                  <div className="font-semibold mb-1">Blockchain Anchors Your Proof</div>
                  <div className="text-sm opacity-80">Qualifying contributions get immutable on-chain registration (optional, free)</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Key Concept: Cloud vs Traditional */}
        <div className="border-2 border-[var(--hydrogen-beta)] bg-blue-500/5 p-6 rounded-lg">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl">💡</span>
            <h4 className="text-lg font-bold">Key Concept: The Cloud Metaphor</h4>
          </div>
          <p className="leading-relaxed">
            <strong>Traditional journals</strong> are like sending faxes—slow, gatekept, and centralized.
            <br />
            <strong>Syntheverse Cloud</strong> is like Google Drive—instant, accessible, and permanent. 
            But instead of storing files, we're storing <em>proof of your intellectual contribution</em> 
            on the blockchain where no one can delete or dispute it.
          </p>
        </div>

        {/* Quick Win */}
        <div className="bg-gradient-to-r from-green-500/10 to-transparent border-l-4 border-green-500 p-6">
          <h4 className="font-bold mb-2 text-green-400">🎉 Quick Win: What You Just Learned</h4>
          <p className="text-sm opacity-90">
            You now understand <strong>why Syntheverse exists</strong> (to liberate gatekept contributions), 
            <strong>how it works</strong> (Cloud + AI + Blockchain), and <strong>what it means for you</strong> 
            (instant, verifiable proof of your work). That's the foundation. Next, we'll dive into how 
            Proof-of-Contribution actually measures your work.
          </p>
        </div>
      </div>
    ),
    keyTakeaways: [
      'Syntheverse liberates contributions from traditional gatekeeping',
      'The Cloud architecture provides instant, unbiased evaluation',
      'SynthScan™ MRI uses hydrogen spin imaging to measure contribution value',
      'Blockchain anchoring creates immutable proof of your work',
    ],
  },
  
  {
    id: 'proof-of-contribution',
    number: 2,
    title: 'Understanding Proof-of-Contribution',
    subtitle: 'How Your Work Gets Measured & Valued',
    icon: <Scan className="h-6 w-6" />,
    duration: '20 min',
    content: (
      <div className="space-y-6">
        {/* Opening Hook */}
        <div className="border-l-4 border-[var(--hydrogen-gamma)] bg-gradient-to-r from-purple-500/10 to-transparent p-6">
          <h3 className="text-2xl font-bold mb-3" style={{color: 'var(--hydrogen-gamma)'}}>
            📊 How Do We Know What's Valuable?
          </h3>
          <p className="text-lg opacity-90 leading-relaxed">
            Traditional systems use citations, impact factors, or peer reviews. Syntheverse uses 
            <strong> Proof-of-Contribution (PoC)</strong>—a revolutionary system that measures the 
            actual coherence and novelty of your work, not its popularity or institutional backing.
          </p>
        </div>

        {/* The Four Dimensions */}
        <div>
          <h4 className="text-xl font-bold mb-4">The Four Dimensions of Value</h4>
          <p className="mb-6">Every contribution is evaluated across four core dimensions. Think of these as the "vital signs" of intellectual work:</p>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="cloud-card p-5 border-l-4 border-blue-500">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">🆕</span>
                <div>
                  <div className="font-bold text-blue-400">Novelty</div>
                  <div className="text-xs opacity-70">0-2,500 points</div>
                </div>
              </div>
              <p className="text-sm opacity-90 mb-3">
                <strong>What it measures:</strong> How original is this? Have we seen it before?
              </p>
              <p className="text-xs opacity-70">
                <strong>Example:</strong> A completely new algorithm scores high. A tutorial on existing methods scores lower.
              </p>
            </div>

            <div className="cloud-card p-5 border-l-4 border-purple-500">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">📦</span>
                <div>
                  <div className="font-bold text-purple-400">Density</div>
                  <div className="text-xs opacity-70">0-2,500 points</div>
                </div>
              </div>
              <p className="text-sm opacity-90 mb-3">
                <strong>What it measures:</strong> How much insight is packed in? Depth over breadth.
              </p>
              <p className="text-xs opacity-70">
                <strong>Example:</strong> A 5-page paper with breakthrough equations scores high. A 50-page review scores lower.
              </p>
            </div>

            <div className="cloud-card p-5 border-l-4 border-green-500">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">🔗</span>
                <div>
                  <div className="font-bold text-green-400">Coherence</div>
                  <div className="text-xs opacity-70">0-2,500 points</div>
                </div>
              </div>
              <p className="text-sm opacity-90 mb-3">
                <strong>What it measures:</strong> Does it make sense? Is the logic sound?
              </p>
              <p className="text-xs opacity-70">
                <strong>Example:</strong> Well-structured arguments score high. Contradictory claims score lower.
              </p>
            </div>

            <div className="cloud-card p-5 border-l-4 border-amber-500">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">🎯</span>
                <div>
                  <div className="font-bold" style={{color: 'var(--hydrogen-amber)'}}>Alignment</div>
                  <div className="text-xs opacity-70">0-2,500 points</div>
                </div>
              </div>
              <p className="text-sm opacity-90 mb-3">
                <strong>What it measures:</strong> Does it fit the Syntheverse framework?
              </p>
              <p className="text-xs opacity-70">
                <strong>Example:</strong> Work exploring holographic principles scores high. Generic unrelated work scores lower.
              </p>
            </div>
          </div>
        </div>

        {/* Scoring Explained Simply */}
        <div className="cloud-card p-6">
          <h4 className="font-bold mb-4 text-lg">Simple Scoring Guide</h4>
          
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <div className="w-24 text-right font-mono text-sm">0-4,000</div>
              <div className="flex-1 h-2 bg-red-500/30 rounded-full"></div>
              <div className="text-sm opacity-70">Unqualified</div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-24 text-right font-mono text-sm text-green-400">4,000-7,000</div>
              <div className="flex-1 h-2 bg-green-500/50 rounded-full"></div>
              <div className="text-sm font-semibold text-green-400">Qualified</div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-24 text-right font-mono text-sm text-amber-400">7,000-9,000</div>
              <div className="flex-1 h-2 bg-amber-500/50 rounded-full"></div>
              <div className="text-sm font-semibold" style={{color: 'var(--hydrogen-amber)'}}>High Impact</div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-24 text-right font-mono text-sm text-purple-400">9,000-10,000</div>
              <div className="flex-1 h-2 bg-purple-500/50 rounded-full"></div>
              <div className="text-sm font-semibold text-purple-400">Breakthrough</div>
            </div>
          </div>

          <p className="text-sm opacity-70 mt-4">
            💡 <strong>Good to know:</strong> Most quality contributions score 5,000-7,000. 
            Don't stress about perfect scores—focus on genuine novelty and clear thinking.
          </p>
        </div>

        {/* The Secret: Hydrogen Spin MRI */}
        <div className="border-2 border-[var(--hydrogen-beta)] bg-blue-500/5 p-6 rounded-lg">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl">🔬</span>
            <h4 className="text-lg font-bold">The Secret: SynthScan™ MRI Technology</h4>
          </div>
          <p className="mb-3 leading-relaxed">
            SynthScan™ MRI isn't just another AI. It uses <strong>hydrogen spin-mediated resonance</strong> 
            to "see" the structure of your contribution—like an MRI machine reveals the inside of a body, 
            SynthScan reveals the coherence patterns inside ideas.
          </p>
          <p className="text-sm opacity-80 leading-relaxed">
            This technology is based on holographic hydrogen fractal principles. Don't worry if that sounds 
            complex—you don't need to understand the physics to use it, just like you don't need to understand 
            TCP/IP to use the internet.
          </p>
        </div>

        {/* Interactive Example */}
        <div className="bg-gradient-to-r from-amber-500/10 to-transparent border-l-4 border-amber-500 p-6">
          <h4 className="font-bold mb-3" style={{color: 'var(--hydrogen-amber)'}}>📝 Example: Two Submissions</h4>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-black/20 p-4 rounded-lg border border-green-500/30">
              <div className="text-sm font-semibold text-green-400 mb-2">✅ High Scorer (8,200 points)</div>
              <div className="text-xs opacity-80 mb-3">
                "Novel method for fractal pattern recognition in neural networks using hydrogen-inspired algorithms. 
                Reduces training time by 40% with mathematical proof and open-source implementation."
              </div>
              <div className="text-xs space-y-1">
                <div>Novelty: <span className="text-green-400">2,300</span> (new method)</div>
                <div>Density: <span className="text-green-400">2,100</span> (math + code)</div>
                <div>Coherence: <span className="text-green-400">1,900</span> (clear logic)</div>
                <div>Alignment: <span className="text-green-400">1,900</span> (fractal/hydrogen)</div>
              </div>
            </div>

            <div className="bg-black/20 p-4 rounded-lg border border-red-500/30">
              <div className="text-sm font-semibold text-red-400 mb-2">❌ Low Scorer (2,800 points)</div>
              <div className="text-xs opacity-80 mb-3">
                "I think AI is interesting and we should use it more. Here are some thoughts about general 
                improvements we could make to various systems."
              </div>
              <div className="text-xs space-y-1">
                <div>Novelty: <span className="text-red-400">600</span> (generic idea)</div>
                <div>Density: <span className="text-red-400">500</span> (vague)</div>
                <div>Coherence: <span className="text-red-400">900</span> (lacks structure)</div>
                <div>Alignment: <span className="text-red-400">800</span> (not specific)</div>
              </div>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-gradient-to-r from-green-500/10 to-transparent border-l-4 border-green-500 p-6">
          <h4 className="font-bold mb-2 text-green-400">🎉 You Now Understand PoC!</h4>
          <p className="text-sm opacity-90">
            You know the <strong>four dimensions</strong> (Novelty, Density, Coherence, Alignment), 
            the <strong>scoring system</strong> (4,000+ qualifies), and the <strong>technology</strong> 
            (SynthScan™ MRI). Next, we'll show you exactly how to submit your first contribution.
          </p>
        </div>
      </div>
    ),
    keyTakeaways: [
      'PoC measures four dimensions: Novelty, Density, Coherence, and Alignment',
      'Scores range 0-10,000; 4,000+ qualifies for blockchain registration',
      'SynthScan™ MRI uses hydrogen spin imaging to evaluate contributions objectively',
      'Focus on clear, original thinking over gaming the system',
    ],
  },

  // Additional modules continue...
];

