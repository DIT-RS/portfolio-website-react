import React, { useState } from 'react';
import { usePortfolio } from '../context/usePortfolio';
import type { Project } from '../data/portfolioData';
import { ProjectCard, CompactProjectCard } from './ProjectCard';
import { ArrowRight, X, BookOpen } from 'lucide-react';

interface WorkViewProps {
  onNavigateToContact: () => void;
}

export const WorkView: React.FC<WorkViewProps> = ({ onNavigateToContact }) => {
  const { content, isEditMode } = usePortfolio();
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  return (
    <div className="space-y-16 md:space-y-24">
      {/* Hero Section */}
      <section className="pt-8 md:pt-14 pb-2">
        <div className="flex items-center gap-2 mb-4 text-[#3b82f6] text-xs font-semibold tracking-wider uppercase">
          <span className="inline-block w-5 h-0.5 bg-[#3b82f6]"></span>
          <span>SELECTED WORK</span>
          {isEditMode && (
            <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 text-[10px] font-mono lowercase">
              live mode
            </span>
          )}
        </div>
        <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight leading-[1.1] mb-5">
          Projects I've shipped
        </h1>
        <p className="text-base md:text-lg text-[#959caa] max-w-xl font-normal leading-relaxed">
          A curated selection of enterprise microservices, cloud migrations, full-stack applications, and research publications I've engineered.
        </p>
      </section>

      {/* Featured Projects Grid */}
      <section className="space-y-8">
        {content.featuredProjects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            onSelectProject={(p) => setSelectedProject(p)}
          />
        ))}
      </section>

      {/* More Work Section */}
      <section className="space-y-6 pt-4">
        <div className="flex items-center gap-2 text-[#7e8599] text-xs font-semibold tracking-wider uppercase">
          <span className="inline-block w-5 h-0.5 bg-[#525970]"></span>
          <span>MORE WORK & RESEARCH</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {content.moreProjects.map((project) => (
            <CompactProjectCard
              key={project.id}
              project={project}
              onSelectProject={(p) => setSelectedProject(p)}
            />
          ))}
        </div>
      </section>

      {/* CTA / Let's Collaborate Section */}
      <section className="pt-8 pb-10 border-t border-[#1b1e2c]">
        <div className="flex items-center gap-2 mb-4 text-[#3b82f6] text-xs font-semibold tracking-wider uppercase">
          <span className="inline-block w-5 h-0.5 bg-[#3b82f6]"></span>
          <span>LET'S COLLABORATE</span>
        </div>

        <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4">
          Have a project<br />in mind?
        </h2>

        <p className="text-sm md:text-base text-[#9299ab] max-w-md font-normal mb-8 leading-relaxed">
          Looking for an experienced Full-Stack & Cloud engineer? Let's discuss how we can build something impactful together.
        </p>

        <button
          onClick={onNavigateToContact}
          className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-[#2f74ff] hover:bg-[#2563eb] text-white font-medium text-sm transition-all duration-200 shadow-lg shadow-blue-500/20 active:scale-[0.98] cursor-pointer"
        >
          <span>Start a Conversation</span>
          <ArrowRight size={16} />
        </button>
      </section>

      {/* Project Detail Modal */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative max-w-xl w-full bg-[#10121a] border border-[#23273a] rounded-2xl p-6 md:p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedProject(null)}
              className="absolute top-5 right-5 text-[#8a91a6] hover:text-white p-1 rounded-lg bg-[#181a24] border border-[#282d3f] transition-colors"
            >
              <X size={18} />
            </button>

            <div className="mb-4 flex items-center gap-2">
              <span className="px-2.5 py-1 rounded bg-[#1e2338] text-xs font-semibold text-blue-400 border border-blue-500/30">
                {selectedProject.category}
              </span>
              <span className="text-xs text-[#737b92]">{selectedProject.year}</span>
            </div>

            <h3 className="font-heading text-2xl md:text-3xl font-bold text-white mb-2">
              {selectedProject.title}
            </h3>

            <p className="text-sm font-medium text-[#9ba2b6] mb-4">
              {selectedProject.subtitle}
            </p>

            <div className="p-4 rounded-xl bg-[#0b0c10] border border-[#1d202e] text-sm text-[#8c94a8] leading-relaxed mb-6">
              {selectedProject.description}
            </div>

            {selectedProject.publication && (
              <div className="p-4 rounded-xl bg-[#141b2d] border border-blue-500/30 text-xs space-y-1.5 mb-6">
                <div className="flex items-center gap-1.5 font-semibold text-blue-400">
                  <BookOpen size={14} />
                  <span>Springer Nature Publication Details</span>
                </div>
                <div className="text-[#a0acc5]">
                  <strong className="text-white">Book:</strong> {selectedProject.publication.book}
                </div>
                <div className="text-[#a0acc5]">
                  <strong className="text-white">Chapter:</strong> {selectedProject.publication.chapter}
                </div>
              </div>
            )}

            <div className="mb-6">
              <h5 className="text-xs font-semibold uppercase tracking-wider text-[#636b80] mb-2.5">
                Technologies Used
              </h5>
              <div className="flex flex-wrap gap-2">
                {selectedProject.tags.map((t) => (
                  <span
                    key={t}
                    className="px-2.5 py-1 rounded-md text-xs font-medium bg-[#171924] text-[#a5acbf] border border-[#232738]"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#1d202e]">
              <button
                onClick={() => setSelectedProject(null)}
                className="px-4 py-2 rounded-lg text-sm text-[#8a91a6] hover:text-white hover:bg-[#1a1c27] transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setSelectedProject(null);
                  onNavigateToContact();
                }}
                className="px-5 py-2 rounded-lg text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white transition-colors"
              >
                Discuss project
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
