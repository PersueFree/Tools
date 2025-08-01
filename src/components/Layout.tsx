import { FC } from "react";
import styled from "styled-components";

import { Menu } from "@/pages/Menu";

const Container = styled.div`
  width: 100%;
  height: 100vh;

  display: flex;
  position: relative;
`;
const MenuContent = styled.div`
  min-width: 15vw;
  height: 100vh;
  overflow-y: auto;
  position: sticky;
  top: 0;
  padding: 20px;

  background: #ffffffff;

  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.5);
`;
const Content = styled.div`
  flex: 1;
  overflow-y: auto;
  height: 100vh;
  padding: 20px;
`;

interface LayoutProps {
  children?: React.ReactNode;
}

const Layout: FC<LayoutProps> = ({ children }) => {
  return (
    <Container>
      <MenuContent>
        <Menu />
      </MenuContent>
      <Content>{children}</Content>
    </Container>
  );
};

export { Layout };
