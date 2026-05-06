import React from 'react';
import { IconSpeakerphone, IconBrandGithub, IconBook } from '@tabler/icons';
import StyledWrapper from './StyledWrapper';
import { useTranslation } from 'react-i18next';

const Support = () => {
  const { t } = useTranslation();

  return (
    <StyledWrapper>
      <div className="section-header">Support</div>
      <div className="rows">
        <div className="mb-2">
          <a href="https://github.com/max-api-client/max#readme" target="_blank" className="flex items-end">
            <IconBook size={18} strokeWidth={2} />
            <span className="label ml-2">{t('COMMON.DOCUMENTATION')}</span>
          </a>
        </div>
        <div className="mt-2">
          <a href="https://github.com/max-api-client/max/issues" target="_blank" className="flex items-end">
            <IconSpeakerphone size={18} strokeWidth={2} />
            <span className="label ml-2">{t('COMMON.REPORT_ISSUES')}</span>
          </a>
        </div>
        <div className="mt-2">
          <a href="https://github.com/max-api-client/max" target="_blank" className="flex items-end">
            <IconBrandGithub size={18} strokeWidth={2} />
            <span className="label ml-2">{t('COMMON.GITHUB')}</span>
          </a>
        </div>
      </div>
    </StyledWrapper>
  );
};

export default Support;
