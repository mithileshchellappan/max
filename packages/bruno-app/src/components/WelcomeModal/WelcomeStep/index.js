import React from 'react';
import {
  IconCloud,
  IconUsers,
  IconLock,
  IconRocket
} from '@tabler/icons';
import StyledWrapper from './StyledWrapper';

const cloudHighlights = [
  {
    icon: IconCloud,
    title: 'Cloud workspaces',
    desc: 'Collections, environments, variables, and docs sync through your shared workspace.'
  },
  {
    icon: IconUsers,
    title: 'Team collaboration',
    desc: 'Invite teammates and keep API work synchronized across sessions.'
  },
  {
    icon: IconLock,
    title: 'Workspace access control',
    desc: 'Members get explicit roles, and private secrets stay scoped to the workspace data you choose to save.'
  },
  {
    icon: IconRocket,
    title: 'Fast and lightweight',
    desc: 'Built to be snappy. No bloated runtimes, just a fast, focused tool for exploring and testing APIs.'
  }
];

const localHighlights = [
  {
    icon: IconCloud,
    title: 'Local collections',
    desc: 'Collections can still be opened from disk when you are working outside a cloud workspace.'
  },
  {
    icon: IconUsers,
    title: 'Import friendly',
    desc: 'Bring in Postman, OpenAPI/Swagger, Insomnia, and Bruno collections.'
  },
  {
    icon: IconLock,
    title: 'Privacy-focused',
    desc: 'Your API keys stay under your control.'
  },
  {
    icon: IconRocket,
    title: 'Fast and lightweight',
    desc: 'Built to be snappy. No bloated runtimes, just a fast, focused tool for exploring and testing APIs.'
  }
];

const WelcomeStep = ({ isCloudWorkspace = false }) => {
  const highlights = isCloudWorkspace ? cloudHighlights : localHighlights;

  return (
    <StyledWrapper className="step-body">
      <div className="highlights">
        {highlights.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.title} className="highlight-item">
              <div className="highlight-icon">
                <Icon size={18} stroke={1.5} />
              </div>
              <div>
                <div className="highlight-title">{item.title}</div>
                <div className="highlight-desc">{item.desc}</div>
              </div>
            </div>
          );
        })}
      </div>
    </StyledWrapper>
  );
};

export default WelcomeStep;
