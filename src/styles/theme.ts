import { DefaultTheme } from "styled-components";

const theme: DefaultTheme = {
    colors: {
        primary: "#1890ff",
        button: "#52c41a",
        orderNormalBg: "linear-gradient(135deg, #3d3bb4 0%, #a672e6 100%), #ffffff",
        orderABNormalBg: "linear-gradient(315deg, #FFED68 0%, #FF9737 100%), #ffffff",
        methodBg: "#F5F6F7"
    },
    spacing: (multiplier = 1) => `${8 * multiplier}px`
}

export default theme;