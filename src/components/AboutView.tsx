import React, { useState, useRef } from 'react';
import { usePortfolio } from '../context/usePortfolio';
import {
  educationList,
  volunteerExperience,
} from '../data/portfolioData';
import {
  Download,
  ArrowRight,
  Briefcase,
  GraduationCap,
  Award,
  Heart,
  BookOpen,
  CheckCircle,
  UploadCloud,
  FileText,
  Loader2,
  CheckCircle2,
} from 'lucide-react';

interface AboutViewProps {
  onNavigateToContact: () => void;
  onNavigateToWork: () => void;
}

export const AboutView: React.FC<AboutViewProps> = ({ onNavigateToContact, onNavigateToWork }) => {
  const { content, isEditMode, updateField, uploadResumeFile } = usePortfolio();

  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpdateBioHero = (heroTitle: string, heroSubtitle: string) => {
    updateField('bio', { ...content.bio, heroTitle, heroSubtitle });
  };

  const handleUpdateBackgroundParagraph = (index: number, text: string) => {
    const updated = [...content.bio.backgroundParagraphs];
    updated[index] = text;
    updateField('bio', { ...content.bio, backgroundParagraphs: updated });
  };

  const handleUpdateResumeUrl = (url: string) => {
    updateField('resumeUrl', url);
  };

  const handleFileProcess = async (file: File) => {
    if (!file) return;
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setUploadStatus({ type: 'error', text: 'Please upload a PDF file.' });
      return;
    }

    setIsUploading(true);
    setUploadStatus(null);

    const res = await uploadResumeFile(file);
    setIsUploading(false);

    if (res.success) {
      setUploadStatus({
        type: 'success',
        text: `Uploaded "${file.name}"! Click "Save & Push" in bottom toolbar to commit.`,
      });
    } else {
      setUploadStatus({ type: 'error', text: res.error || 'Upload failed' });
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  return (
    <div className="space-y-16 md:space-y-24">
      {/* Hero Section */}
      <section className="pt-8 md:pt-14 pb-2">
        <div className="flex items-center gap-2 mb-4 text-[#3b82f6] text-xs font-semibold tracking-wider uppercase">
          <span className="inline-block w-5 h-0.5 bg-[#3b82f6]"></span>
          <span>ABOUT ME</span>
          {isEditMode && (
            <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 text-[10px] font-mono lowercase">
              editable
            </span>
          )}
        </div>

        {isEditMode ? (
          <div className="space-y-3 mb-6 p-4 rounded-2xl bg-[#121520] border border-blue-500/30">
            <label className="block text-[11px] font-bold text-blue-400 uppercase tracking-wider">
              Hero Heading
            </label>
            <input
              type="text"
              value={content.bio.heroTitle}
              onChange={(e) => handleUpdateBioHero(e.target.value, content.bio.heroSubtitle)}
              className="w-full font-heading text-2xl md:text-3xl font-extrabold text-white bg-[#191d2c] px-3.5 py-2 rounded-xl border border-[#2b3248] focus:border-blue-500 outline-none"
            />
            <label className="block text-[11px] font-bold text-blue-400 uppercase tracking-wider pt-2">
              Hero Subtitle
            </label>
            <textarea
              rows={3}
              value={content.bio.heroSubtitle}
              onChange={(e) => handleUpdateBioHero(content.bio.heroTitle, e.target.value)}
              className="w-full text-sm text-[#c0c6d8] bg-[#191d2c] px-3.5 py-2 rounded-xl border border-[#2b3248] focus:border-blue-500 outline-none"
            />
          </div>
        ) : (
          <>
            <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight leading-[1.1] mb-6">
              {content.bio.heroTitle}
            </h1>
            <p className="text-base md:text-lg text-[#959caa] max-w-xl font-normal leading-relaxed">
              {content.bio.heroSubtitle}
            </p>
          </>
        )}
      </section>

      {/* Background Section */}
      <section className="space-y-5">
        <div className="flex items-center gap-2 text-[#3b82f6] text-xs font-semibold tracking-wider uppercase">
          <span className="inline-block w-5 h-0.5 bg-[#3b82f6]"></span>
          <span>BACKGROUND</span>
        </div>

        <div className="space-y-4 text-sm md:text-base text-[#8890a5] leading-relaxed font-normal max-w-2xl">
          {content.bio.backgroundParagraphs.map((para, index) =>
            isEditMode ? (
              <div key={index} className="p-3 rounded-xl bg-[#121520] border border-blue-500/20 space-y-1">
                <span className="text-[10px] text-blue-400 font-mono">Paragraph {index + 1}</span>
                <textarea
                  rows={3}
                  value={para}
                  onChange={(e) => handleUpdateBackgroundParagraph(index, e.target.value)}
                  className="w-full text-sm text-[#d1d5e2] bg-[#191d2c] p-2 rounded-lg border border-[#2b3248] focus:border-blue-500 outline-none"
                />
              </div>
            ) : (
              <p key={index}>{para}</p>
            )
          )}
        </div>
      </section>

      {/* Professional Experience Section */}
      <section className="space-y-8">
        <div className="flex items-center gap-2 text-[#3b82f6] text-xs font-semibold tracking-wider uppercase">
          <Briefcase size={15} className="text-[#3b82f6]" />
          <span>WORK EXPERIENCE</span>
        </div>

        <div className="space-y-6">
          {content.experiences.map((exp) => (
            <div
              key={exp.company + exp.period}
              className="rounded-2xl bg-[#11131a]/80 border border-[#1f2333] p-6 md:p-8 backdrop-blur-sm space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1c202d] pb-4">
                <div>
                  <h3 className="font-heading text-xl md:text-2xl font-bold text-white tracking-tight">
                    {exp.role}
                  </h3>
                  <div className="text-sm font-semibold text-blue-400">
                    {exp.company} {exp.client && <span className="text-[#8a91a6] font-normal">({exp.client})</span>}
                  </div>
                </div>
                <div className="text-left sm:text-right">
                  <span className="inline-block px-3 py-1 rounded-md text-xs font-semibold bg-[#171a26] text-[#9ca3af] border border-[#252a3d]">
                    {exp.period}
                  </span>
                  <div className="text-xs text-[#6e758a] mt-1">{exp.location}</div>
                </div>
              </div>

              <ul className="space-y-2.5 text-xs md:text-sm text-[#8890a5] leading-relaxed">
                {exp.points.map((pt, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#3b82f6] mt-2 shrink-0"></span>
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>

              <div className="pt-2 flex flex-wrap gap-2">
                {exp.techStack.map((tech) => (
                  <span
                    key={tech}
                    className="px-2.5 py-1 rounded-md text-xs font-medium bg-[#171924] text-[#a5acbf] border border-[#232738]"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How I Work Section */}
      <section className="space-y-8">
        <div className="flex items-center gap-2 text-[#3b82f6] text-xs font-semibold tracking-wider uppercase">
          <span className="inline-block w-5 h-0.5 bg-[#3b82f6]"></span>
          <span>HOW I WORK</span>
        </div>

        <div className="space-y-6">
          {content.workPrinciples.map((principle) => (
            <div key={principle.number} className="flex items-start gap-4 md:gap-6">
              <span className="shrink-0 text-xs font-mono font-medium px-2 py-1 rounded bg-[#171924] border border-[#262a3c] text-[#71788e]">
                {principle.number}
              </span>
              <div className="space-y-1">
                <h3 className="font-heading text-base md:text-lg font-bold text-white tracking-tight">
                  {principle.title}
                </h3>
                <p className="text-xs md:text-sm text-[#828a9f] leading-relaxed">
                  {principle.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Technical Skills Section */}
      <section className="space-y-8">
        <div className="flex items-center gap-2 text-[#3b82f6] text-xs font-semibold tracking-wider uppercase">
          <span className="inline-block w-5 h-0.5 bg-[#3b82f6]"></span>
          <span>TECHNICAL SKILLS</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {content.skillCategories.map((category) => (
            <div
              key={category.title}
              className="rounded-2xl bg-[#11131a]/80 border border-[#1f2333] p-6 md:p-7 backdrop-blur-sm"
            >
              <h3 className="font-heading text-lg font-bold text-white mb-4 tracking-tight">
                {category.title}
              </h3>
              <ul className="space-y-2.5">
                {category.skills.map((skill) => (
                  <li key={skill} className="flex items-center gap-2.5 text-xs md:text-sm text-[#9299ab]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#3b82f6]"></span>
                    <span>{skill}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Education & Certifications */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* Education */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-[#3b82f6] text-xs font-semibold tracking-wider uppercase">
            <GraduationCap size={15} />
            <span>EDUCATION</span>
          </div>

          {educationList.map((edu) => (
            <div
              key={edu.degree}
              className="rounded-2xl bg-[#11131a]/80 border border-[#1f2333] p-6 backdrop-blur-sm flex flex-col justify-between"
            >
              <div>
                <span className="inline-block text-xs font-medium text-[#737b92] mb-2">{edu.period}</span>
                <h4 className="font-heading text-lg font-bold text-white mb-1">{edu.degree}</h4>
                <p className="text-xs text-[#8890a5] mb-3">{edu.institution}</p>
              </div>
              <div className="pt-3 border-t border-[#1c202d] flex items-center justify-between text-xs text-[#6e758a]">
                <span>Academic Score</span>
                <span className="font-bold text-emerald-400">{edu.score}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Certifications & Awards */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-[#3b82f6] text-xs font-semibold tracking-wider uppercase">
            <Award size={15} />
            <span>AWARDS & CERTIFICATIONS</span>
          </div>

          <div className="rounded-2xl bg-[#11131a]/80 border border-[#1f2333] p-6 backdrop-blur-sm space-y-3.5">
            {content.certifications.map((cert) => (
              <div key={cert.title} className="flex items-start gap-2.5 text-xs">
                <CheckCircle size={14} className="text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-white font-medium">{cert.title}</div>
                  {cert.issuer && <div className="text-[#737a91] text-[11px]">{cert.issuer}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Research & Extracurricular */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Springer Nature Research Publication */}
        <div className="rounded-2xl bg-[#11131a]/80 border border-[#1f2333] p-6 backdrop-blur-sm space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-400 uppercase tracking-wider">
            <BookOpen size={14} />
            <span>RESEARCH PUBLICATION</span>
          </div>
          <h4 className="font-heading text-base font-bold text-white leading-snug">
            Molecular Dynamics of Carbon Capture from IC Engine Emissions Using ZSM-5
          </h4>
          <p className="text-xs text-[#8890a5] leading-relaxed">
            Published in <span className="text-white font-medium">Springer Nature</span> book: <em>Advances in Multidisciplinary Analysis and Optimization</em>. Computational analysis conducted with OpenMD & Python.
          </p>
        </div>

        {/* Volunteer Work */}
        <div className="rounded-2xl bg-[#11131a]/80 border border-[#1f2333] p-6 backdrop-blur-sm space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-rose-400 uppercase tracking-wider">
            <Heart size={14} />
            <span>VOLUNTEERING</span>
          </div>
          <h4 className="font-heading text-base font-bold text-white">
            {volunteerExperience.organization} — {volunteerExperience.role}
          </h4>
          <p className="text-xs text-[#8890a5] leading-relaxed">
            {volunteerExperience.description}
          </p>
        </div>
      </section>

      {/* Resume Download Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 text-[#7e8599] text-xs font-semibold tracking-wider uppercase">
          <span className="inline-block w-5 h-0.5 bg-[#525970]"></span>
          <span>RESUME</span>
        </div>

        <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Want the full<br />picture?
        </h2>

        <p className="text-sm md:text-base text-[#9299ab] max-w-md font-normal leading-relaxed">
          Download my updated resume for a complete overview of my experience, education, enterprise projects, and technical skills.
        </p>

        {isEditMode ? (
          <div className="p-5 rounded-2xl bg-[#121520] border border-blue-500/30 space-y-4 max-w-lg">
            {/* Drag and Drop Zone */}
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              className={`p-6 rounded-xl border-2 border-dashed text-center transition-all cursor-pointer ${
                isDragOver
                  ? 'border-blue-400 bg-blue-500/10'
                  : 'border-[#2f364d] hover:border-blue-500/50 bg-[#161926]'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    handleFileProcess(e.target.files[0]);
                  }
                }}
              />

              {isUploading ? (
                <div className="flex flex-col items-center gap-2 text-blue-400">
                  <Loader2 size={28} className="animate-spin" />
                  <span className="text-xs font-medium">Processing & uploading resume...</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 text-[#8c94aa]">
                  <UploadCloud size={30} className="text-blue-400" />
                  <div>
                    <span className="text-xs font-semibold text-white">
                      Drag & Drop new Resume PDF here
                    </span>
                    <p className="text-[11px] text-[#6e768e] mt-0.5">
                      or click to browse from your device
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Upload status message */}
            {uploadStatus && (
              <div
                className={`flex items-start gap-2 p-3 rounded-xl text-xs ${
                  uploadStatus.type === 'success'
                    ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
                    : 'bg-red-500/10 border border-red-500/30 text-red-300'
                }`}
              >
                {uploadStatus.type === 'success' ? (
                  <CheckCircle2 size={15} className="shrink-0 mt-0.5" />
                ) : (
                  <FileText size={15} className="shrink-0 mt-0.5" />
                )}
                <span>{uploadStatus.text}</span>
              </div>
            )}

            {/* Direct URL input */}
            <div className="space-y-1 pt-1">
              <label className="block text-[11px] font-semibold text-[#7c849c] uppercase tracking-wider">
                Current Resume File Path / URL:
              </label>
              <input
                type="text"
                value={content.resumeUrl}
                onChange={(e) => handleUpdateResumeUrl(e.target.value)}
                className="w-full text-xs text-white bg-[#191d2c] px-3 py-2 rounded-lg border border-[#2b3248] focus:border-blue-500 outline-none font-mono"
                placeholder="/Dit_R_S_resume.pdf"
              />
            </div>
          </div>
        ) : (
          <div className="pt-2">
            <a
              href={content.resumeUrl || '/Dit_R_S_resume.pdf'}
              download="Dit_R_S_Resume.pdf"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#13151f] hover:bg-[#1a1d2c] border border-[#262a3e] text-white font-medium text-sm transition-all duration-200 cursor-pointer shadow-md"
            >
              <Download size={16} className="text-[#8890a5]" />
              <span>Download Resume (PDF)</span>
            </a>
          </div>
        )}
      </section>

      {/* Work With Me / CTA Section */}
      <section className="pt-8 pb-10 border-t border-[#1b1e2c]">
        <div className="flex items-center gap-2 mb-4 text-[#3b82f6] text-xs font-semibold tracking-wider uppercase">
          <span className="inline-block w-5 h-0.5 bg-[#3b82f6]"></span>
          <span>WORK WITH ME</span>
        </div>

        <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4">
          Let’s build<br />something together.
        </h2>

        <p className="text-sm md:text-base text-[#9299ab] max-w-md font-normal mb-8 leading-relaxed">
          Available for innovative enterprise consulting, full-stack architecture, and cloud engineering projects.
        </p>

        <div className="flex flex-wrap items-center gap-4">
          <button
            onClick={onNavigateToWork}
            className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-[#13151f] hover:bg-[#1a1d2c] border border-[#262a3e] hover:border-[#3b82f6]/50 text-white font-medium text-sm transition-all duration-200 active:scale-[0.98] cursor-pointer"
          >
            <span>View My Work</span>
            <ArrowRight size={16} className="text-[#8890a5]" />
          </button>

          <button
            onClick={onNavigateToContact}
            className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-[#2f74ff] hover:bg-[#2563eb] text-white font-medium text-sm transition-all duration-200 shadow-lg shadow-blue-500/20 active:scale-[0.98] cursor-pointer"
          >
            <span>Get in Touch</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </section>
    </div>
  );
};
