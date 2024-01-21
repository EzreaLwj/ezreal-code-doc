import {SidebarConfig4Multiple} from "vuepress/config";
import shareSideBar from "./sidebars/shareSideBar";

// @ts-ignore
export default {
    "/分享文章/": shareSideBar,
    // 降级，默认根据文章标题渲染侧边栏
    "/": "auto",
} as SidebarConfig4Multiple;
