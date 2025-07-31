/// <reference types="vite/client" />
import "react";
import { Theme } from "styled-components";

declare module "*.svg" {
  import React from "react";
  const content: React.RC<React.SVGProps<SVGSVGElement>>;
  export default content;
}

declare module "*.module.css" {
  const classes: { readonly [key: string]: string };
  export default classes;
}

declare module "styled-components" {
  export interface DefaultTheme extends Theme {
    colors: {
      primary: string;
      button: string;
      orderNormalBg: string;
      orderABNormalBg: string;
      methodBg: string;
    };
    spacing: (multiplier?: number) => string;
  }
}

declare module "react" {
  interface CSSProperties {
    "--adm-color-box"?: string;
  }
}
