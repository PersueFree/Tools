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

const routes = menuItems.flatMap((item) => {
  if (!item.element) {
    return [];
  }

  const LazyComponent = lazy(item.element);
  return [{ path: item.path, element: <LazyComponent /> }];
});

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
                {routes.map((route) => (
                  <Route key={route.path} path={route.path} element={route.element} />
                ))}
              </Routes>
            </Layout>
          </Suspense>
        </AppContainer>
      </HashRouter>
    </Provider>
  );
};

export default App;
