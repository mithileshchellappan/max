import React from 'react';
import Modal from 'components/Modal/index';
import { IconSpeakerphone, IconBrandGithub, IconBook } from '@tabler/icons';
import StyledWrapper from './StyledWrapper';

const BrunoSupport = ({ onClose }) => {
  return (
    <StyledWrapper>
      <Modal size="sm" title="Support" handleCancel={onClose} hideFooter={true}>
        <div className="collection-options">
          <div className="mt-2">
            <a href="https://github.com/max-api-client/max#readme" target="_blank" className="flex items-end">
              <IconBook size={18} strokeWidth={2} />
              <span className="label ml-2">Documentation</span>
            </a>
          </div>
          <div className="mt-2">
            <a href="https://github.com/max-api-client/max/issues" target="_blank" className="flex items-end">
              <IconSpeakerphone size={18} strokeWidth={2} />
              <span className="label ml-2">Report Issues</span>
            </a>
          </div>
          <div className="mt-2">
            <a href="https://github.com/max-api-client/max" target="_blank" className="flex items-end">
              <IconBrandGithub size={18} strokeWidth={2} />
              <span className="label ml-2">GitHub</span>
            </a>
          </div>
        </div>
      </Modal>
    </StyledWrapper>
  );
};

export default BrunoSupport;
