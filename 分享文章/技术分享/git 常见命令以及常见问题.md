# Git 操作

> git 教程：[https://www.runoob.com/git/git-tutorial.html](https://www.runoob.com/git/git-tutorial.html)

## 基本概念

**工作区**：克隆项目到本地后，项目所在的文件夹；
**暂存区**：从工作区添加上来的变更（新增，修改，删除）的文件**执行 git add 命令后，将工作区的文件添加到暂存区；**
**本地仓库**：用于存储本地工作区和暂存区提交上来的变更（新增，修改，删除）文件，即暂存区的文件执行 git commit 操作后，将变更的文件提交到本地仓库；
**远程仓库**：搭建在服务器上的 git 远程仓库，执行 git push origin 分支名称 后，将本地仓库中的变更推送到远程仓库；

## 基本操作

1. 克隆代码

> git clone 

2. 初始化本地仓库

> git init

3. 添加当前文件到暂存区

> git add . 

3. 本地设置远程仓库

> git remote add origin [url]


4. 拉取代码

> git pull origin 远程分支名:本地分支名


5. 提交到远程仓库

> git push origin 远程分支名:本地分支名


6. 查看当前分支

> git branch


7. 查看仓库状态，文件变更信息

> git status


8. 查看历史提交记录

> git log


9. 查看历史提交记录，显示变更的文件信息

> git log --stat


10. 搜索历史提交记录

> git log -S [keyword]


11. 显示工作区和暂存区的区别

> git diff
> git diff HEAD 显示与最新commit之间的区别


12. 显示某次提交的详情

> git show [commitId]


### 版本操作

**git resert**

1. 查看提交历史

> git log

2. 回退到上一个版本

> git reset --hard


3. 回退到指定版本

> git reset --hard commitId


git reset 常见的几种模式

> soft：将 head 指向指定的提交，工作区和暂存区的内容不会改变
> mixed：默认模式，将 head 指向指定的提交，暂存区的内容随之改变，而工作区的内容不会改变
> hard：将 head 指向指定的提交，暂存区和工作区都会改变



**git revert**
适用场景：如果想撤销之前的某一版本，但是又想**保留该目标版本后面的其他版本**。

1. 查看历史提交

> git log

2. 撤销提交

> git revert commit_id
> revert 是默认提交的，但是 git revert | --no-commit [commit-id]，--no-commit 选项不会自动提交需要手动提交

[Git 命令 reset 和 revert 的区别](https://zhuanlan.zhihu.com/p/412482122)

### 文件操作

1. 添加指定文件到暂存区

> git add [file1] [file2] ...

2. 添加指定目录到暂存区，包括子目录

> git add [dir]


3. 添加所有文件到暂存区

> git add . 


4. 删除工作区文件，并将这次删除加入到暂存区

> git rm [file1] [file2]


5. 停止追踪指定文件，该文件会保留在工作区

> git rm --cached [file]


6. 文件已经添加到暂存区，强制删除文件

> git rm -f [file]


7. **删除整个目录下的所有子目录和文件**

> git rm -r [dir]

### 分支操作

1. 切换分支

> git checkout [分支名]

2. 合并分支

> git merge [分支名]

3. 创建并切换分支

> git checkout -b [分支名]

4. 创建分支

> git branch [分支名]

5. 删除分支

> git branch -d [分支名]


### 标签操作

1. 查看标签

> git tag


2. 附注标签

> git tag -a [标签名] -m "标签信息" [提交ID]


3. 指向最新的提交

> git tag -a v1.0.0 -m "Release version 1.0.0" HEAD


4. 提交标签

> git push origin [标签名]


5. 一次性推送所有标签

> git push origin --tags


6. 轻量标签

> git tag [标签名] [提交ID]


7. 创建一个指向最新提交的轻量标签

> git tag v1.0.0


### 远程操作

1. 将远程的全部更新拉取到本地

> git fetch <远程主机名>


2. 拉取指定分支的更新

> git fetch <远程主机名> <分支名>


3. 将远程主机的某个分支的更新取回，并与本地指定的分支合并 

> git pull <远程主机名> <远程分支名>:<本地分支名>


### 管理远程仓库

1. 列出当前仓库配置的远程仓库

> git remote


2. 列出当前仓库配置的远程仓库，并显示 URL

> git remote -v


3. 添加远程仓库，指定一个远程仓库的名称和 URL

> git remote add <远程主机名> <URL>


4. 从当前仓库中删除指定的远程仓库

> git remote remove <远程主机名>


5. 将已配置的远程仓库重命名

> git remote rename <old_name> <new_name>


6. 修改远程仓库的 URL

> git remote set-url <远程主机名> <URL>


7. 显示远程仓库详细信息，包括 URL 和跟踪分支

> git remote show <远程主机名>


## 其他问题

### 如何删除多于的 .idea 文件夹

```shell
git rm --cache -r .idea
git commit -m "fix:移除.idea";
git push origni master
```

### git fetch 与 git pull 的区别

git fetch：将远程主机的最新内容拉到本地，用户在检查了以后决定是否合并到工作本地分支中；
git pull：则是将远程主机的最新内容拉下来后直接合并，相当于 git fetch + git merge，此时可能会产生冲突，需要手动解决；

### git 迁移（从gitee迁移到github上）

1. 在 github 上创建一个项目
2. 把 gitee 上的仓库下载到本地

> git clone [https://gitee.com/EzreaLwj/ezreal-chatgpt-data.git](https://github.com/EzreaLwj/ezreal-chatgpt-data.git)

3. 移除gitee远端，不移除也可以，但是不能也叫 origin

> git remote  remove origin 

4. 添加 github 远端

> git remote add origin [https://github.com/EzreaLwj/ezreal-chatgpt-data.git](https://github.com/EzreaLwj/ezreal-chatgpt-data.git)

5. 推送到 github 的 master，如果有多个分支就需要一个一个地推

> git push -u origin master


### IDEA 解决 git 冲突

当发生冲突时，会弹出解决冲突的提示框，共有三个按钮：
accept yours：以你当前的分支为标准；
accept theirs：以他人的分支为标准（合并过来的分支）；
merge：手动合并；

点击手动合并后，会出现三个框，最左边的框是你本地的分支，最后边的框是他人的分支（合并过来的分支），中间的框是解决冲突后的最终版本。

**每次解决完冲突后，都要点击启动项目，看看能不能将项目跑起来。**