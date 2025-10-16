import React from 'react';

import { colors, isRtl } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

const Container = styled.div<{
  maxHeight?: string;
  minHeight?: string;
}>`
  /* CKEditor 5 styling overrides */
  .ck-editor__editable {
    min-height: ${(props) => props.minHeight ?? '300px'};
    max-height: ${({ maxHeight, theme }) =>
      maxHeight ?? `calc(80vh - ${theme.menuHeight}px)`};
    ${isRtl`
      direction: rtl;
      text-align: right;
    `}
  }

  /* Toolbar styling */
  .ck.ck-toolbar {
    background: #f8f8f8;
    border-radius: ${({ theme }) => theme.borderRadius}
      ${({ theme }) => theme.borderRadius} 0 0;
    border: 1px solid ${colors.borderDark};
    border-bottom: 0;
  }

  /* Editor container */
  .ck.ck-editor__main > .ck-editor__editable {
    border: 1px solid ${colors.borderDark};
    border-radius: 0 0 ${({ theme }) => theme.borderRadius}
      ${({ theme }) => theme.borderRadius};
  }

  /* Focus state */
  .ck.ck-editor__editable:focus {
    border: 2px solid ${(props) => props.theme.colors.tenantPrimary};
    outline: none;
  }

  /* Active button styling */
  .ck.ck-button:not(.ck-disabled):hover,
  .ck.ck-button:not(.ck-disabled):focus,
  .ck.ck-button.ck-on {
    background-color: ${colors.teal}15;
  }

  .ck.ck-button:not(.ck-disabled):hover .ck-icon,
  .ck.ck-button:not(.ck-disabled):focus .ck-icon,
  .ck.ck-button.ck-on .ck-icon {
    color: ${colors.teal};
  }

  /* Image resizing */
  .ck.ck-widget.image {
    max-width: 100%;
  }

  .ck-content img {
    max-width: 100%;
    height: auto;
  }

  /* Custom button style in content */
  .ck-content .custom-button {
    display: inline-block;
    padding: 10px 20px;
    background-color: ${({ theme }) => theme.colors.tenantPrimary};
    color: white;
    text-decoration: none;
    border-radius: 4px;

    &:hover {
      opacity: 0.9;
    }
  }
`;

interface Props {
  maxHeight?: string;
  minHeight?: string;
  className?: string;
  children: React.ReactNode;
}

const StyleContainer = ({
  maxHeight,
  minHeight,
  className,
  children,
}: Props) => {
  return (
    <Container
      maxHeight={maxHeight}
      minHeight={minHeight}
      className={className}
    >
      {children}
    </Container>
  );
};

export default StyleContainer;
