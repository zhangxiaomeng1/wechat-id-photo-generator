Page({
  data: {
    projects: [
      {
        number: "01",
        type: "AI PRODUCT",
        title: "让复杂的事，变得简单",
        desc: "从一个模糊想法出发，做出真正有人愿意使用的产品。",
        color: "orange",
        tags: ["产品设计", "AI 工具"]
      },
      {
        number: "02",
        type: "CONTENT",
        title: "持续输出有价值的内容",
        desc: "把思考写下来，把经验分享出去，和同频的人建立连接。",
        color: "blue",
        tags: ["内容创作", "个人品牌"]
      },
      {
        number: "03",
        type: "EXPERIMENT",
        title: "保持好奇，持续实验",
        desc: "研究新工具、新方法，也记录每一次不确定的尝试。",
        color: "green",
        tags: ["独立开发", "效率研究"]
      }
    ],
    timeline: [
      { year: "NOW", title: "正在做有趣的事", desc: "探索 AI、产品与个人表达的交叉点" },
      { year: "2024", title: "开始独立创造", desc: "从内容到产品，把想法变成可见的作品" },
      { year: "PAST", title: "积累与学习", desc: "保持输入，也保持对世界的敏感" }
    ]
  },

  scrollTo(e) {
    const target = e.currentTarget.dataset.target
    const query = wx.createSelectorQuery()
    query.select(`#${target}`).boundingClientRect()
    query.selectViewport().scrollOffset()
    query.exec((res) => {
      if (!res[0] || !res[1]) return
      wx.pageScrollTo({
        scrollTop: res[0].top + res[1].scrollTop,
        duration: 400
      })
    })
  },

  copyEmail() {
    wx.setClipboardData({
      data: "hello@example.com",
      success: () => {
        wx.showToast({ title: "邮箱已复制", icon: "none" })
      }
    })
  },

  showComingSoon() {
    wx.showToast({ title: "项目详情即将公开", icon: "none" })
  },

  onShareAppMessage() {
    return {
      title: "晓萌 · 把想法做成能被使用的东西",
      path: "/pages/index/index"
    }
  }
})
