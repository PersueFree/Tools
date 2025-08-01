interface MenuItemType {
  name: string;
  path: string;
  element?: () => Promise<{ default: React.ComponentType }>;
}

const menuItems: MenuItemType[] = [
  {
    name: "随机文本顺序",
    path: "/st",
    element: () => import("@/pages/ShuffleTextOrder"),
  },
  {
    name: "随机字符串",
    path: "/rs",
    element: () => import("@/pages/RandomString"),
  },
  {
    name: "混淆转换",
    path: "/cc",
    element: () => import("@/pages/ConfusionConversion"),
  },
  {
    name: "包与包混淆转换",
    path: "/poc",
    element: () => import("@/pages/AppConfusionConversion"),
  },
  {
    name: "加密解密",
    path: "/ed",
    element: () => import("@/pages/EncryptioAndDecryption"),
  },
] as const;

export { menuItems };
export type { MenuItemType };
