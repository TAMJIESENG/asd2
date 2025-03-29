import React from 'react';
import { Layout } from 'antd';
import styled from 'styled-components';

const { Footer: AntFooter } = Layout;

const StyledFooter = styled(AntFooter)`
  text-align: center;
  background: #001529;
  color: rgba(255, 255, 255, 0.65);
  padding: 24px;
`;

const Footer = () => {
  return (
    <StyledFooter>
      <div>小游戏合集 &copy; {new Date().getFullYear()} - 提供多种经典游戏体验</div>
      <div style={{ marginTop: '10px' }}>
        <a href="#" style={{ color: 'rgba(255, 255, 255, 0.65)', margin: '0 10px' }}>关于我们</a>
        <a href="#" style={{ color: 'rgba(255, 255, 255, 0.65)', margin: '0 10px' }}>服务条款</a>
        <a href="#" style={{ color: 'rgba(255, 255, 255, 0.65)', margin: '0 10px' }}>隐私政策</a>
        <a href="#" style={{ color: 'rgba(255, 255, 255, 0.65)', margin: '0 10px' }}>联系我们</a>
      </div>
    </StyledFooter>
  );
};

export default Footer; 