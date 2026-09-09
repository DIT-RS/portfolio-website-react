import React, { useState } from 'react';
import { usePortfolio } from '../context/usePortfolio';
import { ArrowRight, Clock, Mail, MapPin, Zap, CheckCircle2, Phone, Loader2, AlertCircle } from 'lucide-react';

export const ContactView: React.FC = () => {
  const { content, isEditMode, updateField } = usePortfolio();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [budget, setBudget] = useState('');
  const [projectDetails, setProjectDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleUpdateContactField = (key: keyof typeof content.contact, value: string) => {
    updateField('contact', {
      ...content.contact,
      [key]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const response = await fetch('https://formsubmit.co/ajax/d3597e7cf31cd11c092f0d0530cfe24b', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          projectType: budget || 'Not specified',
          message: projectDetails,
          _subject: `New Portfolio Inquiry from ${name}`,
          _template: 'table',
          _captcha: 'false',
        }),
      });

      if (response.ok) {
        setIsSubmitted(true);
      } else {
        const data = await response.json().catch(() => null);
        throw new Error(data?.message || 'Failed to send message. Please try again.');
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'An error occurred while sending your message. Please try again or email me directly.';
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-12 md:space-y-16">
      {/* Hero Section */}
      <section className="pt-8 md:pt-14 pb-2">
        <div className="flex items-center gap-2 mb-4 text-[#3b82f6] text-xs font-semibold tracking-wider uppercase">
          <span className="inline-block w-5 h-0.5 bg-[#3b82f6]"></span>
          <span>GET IN TOUCH</span>
          {isEditMode && (
            <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 text-[10px] font-mono lowercase">
              editable
            </span>
          )}
        </div>
        <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight leading-[1.1] mb-5">
          Let's work<br />together.
        </h1>
        <p className="text-base md:text-lg text-[#959caa] max-w-xl font-normal leading-relaxed">
          Have an enterprise application, backend service, or full-stack project in mind? Reach out and I'll get back to you within 24 hours.
        </p>
      </section>

      {/* Main Grid: Form + Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-start">
        {/* Contact Form */}
        <div className="md:col-span-7">
          {isSubmitted ? (
            <div className="rounded-2xl bg-[#11131a]/90 border border-[#22c55e]/30 p-8 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 size={28} />
              </div>
              <h3 className="font-heading text-2xl font-bold text-white">
                Message Sent!
              </h3>
              <p className="text-sm text-[#8f96ab] max-w-sm mx-auto leading-relaxed">
                Thanks for reaching out, {name}. I'll review your project details and respond to <span className="text-white font-medium">{email}</span> within 24 hours.
              </p>
              <button
                onClick={() => {
                  setIsSubmitted(false);
                  setName('');
                  setEmail('');
                  setBudget('');
                  setProjectDetails('');
                }}
                className="mt-4 px-5 py-2.5 rounded-xl bg-[#1e2338] hover:bg-[#252c46] text-sm text-white font-medium transition-colors cursor-pointer"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name */}
              <div className="space-y-2">
                <label className="block text-xs font-bold tracking-wider uppercase text-[#737a91]">
                  YOUR NAME
                </label>
                <input
                  type="text"
                  required
                  placeholder="Jane Smith"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-xl bg-[#10121a]/90 border border-[#212435] focus:border-[#3b82f6] text-white placeholder-[#454a5c] text-sm outline-none transition-all duration-200"
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="block text-xs font-bold tracking-wider uppercase text-[#737a91]">
                  EMAIL ADDRESS
                </label>
                <input
                  type="email"
                  required
                  placeholder="jane@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-xl bg-[#10121a]/90 border border-[#212435] focus:border-[#3b82f6] text-white placeholder-[#454a5c] text-sm outline-none transition-all duration-200"
                />
              </div>

              {/* Scope / Budget */}
              <div className="space-y-2">
                <label className="block text-xs font-bold tracking-wider uppercase text-[#737a91]">
                  PROJECT TYPE / SCOPE
                </label>
                <div className="relative">
                  <select
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    className="w-full px-4 py-3.5 rounded-xl bg-[#10121a]/90 border border-[#212435] focus:border-[#3b82f6] text-white text-sm outline-none transition-all duration-200 appearance-none cursor-pointer"
                  >
                    <option value="" disabled className="bg-[#10121a] text-[#5b6277]">
                      Select engagement type...
                    </option>
                    <option value="enterprise-consulting" className="bg-[#10121a] text-white">
                      Full-Stack / Microservices Architecture
                    </option>
                    <option value="cloud-migration" className="bg-[#10121a] text-white">
                      AWS Cloud Migration & DevOps
                    </option>
                    <option value="contract-dev" className="bg-[#10121a] text-white">
                      Frontend / Web Application (Angular / React)
                    </option>
                    <option value="fulltime-opportunity" className="bg-[#10121a] text-white">
                      Full-time Engineering Role
                    </option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-[#737a91]">
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                      <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Message */}
              <div className="space-y-2">
                <label className="block text-xs font-bold tracking-wider uppercase text-[#737a91]">
                  TELL ME ABOUT YOUR PROJECT OR REQUIREMENT
                </label>
                <textarea
                  rows={5}
                  placeholder="Describe your tech stack, system requirements, goals, or role expectations..."
                  value={projectDetails}
                  onChange={(e) => setProjectDetails(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-xl bg-[#10121a]/90 border border-[#212435] focus:border-[#3b82f6] text-white placeholder-[#454a5c] text-sm outline-none transition-all duration-200 resize-y"
                ></textarea>
              </div>

              {/* Error Alert */}
              {errorMessage && (
                <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300">
                  <AlertCircle size={16} className="shrink-0 mt-0.5 text-red-400" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-[#2f74ff] hover:bg-[#2563eb] disabled:bg-[#1e2d52] disabled:text-[#6a7594] disabled:cursor-not-allowed text-white font-medium text-sm transition-all duration-200 shadow-lg shadow-blue-500/20 active:scale-[0.98] cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin text-white" />
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <span>Send Message</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Sidebar Info Cards */}
        <div className="md:col-span-5 space-y-4">
          {/* Availability Card */}
          <div className="rounded-2xl bg-[#11131a]/80 border border-[#1f2333] p-6 backdrop-blur-sm space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#10b981]">
              <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse"></span>
              <span>AVAILABILITY</span>
            </div>
            {isEditMode ? (
              <div className="space-y-2 pt-1">
                <input
                  type="text"
                  value={content.contact.availabilityStatus}
                  onChange={(e) => handleUpdateContactField('availabilityStatus', e.target.value)}
                  className="w-full text-sm font-bold text-white bg-[#191d2c] p-2 rounded-lg border border-[#2b3248] focus:border-blue-500 outline-none"
                />
                <textarea
                  rows={2}
                  value={content.contact.availabilityDetail}
                  onChange={(e) => handleUpdateContactField('availabilityDetail', e.target.value)}
                  className="w-full text-xs text-[#9aa2b8] bg-[#191d2c] p-2 rounded-lg border border-[#2b3248] focus:border-blue-500 outline-none"
                />
              </div>
            ) : (
              <>
                <h4 className="font-heading text-lg font-bold text-white tracking-tight">
                  {content.contact.availabilityStatus}
                </h4>
                <p className="text-xs text-[#828a9f] leading-relaxed">
                  {content.contact.availabilityDetail}
                </p>
              </>
            )}
          </div>

          {/* Email Card */}
          <div className="rounded-2xl bg-[#11131a]/80 border border-[#1f2333] p-6 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#737a91] mb-2">
              <Mail size={14} className="text-[#737a91]" />
              <span>EMAIL</span>
            </div>
            {isEditMode ? (
              <input
                type="email"
                value={content.contact.email}
                onChange={(e) => handleUpdateContactField('email', e.target.value)}
                className="w-full text-xs text-white bg-[#191d2c] p-2 rounded-lg border border-[#2b3248] focus:border-blue-500 outline-none"
              />
            ) : (
              <a
                href={`mailto:${content.contact.email}`}
                className="text-sm font-semibold text-white hover:text-blue-400 transition-colors break-all"
              >
                {content.contact.email}
              </a>
            )}
          </div>

          {/* Phone Card */}
          <div className="rounded-2xl bg-[#11131a]/80 border border-[#1f2333] p-6 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#737a91] mb-2">
              <Phone size={14} className="text-[#737a91]" />
              <span>PHONE</span>
            </div>
            {isEditMode ? (
              <input
                type="text"
                value={content.contact.phone}
                onChange={(e) => handleUpdateContactField('phone', e.target.value)}
                className="w-full text-xs text-white bg-[#191d2c] p-2 rounded-lg border border-[#2b3248] focus:border-blue-500 outline-none"
              />
            ) : (
              <a
                href={`tel:${content.contact.phone.replace(/\s+/g, '')}`}
                className="text-sm font-semibold text-white hover:text-blue-400 transition-colors"
              >
                {content.contact.phone}
              </a>
            )}
          </div>

          {/* LinkedIn Card */}
          <div className="rounded-2xl bg-[#11131a]/80 border border-[#1f2333] p-6 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#737a91] mb-2">
              <svg className="w-3.5 h-3.5 fill-current text-[#737a91]" viewBox="0 0 24 24">
                <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
              </svg>
              <span>LINKEDIN</span>
            </div>
            {isEditMode ? (
              <input
                type="text"
                value={content.contact.linkedin}
                onChange={(e) => handleUpdateContactField('linkedin', e.target.value)}
                className="w-full text-xs text-white bg-[#191d2c] p-2 rounded-lg border border-[#2b3248] focus:border-blue-500 outline-none font-mono"
              />
            ) : (
              <a
                href={content.contact.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-semibold text-white hover:text-blue-400 transition-colors break-all"
              >
                {content.contact.linkedin.replace('https://', '')}
              </a>
            )}
          </div>

          {/* Location Card */}
          <div className="rounded-2xl bg-[#11131a]/80 border border-[#1f2333] p-6 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#737a91] mb-2">
              <MapPin size={14} className="text-[#737a91]" />
              <span>LOCATION</span>
            </div>
            {isEditMode ? (
              <input
                type="text"
                value={content.contact.location}
                onChange={(e) => handleUpdateContactField('location', e.target.value)}
                className="w-full text-xs text-white bg-[#191d2c] p-2 rounded-lg border border-[#2b3248] focus:border-blue-500 outline-none"
              />
            ) : (
              <p className="text-sm font-semibold text-white">
                {content.contact.location}
              </p>
            )}
          </div>

          {/* Response Time Card */}
          <div className="rounded-2xl bg-[#11131a]/80 border border-[#1f2333] p-6 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#737a91] mb-2">
              <Clock size={14} className="text-[#737a91]" />
              <span>RESPONSE TIME</span>
            </div>
            {isEditMode ? (
              <input
                type="text"
                value={content.contact.responseTime}
                onChange={(e) => handleUpdateContactField('responseTime', e.target.value)}
                className="w-full text-xs text-white bg-[#191d2c] p-2 rounded-lg border border-[#2b3248] focus:border-blue-500 outline-none"
              />
            ) : (
              <p className="text-sm font-semibold text-white">
                {content.contact.responseTime}
              </p>
            )}
          </div>

          {/* Note Banner */}
          <div className="rounded-2xl bg-[#11131a]/60 border border-[#1f2333] p-5 flex items-start gap-3 backdrop-blur-sm">
            <Zap size={16} className="text-[#3b82f6] shrink-0 mt-0.5" />
            <p className="text-xs text-[#8890a5] leading-relaxed">
              Open to discussing technical challenges, architectural reviews, or full-time roles.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
