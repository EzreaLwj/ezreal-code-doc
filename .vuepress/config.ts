import sidebar from "./sidebar";
import navbar from "./navbar";
import footer from "./footer";
import extraSideBar from "./extraSideBar";

module.exports = {
    title: "是时候表演真正的技术了",
    base: '/', // 使用相对路径，读取相对路径下的静态文件
    head: [
        ['link', {rel: 'icon', href: '/logo.png'}],
        [
            "meta",
            {
                name: "keywords",
                content:
                    "Ezreal, 编程学习路线, 编程知识百科, Java, 编程导航, 前端, 开发, 编程分享, 项目, IT, 求职, 面经",
            },
        ],
    ],
    extraWatchFiles: [".vuepress/*.ts", ".vuepress/sidebars/*.ts"],
    markdown: {
        // 开启代码块的行号
        lineNumbers: true,
        // 支持 4 级以上的标题渲染
        extractHeaders: ["h2", "h3", "h4", "h5", "h6"],
    },
    themeConfig: {
        nav: navbar,
        logo: '/logo.png',
        lastUpdated: 'Last Updated', // string | boolean
        sidebar: sidebar,
        footer,
        extraSideBar
    },

}
