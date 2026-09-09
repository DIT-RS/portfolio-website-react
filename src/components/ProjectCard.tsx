import React from 'react';
import { ExternalLink, Lock } from 'lucide-react';
import type { Project } from '../data/portfolioData';

interface ProjectCardProps {
  project: Project;
  onSelectProject?: (project: Project) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, onSelectProject }) => {
  const isSaaS = project.categoryColor === 'blue';
  const isEcommerce = project.categoryColor === 'amber';

  return (
    <div
      onClick={() => onSelectProject && onSelectProject(project)}
      className="group relative rounded-2xl bg-[#11131a]/80 border border-[#1f2333] hover:border-[#3b82f6]/40 p-6 md:p-9 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/5 cursor-pointer backdrop-blur-sm"
    >
      {/* Badges row */}
      <div className="flex items-center gap-2.5 mb-5 flex-wrap">
        <span
          className={`px-3 py-1 rounded-md text-xs font-semibold tracking-wide ${
            isSaaS
              ? 'bg-[#15233e] text-[#60a5fa] border border-[#2563eb]/30'
              : isEcommerce
              ? 'bg-[#2e2013] text-[#f59e0b] border border-[#d97706]/30'
              : 'bg-[#1e1f2e] text-[#a78bfa] border border-[#8b5cf6]/30'
          }`}
        >
          {project.category}
        </span>
        <span className="text-xs font-medium text-[#737b92]">{project.year}</span>
        {project.isFeatured && (
          <span className="px-3 py-1 rounded-md text-xs font-semibold tracking-wide bg-[#172545] text-[#38bdf8] border border-[#0284c7]/30">
            Featured
          </span>
        )}
      </div>

      {/* Project Title */}
      <h3 className="font-heading text-2xl md:text-3xl font-extrabold text-white mb-2.5 tracking-tight group-hover:text-blue-300 transition-colors">
        {project.title}
      </h3>

      {/* Project Subtitle */}
      <p className="text-sm md:text-base font-normal text-[#9ca3af] mb-4 leading-relaxed">
        {project.subtitle}
      </p>

      {/* Project Long Description */}
      <p className="text-sm text-[#798196] leading-relaxed mb-7 font-normal">
        {project.description}
      </p>

      {/* Tech Stack Tags */}
      <div className="flex flex-wrap gap-2 mb-8">
        {project.tags.map((tag) => (
          <span
            key={tag}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[#171924] text-[#a5acbf] border border-[#232738]"
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Links / Status Footer */}
      <div className="flex items-center gap-5 text-xs font-medium text-[#81899e] pt-2 border-t border-[#1c202d]">
        {project.clientText && (
          <div className="flex items-center gap-1.5 hover:text-white transition-colors">
            <ExternalLink size={13} className="text-[#81899e]" />
            <span>{project.clientText}</span>
          </div>
        )}
        {project.repoText && (
          <div className="flex items-center gap-1.5 hover:text-white transition-colors">
            <Lock size={13} className="text-[#81899e]" />
            <span>{project.repoText}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export const CompactProjectCard: React.FC<ProjectCardProps> = ({ project, onSelectProject }) => {
  const isInfra = project.categoryColor === 'indigo';
  const isProductivity = project.categoryColor === 'emerald';
  const isFintech = project.categoryColor === 'purple';

  const categoryStyles = isInfra
    ? 'bg-[#181d3d] text-[#818cf8] border border-[#6366f1]/30'
    : isProductivity
    ? 'bg-[#122822] text-[#34d399] border border-[#10b981]/30'
    : isFintech
    ? 'bg-[#291738] text-[#c084fc] border border-[#a855f7]/30'
    : 'bg-[#1c202e] text-[#94a3b8] border border-[#475569]/30';

  return (
    <div
      onClick={() => onSelectProject && onSelectProject(project)}
      className="group rounded-2xl bg-[#11131a]/80 border border-[#1f2333] hover:border-[#3b82f6]/40 p-6 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/5 cursor-pointer backdrop-blur-sm"
    >
      <div className="flex items-center justify-between mb-4">
        <span className={`px-2.5 py-0.5 rounded-md text-xs font-semibold ${categoryStyles}`}>
          {project.category}
        </span>
        <span className="text-xs font-medium text-[#737b92]">{project.year}</span>
      </div>

      <h4 className="font-heading text-xl font-bold text-white mb-2 tracking-tight group-hover:text-blue-300 transition-colors">
        {project.title}
      </h4>

      <p className="text-sm text-[#8890a5] mb-5 leading-relaxed">
        {project.subtitle}
      </p>

      <div className="flex flex-wrap gap-2 mb-5">
        {project.tags.map((tag) => (
          <span
            key={tag}
            className="px-2.5 py-1 rounded-md text-xs font-medium bg-[#171924] text-[#9ba2b6] border border-[#232738]"
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="text-xs text-[#6e758a] font-medium pt-3 border-t border-[#1a1d2b]">
        {project.clientText}
      </div>
    </div>
  );
};
