import styled from 'styled-components';

const Wrapper = styled.div`
  max-width: 620px;

  label {
    font-size: ${(props) => props.theme.font.size.sm};
    color: ${(props) => props.theme.colors.text.subtext1};
  }

  input,
  select,
  textarea {
    width: 100%;
    min-width: 0;
    border: 1px solid ${(props) => props.theme.input.border};
    border-radius: 3px;
    background-color: ${(props) => props.theme.input.bg};
    color: ${(props) => props.theme.text};
    font-size: ${(props) => props.theme.font.size.sm};
    outline: none;
  }

  input,
  select {
    height: 30px;
    padding: 0 8px;
  }

  textarea {
    min-height: 92px;
    resize: vertical;
    padding: 8px;
    font-family: var(--font-family-mono);
  }

  .jwt-grid {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 8px;
  }

  .jwt-preview {
    word-break: break-all;
    border: 1px solid ${(props) => props.theme.input.border};
    border-radius: 3px;
    background-color: ${(props) => props.theme.input.bg};
    color: ${(props) => props.theme.colors.text.subtext1};
    font-size: ${(props) => props.theme.font.size.xs};
    padding: 8px;
  }
`;

export default Wrapper;
