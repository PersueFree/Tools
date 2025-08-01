import { FC, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styled from "styled-components";

import { MenuItemType, menuItems } from "@/router/routerConfig";

const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  box-sizing: border-box;
`;

const Title = styled.h2`
  font-weight: bold;
  font-size: 24px;
  color: #333;
  margin-bottom: 10px;
`;

const MenuContent = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const MenuItem = styled.div<{ $selected: boolean }>`
  width: 100%;
  background: ${(props) => (props.$selected ? "#e3f2fd" : "#f5f6f7")};
  padding: 15px 20px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  border-left: 4px solid ${(props) => (props.$selected ? "#2196f3" : "transparent")};

  &:hover {
    background: #e3f2fd;
    transform: translateX(5px);
  }

  font-weight: 500;
  font-size: 16px;
  color: #333;
`;

const Menu: FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);

  useEffect(() => {
    const hash = location.pathname.replace("#", "") || "/";
    const index = menuItems.findIndex((item) => item.path === hash);
    setSelectedIndex(index);
  }, [location]);

  const handleSelect = (item: MenuItemType, index: number) => {
    setSelectedIndex(index);

    // 这里可以添加路由跳转逻辑
    navigate(item.path);
  };

  return (
    <Container>
      <Title>Menu</Title>
      <MenuContent>
        {menuItems.map((item, index) => (
          <MenuItem
            key={item.path}
            $selected={selectedIndex === index}
            onClick={() => handleSelect(item, index)}
          >
            {item.name}
          </MenuItem>
        ))}
      </MenuContent>
    </Container>
  );
};

export { Menu };
