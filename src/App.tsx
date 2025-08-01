import { FC, Suspense, lazy, useEffect } from "react";
import { Provider } from "react-redux";
import { HashRouter, Route, Routes } from "react-router-dom";
import styled from "styled-components";

import { Layout } from "@/components";
import { menuItems } from "@/router/routerConfig";

import store from "./store";

const AppContainer = styled.div`
  width: 100%;
  background: #ffffff;
`;

const App: FC = () => {
  useEffect(() => {
    document.title = "Tool Combination";
  }, []);
  return (
    <Provider store={store}>
      <HashRouter>
        <AppContainer>
          <Suspense fallback={<div>Loading...</div>}>
            <Layout>
              <Routes>
                {menuItems.map((item) => {
                  if (!item.element) return null;
                  const LazyComponent = lazy(item.element);

                  return <Route key={item.path} path={item.path} element={<LazyComponent />} />;
                })}
              </Routes>
            </Layout>
          </Suspense>
        </AppContainer>
      </HashRouter>
    </Provider>
  );
};

export default App;
