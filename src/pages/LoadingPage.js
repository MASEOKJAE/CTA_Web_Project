import React from 'react';
import { css } from '@emotion/react';
import BeatLoader from 'react-spinners/BeatLoader';
import styled from '@emotion/styled';

const override = css`
  display: block;
  margin: 0 auto;
  border-color: red;
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background: #f5f5f5;
`;

const Logo = styled('img')`
  max-width: 350px;
  max-height: 350px;
  cursor: pointer;
  margin-bottom: 30px;
`;

function LoadingPage() {
  return (
    <LoadingContainer>
      <Logo src="/assets/ctalogo.png" alt="CTA Logo" />
      <BeatLoader color={'#123abc'} loading={true} css={override} size={60} />
    </LoadingContainer>
  );
}

export default LoadingPage;