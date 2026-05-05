import styled from 'styled-components';

const StyledWrapper = styled.div`
  margin-bottom: 16px;

  .members-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
  }

  .member-count {
    font-size: ${(props) => props.theme.font.size.xs};
    color: ${(props) => props.theme.colors.text.muted};
  }

  .invite-form {
    display: grid;
    grid-template-columns: minmax(160px, 1fr) 104px auto;
    gap: 8px;
    margin-bottom: 8px;
  }

  input,
  select {
    height: 30px;
    min-width: 0;
    border: 1px solid ${(props) => props.theme.workspace.border};
    border-radius: ${(props) => props.theme.border.radius.base};
    background: ${(props) => props.theme.input.bg};
    color: ${(props) => props.theme.text};
    font-size: ${(props) => props.theme.font.size.sm};
    padding: 0 8px;
    outline: none;
  }

  input:focus,
  select:focus {
    border-color: ${(props) => props.theme.brand};
  }

  .members-list {
    display: flex;
    flex-direction: column;
    border: 1px solid ${(props) => props.theme.workspace.border};
    border-radius: ${(props) => props.theme.border.radius.base};
    max-height: min(260px, 35vh);
    overflow-y: auto;
    overflow-x: hidden;
  }

  .member-row {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: center;
    gap: 8px;
    min-height: 38px;
    padding: 6px 8px;
    border-bottom: 1px solid ${(props) => props.theme.workspace.border};
  }

  .member-row:last-child {
    border-bottom: none;
  }

  .member-info {
    min-width: 0;
  }

  .member-email {
    color: ${(props) => props.theme.text};
    font-size: ${(props) => props.theme.font.size.sm};
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .member-status,
  .member-role,
  .empty-members {
    color: ${(props) => props.theme.colors.text.muted};
    font-size: ${(props) => props.theme.font.size.xs};
  }

  .empty-members {
    padding: 10px 8px;
  }

  .member-controls {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .member-controls select {
    width: 92px;
  }

  .remove-member {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border: 1px solid ${(props) => props.theme.workspace.border};
    border-radius: ${(props) => props.theme.border.radius.base};
    background: transparent;
    color: ${(props) => props.theme.colors.text.muted};
    cursor: pointer;
  }

  .remove-member:hover {
    color: ${(props) => props.theme.colors.text.danger};
    border-color: ${(props) => props.theme.colors.text.danger};
  }
`;

export default StyledWrapper;
