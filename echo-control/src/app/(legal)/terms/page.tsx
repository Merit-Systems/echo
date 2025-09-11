import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service - Echo Platform',
  description:
    'Terms of Service for the Echo Platform operated by Merit Systems, Inc.',
};

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="prose prose-gray dark:prose-invert max-w-none">
        <h1>Echo Platform Terms of Service</h1>

        <p>
          <strong>Effective Date</strong>: September 9, 2025
          <br />
          <strong>Last Updated</strong>: September 9, 2025
        </p>

        <p>
          These Terms of Service (&quot;Terms&quot;) govern your use of the Echo
          Platform operated by Merit Systems, Inc. (&quot;Merit Systems,&quot;
          &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;). By accessing or
          using the Echo Platform, you agree to be bound by these Terms.
        </p>

        <hr />

        <h2>1. Service Description</h2>

        <h3>What Echo Is</h3>
        <p>
          Echo is an AI and large language model (LLM) platform that provides:
        </p>
        <ul>
          <li>
            <strong>API Access</strong>: Unified access to multiple AI providers
            including OpenAI, Anthropic, Google Gemini, and OpenRouter
          </li>
          <li>
            <strong>Usage Management</strong>: Real-time tracking, billing, and
            quota management for AI model usage
          </li>
          <li>
            <strong>Developer Tools</strong>: SDKs, libraries, and development
            tools for building AI-powered applications
          </li>
          <li>
            <strong>Analytics</strong>: Usage insights and performance
            monitoring for your AI applications
          </li>
        </ul>

        <h3>How Echo Works</h3>
        <p>
          Echo acts as an intermediary between you and AI service providers.
          When you submit prompts or requests through Echo:
        </p>
        <ol>
          <li>Your request is authenticated and processed by our systems</li>
          <li>We forward your request to the appropriate AI provider</li>
          <li>The AI provider processes your request and returns a response</li>
          <li>
            We track usage and bill you according to your usage and our pricing
          </li>
        </ol>

        <h3>Related Services</h3>
        <p>
          For Echo developers who earn revenue through our platform, payouts are
          processed through our Terminal platform. Payout terms and conditions
          are governed by the Terminal Terms of Service available at{' '}
          <a
            href="https://merit.systems/terms"
            className="text-blue-600 hover:text-blue-800"
          >
            merit.systems/terms
          </a>
          .
        </p>

        <hr />

        <h2>2. Definitions</h2>
        <ul>
          <li>
            <strong>&quot;AI Content&quot;</strong> means any content generated
            by artificial intelligence models through the Echo Platform
          </li>
          <li>
            <strong>&quot;API Key&quot;</strong> means the unique identifier
            that authenticates your access to Echo services
          </li>
          <li>
            <strong>&quot;Developer&quot;</strong> means a user who creates
            applications using Echo and may receive revenue sharing or referral
            payments
          </li>
          <li>
            <strong>&quot;Prompts&quot;</strong> means the text, questions, or
            instructions you submit to AI models
          </li>
          <li>
            <strong>&quot;Third-Party AI Providers&quot;</strong> means external
            AI service providers including OpenAI, Anthropic, Google, and
            OpenRouter
          </li>
          <li>
            <strong>&quot;Usage Data&quot;</strong> means information about your
            use of AI models including token consumption, costs, and performance
            metrics
          </li>
        </ul>

        <hr />

        <h2>3. Account Registration and Eligibility</h2>

        <h3>Age Requirement</h3>
        <p>
          You must be at least 18 years old to use Echo. By using our service,
          you represent that you meet this age requirement.
        </p>

        <h3>Account Information</h3>
        <p>
          You must provide accurate and complete information when creating your
          account. You are responsible for:
        </p>
        <ul>
          <li>Maintaining the security of your account credentials</li>
          <li>All activities that occur under your account</li>
          <li>Notifying us immediately of any unauthorized use</li>
        </ul>

        <h3>API Keys and Security</h3>
        <p>
          Your API keys are sensitive credentials that provide access to your
          Echo account. You must:
        </p>
        <ul>
          <li>Keep API keys confidential and secure</li>
          <li>Not share API keys with unauthorized third parties</li>
          <li>Rotate API keys regularly for security</li>
          <li>Report compromised API keys immediately</li>
        </ul>

        <hr />

        <h2>4. Acceptable Use Policy</h2>

        <h3>Permitted Uses</h3>
        <p>You may use Echo for lawful purposes including:</p>
        <ul>
          <li>Building AI-powered applications and services</li>
          <li>Generating content for personal or commercial use</li>
          <li>Research and educational activities</li>
          <li>Testing and development of AI applications</li>
        </ul>

        <h3>Prohibited Uses</h3>
        <p>You may NOT use Echo to:</p>

        <h4>Content Restrictions</h4>
        <ul>
          <li>Generate illegal, harmful, or abusive content</li>
          <li>Create content that violates intellectual property rights</li>
          <li>Produce misleading, deceptive, or fraudulent content</li>
          <li>
            Generate content that promotes violence, hatred, or discrimination
          </li>
        </ul>

        <h4>Technical Restrictions</h4>
        <ul>
          <li>Circumvent usage limits, rate limiting, or security measures</li>
          <li>Attempt to reverse engineer or extract AI model weights</li>
          <li>
            Use automated systems to generate excessive requests beyond
            reasonable use
          </li>
          <li>Share or resell your API access without proper authorization</li>
        </ul>

        <h4>Business Restrictions</h4>
        <ul>
          <li>
            Compete directly with Echo or our AI provider partners using our
            service
          </li>
          <li>Use Echo to train competing AI models</li>
          <li>Violate any applicable laws or regulations</li>
        </ul>

        <h3>Enforcement</h3>
        <p>
          We reserve the right to suspend or terminate accounts that violate
          this Acceptable Use Policy. We may also report illegal activities to
          appropriate authorities.
        </p>

        <hr />

        <h2>5. AI Services and Disclaimers</h2>

        <h3>Third-Party AI Providers</h3>
        <p>
          Echo integrates with multiple AI providers. Your prompts and data are
          transmitted to these providers according to their respective privacy
          policies and terms of service:
        </p>
        <ul>
          <li>
            <strong>OpenAI</strong>:{' '}
            <a
              href="https://openai.com/terms/"
              className="text-blue-600 hover:text-blue-800"
            >
              OpenAI Terms
            </a>{' '}
            and{' '}
            <a
              href="https://openai.com/privacy/"
              className="text-blue-600 hover:text-blue-800"
            >
              Privacy Policy
            </a>
          </li>
          <li>
            <strong>Anthropic</strong>:{' '}
            <a
              href="https://www.anthropic.com/terms/"
              className="text-blue-600 hover:text-blue-800"
            >
              Anthropic Terms
            </a>{' '}
            and{' '}
            <a
              href="https://www.anthropic.com/privacy/"
              className="text-blue-600 hover:text-blue-800"
            >
              Privacy Policy
            </a>
          </li>
          <li>
            <strong>Google</strong>:{' '}
            <a
              href="https://ai.google.dev/terms"
              className="text-blue-600 hover:text-blue-800"
            >
              Google AI Terms
            </a>{' '}
            and{' '}
            <a
              href="https://policies.google.com/privacy"
              className="text-blue-600 hover:text-blue-800"
            >
              Privacy Policy
            </a>
          </li>
          <li>
            <strong>OpenRouter</strong>:{' '}
            <a
              href="https://openrouter.ai/terms"
              className="text-blue-600 hover:text-blue-800"
            >
              OpenRouter Terms
            </a>{' '}
            and{' '}
            <a
              href="https://openrouter.ai/privacy"
              className="text-blue-600 hover:text-blue-800"
            >
              Privacy Policy
            </a>
          </li>
        </ul>

        <h3>AI Content Disclaimers</h3>

        <h4>No Warranty on Accuracy</h4>
        <p>
          AI-generated content is provided for informational purposes only. We
          make no warranties about:
        </p>
        <ul>
          <li>Accuracy, completeness, or reliability of AI responses</li>
          <li>Appropriateness for any particular purpose</li>
          <li>Freedom from errors, bias, or harmful content</li>
        </ul>

        <h4>Your Responsibility</h4>
        <p>You are solely responsible for:</p>
        <ul>
          <li>Evaluating AI-generated content before use</li>
          <li>Ensuring AI content complies with applicable laws</li>
          <li>Verifying factual accuracy of AI responses</li>
          <li>
            Using AI content in accordance with your professional and ethical
            obligations
          </li>
        </ul>

        <h4>Limitation of Liability</h4>
        <p className="font-bold">
          MERIT SYSTEMS DISCLAIMS ALL LIABILITY FOR ANY HARM ARISING FROM YOUR
          RELIANCE ON AI-GENERATED CONTENT. AI RESPONSES ARE PROVIDED &quot;AS
          IS&quot; WITHOUT WARRANTY OF ANY KIND.
        </p>

        <h3>Prompt Privacy</h3>
        <p>
          While we implement security measures to protect your data, you should
          not submit highly sensitive information (such as passwords, personal
          financial information, or confidential business data) through AI
          prompts.
        </p>

        <hr />

        <h2>6. Payment Terms</h2>

        <h3>For Users (Paying for AI Usage)</h3>

        <h4>Usage-Based Billing</h4>
        <p>You pay based on your actual usage of AI services, calculated by:</p>
        <ul>
          <li>Token consumption (input and output tokens)</li>
          <li>Model selection and complexity</li>
          <li>Processing time and computational resources</li>
          <li>Our markup over third-party provider costs</li>
        </ul>

        <h4>Payment Processing</h4>
        <ul>
          <li>Payments are processed via Stripe</li>
          <li>You consent to automatic charging based on usage</li>
          <li>Payment methods must be kept current and valid</li>
          <li>All fees are in USD unless otherwise specified</li>
        </ul>

        <h4>Billing Disputes</h4>
        <p>
          If you dispute any charges, contact us within 30 days. We will
          investigate and resolve billing disputes in good faith.
        </p>

        <h3>For Developers (Receiving Payments)</h3>
        <p>
          If you create applications that generate revenue through Echo or
          participate in our referral program:
        </p>

        <h4>Payout Processing</h4>
        <ul>
          <li>Payouts are processed through our Terminal platform</li>
          <li>
            You must agree to the Terminal Terms of Service at{' '}
            <a
              href="https://merit.systems/terms"
              className="text-blue-600 hover:text-blue-800"
            >
              merit.systems/terms
            </a>
          </li>
          <li>
            Minimum payout thresholds and schedules are defined in your
            developer agreement
          </li>
        </ul>

        <h4>Tax Obligations</h4>
        <p>You are responsible for:</p>
        <ul>
          <li>Reporting all income received through Echo</li>
          <li>Paying applicable taxes on earnings</li>
          <li>Providing required tax documentation (W-9, W-8BEN, etc.)</li>
        </ul>

        <h4>Revenue Sharing</h4>
        <p>
          Revenue sharing terms are specified in your individual developer
          agreement and may include:
        </p>
        <ul>
          <li>Referral commissions for new users</li>
          <li>Markup sharing for application usage</li>
          <li>Performance bonuses based on user engagement</li>
        </ul>

        <hr />

        <h2>7. Intellectual Property Rights</h2>

        <h3>Your Rights</h3>
        <ul>
          <li>
            <strong>Your Prompts</strong>: You retain ownership of the prompts
            and input you provide to AI services
          </li>
          <li>
            <strong>Your Applications</strong>: You own applications and
            derivative works you create using Echo
          </li>
          <li>
            <strong>Your Data</strong>: You retain ownership of any data you
            input into the system
          </li>
        </ul>

        <h3>AI-Generated Content</h3>
        <ul>
          <li>
            <strong>Ownership</strong>: AI-generated content may not be subject
            to copyright protection under current law
          </li>
          <li>
            <strong>No Warranty</strong>: We make no warranty regarding the
            intellectual property status of AI-generated content
          </li>
          <li>
            <strong>Your Responsibility</strong>: You are responsible for
            ensuring your use of AI content does not infringe third-party rights
          </li>
        </ul>

        <h3>Merit Systems Rights</h3>
        <ul>
          <li>
            <strong>Platform</strong>: We own the Echo platform, including
            software, APIs, and documentation
          </li>
          <li>
            <strong>Service Marks</strong>: &quot;Echo&quot; and related marks
            are our trademarks
          </li>
          <li>
            <strong>License</strong>: We grant you a limited, non-exclusive
            license to use our platform according to these Terms
          </li>
        </ul>

        <h3>License to Merit Systems</h3>
        <p>By using Echo, you grant us a limited license to:</p>
        <ul>
          <li>Process your prompts through AI providers</li>
          <li>Store usage data for billing and service improvement</li>
          <li>Use aggregated, anonymized data for platform enhancement</li>
        </ul>

        <hr />

        <h2>8. Data and Privacy</h2>
        <p>
          Your privacy is important to us. Our collection and use of personal
          information is governed by our Privacy Policy, available at{' '}
          <a
            href="https://merit.systems/privacy"
            className="text-blue-600 hover:text-blue-800"
          >
            merit.systems/privacy
          </a>
          .
        </p>

        <h3>Data Processing</h3>
        <p>By using Echo, you consent to:</p>
        <ul>
          <li>Processing of your prompts by third-party AI providers</li>
          <li>Collection of usage data for billing and service improvement</li>
          <li>
            International data transfers as described in our Privacy Policy
          </li>
        </ul>

        <h3>Data Security</h3>
        <p>
          We implement appropriate security measures to protect your data, but
          no system is completely secure. You use our service at your own risk.
        </p>

        <hr />

        <h2>9. Account Termination</h2>

        <h3>Your Right to Terminate</h3>
        <p>You may terminate your Echo account at any time by:</p>
        <ul>
          <li>Using account deletion features in your dashboard</li>
          <li>
            Contacting us at{' '}
            <a
              href="mailto:support@echo.merit.systems"
              className="text-blue-600 hover:text-blue-800"
            >
              support@echo.merit.systems
            </a>
          </li>
        </ul>

        <h3>Our Right to Terminate</h3>
        <p>We may suspend or terminate your account if you:</p>
        <ul>
          <li>Violate these Terms or our Acceptable Use Policy</li>
          <li>Engage in fraudulent or illegal activities</li>
          <li>Fail to pay outstanding charges</li>
          <li>Pose a security risk to our platform or other users</li>
        </ul>

        <h3>Effect of Termination</h3>
        <p>Upon termination:</p>
        <ul>
          <li>Your access to Echo services will cease</li>
          <li>Outstanding charges remain due and payable</li>
          <li>
            We may retain certain data as required by law or for legitimate
            business purposes
          </li>
          <li>Prepaid credits are generally non-refundable</li>
        </ul>

        <h3>Data Deletion</h3>
        <p>
          Following account termination, we will delete your personal data
          according to our Privacy Policy and data retention policies, except
          where retention is required by law.
        </p>

        <hr />

        <h2>10. Disclaimers and Limitation of Liability</h2>

        <h3>SERVICE DISCLAIMER</h3>
        <p className="font-bold">
          THE ECHO PLATFORM IS PROVIDED &quot;AS IS&quot; AND &quot;AS
          AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR
          IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY,
          FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT.
        </p>

        <h3>LIMITATION OF LIABILITY</h3>
        <p className="font-bold">
          IN NO EVENT SHALL MERIT SYSTEMS BE LIABLE FOR ANY INDIRECT,
          INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING
          WITHOUT LIMITATION LOST PROFITS, DATA, OR USE, INCURRED BY YOU OR ANY
          THIRD PARTY, WHETHER IN AN ACTION IN CONTRACT OR TORT, EVEN IF MERIT
          SYSTEMS HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
        </p>

        <h3>MAXIMUM LIABILITY</h3>
        <p className="font-bold">
          OUR TOTAL LIABILITY TO YOU FOR ALL CLAIMS ARISING FROM OR RELATED TO
          THE ECHO PLATFORM SHALL NOT EXCEED THE GREATER OF (A) $100 OR (B) THE
          AMOUNT YOU PAID TO US IN THE 12 MONTHS PRECEDING THE CLAIM.
        </p>

        <h3>AI-Specific Limitations</h3>
        <p>We specifically disclaim liability for:</p>
        <ul>
          <li>Inaccurate, biased, or harmful AI-generated content</li>
          <li>Third-party AI provider service interruptions</li>
          <li>Intellectual property disputes arising from AI content</li>
          <li>Business decisions made based on AI recommendations</li>
        </ul>

        <hr />

        <h2>11. Indemnification</h2>
        <p>
          You agree to indemnify and hold harmless Merit Systems, its officers,
          directors, employees, and agents from any claims, damages, or expenses
          (including reasonable attorneys&apos; fees) arising from:
        </p>
        <ul>
          <li>Your use of the Echo Platform</li>
          <li>Your violation of these Terms</li>
          <li>Your violation of any rights of third parties</li>
          <li>AI content you generate or distribute using our platform</li>
        </ul>

        <hr />

        <h2>12. Changes to Terms</h2>

        <h3>Updates</h3>
        <p>
          We may update these Terms from time to time. We will notify you of
          material changes by:
        </p>
        <ul>
          <li>Email notification to your registered email address</li>
          <li>Notice on our platform</li>
          <li>
            Posting updated terms at{' '}
            <a
              href="https://echo.merit.systems/terms"
              className="text-blue-600 hover:text-blue-800"
            >
              echo.merit.systems/terms
            </a>
          </li>
        </ul>

        <h3>Acceptance</h3>
        <p>
          Your continued use of Echo after changes become effective constitutes
          acceptance of the updated Terms. If you do not agree to changes, you
          must stop using our service.
        </p>

        <hr />

        <h2>13. Dispute Resolution</h2>

        <h3>Informal Resolution</h3>
        <p>
          Before filing any formal claim, you agree to contact us at{' '}
          <a
            href="mailto:legal@merit.systems"
            className="text-blue-600 hover:text-blue-800"
          >
            legal@merit.systems
          </a>{' '}
          to seek an informal resolution.
        </p>

        <h3>Arbitration</h3>
        <p>
          Any disputes that cannot be resolved informally shall be resolved
          through binding arbitration administered by the American Arbitration
          Association under its Commercial Arbitration Rules. The arbitration
          will be conducted in New York, New York.
        </p>

        <h3>Class Action Waiver</h3>
        <p>
          You agree that any arbitration or legal proceeding shall be limited to
          the dispute between you and Merit Systems individually. You waive any
          right to participate in class action lawsuits or class-wide
          arbitrations.
        </p>

        <h3>Exceptions</h3>
        <p>This arbitration requirement does not apply to:</p>
        <ul>
          <li>Claims for injunctive or equitable relief</li>
          <li>Small claims court actions</li>
          <li>Intellectual property disputes</li>
        </ul>

        <hr />

        <h2>14. General Provisions</h2>

        <h3>Entire Agreement</h3>
        <p>
          These Terms, together with our Privacy Policy, constitute the entire
          agreement between you and Merit Systems regarding the Echo Platform.
        </p>

        <h3>Severability</h3>
        <p>
          If any provision of these Terms is found to be unenforceable, the
          remaining provisions will remain in full force and effect.
        </p>

        <h3>Governing Law</h3>
        <p>
          These Terms are governed by the laws of the State of New York, without
          regard to conflict of law principles.
        </p>

        <h3>Assignment</h3>
        <p>
          We may assign these Terms and our rights hereunder without your
          consent. You may not assign these Terms without our written consent.
        </p>

        <h3>Force Majeure</h3>
        <p>
          We are not liable for delays or failures in performance resulting from
          circumstances beyond our reasonable control.
        </p>

        <h3>Contact Information</h3>
        <p>For questions about these Terms, please contact us at:</p>

        <p>
          <strong>Merit Systems, Inc.</strong>
          <br />
          Email:{' '}
          <a
            href="mailto:legal@merit.systems"
            className="text-blue-600 hover:text-blue-800"
          >
            legal@merit.systems
          </a>
          <br />
          Address: 224 West 35th Street, Ste 500 #2218, New York, NY 10001
        </p>

        <p>
          For technical support:{' '}
          <a
            href="mailto:support@echo.merit.systems"
            className="text-blue-600 hover:text-blue-800"
          >
            support@echo.merit.systems
          </a>
        </p>

        <hr />

        <p className="italic">
          By using the Echo Platform, you acknowledge that you have read,
          understood, and agree to be bound by these Terms of Service.
        </p>
      </div>
    </div>
  );
}
