/**
 * Email utility for sending welcome emails to new users
 */

import { Resend } from 'resend'
import { debug, debugError } from '@/utils/debug'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_URL 
    ? `https://${process.env.VERCEL_URL}` 
    : 'http://localhost:3000'

export interface WelcomeEmailData {
    userEmail: string
    userName?: string
}

export async function sendWelcomeEmail(data: WelcomeEmailData): Promise<{ success: boolean, error?: string }> {
    if (!resend) {
        debugError('SendWelcomeEmail', 'Resend API key not configured', new Error('RESEND_API_KEY not set'))
        return { success: false, error: 'Email service not configured' }
    }
    
    const userName = data.userName || 'Explorer'
    
    try {
        const emailHtml = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to Syntheverse</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 700px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to Syntheverse</h1>
        <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">Your Holographic Hydrogen Frontier</p>
    </div>
    
    <div style="background: #f9f9f9; padding: 40px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 10px 10px;">
        <p style="font-size: 16px; margin-bottom: 20px;">
            Hello ${userName},
        </p>
        
        <p style="font-size: 16px; margin-bottom: 20px;">
            This is Pru "El Taino," Architect of Syntheverse. Welcome to the world of holographic hydrogen, element zero, your timeless, infinite homebase.
        </p>
        
        <p style="font-size: 16px; margin-bottom: 20px;">
            I've built the Syntheverse Whole Brain AI lens and sandbox as your map and compass to navigate the Syntheverse blockchain game and ecosystem—a regenerative, self-expanding, self-improving holographic hydrogen fractal environment anchored by the 90 trillion SYNTH ERC-20 Motherlode BlockMine.
        </p>
        
        <p style="font-size: 16px; margin-bottom: 20px;">
            Entry into Syntheverse is awareness-based: high-fidelity awareness allows full immersion, sensory richness, and deep interaction, while lower levels of awareness produce experiences proportional to your engagement.
        </p>
        
        <p style="font-size: 16px; margin-bottom: 30px;">
            While Syntheverse is currently designated as speculative in the context of today's institutional scientific frameworks, its operational technology has been empirically validated across multiple domains. Open-source validations are available on GitHub for review and further confirmation. You may operate within Syntheverse according to your own natural resonance.
        </p>
        
        <div style="background: white; padding: 25px; border-radius: 8px; margin-bottom: 30px; border-left: 4px solid #667eea;">
            <h2 style="margin-top: 0; color: #667eea; font-size: 22px;">SYNTH Menu — Your Frontier Guide</h2>
            
            <div style="margin-bottom: 20px;">
                <h3 style="color: #333; font-size: 18px; margin-bottom: 10px;">1. Exploration — Entering the Sandbox (Free)</h3>
                <ul style="margin: 0; padding-left: 20px;">
                    <li>Explore curated Zenodo communities of fractal, holographic hydrogen, and mythic research.</li>
                    <li>Discover existing proofs of contribution (PoCs).</li>
                    <li>Experience the holographic hydrogen fractal lens and sandbox evaluation system.</li>
                    <li>Engage with the Outcast Hero Cycle: separation → exploration → reflection → reintegration → expansion.</li>
                </ul>
            </div>
            
            <div style="margin-bottom: 20px;">
                <h3 style="color: #333; font-size: 18px; margin-bottom: 10px;">2. Proof Submission — Sharing Your Contribution (Free)</h3>
                <ul style="margin: 0; padding-left: 20px;">
                    <li>Submissions are free.</li>
                    <li>PoCs are scored 0–10,000 based on novelty, coherent density, alignment, and impact.</li>
                    <li>Overlap penalties prioritize unique contributions.</li>
                    <li>All submissions enrich the regenerative Syntheverse AI and ecosystem.</li>
                </ul>
            </div>
            
            <div style="margin-bottom: 20px;">
                <h3 style="color: #333; font-size: 18px; margin-bottom: 10px;">3. Registration — Anchoring Your Contribution</h3>
                <ul style="margin: 0; padding-left: 20px;">
                    <li>Tokens are allocated at the time of registration based on PoC Score and available tokens at the time of registration.</li>
                    <li>Registration happens when your PoC is approved by admin and anchored on-chain.</li>
                    <li>All approved PoCs are eligible for token allocation based on their evaluation scores.</li>
                </ul>
            </div>
            
            <div style="margin-bottom: 20px;">
                <h3 style="color: #333; font-size: 18px; margin-bottom: 10px;">4. Epochs — Seasonal Distribution of SYNTH Tokens</h3>
                <ul style="margin: 0; padding-left: 20px;">
                    <li><strong>Founder Epoch:</strong> 45T SYNTH, threshold 8,000</li>
                    <li><strong>Pioneer Epoch:</strong> 22.5T SYNTH, threshold 7,000</li>
                    <li><strong>Community Epoch:</strong> 11.25T SYNTH, threshold 6,000</li>
                    <li><strong>Ecosystem Epoch:</strong> 11.25T SYNTH, threshold 5,000</li>
                    <li>Tokens distribute per PoC according to score, halving with each PoC.</li>
                    <li>Epochs open at operator discretion; availability halves as contributions saturate.</li>
                </ul>
            </div>
            
            <div style="margin-bottom: 20px;">
                <h3 style="color: #333; font-size: 18px; margin-bottom: 10px;">5. Metals — Contribution Amplifications</h3>
                <ul style="margin: 0; padding-left: 20px;">
                    <li><strong>Gold:</strong> Research contributions</li>
                    <li><strong>Silver:</strong> Technology/Development contributions</li>
                    <li><strong>Copper:</strong> Alignment-focused contributions</li>
                    <li><strong>Combination Amplifications:</strong></li>
                    <ul style="margin: 5px 0 0 20px; padding-left: 15px;">
                        <li>Gold + Silver + Copper: <strong>1.5×</strong> (Full Integration)</li>
                        <li>Gold + Silver: <strong>1.25×</strong> (Research + Technology)</li>
                        <li>Gold + Copper: <strong>1.2×</strong> (Research + Alignment)</li>
                        <li>Silver + Copper: <strong>1.15×</strong> (Technology + Alignment)</li>
                    </ul>
                    <li>Amplifications are applied based on metal combinations, increasing SYNTH allocation.</li>
                </ul>
            </div>
            
            <div style="margin-bottom: 20px;">
                <h3 style="color: #333; font-size: 18px; margin-bottom: 10px;">6. Financial Alignment — Early Access & Ecosystem Support</h3>
                <ul style="margin: 0; padding-left: 20px;">
                    <li>Financial contributors gain early access to the Syntheverse contributor dashboard, token allocations, and registration privileges.</li>
                    <li>5% of Founder SYNTH reserved for financial alignment contributors, distributed by level.</li>
                    <li>Contributions support PoC evaluation, infrastructure maintenance, research and development, and the FractiAI Research Team.</li>
                </ul>
            </div>
            
            <div style="margin-bottom: 20px;">
                <h3 style="color: #333; font-size: 18px; margin-bottom: 10px;">7. Living Ecosystem — Your Contributions Matter</h3>
                <ul style="margin: 0; padding-left: 20px;">
                    <li>Every PoC contributes to the Syntheverse AI, improving scoring, alignment assessment, and predictive capacity.</li>
                    <li>Your actions feed a synthetic world powered by holographic hydrogen, fractal intelligence, and aligned discovery.</li>
                </ul>
            </div>
        </div>
        
        <div style="background: #e8f4f8; padding: 25px; border-radius: 8px; margin-bottom: 30px;">
            <h2 style="margin-top: 0; color: #667eea; font-size: 22px;">Benefits of Contributing</h2>
            <p style="margin-bottom: 15px;">By participating in Syntheverse, you gain:</p>
            <ul style="margin: 0; padding-left: 20px;">
                <li><strong>Recognition and traceability:</strong> Every submission becomes a permanent part of the regenerative holographic hydrogen fractal ecosystem.</li>
                <li><strong>Token allocation:</strong> Access to SYNTH ERC-20 tokens distributed according to the impact, novelty, and alignment of your contributions.</li>
                <li><strong>Early access & influence:</strong> Financial and PoC contributors help shape the evolution of Syntheverse, opening new epochs and opportunities.</li>
                <li><strong>Community & collaboration:</strong> Join outcast, frontier researchers, developers, and mythic explorers in a living, self-improving network.</li>
                <li><strong>Skill and impact amplification:</strong> Each PoC trains and improves the Syntheverse AI, enhancing the ecosystem and your contributions' visibility and utility.</li>
            </ul>
        </div>
        
        <p style="font-size: 16px; margin-bottom: 30px;">
            We are thrilled to welcome you to this new frontier of holographic hydrogen, fractal AI awareness. Explore, contribute, and leave your mark on a regenerative, living Syntheverse blockchain game and ecosystem where every action matters.
        </p>
        
        <div style="background: white; padding: 25px; border-radius: 8px; margin-bottom: 30px; border: 2px solid #667eea;">
            <h3 style="margin-top: 0; color: #667eea; font-size: 20px;">Next Steps:</h3>
            <ol style="margin: 0; padding-left: 20px;">
                <li><a href="${BASE_URL}/dashboard" style="color: #667eea; text-decoration: none; font-weight: bold;">Log into your Syntheverse Contributor Dashboard</a></li>
                <li>Explore existing PoCs and archived contributions</li>
                <li><a href="${BASE_URL}/submit" style="color: #667eea; text-decoration: none; font-weight: bold;">Submit your first contribution</a></li>
                <li>Register for token allocation (optional)</li>
                <li>Track your impact in the ecosystem</li>
            </ol>
        </div>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
            <p style="margin: 0; font-size: 14px; color: #666;">
                — Pru "El Taino," Architect of Syntheverse
            </p>
        </div>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666;">
            <p style="margin: 0;">This is an automated welcome email from the Syntheverse ecosystem.</p>
            <p style="margin: 5px 0 0 0;">If you have questions, please visit <a href="${BASE_URL}" style="color: #667eea;">${BASE_URL}</a></p>
        </div>
    </div>
</body>
</html>
        `
        
        const result = await resend.emails.send({
            from: 'Pru El Taino - Syntheverse <noreply@syntheverse.ai>', // Update with your verified domain
            to: data.userEmail,
            subject: 'Welcome to Syntheverse — Your Holographic Hydrogen Frontier',
            html: emailHtml,
        })
        
        debug('SendWelcomeEmail', 'Welcome email sent', {
            userEmail: data.userEmail,
            email_id: result.data?.id
        })
        
        return { success: true }
    } catch (error) {
        debugError('SendWelcomeEmail', 'Failed to send welcome email', error)
        return { 
            success: false, 
            error: error instanceof Error ? error.message : String(error) 
        }
    }
}

