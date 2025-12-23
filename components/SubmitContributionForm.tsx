'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FileText, Brain, Award, Coins, AlertTriangle, Loader2, CheckCircle2 } from "lucide-react"
import Link from "next/link"

interface SubmitContributionFormProps {
    userEmail: string
}

export default function SubmitContributionForm({ userEmail }: SubmitContributionFormProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)
    const [submissionHash, setSubmissionHash] = useState<string | null>(null)
    
    const [formData, setFormData] = useState({
        title: '',
        text_content: '',
        category: 'scientific',
        file: null as File | null
    })

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        setSuccess(false)

        if (!formData.title.trim()) {
            setError('Title is required')
            setLoading(false)
            return
        }

        if (!formData.text_content.trim() && !formData.file) {
            setError('Please provide either text content or upload a file')
            setLoading(false)
            return
        }

        try {
            const submitFormData = new FormData()
            submitFormData.append('title', formData.title)
            submitFormData.append('text_content', formData.text_content)
            submitFormData.append('category', formData.category)
            submitFormData.append('contributor', userEmail)
            
            if (formData.file) {
                submitFormData.append('file', formData.file)
            }

            const response = await fetch('/api/submit', {
                method: 'POST',
                body: submitFormData
            })

            const result = await response.json()

            if (!response.ok) {
                throw new Error(result.error || 'Failed to submit contribution')
            }

            setSubmissionHash(result.submission_hash)
            setSuccess(true)
            
            // Redirect to dashboard after a short delay
            setTimeout(() => {
                router.push('/dashboard')
            }, 2000)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred')
        } finally {
            setLoading(false)
        }
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFormData({ ...formData, file: e.target.files[0] })
        }
    }

    return (
        <div className="space-y-6">
            {/* Contribution Process Overview */}
            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            Step 1: Prepare Your Work
                        </CardTitle>
                        <CardDescription>
                            Create or identify your contribution for evaluation
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <p className="text-sm text-muted-foreground">
                            Scientific papers, technical documentation, research findings,
                            or any intellectual contribution that advances human knowledge.
                        </p>
                        <ul className="text-sm space-y-1 ml-4">
                            <li>• PDF format preferred</li>
                            <li>• Include metadata and context</li>
                            <li>• Ensure original work</li>
                        </ul>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Brain className="h-5 w-5" />
                            Step 2: AI Evaluation
                        </CardTitle>
                        <CardDescription>
                            Hydrogen-holographic fractal scoring
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <p className="text-sm text-muted-foreground">
                            Your contribution is evaluated across four dimensions:
                        </p>
                        <ul className="text-sm space-y-1 ml-4">
                            <li>• <strong>Novelty:</strong> Originality and innovation (0-2,500)</li>
                            <li>• <strong>Density:</strong> Information richness (0-2,500)</li>
                            <li>• <strong>Coherence:</strong> Logical consistency (0-2,500)</li>
                            <li>• <strong>Alignment:</strong> Syntheverse objectives (0-2,500)</li>
                        </ul>
                        <p className="text-xs text-muted-foreground mt-2">
                            Total score: 0-10,000. Founder qualification: ≥8,000
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Award className="h-5 w-5" />
                            Step 3: Metallic Qualification
                        </CardTitle>
                        <CardDescription>
                            Gold, Silver, or Copper ranking
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <p className="text-sm text-muted-foreground">
                            Based on evaluation scores, receive a metallic qualification:
                        </p>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                                <span className="text-sm"><strong>Gold:</strong> Top 10% (1.5× multiplier)</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                                <span className="text-sm"><strong>Silver:</strong> Top 30% (1.2× multiplier)</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-orange-600 rounded-full"></div>
                                <span className="text-sm"><strong>Copper:</strong> Qualified (1.15× multiplier)</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Coins className="h-5 w-5" />
                            Step 4: Token Rewards
                        </CardTitle>
                        <CardDescription>
                            SYNTH tokens and blockchain registration
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <p className="text-sm text-muted-foreground">
                            Approved contributions earn SYNTH tokens based on:
                        </p>
                        <ul className="text-sm space-y-1 ml-4">
                            <li>• Base reward + metallic amplification</li>
                            <li>• Evaluation scores across dimensions</li>
                            <li>• Current epoch allocation</li>
                        </ul>
                        <p className="text-sm text-muted-foreground mt-2">
                            <strong>$200 registration fee</strong> for on-chain anchoring
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Submission Form */}
            <Card>
                <CardHeader>
                    <CardTitle>Submit Your Contribution</CardTitle>
                    <CardDescription>
                        Fill in the details below to submit your work for evaluation
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {error && (
                        <Alert variant="destructive" className="mb-4">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {success && (
                        <Alert className="mb-4 border-green-500 bg-green-50">
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                            <AlertTitle className="text-green-800">Submission Successful!</AlertTitle>
                            <AlertDescription className="text-green-700">
                                Your contribution has been submitted. Submission hash: {submissionHash}
                                <br />
                                Redirecting to dashboard...
                            </AlertDescription>
                        </Alert>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="title">Title *</Label>
                            <Input
                                id="title"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="Enter contribution title"
                                required
                                disabled={loading}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="category">Category *</Label>
                            <select
                                id="category"
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                required
                                disabled={loading}
                            >
                                <option value="scientific">Scientific Discovery</option>
                                <option value="tech">Technological Innovation</option>
                                <option value="alignment">Alignment Research</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="text_content">Content *</Label>
                            <textarea
                                id="text_content"
                                value={formData.text_content}
                                onChange={(e) => setFormData({ ...formData, text_content: e.target.value })}
                                placeholder="Enter your contribution content, research findings, or description..."
                                className="flex min-h-[200px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                required={!formData.file}
                                disabled={loading}
                            />
                            <p className="text-xs text-muted-foreground">
                                Provide the text content of your contribution. This will be evaluated by the Syntheverse PoC Evaluation Engine.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="file">File Upload (Optional)</Label>
                            <Input
                                id="file"
                                type="file"
                                accept=".pdf,.txt,.md"
                                onChange={handleFileChange}
                                disabled={loading}
                            />
                            <p className="text-xs text-muted-foreground">
                                Upload a PDF, text file, or markdown file. File name will be stored for reference.
                            </p>
                            {formData.file && (
                                <p className="text-sm text-muted-foreground">
                                    Selected: {formData.file.name} ({(formData.file.size / 1024).toFixed(2)} KB)
                                </p>
                            )}
                        </div>

                        <div className="flex gap-4">
                            <Link href="/dashboard" className="flex-1">
                                <Button type="button" variant="outline" className="w-full" disabled={loading}>
                                    Cancel
                                </Button>
                            </Link>
                            <Button type="submit" className="flex-1" disabled={loading || (!formData.text_content.trim() && !formData.file)}>
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Submitting...
                                    </>
                                ) : (
                                    <>
                                        <FileText className="mr-2 h-4 w-4" />
                                        Submit Contribution
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}

