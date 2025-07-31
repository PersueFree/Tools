import { FC } from "react";
import { HashRouter, Route, Routes } from "react-router-dom";
import styled from "styled-components";

import { RouterConfig } from "@/router/routerConfig";

const AppContainer = styled.div`
  width: 100%;
`;

const App: FC = () => {
  return (<HashRouter>
      <AppContainer>
        <Routes>
          <Route path={RouterConfig.COMPLAINT_DETAILS} element={<></>} />
        </Routes>
      </AppContainer>
    </HashRouter>)
};

export default App;
